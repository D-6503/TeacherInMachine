import { create } from 'zustand';
import { Topic } from '@/types';

interface ProgressState {
  currentSubjectId: string | null;
  currentTopicId: string | null;
  topics: Topic[];
  setCurrentSubject: (id: string) => void;
  setCurrentTopic: (id: string) => void;
  setTopics: (topics: Topic[]) => void;
  updateTopicStatus: (topicId: string, status: Topic['status']) => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  currentSubjectId: null,
  currentTopicId: null,
  topics: [],
  setCurrentSubject: (id) => set({ currentSubjectId: id }),
  setCurrentTopic: (id) => set({ currentTopicId: id }),
  setTopics: (topics) => set({ topics }),
  updateTopicStatus: (topicId, status) =>
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId ? { ...t, status } : t
      ),
    })),
}));
