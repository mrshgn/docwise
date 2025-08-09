// src/pages/Analyze.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Settings,
  Volume2,
  Square,
  Download,
  Eye,
} from "lucide-react";
import { AccessibilityToolbar } from "@/components/accessibility-toolbar";
import { HeaderBar } from "@/components/header-bar";
import { supabase } from "@/integrations/supabase/client";

interface LocationState {
  files?: File[];
}

const steps = [
  { key: "upload", label: "Uploading to secure storage" },
  { key: "analyze", label: "Running AI accessibility analysis" },
  { key: "fix", label: "Applying fixes and tagging" },
  { key: "complete", label: "Finalizing accessible document" },
] as const;

const Analyze: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { files = [] } = (location.state as LocationState) || {};

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const [accessibleContent, setAccessibleContent] = useState("");
  const [summary, setSummary] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const handleFocusModeChange = (event: CustomEvent) => {
      setFocusMode(event.detail.enabled);
    };
    window.addEventListener("focusModeChange", handleFocusModeChange as EventListener);
    return () => window.removeEventListener("focusModeChange", handleFocusModeChange as EventListener);
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
      const fileName = fileNames.length > 0 ? fileNames[0].replace(/\.[^/.]+$/, "") : "document";
      const blob = new Blob([accessibleContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
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

      setProgress(10);
      setCurrentStep(0);
      setDone(false);

      try {
        // 1) Upload to Supabase storage (uploads bucket)
        const uploadedPaths: string[] = [];
        for (const file of files) {
          const path = `${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage.from("uploads").upload(path, file);
          if (error) {
            console.error("Upload error:", error);
            throw error;
          }
          // data.path is the canonical path returned
          const uploadedPath = (data as any)?.path ?? path;
          uploadedPaths.push(uploadedPath);
        }

        setProgress(35);
        setCurrentStep(1);

        // 2) Call Edge Function using supabase.functions.invoke
        // Use the Supabase client helper to call the function by name
        // NOTE: This uses the client and will include anon token if configured. Your function can be public or you can use no-verify-jwt.
        const fnBody = { bucket: "uploads", path: uploadedPaths[0] };

        // supabase.functions.invoke returns a Response-like object
        const res = await supabase.functions.invoke("gemini-process", {
          method: "POST",
          body: JSON.stringify(fnBody),
          headers: { "Content-Type": "application/json" },
        });

        // .invoke returns an object with .error (if using older helpers) or standard Response-like shape.
        // Handle both cases:
        let json: any = null;
        if ("error" in res && res.error) {
          // this path for older client patterns
          console.error("Function invocation error (client):", (res as any).error);
          throw new Error((res as any).error.message || "Function invocation error");
        } else if ("json" in res) {
          json = await (res as Response).json();
        } else {
          // fallback: try parsing
          const text = await (res as any).text?.();
          try { json = JSON.parse(text); } catch { json = { error: "Invalid function response", raw: text }; }
        }

        if (!json) throw new Error("No response from function");

        if (json.error) {
          console.error("Function returned error:", json.error);
          throw new Error(json.error);
        }

        const accessible_text = json.accessible_text ?? json.accessibleText ?? json.accessible;
        const aiSummary = json.summary ?? json.summaryText ?? json.summary_message ?? "";

        setProgress(75);
        setCurrentStep(2);

        // 3) Update UI
        setAccessibleContent(accessible_text || "");
        setSummary(aiSummary || "");
        setProgress(100);
        setCurrentStep(3);
        setDone(true);
      } catch (err: any) {
        console.error("Processing pipeline error:", err);
        setSummary("An error occurred while processing the document. See console for details.");
        setAccessibleContent("");
        setDone(true);
        setProgress(100);
        setCurrentStep(3);
      }
    };

    processFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  if (!files.length) {
    return (
      <main className="min-h-screen bg-background">
        <Helmet>
          <title>Analyze Documents | Accessible AI</title>
        </Helmet>
        <section className="container mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-4">No files to process</h1>
          <Button onClick={() => navigate("/")}>Back to upload</Button>
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
                  {accessibleContent || "Accessible content will appear here after AI processing."}
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
                  {isSpeaking ? "Stop" : "Listen"}
                </Button>
              </div>
            </section>

            {!focusMode && (
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleDownload} disabled={!accessibleContent || isDownloading}>
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? "Preparing..." : "Download accessible version"}
                </Button>
                <Button variant="secondary" onClick={() => navigate("/")}>
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
