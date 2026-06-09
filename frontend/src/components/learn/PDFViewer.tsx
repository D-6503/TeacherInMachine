'use client';
import { FileText } from 'lucide-react';

interface Props { pdfUrl?: string | null; }

export default function PDFViewer({ pdfUrl }: Props) {
  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <FileText className="w-12 h-12 mb-3 opacity-30 animate-float" />
        <p className="text-sm font-semibold">No PDF notes available for this topic.</p>
      </div>
    );
  }

  // Prepend the backend origin if the path is relative and we are in local development
  let resolvedUrl = pdfUrl;
  if (pdfUrl.startsWith('/static/')) {
    resolvedUrl = `http://localhost:8000${pdfUrl}`;
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="w-full overflow-hidden rounded-2xl border border-border/80 shadow-card bg-card p-1.5">
        <iframe
          src={`${resolvedUrl}#toolbar=0&navpanes=0`}
          className="w-full h-[650px] rounded-xl"
          title="Study Material PDF"
          loading="lazy"
        />
      </div>
      <div className="flex items-center gap-2">
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-primary font-bold text-xs hover:bg-primary/10 transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          Open PDF in New Tab ↗
        </a>
      </div>
    </div>
  );
}

