'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Mic, MicOff, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { topicsApi, sttApi } from '@/lib/api';
import { preprocessTutorResponse } from '@/lib/math-utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  topicId: string;
}

const SUGGESTIONS = [
  { text: "Summarize this topic", query: "Summarize this topic for me, highlighting the most important concepts." },
  { text: "Explain key formulas", query: "What are the most important formulas for this topic and how are they used?" },
  { text: "Ask me a question", query: "Ask me a conceptual question about this topic to test my understanding." },
  { text: "Give a practical example", query: "Can you give me a real-life practical application of the concepts in this topic?" }
];

export default function AIChatTab({ topicId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice Recording state
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isNativeSupported, setIsNativeSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsNativeSupported(true);
    }
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, transcribing]);

  const handleSend = async (textToSend = inputValue) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Map messages history format to what the API expects
      const apiHistory = messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await topicsApi.chatWithTutor(topicId, trimmed, apiHistory);
      
      setMessages(prev => [...prev, { role: 'assistant', content: res.response }]);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to get a response from your AI tutor.');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setRecording(true);
          setInterimText('');
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event);
          if (event.error !== 'no-speech') {
            toast.error(`Microphone error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setRecording(false);
          setInterimText('');
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let newFinals = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              newFinals += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (newFinals) {
            setInputValue(prev => {
              const base = prev.trim();
              return base ? `${base} ${newFinals}` : newFinals;
            });
            setInterimText('');
          } else if (interimTranscript) {
            setInterimText(interimTranscript);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.error(err);
        toast.error('Failed to start speech recognition.');
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];
        recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
        recorder.onstop = async () => {
          setTranscribing(true);
          try {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const res = await sttApi.transcribe(blob);
            if (res.transcript && res.transcript.trim()) {
              setInputValue(prev => {
                const base = prev.trim();
                return base ? `${base} ${res.transcript.trim()}` : res.transcript.trim();
              });
              toast.success("Voice transcribed successfully!");
            } else {
              toast.error("No speech detected. Try speaking closer to the microphone.");
            }
          } catch (err) {
            console.error(err);
            toast.error('Voice transcription failed. Please try typing instead.');
          } finally {
            setTranscribing(false);
            stream.getTracks().forEach((t) => t.stop());
          }
        };
        recorder.start();
        mediaRef.current = recorder;
        setRecording(true);
      } catch (e) {
        toast.error('Microphone access denied. Please allow microphone permissions.');
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    } else if (mediaRef.current) {
      mediaRef.current.stop();
    }
    setRecording(false);
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Conversation history cleared.");
  };

  return (
    <div className="flex flex-col h-[500px] border border-border rounded-xl bg-background overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">TIM Socratic Tutor</h4>
            <p className="text-xs font-semibold text-muted-foreground">Interactive Science & Math Coach</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={clearChat}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all hover:bg-muted rounded-md border border-border"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto px-4 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h5 className="font-bold text-foreground font-display text-sm">Ask your Socratic Tutor</h5>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Stuck on a concept, formula, or derivation? Ask me! I won&apos;t just give you the answer; I will guide you to figure it out yourself.
            </p>
            
            {/* Suggestions */}
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.query)}
                  className="p-3 text-left border border-border rounded-xl hover:bg-muted hover:border-brand-300 text-xs font-semibold text-foreground transition-all hover:-translate-y-0.5 bg-card shadow-sm leading-snug"
                >
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm border ${
                      m.role === 'user'
                        ? 'bg-primary text-white border-primary/20 rounded-tr-none'
                        : 'bg-card text-foreground border-border rounded-tl-none prose prose-sm leading-relaxed font-medium'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap font-medium">{m.content}</p>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-base font-extrabold text-foreground mb-2 mt-3" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-sm font-bold text-foreground mb-1.5 mt-2" {...props} />,
                          p: ({ node, ...props }) => <p className="leading-relaxed mb-2 text-xs md:text-sm" {...props} />,

                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 mb-2" {...props} />,
                          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold text-primary" {...props} />,
                          code: ({ node, ...props }) => (
                            <code className="bg-muted text-primary rounded px-1 py-0.5 text-xs font-mono border border-border" {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-2 border-primary pl-3 text-muted-foreground italic my-2 bg-muted/40 py-1 rounded-r-md" {...props} />
                          ),
                        }}
                      >
                        {preprocessTutorResponse(m.content)}
                      </ReactMarkdown>

                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card text-muted-foreground border border-border rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="font-semibold text-xs animate-pulse">Tutor is thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating chips (shown when conversation is active) */}
      {messages.length > 0 && !isLoading && (
        <div className="flex gap-2 px-4 py-2 bg-muted/5 border-t border-border overflow-x-auto whitespace-nowrap scrollbar-none">
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s.query)}
              className="inline-block px-3 py-1.5 bg-card hover:bg-muted text-xs font-semibold text-foreground border border-border rounded-full transition-all hover:-translate-y-0.5 shadow-sm"
            >
              {s.text}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border bg-card space-y-2">
        {transcribing && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-xs font-semibold text-muted-foreground animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>Transcribing audio...</span>
          </div>
        )}

        {recording && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-xs font-bold text-rose-600 animate-pulse">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
            {interimText ? (
              <span>Dictating: &ldquo;{interimText}&rdquo;</span>
            ) : (
              <span>Listening… Speak now</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 border border-border rounded-xl p-1 bg-background focus-within:ring-2 focus-within:ring-primary/20">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={recording ? "Listening... Speak now and press microphone button to stop" : "Ask your Socratic tutor..."}
            disabled={isLoading || recording}
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none py-2 px-3 text-sm text-foreground placeholder:text-muted-foreground max-h-24"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={isLoading || transcribing}
            type="button"
            title={recording ? "Stop recording" : "Record voice query"}
            className={`p-2.5 rounded-lg transition-all ${
              recording
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => handleSend()}
            disabled={isLoading || recording || !inputValue.trim()}
            type="button"
            className="p-2.5 rounded-lg bg-primary hover:bg-brand-600 text-white transition-all disabled:opacity-50 disabled:hover:bg-primary shadow-sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div ref={chatEndRef} className="h-0" />
    </div>
  );
}
