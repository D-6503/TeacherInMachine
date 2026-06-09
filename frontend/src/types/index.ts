export interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  class_level: number;
  description?: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  title: string;
  sequence_order: number;
  description?: string;
  pdf_url?: string;
  summary?: string;
  pass_threshold: number;
  is_active: boolean;
  status?: 'locked' | 'in_progress' | 'passed';
  best_score?: number;
}

export interface Video {
  id: string;
  topic_id: string;
  title: string;
  url: string;
  duration_seconds: number;
  language: string;
  is_active: boolean;
}

export interface Question {
  id: string;
  topic_id: string;
  question_text: string;
  expected_answer: string;
  bloom_level: 'remember' | 'understand' | 'apply';
  created_by: string;
  is_validated: boolean;
  is_active: boolean;
  created_at: string;
}

export interface KeystrokeEvent {
  key: string;
  timestamp: number;
  delta: number;
  type: 'keydown' | 'paste' | 'delete';
}

export interface CheatFlag {
  type: string;
  severity: string;
  detail: string;
  escalated?: boolean;
}

export interface Attempt {
  id: string;
  student_id: string;
  question_id: string;
  topic_id: string;
  answer_text: string;
  input_mode: string;
  score?: number;
  feedback?: string;
  missing_concepts: string[];
  cheat_flags: CheatFlag[];
  wpm?: number;
  keystroke_count: number;
  paste_detected: boolean;
  tab_switches: number;
  created_at: string;
}

export interface SubmitAttemptRequest {
  student_id: string;
  question_id: string;
  topic_id: string;
  answer_text: string;
  input_mode: 'typed' | 'voice';
  keystrokes: KeystrokeEvent[];
  wpm?: number;
  paste_detected: boolean;
  tab_switches: number;
}

export interface SubmitAttemptResponse {
  attempt_id: string;
  score: number;
  feedback: string;
  missing_concepts: string[];
  cheat_flags: CheatFlag[];
  topic_status: string;
  next_topic_unlocked: boolean;
  next_topic_id?: string;
  unlock_message: string;
  student_answer?: string;
  expected_answer?: string;
}

export interface BloomScores {
  remember: number;
  understand: number;
  apply: number;
}

export interface WeakArea {
  topic_id: string;
  topic_title: string;
  subject: string;
  best_score: number;
}

export interface AttemptSummary {
  attempt_id: string;
  topic_title: string;
  bloom_level: string;
  score?: number;
  input_mode: string;
  created_at: string;
  cheat_flags: CheatFlag[];
}

export interface TopicProgressItem {
  topic_id: string;
  topic_title: string;
  subject: string;
  status: string;
  best_score: number;
  attempts_count: number;
}

export interface StudentDashboard {
  student_id: string;
  name: string;
  bloom_scores: BloomScores;
  total_topics: number;
  passed_topics: number;
  recent_attempts: AttemptSummary[];
  weak_areas: WeakArea[];
  topic_progress: TopicProgressItem[];
}

export interface AdminOverview {
  total_students: number;
  active_students: number;
  total_attempts: number;
  avg_score: number;
  pending_cheat_flags: number;
  subject_pass_rates: Record<string, number>;
}

export interface AdminStudent {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  attempt_count: number;
  passed_topics: number;
}

export interface CheatFlagRow {
  attempt_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  topic_title: string;
  topic_id: string;
  cheat_flags: CheatFlag[];
  score?: number;
  created_at: string;
}
