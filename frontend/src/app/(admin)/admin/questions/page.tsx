'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Question, Subject, Topic } from '@/types';
import { Trash2, CheckCircle2, Circle, Loader2, Zap, BookOpen, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const BLOOM_COLORS: Record<string, string> = {
  remember: 'bg-blue-50 text-blue-700 border-blue-200',
  understand: 'bg-violet-50 text-violet-700 border-violet-200',
  apply: 'bg-amber-50 text-amber-700 border-amber-200',
};

const selectCls = "w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed";

export default function QuestionsAdminPage() {
  const qc = useQueryClient();
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [generating, setGenerating] = useState(false);
  
  // Add manual question states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBloomLevel, setNewBloomLevel] = useState('remember');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newExpectedAnswer, setNewExpectedAnswer] = useState('');

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => apiClient.get('/api/subjects').then((r) => r.data),
  });

  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ['topics', selectedSubjectId],
    queryFn: () => apiClient.get(`/api/subjects/${selectedSubjectId}/topics`).then((r) => r.data),
    enabled: !!selectedSubjectId,
  });

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['admin-questions', selectedTopicId],
    queryFn: () => apiClient.get(`/api/topics/${selectedTopicId}/questions`).then((r) => r.data),
    enabled: !!selectedTopicId,
  });

  const validate = useMutation({
    mutationFn: (id: string) => apiClient.put(`/api/questions/${id}`, { is_validated: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-questions', selectedTopicId] }),
    onError: () => toast.error('Failed to validate'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/questions/${id}`),
    onSuccess: () => { toast.success('Question removed'); qc.invalidateQueries({ queryKey: ['admin-questions', selectedTopicId] }); },
    onError: () => toast.error('Failed to delete'),
  });

  const addQuestion = useMutation({
    mutationFn: (payload: { topic_id: string, question_text: string, expected_answer: string, bloom_level: string }) => 
      apiClient.post('/api/questions', payload),
    onSuccess: () => {
      toast.success('Question added successfully!');
      qc.invalidateQueries({ queryKey: ['admin-questions', selectedTopicId] });
      // Reset form
      setIsAddOpen(false);
      setNewQuestionText('');
      setNewExpectedAnswer('');
      setNewBloomLevel('remember');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to add question');
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newExpectedAnswer.trim()) {
      toast.error('Please fill in both the question text and expected answer.');
      return;
    }
    addQuestion.mutate({
      topic_id: selectedTopicId,
      question_text: newQuestionText.trim(),
      expected_answer: newExpectedAnswer.trim(),
      bloom_level: newBloomLevel
    });
  };

  const generate = async () => {
    if (!selectedTopicId) return;
    setGenerating(true);
    try {
      await apiClient.post(`/api/topics/${selectedTopicId}/generate`);
      toast.success('AI generation started! Questions will appear in a few minutes.', { duration: 5000 });
    } catch {
      toast.error('Failed to start generation');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-outfit">Questions</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage and validate AI-generated questions</p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-card grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedTopicId(''); }}
            className={selectCls}
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Topic</label>
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            disabled={!selectedSubjectId}
            className={selectCls}
          >
            <option value="">Select Topic</option>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
      </div>

      {/* Action bar */}
      {selectedTopicId && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm font-medium">
            <span className="text-foreground font-bold">{questions.length}</span> question{questions.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-muted border border-border text-foreground text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-2 bg-primary hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-card hover:shadow-card-hover transition-all active:scale-[0.99]"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Generate with AI
            </button>
          </div>
        </div>
      )}

      {/* Manual Question Form Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border-4 border-[#2c1e14] rounded-3xl p-6 w-full max-w-lg shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/40"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-lg font-black font-outfit text-foreground mb-4">Add Custom Question</h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Bloom Level</label>
                <select
                  value={newBloomLevel}
                  onChange={(e) => setNewBloomLevel(e.target.value)}
                  className={selectCls}
                >
                  <option value="remember">Remember (Facts & formulas)</option>
                  <option value="understand">Understand (Concepts & explanations)</option>
                  <option value="apply">Apply (Calculations & problems)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Question Text</label>
                <textarea
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Enter the question text..."
                  rows={3}
                  className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Expected Answer (for AI grading)</label>
                <textarea
                  value={newExpectedAnswer}
                  onChange={(e) => setNewExpectedAnswer(e.target.value)}
                  placeholder="Enter the detailed expected answer key..."
                  rows={4}
                  className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addQuestion.isPending}
                  className="flex items-center gap-1.5 bg-primary hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-card transition-all active:scale-[0.99]"
                >
                  {addQuestion.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Questions list */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && selectedTopicId && (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${BLOOM_COLORS[q.bloom_level] || 'bg-muted text-muted-foreground border-border'}`}>
                      {q.bloom_level}
                    </span>
                    {q.is_validated
                      ? <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Validated</span>
                      : <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full"><Circle className="w-3 h-3" /> Pending</span>}
                    <span className="text-muted-foreground text-xs">by {q.created_by}</span>
                  </div>
                  <p className="text-foreground text-sm font-semibold mb-2 leading-relaxed">{q.question_text}</p>
                  <p className="text-muted-foreground/80 text-xs leading-relaxed">
                    <span className="font-semibold text-muted-foreground">Expected: </span>
                    {q.expected_answer.slice(0, 140)}{q.expected_answer.length > 140 ? '…' : ''}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!q.is_validated && (
                    <button
                      onClick={() => validate.mutate(q.id)}
                      className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="Validate"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => { if (confirm('Delete this question?')) remove.mutate(q.id); }}
                    className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="bg-card border border-dashed border-border rounded-2xl text-center py-12">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm font-medium">No questions yet.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Click "Generate with AI" to create questions from the topic PDF.</p>
            </div>
          )}
        </div>
      )}

      {!selectedTopicId && !isLoading && (
        <div className="bg-card border border-dashed border-border rounded-2xl text-center py-16">
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-foreground font-semibold text-sm font-outfit">No Topic Selected</p>
          <p className="text-xs text-muted-foreground mt-1">Select a subject and topic to view and manage questions.</p>
        </div>
      )}
    </div>
  );
}
