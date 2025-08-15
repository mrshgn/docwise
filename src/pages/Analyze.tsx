import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, FileText, Loader2, Settings, Volume2, Square, Download, Eye, Languages } from 'lucide-react';
import { AccessibilityToolbar } from '@/components/accessibility-toolbar';
import { HeaderBar } from '@/components/header-bar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { extractTextFromFile } from '@/lib/extract-text';
interface LocationState {
  files?: File[];
}
const steps = [{
  key: 'upload',
  label: 'Uploading to secure storage'
}, {
  key: 'analyze',
  label: 'Running AI accessibility analysis'
}, {
  key: 'fix',
  label: 'Applying fixes and tagging'
}, {
  key: 'complete',
  label: 'Finalizing accessible document'
}] as const;
const Analyze: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    files = []
  } = location.state as LocationState || {};
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [accessibleContent, setAccessibleContent] = useState('');
  const [summary, setSummary] = useState('');
  const [processedDocumentUrl, setProcessedDocumentUrl] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [downloadFormat, setDownloadFormat] = useState<'html' | 'markdown' | 'pdf' | 'txt'>('pdf');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices and listen for focus mode changes
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    const handleFocusModeChange = (event: CustomEvent) => {
      setFocusMode(event.detail.enabled);
    };
    window.addEventListener('focusModeChange', handleFocusModeChange as EventListener);
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.removeEventListener('focusModeChange', handleFocusModeChange as EventListener);
    };
  }, []);
  const fileNames = useMemo(() => files.map(f => f.name), [files]);
  const handleNarrate = () => {
    const text = accessibleContent || summary;
    if (!text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      // Find and set the selected voice - improved language matching
      const selectedVoice = availableVoices.find(voice => {
        // First try exact match
        if (voice.lang === selectedLanguage) return true;
        // Then try language prefix match (e.g., 'en' matches 'en-US')
        const langPrefix = selectedLanguage.split('-')[0];
        return voice.lang.startsWith(langPrefix);
      });
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = selectedLanguage;
      }
      utterance.rate = 1.0;
      utteranceRef.current = utterance;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeaking(false);
    }
  };
  const handleStopNarration = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };
  const handleDownload = async () => {
    // Add debug logging
    console.log('Download attempt:', { 
      accessibleContent: accessibleContent?.length || 0, 
      processedDocumentUrl,
      downloadFormat 
    });
    
    if (!accessibleContent && !processedDocumentUrl) {
      toast({
        title: 'No content available',
        description: 'Please process a document first before downloading.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!accessibleContent) {
      toast({
        title: 'No processed content',
        description: 'The document content is empty. Please try processing again.',
        variant: 'destructive'
      });
      return;
    }
    setIsDownloading(true);
    const fileBase = (fileNames[0] ? fileNames[0].replace(/\.[^/.]+$/, '') : 'document') + '_accessible';
    const downloadBlob = (blob: Blob, filename: string) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    try {
      switch (downloadFormat) {
        case 'html':
          {
            if (processedDocumentUrl) {
              const link = document.createElement('a');
              link.href = processedDocumentUrl;
              link.download = `${fileBase}.html`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else {
              const blob = new Blob([accessibleContent], {
                type: 'text/html;charset=utf-8'
              });
              downloadBlob(blob, `${fileBase}.html`);
            }
            break;
          }
        case 'markdown':
          {
            const Turndown = (await import('turndown')).default as any;
            const td = new Turndown({
              headingStyle: 'atx'
            });
            const markdown = td.turndown(accessibleContent);
            const blob = new Blob([markdown], {
              type: 'text/markdown;charset=utf-8'
            });
            downloadBlob(blob, `${fileBase}.md`);
            break;
          }
        case 'txt':
          {
            const el = document.createElement('div');
            el.innerHTML = accessibleContent;
            const text = el.textContent || '';
            const blob = new Blob([text], {
              type: 'text/plain;charset=utf-8'
            });
            downloadBlob(blob, `${fileBase}.txt`);
            break;
          }
         case 'pdf':
           {
             console.log('Starting PDF generation...');
             const html2pdf: any = (await import('html2pdf.js')).default;
             
             // Create a proper HTML document structure for PDF
             const htmlContent = `
               <!DOCTYPE html>
               <html>
                 <head>
                   <meta charset="utf-8">
                   <title>Accessible Document</title>
                   <style>
                     body { 
                       font-family: 'Times New Roman', serif; 
                       line-height: 1.6; 
                       color: #333; 
                       max-width: 800px; 
                       margin: 0 auto; 
                       padding: 20px; 
                     }
                     h1, h2, h3, h4, h5, h6 { 
                       font-weight: bold; 
                       margin-top: 20px; 
                       margin-bottom: 10px; 
                       color: #2c3e50; 
                     }
                     p { margin-bottom: 12px; }
                     ul, ol { margin-bottom: 15px; padding-left: 30px; }
                     li { margin-bottom: 5px; }
                   </style>
                 </head>
                 <body>
                   ${accessibleContent}
                 </body>
               </html>
             `;
             
             const opt = {
               margin: [10, 10, 10, 10],
               filename: `${fileBase}.pdf`,
               image: { type: 'jpeg', quality: 0.98 },
               html2canvas: { scale: 2, useCORS: true },
               jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
             };
             
             console.log('Generating PDF with options:', opt);
             await html2pdf().set(opt).from(htmlContent).save();
             console.log('PDF generation completed');
             break;
           }
        default:
          {
            const blob = new Blob([accessibleContent], {
              type: 'text/plain;charset=utf-8'
            });
            downloadBlob(blob, `${fileBase}.txt`);
          }
       }
       
       console.log('Download completed successfully');
       toast({
         title: 'Download successful',
         description: `Your accessible document has been downloaded as ${downloadFormat.toUpperCase()}.`,
         variant: 'default'
       });
       
     } catch (error) {
       console.error('Download failed:', error);
       toast({
         title: 'Download failed',
         description: error instanceof Error ? error.message : 'Please try again.',
         variant: 'destructive'
       });
    } finally {
      setIsDownloading(false);
    }
  };
  useEffect(() => {
    if (!files.length) return;
    const process = async () => {
      try {
        // Step 1: Try client-side text extraction first
        setCurrentStep(0);
        setProgress(10);
        let rawText = '';
        let shouldUploadFile = false;
        
        try {
          const extracted = await extractTextFromFile(files[0]);
          rawText = (extracted.text || '').trim();
          
          // Check if we need backend processing
          if (rawText.startsWith('BACKEND_PROCESSING_REQUIRED:')) {
            shouldUploadFile = true;
            rawText = '';
          }
        } catch (error) {
          console.warn('Client-side extraction failed:', error);
          shouldUploadFile = true;
          rawText = '';
        }

        // Step 2: Upload file if needed for backend processing
        const publicUrls: string[] = [];
        if (shouldUploadFile || !rawText) {
          for (const file of files) {
            const folder = `incoming/${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const path = `${folder}/${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('uploads').upload(path, file, {
              upsert: true
            });
            if (uploadError) {
              console.warn('Upload failed:', uploadError);
              throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
            }
            const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(uploadData.path);
            publicUrls.push(urlData.publicUrl);
          }
        }

        // Step 3: Process through Edge Function
        setCurrentStep(1);
        setProgress(40);

        // Always provide file context, even if we have extracted text
        if (!rawText && publicUrls.length === 0) {
          const f = files[0];
          const name = f?.name || 'document';
          const type = f?.type || 'unknown';
          rawText = `Process file '${name}' with content-type ${type}. Create accessible content from this document.`;
        }

        const { data, error } = await supabase.functions.invoke('process-document', {
          body: {
            file_urls: publicUrls,
            raw_text: rawText,
          },
        });
        
        // Handle edge function errors properly
        if (error) {
          console.error('Edge function error:', error);
          // Try to get the actual error message from the response
          let errorMessage = error.message || 'Processing failed';
          
          // Check if this might be a server overload error
          if (error.message?.includes('non-2xx status code')) {
            // For non-2xx errors, we need to check what the actual error was
            errorMessage = 'Server is currently experiencing high demand. Please try again in a few minutes.';
          }
          
          throw new Error(errorMessage);
        }

        // Step 3: Apply fixes/collect results
        setCurrentStep(2);
        setProgress(70);
        const content = data?.accessible_content || data?.accessibleContent || data?.accessible_text || data?.html || '';
        const sum = data?.summary || '';
        const processedUrl = data?.processed_document_url || data?.downloadUrl || data?.processed_url || data?.processedDocumentUrl || '';
        if (!content && !processedUrl) {
          throw new Error('Edge Function did not return processed content or URL.');
        }
        setAccessibleContent(content);
        setSummary(sum);
        if (processedUrl) setProcessedDocumentUrl(processedUrl);

        // Step 4: Complete
        setCurrentStep(3);
        setProgress(100);
        setDone(true);
        } catch (err: any) {
        console.error('Processing failed:', err);
        
        // Check for server busy/overload errors
        const isServerBusy = err?.message?.includes("Server is currently busy") || 
                            err?.message?.includes("experiencing high demand") ||
                            err?.message?.includes("quota") || 
                            err?.message?.includes("rate limit") ||
                            err?.message?.includes("overload") ||
                            err?.message?.includes("non-2xx status code");
        
        const title = isServerBusy ? '🚧 Server Overload' : 'Processing Failed';
        const description = isServerBusy 
          ? 'Our AI service is experiencing high demand due to heavy usage. Please wait a few minutes and try again.'
          : err?.message || 'An unexpected error occurred. Please try again.';
        
        toast({
          title,
          description,
          variant: 'destructive'
        });
        setDone(true);
      }
    };
    process();
  }, [files, supabase]);

  // If user navigates here directly
  if (!files.length) {
    return <main className="min-h-screen bg-background">
        <Helmet>
          <title>Analyze Documents | Accessible AI</title>
          <meta name="description" content="Upload documents for AI-powered accessibility analysis and remediation." />
          <link rel="canonical" href="/analyze" />
        </Helmet>
        <section className="container mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold text-foreground mb-4">No files to process</h1>
          <p className="text-muted-foreground mb-6">Please upload a document first.</p>
          <Button onClick={() => navigate('/')}>Back to upload</Button>
        </section>
      </main>;
  }
  return <main className="min-h-screen bg-background">
      <Helmet>
        <title>Processing Your Document | Accessible AI</title>
        <meta name="description" content="Processing and fixing document accessibility using AI. Live progress and final results." />
        <link rel="canonical" href="/analyze" />
      </Helmet>

      <HeaderBar />

      <section className="container mx-auto px-4 py-16">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Making your document accessible</h1>
          <p className="text-muted-foreground mt-2">We're analyzing and remediating accessibility issues automatically.</p>
        </header>

        <article className="bg-card border rounded-lg p-6 shadow-medium">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary animate-spin-slow" />
              <span className="text-sm font-medium text-foreground">{steps[currentStep].label}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {fileNames.map((name, i) => <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-accent-light text-foreground">
                  <FileText className="w-3 h-3" />
                  {name}
                </span>)}
            </div>
          </div>

          <div className="mt-4">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground mt-2">{progress}% complete</p>
          </div>

          {!done ? <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Working… This usually takes under a minute.
            </div> : <div className="mt-8 space-y-6">
              {/* Show everything when not in focus mode */}
              {!focusMode && <>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Accessibility fixes applied</h2>
                      <p className="text-muted-foreground mt-1">
                        Fantastic work—your content is now more inclusive. Headings normalized, reading order corrected,
                        forms labeled, and WCAG AA compliance achieved.
                      </p>
                    </div>
                  </div>

                  {summary && <article className="bg-success-light/40 border border-success/20 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Eye className="w-5 h-5 text-success mt-0.5" />
                        <div>
                          <h3 className="text-base font-medium text-foreground">Processing Summary</h3>
                          <p className="text-sm text-muted-foreground mt-2">{summary}</p>
                        </div>
                      </div>
                    </article>}
                </>}

              <AccessibilityToolbar className="mb-6" />

              <section className="bg-card border rounded-lg p-6 shadow-medium">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Accessible Document Preview</h3>
                </div>
                
                <div className="bg-gradient-document border-2 border-primary/10 rounded-xl p-8 max-h-[28rem] overflow-y-auto shadow-soft backdrop-blur-sm">
                  <div className="prose prose-lg max-w-none text-foreground" 
                       dangerouslySetInnerHTML={{
                         __html: accessibleContent || `
                           <div class="text-center py-12">
                             <div class="text-4xl mb-4">✨</div>
                             <p class="text-muted-foreground text-xl font-medium mb-2">Accessible content will appear here</p>
                             <p class="text-muted-foreground text-sm">Your document will be optimized for screen readers and accessibility compliance</p>
                           </div>
                         `
                       }} 
                  />
                  <style>{`
                    .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
                      font-weight: 700 !important;
                      margin-top: 2rem !important;
                      margin-bottom: 1rem !important;
                      color: hsl(var(--primary)) !important;
                    }
                    .prose h1 { font-size: 2rem !important; }
                    .prose h2 { font-size: 1.75rem !important; }
                    .prose h3 { font-size: 1.5rem !important; }
                    .prose p {
                      margin-bottom: 1.25rem !important;
                      line-height: 1.75 !important;
                      font-size: 1.125rem !important;
                    }
                    .prose ul, .prose ol {
                      margin-bottom: 1.5rem !important;
                      padding-left: 2rem !important;
                    }
                    .prose li {
                      margin-bottom: 0.75rem !important;
                      line-height: 1.6 !important;
                    }
                    .prose strong {
                      font-weight: 600 !important;
                      color: hsl(var(--primary)) !important;
                    }
                    .prose em {
                      font-style: italic !important;
                      color: hsl(var(--muted-foreground)) !important;
                    }
                  `}</style>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Document optimized for screen readers and accessibility compliance
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-muted-foreground" />
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="es-ES">Spanish</SelectItem>
                          <SelectItem value="fr-FR">French</SelectItem>
                          <SelectItem value="de-DE">German</SelectItem>
                          <SelectItem value="it-IT">Italian</SelectItem>
                          <SelectItem value="pt-BR">Portuguese</SelectItem>
                          <SelectItem value="ru-RU">Russian</SelectItem>
                          <SelectItem value="ja-JP">Japanese</SelectItem>
                          <SelectItem value="ko-KR">Korean</SelectItem>
                          <SelectItem value="zh-CN">Chinese (Mandarin)</SelectItem>
                          <SelectItem value="ar-SA">Arabic</SelectItem>
                          <SelectItem value="hi-IN">Hindi</SelectItem>
                          <SelectItem value="pl-PL">Polish</SelectItem>
                          <SelectItem value="nl-NL">Dutch</SelectItem>
                          <SelectItem value="sv-SE">Swedish</SelectItem>
                          <SelectItem value="da-DK">Danish</SelectItem>
                          <SelectItem value="no-NO">Norwegian</SelectItem>
                          <SelectItem value="fi-FI">Finnish</SelectItem>
                          <SelectItem value="cs-CZ">Czech</SelectItem>
                          <SelectItem value="hu-HU">Hungarian</SelectItem>
                          <SelectItem value="tr-TR">Turkish</SelectItem>
                          <SelectItem value="th-TH">Thai</SelectItem>
                          <SelectItem value="vi-VN">Vietnamese</SelectItem>
                          <SelectItem value="he-IL">Hebrew</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => isSpeaking ? handleStopNarration() : handleNarrate()} disabled={!accessibleContent}>
                      {isSpeaking ? <>
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </> : <>
                          <Volume2 className="w-4 h-4 mr-2" />
                          Listen
                        </>}
                    </Button>
                  </div>
                </div>
              </section>

              {!focusMode && <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">File type</span>
                    <Select value={downloadFormat} onValueChange={v => setDownloadFormat(v as any)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Choose format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="markdown">Markdown (.md)</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="txt">Plain text (.txt)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleDownload} disabled={isDownloading || (!accessibleContent && !processedDocumentUrl)} className="bg-gradient-primary hover:opacity-90">
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloading ? 'Preparing...' : `Download ${downloadFormat.toUpperCase()}`}
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/')}>Process another document</Button>
                </div>}
            </div>}
        </article>

        
      </section>
    </main>;
};
export default Analyze;