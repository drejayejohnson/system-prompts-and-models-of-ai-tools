'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';

interface BrandUploaderProps {
  onTextExtracted: (text: string, filename: string, wordCount: number) => void;
}

export function BrandUploader({ onTextExtracted }: BrandUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!['application/pdf', 'text/plain', 'text/markdown'].includes(file.type) &&
          !file.name.match(/\.(pdf|txt|md)$/i)) {
        setError('Please upload a .pdf, .txt, or .md file');
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error ?? 'Upload failed');

        setUploadedFiles((prev) => [...prev, file.name]);
        onTextExtracted(data.text, data.filename, data.wordCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    },
    [onTextExtracted]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={onInputChange}
        />
        <div className="text-3xl mb-2">{isUploading ? '⏳' : '📄'}</div>
        <p className="text-sm font-medium text-slate-700">
          {isUploading ? 'Uploading and extracting text...' : 'Drop your brand files here'}
        </p>
        <p className="text-xs text-slate-400 mt-1">PDF, TXT, or Markdown files</p>
        {!isUploading && (
          <Button variant="outline" size="sm" className="mt-3 pointer-events-none">
            Browse Files
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-1">
          {uploadedFiles.map((name, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
              <span className="text-green-500">✓</span>
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
