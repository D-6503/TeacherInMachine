'use client';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Video, Subject, Topic } from '@/types';
import { Upload, Trash2, Clock, Globe, Loader2, Play, Film } from 'lucide-react';
import { toast } from 'sonner';

function formatDuration(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const inputCls = "w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-muted-foreground";
const selectCls = "w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed";

export default function VideosAdminPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('en');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState('');

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => apiClient.get('/api/subjects').then((r) => r.data),
  });
  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ['topics', selectedSubjectId],
    queryFn: () => apiClient.get(`/api/subjects/${selectedSubjectId}/topics`).then((r) => r.data),
    enabled: !!selectedSubjectId,
  });
  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['admin-videos', selectedTopicId],
    queryFn: () => apiClient.get(`/api/videos/topics/${selectedTopicId}/videos`).then((r) => r.data),
    enabled: !!selectedTopicId,
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/videos/${id}`),
    onSuccess: () => { toast.success('Video removed'); qc.invalidateQueries({ queryKey: ['admin-videos', selectedTopicId] }); },
    onError: () => toast.error('Failed to remove video'),
  });

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !selectedTopicId || !title.trim()) {
      toast.error('Please select a topic, enter a title, and pick a file.');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    const form = new FormData();
    form.append('topic_id', selectedTopicId);
    form.append('title', title);
    form.append('language', language);
    form.append('file', file);
    try {
      await apiClient.post('/api/videos/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      toast.success('Video uploaded successfully');
      qc.invalidateQueries({ queryKey: ['admin-videos', selectedTopicId] });
      setTitle('');
      setSelectedFileName('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-outfit">Videos</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload and manage topic lecture videos</p>
      </div>

      {/* Upload form */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-card">
        <h2 className="text-base font-semibold text-foreground font-outfit">Upload New Video</h2>
        <div className="grid grid-cols-2 gap-3">
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
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Video Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Introduction to Kinematics"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectCls}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Video File</label>
          <label
            className="flex items-center gap-3 bg-muted/30 border-2 border-dashed border-border hover:border-primary/50 rounded-xl px-4 py-3 cursor-pointer hover:bg-primary/5 transition-all group"
            onClick={() => fileRef.current?.click()}
          >
            <Film className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors truncate">
              {selectedFileName || 'Click to choose video file…'}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                setSelectedFileName(e.target.files?.[0]?.name || '');
                qc.invalidateQueries();
              }}
            />
          </label>
        </div>
        {uploading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Uploading…</span>
              <span className="font-semibold text-primary">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.99]"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? `Uploading… ${uploadProgress}%` : 'Upload Video'}
        </button>
      </div>

      {/* Videos list */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      {!isLoading && selectedTopicId && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Videos for this Topic</h3>
          {videos.map((v) => (
            <div key={v.id} className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 hover:shadow-card-hover transition-all duration-300">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Play className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-sm truncate">{v.title}</p>
                <p className="text-muted-foreground text-xs flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(v.duration_seconds)}</span>
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {v.language.toUpperCase()}</span>
                </p>
              </div>
              <button
                onClick={() => { if (confirm('Remove this video?')) remove.mutate(v.id); }}
                className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {videos.length === 0 && (
            <div className="bg-card border border-dashed border-border rounded-2xl text-center py-12">
              <Film className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No videos uploaded for this topic yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
