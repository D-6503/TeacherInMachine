'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useKeystrokeTracker } from '@/lib/keystroke-tracker';
import { Question, SubmitAttemptResponse } from '@/types';
import VoiceRecorder from '@/components/test/VoiceRecorder';
import ResultPanel from '@/components/test/ResultPanel';
import AnswerEditor from '@/components/test/AnswerEditor';
import { ArrowLeft, BookOpen, Loader2, Mic, Keyboard, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { preprocessMath } from '@/lib/math-utils';

const BLOOM_COLORS: Record<string, string> = {
  remember: 'bg-blue-50 text-blue-800 border-blue-200',
  understand: 'bg-violet-50 text-violet-800 border-violet-200',
  apply: 'bg-amber-50 text-amber-800 border-amber-200',
  evaluate: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

export default function TestPage({ params }: { params: { topicId: string } }) {
  const { topicId } = params;
  const router = useRouter();
  const { user } = useAuthStore();

  const [questionIdx, setQuestionIdx] = useState(0);
  const [inputMode, setInputMode] = useState<'typed' | 'voice'>('typed');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<SubmitAttemptResponse | null>(null);
  const [tabSwitches, setTabSwitches] = useState(0);

  const tracker = useKeystrokeTracker();

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((c) => c + 1);
        toast.warning('Tab switch detected', { description: 'Leaving the test window is flagged.' });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['questions', topicId],
    queryFn: () => apiClient.get(`/api/topics/${topicId}/questions`).then((r) => r.data),
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/attempts/submit', payload);
      return res.data as SubmitAttemptResponse;
    },
    onSuccess: (data) => {
      setResult(data);
      tracker.reset();
      if (data.next_topic_unlocked && data.next_topic_id) {
        toast.success(data.unlock_message, { duration: 5000 });
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Submission failed. Please try again.');
    },
  });

  const currentQuestion = questions[questionIdx];

  const handleSubmit = () => {
    if (!answer.trim()) {
      toast.error('Please write your answer before submitting.');
      return;
    }
    if (!currentQuestion || !user) return;

    const { keystrokes, wpm, pasteDetected } = tracker.getStats();
    submitMutation.mutate({
      student_id: user.id,
      question_id: currentQuestion.id,
      topic_id: topicId,
      answer_text: answer,
      input_mode: inputMode,
      keystrokes,
      wpm,
      paste_detected: pasteDetected,
      tab_switches: tabSwitches,
    });
  };

  const handleNext = () => {
    setResult(null);
    setAnswer('');
    tracker.reset();
    setTabSwitches(0);
    if (questionIdx < questions.length - 1) {
      setQuestionIdx((i) => i + 1);
    } else {
      toast.success('All questions attempted! Returning to dashboard.');
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <BookOpen className="w-12 h-12 mb-3 opacity-40 animate-float" />
        <p className="text-foreground font-bold text-lg">No questions available</p>
        <p className="text-sm mt-1">Questions are being generated. Check back soon.</p>
        <Link href={`/learn/${topicId}`} className="mt-4 text-primary hover:text-brand-600 font-semibold text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Learn
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/learn/${topicId}`}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Learn
        </Link>
        <div className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
          <span>Question {questionIdx + 1} of {questions.length}</span>
          {tabSwitches > 0 && (
            <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-md text-xs font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" /> {tabSwitches} switch{tabSwitches > 1 ? 'es' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Question card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card transition-all duration-300">
        {/* Bloom badge */}
        <div className="flex items-center justify-between mb-5">
          <span className={`px-3 py-1 rounded-xl text-xs font-bold capitalize border ${BLOOM_COLORS[currentQuestion.bloom_level] || 'bg-muted text-muted-foreground border-border'}`}>
            {currentQuestion.bloom_level}
          </span>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i < questionIdx ? 'bg-accent' : i === questionIdx ? 'bg-primary scale-110' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question text */}
        <div className="text-foreground text-xl leading-relaxed font-bold font-display mb-6 prose prose-base max-w-none">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {preprocessMath(currentQuestion.question_text)}
          </ReactMarkdown>
        </div>

        {/* Input mode toggle */}
        {!result && (
          <div className="flex gap-2 mt-6 mb-4">
            <button
              onClick={() => setInputMode('typed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                inputMode === 'typed'
                  ? 'bg-brand-50 text-primary border-brand-200 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground border-border hover:bg-muted/40'
              }`}
            >
              <Keyboard className="w-4 h-4" /> Type Answer
            </button>
            <button
              onClick={() => setInputMode('voice')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                inputMode === 'voice'
                  ? 'bg-brand-50 text-primary border-brand-200 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground border-border hover:bg-muted/40'
              }`}
            >
              <Mic className="w-4 h-4" /> Voice Answer
            </button>
          </div>
        )}

        {/* Answer area */}
        {!result && (
          <>
            <AnswerEditor value={answer} onChange={setAnswer} tracker={tracker} />

            {inputMode === 'voice' && (
              <div className="mt-4 p-4 rounded-2xl bg-muted/40 border border-border shadow-sm animate-fadeIn">
                <VoiceRecorder
                  onTranscript={(text) => {
                    setAnswer((prev) => (prev ? prev + ' ' + text.trim() : text.trim()));
                  }}
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || !answer.trim()}
              className="mt-5 w-full bg-primary hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-card hover:shadow-card-hover hover:-translate-y-0.5"
            >
              {submitMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating Answer…</>
              ) : 'Submit Answer'}
            </button>
          </>
        )}

        {/* Result */}
        {result && <ResultPanel result={result} onNext={handleNext} isLast={questionIdx === questions.length - 1} />}
      </div>
    </div>
  );
}
