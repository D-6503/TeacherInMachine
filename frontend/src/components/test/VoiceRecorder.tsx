'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  onTranscript: (text: string) => void;
}

export default function VoiceRecorder({ onTranscript }: Props) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isNativeSupported, setIsNativeSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsNativeSupported(true);
    }
  }, []);

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      // Use high-performance client-side browser speech recognition
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
            onTranscript(newFinals);
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
      // Fallback: Record media locally and transcribe on backend
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];
        
        recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
        
        recorder.onstop = async () => {
          setTranscribing(true);
          try {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');
            
            const res = await apiClient.post('/api/stt/transcribe', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            if (res.data.transcript) {
              onTranscript(res.data.transcript + ' ');
            } else {
              toast.error('Could not detect any speech in the audio.');
            }
          } catch {
            toast.error('Transcription failed. Please try typing your answer.');
          } finally {
            setTranscribing(false);
            stream.getTracks().forEach((t) => t.stop());
          }
        };

        recorder.start();
        mediaRef.current = recorder;
        setRecording(true);
      } catch (e) {
        toast.error('Microphone access denied. Please allow microphone access in browser settings.');
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

  if (transcribing) {
    return (
      <div className="flex flex-col items-center justify-center h-28 gap-2">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
        <p className="text-xs font-semibold text-muted-foreground">Transcribing your voice answer…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-2 gap-3 w-full">
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
          recording
            ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 animate-pulse scale-105'
            : 'bg-primary hover:bg-brand-600 hover:scale-105 active:scale-95 shadow-sm'
        }`}
      >
        {recording ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
      </button>

      <div className="text-center min-h-[20px] max-w-md px-4">
        {recording ? (
          interimText ? (
            <p className="text-xs italic text-primary/80 animate-pulse font-medium">
              &ldquo;{interimText}&rdquo;
            </p>
          ) : (
            <p className="text-xs font-semibold text-rose-500 animate-pulse">
              Listening… Speak now
            </p>
          )
        ) : (
          <p className="text-xs font-semibold text-muted-foreground">
            {isNativeSupported 
              ? 'Click to dictate (words will type in real-time)' 
              : 'Click to start voice recording'}
          </p>
        )}
      </div>

      {recording && (
        <div className="flex gap-0.5 items-center justify-center h-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-primary/70 rounded-full animate-bounce"
              style={{
                height: `${8 + Math.random() * 12}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

