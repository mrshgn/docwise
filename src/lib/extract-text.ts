export async function extractTextFromFile(file: File): Promise<{ text: string; contentType: string }> {
  const contentType = file.type || '';

  // Read simple textual files directly
  if (
    contentType.startsWith('text/') ||
    contentType.includes('json') ||
    contentType.includes('xml') ||
    contentType.includes('html')
  ) {
    const text = await file.text();
    return { text, contentType };
  }

  // DOCX: convert to HTML first, then let model improve semantics
  if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const mammoth: any = await import('mammoth/mammoth.browser');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      // Provide HTML to preserve structure; model will normalize semantics
      const html = result.value as string;
      return { text: html, contentType };
    } catch (e) {
      console.warn('Failed to extract DOCX content:', e);
      // Fall through to backend processing
    }
  }

  // For PDFs and other file types, let backend handle extraction
  // Return a marker that indicates backend processing is needed
  const name = file.name || 'document';
  return { 
    text: `BACKEND_PROCESSING_REQUIRED: ${name}`, 
    contentType 
  };
}
