'use client';
import { SubmitAttemptResponse } from '@/types';
import { CheckCircle2, XCircle, ArrowRight, AlertTriangle, Unlock, Sparkles, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import TimMascot from '@/components/common/TimMascot';
import { motion } from 'framer-motion';
import { preprocessMath } from '@/lib/math-utils';

interface Props {
  result: SubmitAttemptResponse;
  onNext: () => void;
  isLast: boolean;
}

function ScoreRing({ score }: { score: number }) {
  const isExcellent = score >= 8;
  const isPassing = score >= 7;
  
  const color = isExcellent ? '#16a34a' : isPassing ? '#ff6200' : '#ea580c';
  const pct = (score / 10) * 100;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dashoffset = circ - (pct / 100) * circ;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center bg-card rounded-full shadow-inner border border-border/60">
      <svg className="absolute inset-0 -rotate-90" width="80" height="80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(44, 30, 20, 0.05)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="text-center">
        <p className="text-xl font-black text-foreground font-display leading-none">{score}</p>
        <p className="text-[9px] font-black text-muted-foreground mt-0.5">/ 10</p>
      </div>
    </div>
  );
}

export default function ResultPanel({ result, onNext, isLast }: Props) {
  const isGood = result.score >= 7;

  // Mascot quotes based on performance
  const cheerQuote = result.score >= 9 ? "Incredible work! You are a master!" :
                      result.score >= 7 ? "Superb job! Milestone unlocked!" :
                      result.score >= 5 ? "Not bad at all! Let's polish some concepts!" :
                      "Let's try again. Learning is a journey!";

  const cheerMood = result.score >= 7 ? 'cheering' : 'thinking';

  return (
    <div className="mt-6 space-y-6 animate-fadeIn">
      <div className="h-px bg-border" />

      {/* Duolingo style result banner */}
      <div className={`rounded-3xl border p-5 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-5 items-center ${
        isGood 
          ? 'bg-green-50/60 border-green-200 text-green-900' 
          : 'bg-orange-50/60 border-orange-200 text-orange-950'
      }`}>
        {/* Floating elements inside banner */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <TimMascot size={72} mood={cheerMood} />
        </div>

        {/* Score and text */}
        <div className="flex-1 text-center md:text-left space-y-1.5 z-10">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {isGood ? (
              <span className="inline-flex items-center gap-1 bg-green-500 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-green-600/10">
                <Sparkles className="w-3 h-3" /> Quest Success
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-primary text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-primary/10">
                <Award className="w-3 h-3" /> Learning Quest
              </span>
            )}
            
            {result.next_topic_unlocked && (
              <span className="inline-flex items-center gap-1 bg-accent text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-accent/10 animate-bounce">
                <Unlock className="w-3 h-3" /> Chapter Unlocked!
              </span>
            )}
          </div>

          <h3 className="text-lg font-black font-display leading-tight">
            {isGood ? 'Awesome Job! You got it!' : 'Nice try! Let\'s learn together!'}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
            &ldquo;{cheerQuote}&rdquo;
          </p>
          
          {result.next_topic_unlocked && (
            <p className="text-xs text-accent font-extrabold mt-1">
              🎉 {result.unlock_message}
            </p>
          )}
        </div>

        <div className="flex-shrink-0">
          <ScoreRing score={result.score} />
        </div>
      </div>

      {/* Dynamic Tabs / Blocks for Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Socratic Feedback */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">AI Coach Feedback</p>
          <div className="text-foreground text-sm font-semibold leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{preprocessMath(result.feedback)}</ReactMarkdown>
          </div>
        </div>

        {/* Missing Concepts or Flags */}
        <div className="space-y-4">
          {/* Missing concepts */}
          {result.missing_concepts.length > 0 && (
            <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Target Concepts to Master</p>
              <ul className="space-y-2">
                {result.missing_concepts.map((c, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-foreground font-extrabold bg-card border border-border/80 rounded-xl px-3 py-2">
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cheat flags */}
          {result.cheat_flags.length > 0 && (
            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" /> Focus Integrity Alert
              </p>
              <div className="space-y-1.5">
                {result.cheat_flags.map((f: any, i) => (
                  <p key={i} className="text-xs text-rose-950 font-bold leading-normal">
                    • {f.detail}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Answer Comparison Box */}
      {(result.student_answer || result.expected_answer) && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Answer Comparison Key</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.student_answer && (
              <div className="bg-muted/30 border border-border/80 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Your Submitted Answer</span>
                <p className="text-xs text-foreground font-semibold whitespace-pre-wrap leading-relaxed">
                  {result.student_answer}
                </p>
              </div>
            )}
            {result.expected_answer && (
              <div className="bg-green-50/25 border border-green-200/50 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-extrabold text-green-700 uppercase tracking-wider">Expected Answer Rubric</span>
                <div className="text-xs text-foreground font-semibold leading-relaxed prose prose-xs max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {preprocessMath(result.expected_answer)}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Question/Finish Button */}
      <button
        onClick={onNext}
        className={`w-full text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-md ${
          isGood 
            ? 'bg-green-600 hover:bg-green-500 btn-3d-success' 
            : 'bg-primary hover:bg-brand-600 btn-3d-primary'
        }`}
      >
        {isLast ? 'Finish learning Quest' : 'Continue Journey'}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
