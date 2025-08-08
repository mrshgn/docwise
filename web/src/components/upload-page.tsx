import React, { useState } from "react";
import axios from "axios";

const API_BASE = "https://docwise-api.onrender.com";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<any>(null);

  const upload = async () => {
    if (!file) return setStatus("Choose a file first");
    setStatus("Uploading...");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await axios.post(`${API_BASE}/api/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { job_id } = res.data;
      setStatus("Uploaded. Processing...");
      poll(job_id);
    } catch (e) {
      console.error(e);
      setStatus("Upload failed");
    }
  };

  const poll = async (jobId: string) => {
    setStatus("Processing...");
    const interval = setInterval(async () => {
      try {
        const r = await axios.get(`${API_BASE}/api/status/${jobId}`);
        if (r.data.status === "done") {
          clearInterval(interval);
          setResult(r.data);
          setStatus("Done");
        } else if (r.data.status === "error") {
          clearInterval(interval);
          setStatus("Processing failed");
        } else {
          setStatus(`Processing: ${r.data.progress || "starting"}`);
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
        setStatus("Error checking status");
      }
    }, 1500);
  };

  return (
    <div className="card">
      <h2>Upload & Simplify Document</h2>
      <input
        type="file"
        accept=".pdf,.docx,.pptx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={upload}>Upload & Process</button>
      <div>{status}</div>

      {result && (
        <div>
          <h3>Summary</h3>
          <p>{result.summary}</p>
          <h4>Downloads</h4>
          <ul>
            {result.accessible_pdf_url && (
              <li>
                <a href={result.accessible_pdf_url} target="_blank">
                  Accessible PDF
                </a>
              </li>
            )}
            {result.html_url && (
              <li>
                <a href={result.html_url} target="_blank">
                  HTML Version
                </a>
              </li>
            )}
            {result.audio_url && (
              <li>
                <a href={result.audio_url} target="_blank">
                  Audio Summary
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
