'use client';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Subject, Topic } from '@/types';
import { FileUp, FileText, Loader2, Save, ExternalLink, BookOpen, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const inputCls = "w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";
const selectCls = "w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed";

export default function TopicsAdminPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState('');

  // Edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSummary, setEditSummary] = useState('');

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => apiClient.get('/api/subjects').then((r) => r.data),
  });

  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ['topics', selectedSubjectId],
    queryFn: () => apiClient.get(`/api/subjects/${selectedSubjectId}/topics`).then((r) => r.data),
    enabled: !!selectedSubjectId,
  });

  const { data: topicDetails, isLoading: isTopicLoading } = useQuery<Topic>({
    queryKey: ['topic-details', selectedTopicId],
    queryFn: () =>
      apiClient.get(`/api/topics/${selectedTopicId}`).then((r) => {
        const t = r.data;
        setEditTitle(t.title || '');
        setEditDescription(t.description || '');
        setEditSummary(t.summary || '');
        return t;
      }),
    enabled: !!selectedTopicId,
  });

  const updateTopicMutation = useMutation({
    mutationFn: (data: Partial<Topic>) =>
      apiClient.put(`/api/topics/${selectedTopicId}`, data),
    onSuccess: () => {
      toast.success('Topic details updated successfully');
      qc.invalidateQueries({ queryKey: ['topic-details', selectedTopicId] });
      qc.invalidateQueries({ queryKey: ['topics', selectedSubjectId] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to update topic details');
    },
  });

  const handleUpdateDetails = () => {
    if (!editTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }
    updateTopicMutation.mutate({
      title: editTitle,
      description: editDescription,
      summary: editSummary,
    });
  };

  const handlePDFUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !selectedTopicId) {
      toast.error('Please select a PDF file first.');
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are allowed.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const form = new FormData();
    form.append('file', file);

    try {
      await apiClient.post(`/api/topics/${selectedTopicId}/pdf`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      toast.success('Study PDF uploaded successfully — students can now view it!');
      qc.invalidateQueries({ queryKey: ['topic-details', selectedTopicId] });
      setSelectedFileName('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'PDF Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground font-outfit tracking-tight">Topics & PDFs</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload study materials (PDFs) and manage chapter details</p>
      </div>

      {/* Selectors */}
      <div className="bg-card border border-border rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-card">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setSelectedTopicId('');
            }}
            className={selectCls}
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (Class {s.class_level})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Topic / Chapter</label>
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            disabled={!selectedSubjectId}
            className={selectCls}
          >
            <option value="">Select Topic</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.sequence_order}. {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {isTopicLoading && (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground text-sm">Loading topic metadata…</p>
        </div>
      )}

      {!isTopicLoading && topicDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Edit Topic Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground font-outfit">Edit Topic Details</h2>
                </div>
                <span className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full">
                  Ch. {topicDetails.sequence_order}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Topic Title</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={inputCls}
                    placeholder="E.g., Kinematics"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={inputCls + ' resize-none'}
                    placeholder="Enter short description/syllabus for the topic..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Concept Summary (AI Generated or Manual)</label>
                  <textarea
                    rows={6}
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className={inputCls + ' resize-none font-mono text-xs'}
                    placeholder="Write detailed markdown summary or reference key equations..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleUpdateDetails}
                  disabled={updateTopicMutation.isPending}
                  className="flex items-center gap-2 bg-primary hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateTopicMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: PDF Upload & Status */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-card">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground font-outfit">Study Material</h2>
              </div>

              {topicDetails.pdf_url ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-emerald-800 text-sm font-semibold">PDF Active</p>
                      <p className="text-emerald-700 text-xs mt-0.5">Students can view this PDF in the learn section</p>
                    </div>
                  </div>

                  <a
                    href={topicDetails.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-card border border-border hover:bg-muted/40 text-foreground text-sm font-medium py-2.5 rounded-xl hover:border-primary/30 transition-all"
                  >
                    <ExternalLink className="w-4 h-4 text-primary" />
                    Open PDF Notes
                  </a>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-border rounded-xl bg-muted/20">
                  <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-foreground text-sm font-medium">No PDF Uploaded</p>
                  <p className="text-xs text-muted-foreground px-4 mt-1">Students will see a placeholder until you upload a PDF.</p>
                </div>
              )}
            </div>

            {/* Upload Zone */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-card">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground font-outfit">Upload PDF</h2>
              </div>

              <div className="space-y-4">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 cursor-pointer bg-muted/20 hover:bg-primary/5 transition-all text-center group"
                >
                  <FileUp className="w-10 h-10 text-muted-foreground/50 group-hover:text-primary transition-colors mb-2" />
                  <span className="text-foreground/70 text-sm font-medium group-hover:text-foreground transition-colors">
                    {selectedFileName || 'Choose Study PDF'}
                  </span>
                  <span className="text-muted-foreground text-xs mt-1">Max 20MB · PDF only</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      setSelectedFileName(e.target.files?.[0]?.name || '');
                      qc.invalidateQueries({ queryKey: ['topic-details', selectedTopicId] });
                    }}
                  />
                </div>

                {uploading && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uploading…</span>
                      <span className="font-semibold text-primary">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePDFUpload}
                  disabled={uploading || !selectedFileName}
                  className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.99]"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileUp className="w-4 h-4" />
                  )}
                  {uploading ? 'Uploading PDF…' : 'Upload PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedTopicId && !isTopicLoading && (
        <div className="bg-card border border-dashed border-border rounded-2xl py-16 text-center shadow-sm">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-foreground font-semibold text-sm font-outfit">No Topic Selected</p>
          <p className="text-muted-foreground text-xs mt-1">Select a subject and topic from the dropdowns above to begin managing content.</p>
        </div>
      )}
    </div>
  );
}
