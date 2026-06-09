import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getToken, clearAuth } from '@/lib/auth';
import type {
  Student,
  Subject,
  Topic,
  Video,
  Question,
  SubmitAttemptRequest as SubmitAttemptPayload,
  SubmitAttemptResponse,
  StudentDashboard,
  AdminOverview,
  CheatFlagRow as CheatFlagRecord,
} from '@/types';

// Local type aliases not in shared types
interface AuthResponse { access_token: string; token_type: string; }
interface LoginRequest { email: string; password: string; }
interface RegisterRequest { name: string; email: string; password: string; }
interface TranscribeResponse { transcript: string; }

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (typeof window !== 'undefined') {
        const isAdminPath = window.location.pathname.startsWith('/admin');
        window.location.href = isAdminPath ? '/admin-login' : '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/api/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/api/auth/register', data);
    return res.data;
  },

  getMe: async (): Promise<Student> => {
    const res = await api.get<Student>('/api/auth/me');
    return res.data;
  },
};

// ─── Topics / Subjects API ────────────────────────────────────────────────────

export const topicsApi = {
  getSubjects: async (): Promise<Subject[]> => {
    const res = await api.get<Subject[]>('/api/subjects');
    return res.data;
  },

  getTopics: async (subjectId: string): Promise<Topic[]> => {
    const res = await api.get<Topic[]>(`/api/subjects/${subjectId}/topics`);
    return res.data;
  },

  getTopic: async (topicId: string): Promise<Topic> => {
    const res = await api.get<Topic>(`/api/topics/${topicId}`);
    return res.data;
  },

  chatWithTutor: async (
    topicId: string,
    message: string,
    history: { role: string; content: string }[]
  ): Promise<{ response: string; context: string }> => {
    const res = await api.post<{ response: string; context: string }>(`/api/topics/${topicId}/chat`, {
      message,
      history,
    });
    return res.data;
  },
};

// ─── Questions API ────────────────────────────────────────────────────────────

export const questionsApi = {
  getQuestions: async (topicId: string): Promise<Question[]> => {
    const res = await api.get<Question[]>(`/api/topics/${topicId}/questions`);
    return res.data;
  },

  createQuestion: async (
    data: Omit<Question, 'id' | 'created_by' | 'is_validated' | 'created_at'>
  ): Promise<Question> => {
    const res = await api.post<Question>('/api/questions', data);
    return res.data;
  },

  updateQuestion: async (id: string, data: Partial<Question>): Promise<Question> => {
    const res = await api.patch<Question>(`/api/questions/${id}`, data);
    return res.data;
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/api/questions/${id}`);
  },

  generateQuestions: async (
    topicId: string,
    count: number = 3
  ): Promise<Question[]> => {
    const res = await api.post<Question[]>(`/api/topics/${topicId}/questions/generate`, { count });
    return res.data;
  },
};

// ─── Attempts API ─────────────────────────────────────────────────────────────

export const attemptsApi = {
  submitAttempt: async (data: SubmitAttemptPayload): Promise<SubmitAttemptResponse> => {
    const res = await api.post<SubmitAttemptResponse>('/api/attempts', data);
    return res.data;
  },
};

// ─── STT API ─────────────────────────────────────────────────────────────────

export const sttApi = {
  transcribe: async (audioBlob: Blob, language = 'en'): Promise<TranscribeResponse> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language', language);

    const res = await api.post<TranscribeResponse>('/api/stt/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return res.data;
  },
};

// ─── Dashboard API ────────────────────────────────────────────────────────────

export const dashboardApi = {
  getStudentDashboard: async (studentId?: string): Promise<StudentDashboard> => {
    const url = studentId ? `/api/dashboard/${studentId}` : '/api/dashboard/me';
    const res = await api.get<StudentDashboard>(url);
    return res.data;
  },

  getAdminOverview: async (): Promise<AdminOverview> => {
    const res = await api.get<AdminOverview>('/api/admin/overview');
    return res.data;
  },
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  getStudents: async (): Promise<Student[]> => {
    const res = await api.get<Student[]>('/api/admin/students');
    return res.data;
  },

  getCheatFlags: async (status?: string): Promise<CheatFlagRecord[]> => {
    const params = status ? { status } : {};
    const res = await api.get<CheatFlagRecord[]>('/api/admin/cheat-flags', { params });
    return res.data;
  },

  dismissFlag: async (flagId: string): Promise<void> => {
    await api.post(`/api/admin/cheat-flags/${flagId}/dismiss`);
  },

  escalateFlag: async (flagId: string): Promise<void> => {
    await api.post(`/api/admin/cheat-flags/${flagId}/escalate`);
  },
};

// ─── Videos API ───────────────────────────────────────────────────────────────

export const videosApi = {
  getVideos: async (topicId: string): Promise<Video[]> => {
    const res = await api.get<Video[]>(`/api/topics/${topicId}/videos`);
    return res.data;
  },

  uploadVideo: async (
    topicId: string,
    formData: FormData,
    onProgress?: (pct: number) => void
  ): Promise<Video> => {
    const res = await api.post<Video>(`/api/topics/${topicId}/videos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      },
    });
    return res.data;
  },

  deleteVideo: async (videoId: string): Promise<void> => {
    await api.delete(`/api/videos/${videoId}`);
  },
};

// Named alias used by newer components
export const apiClient = api;

export { api };
export default api;

