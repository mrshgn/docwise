import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, Loader2, Settings, Volume2, Square, Download, Eye } from 'lucide-react';
import { AccessibilityToolbar } from '@/components/accessibility-toolbar';
import { HeaderBar } from '@/components/header-bar';
import { supabase } from '@/integrations/supabase/client';

interface LocationState {
  files?: File[];
}

const steps = [
  { key: 'upload', label: 'Uploading to secure storage' },
  { key: 'analyze', label: 'Running AI accessibility analysis' },
  { key: 'fix', label: 'Applying fixes and tagging' },
  { key: 'complete', label: 'Finalizing accessible document' },
] as const;

const Analyze: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { files = [] } = (location.state as LocationState) || {};

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const [accessibleContent, setAccessibleContent] = useState('');
  const [summary, setSummary] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const handleFocusModeChange = (event: CustomEvent) => {
      setFocusMode(event.detail.enabled);
    };
    window.addEventListener('focusModeChange', handleFocusModeChange as EventListener);
    return () => window.removeEventListener('focusModeChange', handleFocusModeChange as EventListener);
  }, []);

  const fileNames = useMemo(() => files.map((f) => f.name), [files]);

  const handleNarrate = () => {
    const text = accessibleContent || summary;
    if (!text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utteranceRef.current = utterance;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleStopNarration = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleDownload = async () => {
    if (!accessibleContent) return;
    setIsDownloading(true);
    try {
      const fileName = fileNames.length > 0 ? fileNames[0].replace(/\.[^/.]+$/, '') : 'document';
      const blob = new Blob([accessibleContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}_accessible.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const processFiles = async () => {
      if (!files.length) return;

      setProgress(10); // Start progress
      setCurrentStep(0);

      try {
        // 1️⃣ Upload file to Supabase Storage
        const uploadedPaths: string[] = [];
        for (const file of files) {
          const path = `${Date.now()}-${file.name}`;
          const { error } = await supabase.storage.from('uploads').upload(path, file);
          if (error) throw error;
          uploadedPaths.push(path);
        }
        setProgress(35);
        setCurrentStep(1);

        // 2️⃣ Call Edge Function
        const res = await fetch(`${supabase.functionsUrl}/gemini-process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bucket: 'uploads', path: uploadedPaths[0] }),
        });

        if (!res.ok) throw new Error('Edge Function failed');
        const { accessible_text, summary: aiSummary } = await res.json();
        setProgress(75);
        setCurrentStep(2);

        // 3️⃣ Update UI with AI results
        setAccessibleContent(accessible_text || '');
        setSummary(aiSummary || '');
        setProgress(100);
        setCurrentStep(3);
        setDone(true);
      } catch (err) {
        console.error('Processing error:', err);
        setSummary('An error occurred while processing the document.');
        setDone(true);
      }
    };

    processFiles();
  }, [files]);

  if (!files.length) {
    return (
      <main className="min-h-screen bg-background">
        <Helmet>
          <title>Analyze Documents | Accessible AI</title>
        </Helmet>
        <section className="container mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-4">No files to process</h1>
          <Button onClick={() => navigate('/')}>Back to upload</Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>Processing Your Document | Accessible AI</title>
      </Helmet>

      <HeaderBar />

      <section className="container mx-auto px-4 py-16">
        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-primary animate-spin-slow" />
          <span>{steps[currentStep].label}</span>
        </div>
        <Progress value={progress} />
        <p className="text-xs mt-2">{progress}% complete</p>

        {done && (
          <div className="mt-8 space-y-6">
            {!focusMode && summary && (
              <article className="bg-success-light/40 border border-success/20 rounded-lg p-4">
                <Eye className="w-5 h-5 text-success" />
                <h3 className="text-base font-medium">Processing Summary</h3>
                <p className="text-sm mt-2">{summary}</p>
              </article>
            )}

            <AccessibilityToolbar className="mb-6" />

            <section className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Accessible Document Preview</h3>
              <div className="bg-background border rounded-md p-6 max-h-96 overflow-y-auto">
                <div className="prose prose-sm whitespace-pre-wrap">
                  {accessibleContent || 'Accessible content will appear here after AI processing.'}
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (isSpeaking ? handleStopNarration() : handleNarrate())}
                  disabled={!accessibleContent}
                >
                  {isSpeaking ? <Square className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                  {isSpeaking ? 'Stop' : 'Listen'}
                </Button>
              </div>
            </section>

            {!focusMode && (
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleDownload} disabled={!accessibleContent || isDownloading}>
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? 'Preparing...' : 'Download accessible version'}
                </Button>
                <Button variant="secondary" onClick={() => navigate('/')}>
                  Process another document
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default Analyze;
