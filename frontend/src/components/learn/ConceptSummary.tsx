'use client';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { BookOpen } from 'lucide-react';
import { preprocessMath } from '@/lib/math-utils';

interface Props { summary?: string | null; }

export default function ConceptSummary({ summary }: Props) {
  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <BookOpen className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm font-semibold">No summary available for this topic.</p>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-extrabold text-foreground mb-4 border-b border-border pb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-foreground mb-3 mt-6" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-foreground mb-2 mt-4" {...props} />,
          p: ({ node, ...props }) => <p className="text-muted-foreground leading-relaxed mb-4 text-sm font-medium" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2 mb-4 text-muted-foreground text-sm font-medium" {...props} />,
          li: ({ node, ...props }) => <li className="text-muted-foreground leading-relaxed" {...props} />,
          strong: ({ node, ...props }) => <strong className="text-foreground font-bold" {...props} />,
          code: ({ node, ...props }) => (
            <code className="bg-muted text-primary rounded px-1.5 py-0.5 text-xs font-mono border border-border" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary pl-4 text-muted-foreground italic my-4 bg-muted/40 py-2 pr-3 rounded-r-lg" {...props} />
          ),
        }}
      >
        {preprocessMath(summary)}
      </ReactMarkdown>
    </div>
  );
}
