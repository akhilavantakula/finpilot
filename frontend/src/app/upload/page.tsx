"use client";
import { useState, useRef } from "react";
import axios from "axios";
import { Upload, Camera, CheckCircle, XCircle, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const scan = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API}/api/ocr/scan-receipt`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data);
    } catch {
      setResult({ success: false, error: "Failed to process receipt." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Scan Receipt</h1>
        <p className="text-muted text-sm mt-1">Upload a receipt photo — Gemini Vision extracts and saves the expense automatically</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`glass rounded-xl border-2 border-dashed transition-colors cursor-pointer p-10 text-center
          ${file ? "border-primary/50" : "border-border hover:border-primary/30"}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {preview ? (
          <img src={preview} alt="Receipt preview" className="max-h-48 mx-auto rounded-lg object-contain" />
        ) : (
          <>
            <Camera size={36} className="mx-auto text-muted mb-3" />
            <p className="text-white text-sm font-medium">Drop receipt image here</p>
            <p className="text-muted text-xs mt-1">or click to browse · JPG, PNG supported</p>
          </>
        )}
      </div>

      {file && (
        <button onClick={scan} disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-medium transition-colors">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Scanning with Gemini Vision...</> : <><Upload size={16} /> Scan & Save Receipt</>}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className={`glass rounded-xl p-5 border-l-4 ${result.success ? "border-success" : "border-danger"}`}>
          {result.success ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={18} className="text-success" />
                <p className="text-sm font-semibold text-success">Receipt scanned and saved!</p>
              </div>
              <div className="space-y-2">
                {[
                  ["Description", result.extracted.description],
                  ["Amount", `₹${parseFloat(result.extracted.amount).toLocaleString("en-IN")}`],
                  ["Category", result.extracted.category],
                  ["Date", result.extracted.date],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle size={18} className="text-danger" />
              <p className="text-sm text-danger">{result.error}</p>
            </div>
          )}
        </div>
      )}

      <div className="glass rounded-xl p-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">How it works</p>
        <div className="space-y-2 text-xs text-muted">
          <p>1. Upload a receipt image (restaurant bill, grocery receipt, etc.)</p>
          <p>2. Gemini 1.5 Flash Vision API reads and extracts the data</p>
          <p>3. Expense is automatically categorized and saved to your tracker</p>
        </div>
      </div>
    </div>
  );
}
