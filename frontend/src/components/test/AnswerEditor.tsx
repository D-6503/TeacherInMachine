'use client';
import { useEffect, useRef } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  tracker: any;
}

export default function AnswerEditor({ value, onChange, tracker }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    tracker.recordKey(e.key, 'keydown');
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    tracker.recordPaste();
  };

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder="Write your answer here… Be as detailed and accurate as possible."
      rows={6}
      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all leading-relaxed text-sm font-medium shadow-sm"
    />
  );
}
