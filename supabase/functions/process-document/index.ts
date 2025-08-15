import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessRequestBody {
  file_urls: string[];
  raw_text?: string;
}

// Helper function to convert ArrayBuffer to base64 safely
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192; // Process in 8KB chunks
  let binaryString = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binaryString += String.fromCharCode(...chunk);
  }
  
  return btoa(binaryString);
}

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/ANON_KEY in secrets");
  }
  return createClient(supabaseUrl, serviceKey);
}

async function processDocumentWithGemini(fileUrl: string, fileName: string): Promise<{ accessible_html: string; summary: string }> {
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) {
    throw new Error("GEMINI_API_KEY is not set in Supabase secrets");
  }

  console.log(`Processing document: ${fileName} from URL: ${fileUrl}`);

  // Fetch the file
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Convert to base64 safely for large files
  const base64 = await arrayBufferToBase64(arrayBuffer);
  const contentType = response.headers.get("content-type") || "application/pdf";

  console.log(`File size: ${arrayBuffer.byteLength} bytes, Content-Type: ${contentType}`);

  // Handle text files directly
  if (contentType.startsWith("text/") || contentType.includes("json") || contentType.includes("xml") || contentType.includes("html")) {
    const text = new TextDecoder().decode(arrayBuffer);
    console.log(`Extracted ${text.length} characters from text file`);
    return await processTextWithGemini(text, fileName);
  }

  // Handle DOCX files
  if (contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    try {
      const text = await extractTextFromDocx(arrayBuffer);
      if (text.length > 0) {
        console.log(`Extracted ${text.length} characters from DOCX`);
        return await processTextWithGemini(text, fileName);
      }
    } catch (error) {
      console.error('DOCX extraction failed:', error);
    }
  }

  // For PDFs and other files, use Gemini Vision API
  console.log("Using Gemini Vision API for document processing");
  
  const systemPrompt = `You are an expert document accessibility specialist. Your task is to extract ALL text content from this document and convert it into accessible HTML.

CRITICAL INSTRUCTIONS:
1. Extract EVERY piece of text from the document - do not skip anything
2. Preserve the original structure, headings, paragraphs, lists, tables
3. Return ONLY valid JSON with two keys: "accessible_html" and "summary"
4. The accessible_html must be wrapped in <article> tags with proper semantic HTML
5. Use proper heading hierarchy (h1, h2, h3, etc.)
6. Ensure WCAG 2.2 AA compliance
7. The summary should reflect the actual document content

ABSOLUTELY FORBIDDEN:
- Do not create placeholder content
- Do not make up content that isn't in the document
- Do not use generic examples
- Extract and use ONLY the actual text from this specific document

Return format:
{
  "accessible_html": "<article>...actual document content...</article>",
  "summary": "Brief summary of the actual document content"
}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt },
          {
            inline_data: {
              mime_type: contentType,
              data: base64
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`Gemini API attempt ${attempt + 1}`);
      
      const resp = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (resp.ok) {
        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        console.log(`Gemini response length: ${text.length} characters`);
        console.log(`Gemini response preview: ${text.substring(0, 300)}...`);
        
        try {
          const parsed = JSON.parse(text);
          if (parsed && parsed.accessible_html && parsed.summary) {
            console.log('Successfully parsed Gemini response');
            console.log(`Extracted HTML length: ${parsed.accessible_html.length}`);
            console.log(`Summary: ${parsed.summary}`);
            return parsed;
          }
          throw new Error("Invalid JSON structure from Gemini");
        } catch (e) {
          console.error('Failed to parse Gemini response:', e);
          console.error('Raw response:', text);
          
          // Return the raw text if JSON parsing fails
          return {
            accessible_html: `<article><h1>Document Content</h1><div>${text || "Could not process document"}</div></article>`,
            summary: "Document processing encountered a parsing error.",
          };
        }
      }

      const errorText = await resp.text().catch(() => '');
      console.error(`Gemini API error (attempt ${attempt + 1}):`, errorText);
      
      // Check for quota exhausted error
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.code === 429 && errorJson.error?.status === "RESOURCE_EXHAUSTED") {
          throw new Error("Server is currently busy due to high demand. Please try again in a few minutes.");
        }
      } catch (parseError) {
        // If we can't parse the error, continue with retry logic
      }
      
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    } catch (error) {
      console.error(`Gemini API error (attempt ${attempt + 1}):`, error);
      
      // Check if this is our custom quota error
      if (error instanceof Error && error.message.includes("Server is currently busy")) {
        throw error; // Re-throw to stop retries
      }
      
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  throw new Error("Gemini API failed after 3 attempts");
}

async function processTextWithGemini(text: string, fileName: string): Promise<{ accessible_html: string; summary: string }> {
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const systemPrompt = `Convert this text content into accessible HTML format.

Instructions:
1. Use the provided text content exactly as given
2. Structure it with proper semantic HTML elements
3. Return ONLY valid JSON with "accessible_html" and "summary" keys
4. Wrap content in <article> tags
5. Use proper heading hierarchy and WCAG 2.2 AA compliance

Text content to process:
${text}`;

  const body = {
    contents: [
      { role: "user", parts: [{ text: systemPrompt }] }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  };

  const resp = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (resp.ok) {
    const data = await resp.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    try {
      const parsed = JSON.parse(responseText);
      return parsed;
    } catch (e) {
      console.error('Failed to parse text processing response:', e);
      return {
        accessible_html: `<article><div>${text}</div></article>`,
        summary: "Text content processed with basic formatting",
      };
    }
  }

  throw new Error("Failed to process text with Gemini");
}

async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const JSZip = (await import("https://esm.sh/jszip@3.10.1")).default;
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    const documentXml = await zip.file("word/document.xml")?.async("text");
    if (!documentXml) {
      throw new Error("Could not find document.xml in DOCX file");
    }
    
    const textContent = documentXml
      .replace(/<[^>]*>/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    
    return textContent;
  } catch (error) {
    console.error('DOCX extraction failed:', error);
    return '';
  }
}

async function uploadProcessedHtml(html: string) {
  const supabase = getSupabaseClient();
  const fileName = `processed/${Date.now()}-${Math.random().toString(36).slice(2)}.html`;
  const { error } = await supabase.storage
    .from("uploads")
    .upload(fileName, new Blob([html], { type: "text/html" }), {
      contentType: "text/html",
      upsert: true,
    });
  if (error) throw error;

  const { data } = supabase.storage.from("uploads").getPublicUrl(fileName);
  return data.publicUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as ProcessRequestBody & { extracted_text?: string };
    const urls = Array.isArray(body?.file_urls) ? body.file_urls : [];
    const providedText = (body as any).raw_text || (body as any).extracted_text || '';

    console.log('Processing request:', { 
      urlCount: urls.length, 
      hasProvidedText: !!providedText,
      urls: urls 
    });

    if (!urls.length && !providedText) {
      return new Response(JSON.stringify({ error: "file_urls or raw_text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;
    
    if (providedText && !providedText.startsWith('BACKEND_PROCESSING_REQUIRED:')) {
      // Process provided text
      const fileName = 'user-provided-text';
      result = await processTextWithGemini(providedText, fileName);
    } else if (urls.length > 0) {
      // Process uploaded file
      const fileUrl = urls[0];
      const fileName = fileUrl.split("/").pop() || "document";
      result = await processDocumentWithGemini(fileUrl, fileName);
    } else {
      throw new Error("No valid content to process");
    }

    const processed_document_url = await uploadProcessedHtml(result.accessible_html);

    // Clean up uploaded files after processing
    if (urls.length > 0) {
      try {
        for (const url of urls) {
          const fileName = url.split('/uploads/')[1];
          if (fileName) {
            const { error: deleteError } = await getSupabaseClient().storage
              .from('uploads')
              .remove([fileName]);
            if (deleteError) {
              console.warn('Failed to delete uploaded file:', fileName, deleteError);
            } else {
              console.log('Successfully deleted uploaded file:', fileName);
            }
          }
        }
      } catch (cleanupError) {
        console.warn('Cleanup error:', cleanupError);
      }
    }

    console.log('Processing completed successfully');
    console.log(`Final HTML length: ${result.accessible_html.length}`);
    console.log(`Final summary: ${result.summary}`);

    return new Response(
      JSON.stringify({
        accessible_content: result.accessible_html,
        summary: result.summary,
        processed_document_url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("process-document error:", err);
    
    // Determine if this is a server overload/quota error
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isServerBusy = errorMessage.includes("Server is currently busy") || 
                        errorMessage.includes("quota") || 
                        errorMessage.includes("rate limit") ||
                        errorMessage.includes("overload");
    
    const responseMessage = isServerBusy 
      ? "Server is currently experiencing high demand due to heavy usage. Please try again in a few minutes."
      : errorMessage;
    
    return new Response(
      JSON.stringify({ error: responseMessage }),
      { status: isServerBusy ? 503 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});