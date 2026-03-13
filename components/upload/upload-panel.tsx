"use client";

import { useState, useCallback } from "react";

interface UploadResult {
  filename: string;
  status: "success" | "error";
  pages?: number;
  chunks?: number;
  message?: string;
}

interface UploadPanelProps {
  onUploadComplete?: () => void;
  onPdfStored?: (filename: string, url: string) => void;
}

export function UploadPanel({ onUploadComplete, onPdfStored }: UploadPanelProps) {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      const pdfFiles = Array.from(files).filter(
        (f) => f.type === "application/pdf"
      );
      if (pdfFiles.length === 0) return;

      setUploading(true);
      pdfFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        onPdfStored?.(file.name, url);
      });
      const formData = new FormData();
      pdfFiles.forEach((file) => formData.append("files", file));

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          pdfFiles.forEach((file) => {
            setResults((prev) => [
              ...prev,
              {
                filename: file.name,
                status: "error",
                message: data.error || `Server error (${response.status})`,
              },
            ]);
          });
        } else if (data.results) {
          setResults((prev) => [...prev, ...data.results]);
          onUploadComplete?.();
        }
      } catch {
        pdfFiles.forEach((file) => {
          setResults((prev) => [
            ...prev,
            { filename: file.name, status: "error", message: "Network error" },
          ]);
        });
      } finally {
        setUploading(false);
      }
    },
    [onUploadComplete, onPdfStored]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleUpload(e.target.files);
      }
    },
    [handleUpload]
  );

  return (
    <div className="shrink-0 space-y-2 pb-4">
      <div
        className={`rounded-lg border border-dashed p-4 text-center transition-all ${
          dragOver
            ? "border-white/30 bg-white/5"
            : "border-white/10 hover:border-white/20"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploading ? (
          <p className="text-sm text-white/40">processing...</p>
        ) : (
          <label className="cursor-pointer">
            <p className="text-sm text-white/40">
              drop lecture slides here, or{" "}
              <span className="text-white/60 underline underline-offset-2">
                browse
              </span>
            </p>
            <input
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        )}
      </div>

      {results.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/30">
          {results.map((r, i) => (
            <span key={`${r.filename}-${i}`}>
              {r.status === "success" ? (
                <>{r.filename} <span className="text-white/20">· {r.pages}p</span></>
              ) : (
                <span className="text-red-400/60">{r.filename} failed</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
