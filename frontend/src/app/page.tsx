'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  Sparkles,
  FileText,
  Mic,
  Eye,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Layers,
  Activity,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Target,
  Award,
  Users,
  Compass,
  Zap,
  Lock,
  Unlock,
  CheckCircle,
  HelpCircle,
  Play,
  Check,
  Shield,
  MessageSquare
} from 'lucide-react';
import TimMascot from '@/components/common/TimMascot';

interface Option {
  id: string;
  label: string;
  text: string;
  score: number;
  feedback: string;
  mood: 'happy' | 'thinking' | 'studying' | 'cheering';
  missingConcepts: string[];
}

const SIMULATOR_OPTIONS: Option[] = [
  {
    id: 'lazy',
    label: 'Memorized Guess',
    text: "It speeds up because gravity pulls it down.",
    score: 4,
    feedback: "You correctly noted that gravity pulls it down! However, you described velocity (speeding up), not acceleration. Since the ramp angle and gravity are constant, the acceleration remains constant. Think about Newton's Second Law.",
    mood: 'thinking',
    missingConcepts: ["Constant Acceleration", "Newton's Second Law"],
  },
  {
    id: 'wrong',
    label: 'Common Misconception',
    text: "The acceleration increases as it goes faster because of momentum.",
    score: 2,
    feedback: "Careful! Acceleration is the rate of change of velocity, not momentum. And acceleration does not increase just because velocity increases. What constant force is acting on it down the ramp?",
    mood: 'studying',
    missingConcepts: ["Definition of Acceleration", "Gravity Component along Ramp"],
  },
  {
    id: 'perfect',
    label: 'Socratic Mastery',
    text: "Since the ramp is frictionless and straight, the force along the ramp (mg sin θ) is constant. By Newton's Second Law (F = ma), the acceleration is constant and does not change.",
    score: 10,
    feedback: "Spectacular! Perfect analysis. You correctly broke down the constant force of gravity and linked it to constant acceleration using Newton's Second Law. That is true mastery!",
    mood: 'cheering',
    missingConcepts: [],
  }
];

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simulator State
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSelectOption = (option: Option) => {
    setEvaluating(true);
    setSelectedOption(null);
    setScore(0);

    setTimeout(() => {
      setEvaluating(false);
      setSelectedOption(option);

      // Animate score counting up
      let current = 0;
      const interval = setInterval(() => {
        if (current < option.score) {
          current++;
          setScore(current);
        } else {
          clearInterval(interval);
        }
      }, 50);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2c1e14] selection:bg-primary/20 font-sans relative overflow-x-hidden pb-12">
      {/* Playful background grids & shapes */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-[#FAF6EE] to-transparent -z-10" />
      <div className="absolute top-[20%] left-[-5%] w-[45%] aspect-square rounded-full bg-brand-100/30 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[50%] aspect-square rounded-full bg-indigo-100/30 blur-[130px] -z-10 pointer-events-none" />

      {/* Decorative floating bubbles */}
      <div className="absolute top-24 left-[12%] w-6 h-6 rounded-full border-4 border-[#2c1e14]/10 -z-10 animate-float" />
      <div className="absolute top-[60%] right-[8%] w-10 h-10 rounded-full border-4 border-[#2c1e14]/15 -z-10 animate-float-delayed" />
      <div className="absolute bottom-[20%] left-[5%] w-8 h-8 rounded-full border-4 border-primary/10 -z-10 animate-float" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b-4 border-[#2c1e14] bg-[#FAF6EE]/90 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.jpg"
              alt="TIM Logo"
              className="w-10 h-10 rounded-xl object-cover border-2 border-[#2c1e14] shadow-[2px_2px_0px_#2c1e14] group-hover:scale-105 transition-all duration-300"
            />
            <span className="font-display font-black text-xl tracking-tight text-[#2c1e14] transition-colors group-hover:text-primary">
              Teacher in Machine
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-extrabold text-[#2c1e14]/75">
            <a href="#why" className="hover:text-primary transition-colors">Why TIM</a>
            <a href="#simulator" className="hover:text-primary transition-colors">Try AI Tutor</a>
            <a href="#roadmap" className="hover:text-primary transition-colors">The Roadmap</a>
            <a href="#subjects" className="hover:text-primary transition-colors">Subjects</a>
            <a href="#integrity" className="hover:text-primary transition-colors">Anti-Cheat</a>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-wider btn-3d-primary"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2.5 rounded-xl text-xs font-black uppercase text-[#2c1e14]/70 hover:text-[#2c1e14] hover:bg-muted/40 transition-all duration-200"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-wider btn-3d-primary"
                >
                  Start Free
                  <ChevronRight className="w-4 h-4 stroke-[3px]" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Playful Promo Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FFF2E6] border-2 border-[#FF6200]/25 text-[#FF6200] text-xs font-black mb-6 animate-bounce-subtle">
              <Sparkles className="w-4 h-4 fill-[#FF6200]" />
              <span>Vibrant adaptive learning powered by Socratic AI</span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#2c1e14] leading-[1.05] mb-6">
              The AI Teacher That <span className="text-primary">Never Gives Up</span> On You.
            </h1>

            <p className="text-base sm:text-lg text-[#2c1e14]/80 max-w-xl leading-relaxed mb-8 font-bold">
              Master Physics, Chemistry & Mathematics — the way your brain actually learns. Built for school, board, and science students who want to build real mastery through active thinking.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4.5 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-wider btn-3d-primary text-center"
                >
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 stroke-[3px]" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4.5 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-wider btn-3d-primary text-center"
                  >
                    Start Learning Free
                    <ArrowRight className="w-5 h-5 stroke-[3px]" />
                  </Link>
                  <a
                    href="#simulator"
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4.5 rounded-2xl bg-[#FAF6EE] border-2 border-[#2c1e14] text-[#2c1e14] font-black text-sm uppercase tracking-wider shadow-[3px_3px_0px_#2c1e14] hover:bg-muted/40 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#2c1e14] transition-all text-center"
                  >
                    Test the AI Tutor
                    <Play className="w-4 h-4 text-primary fill-primary" />
                  </a>
                </>
              )}
            </div>

            {/* Micro badges list */}
            <div className="flex flex-wrap gap-x-5 gap-y-3 mt-10 pt-8 border-t-2 border-[#2c1e14]/10 w-full max-w-2xl text-xs font-black uppercase text-[#2c1e14]/65">
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-primary fill-primary" /> Active Recall</span>
              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-indigo-500 fill-indigo-500/20" /> Bloom&apos;s Engine</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-500 fill-emerald-500/20" /> Anti-Malpractice</span>
              <span className="flex items-center gap-1.5"><Mic className="w-4 h-4 text-rose-500" /> Voice Input</span>
            </div>
          </div>

          {/* Right Mascot Column */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">
              {/* Circular Background Accent */}
              <div className="absolute w-[300px] h-[300px] rounded-full border-4 border-[#2c1e14]/10 bg-[#FAF6EE] -z-10" />
              <div className="absolute w-[240px] h-[240px] rounded-full bg-brand-100/40 -z-10 animate-pulse-glow" />

              {/* TIM mascot with custom speech bubble */}
              <TimMascot
                size={220}
                mood="happy"
                speechBubble="Welcome! Let's build real mastery today!"
                className="hover:scale-105 transition-transform duration-300 cursor-pointer"
              />

              {/* Decorative side tags */}
              <div className="absolute -top-4 -right-2 p-3 rounded-2xl bg-white border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] flex items-center gap-2.5 animate-float">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-black text-[#2c1e14]">Textbooks Grounded</span>
              </div>

              <div className="absolute -bottom-4 -left-2 p-3 rounded-2xl bg-white border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] flex items-center gap-2.5 animate-float-delayed">
                <BrainCircuit className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-black text-[#2c1e14]">Socratic Dialogue</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Socratic AI Simulator Section */}
      <section id="simulator" className="py-20 px-6 border-y-4 border-[#2c1e14] bg-[#FAF6EE] relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black text-primary uppercase tracking-widest bg-[#FFF2E6] border-2 border-primary/20 px-4 py-2 rounded-2xl">
              AI Tutor Simulator
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2c1e14] mt-4 mb-4">
              Test Our Socratic Examiner in Real Time
            </h2>
            <p className="text-sm font-bold text-[#2c1e14]/70">
              No multiple choice. TIM evaluates your explanation like a subject expert, scores your understanding, and reveals hidden gaps in your reasoning. Click an answer below to test it!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* Left Box: Choose an answer */}
            <div className="lg:col-span-5 flex flex-col justify-between border-4 border-[#2c1e14] bg-white rounded-3xl p-6 shadow-[5px_5px_0px_#2c1e14] relative">
              <div>
                <span className="text-xs font-black text-[#2c1e14]/50 uppercase block mb-1">PHYSICS QUESTION</span>
                <h3 className="font-display font-black text-lg text-[#2c1e14] mb-6 leading-snug">
                  "A block of ice slides down a frictionless straight ramp. What happens to its acceleration as it slides down, and why?"
                </h3>

                <div className="space-y-4">
                  {SIMULATOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      disabled={evaluating}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between group relative overflow-hidden ${selectedOption?.id === opt.id
                        ? 'bg-brand-50 border-primary shadow-[2px_2px_0px_#FF6200]'
                        : 'bg-[#FFFDF9] border-[#2c1e14] hover:bg-[#FAF6EE] shadow-[3px_3px_0px_#2c1e14] hover:-translate-y-0.5 active:translate-y-0.5 hover:shadow-[2px_2px_0px_#2c1e14]'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${opt.id === 'perfect'
                          ? 'bg-emerald-50 border-emerald-500/25 text-emerald-600'
                          : opt.id === 'lazy'
                            ? 'bg-amber-50 border-amber-500/25 text-amber-600'
                            : 'bg-indigo-50 border-indigo-500/25 text-indigo-600'
                          }`}>
                          {opt.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-xs font-bold text-[#2c1e14] leading-relaxed">
                        &ldquo;{opt.text}&rdquo;
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Box: Live evaluation screen */}
            <div className="lg:col-span-7 flex flex-col justify-center border-4 border-[#2c1e14] bg-[#0A1128] rounded-3xl p-6 md:p-8 shadow-[5px_5px_0px_#2c1e14] text-white min-h-[380px] relative overflow-hidden">

              {/* Header inside display */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  TIM Live Evaluation
                </span>
                <span className="text-[10px] font-semibold text-slate-400">TIM-Grounded Engine v2</span>
              </div>

              <AnimatePresence mode="wait">
                {evaluating ? (
                  <motion.div
                    key="evaluating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 space-y-4"
                  >
                    <TimMascot size={90} mood="thinking" />
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase text-brand-300 tracking-wider">Evaluating concepts...</p>
                  </motion.div>
                ) : selectedOption ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    {/* Score section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <div className="flex items-center gap-3">
                        {/* Radial Progress Ring */}
                        <div className="relative w-14 h-14 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="28" cy="28" r="24" stroke="rgba(255,255,255,0.06)" strokeWidth="4.5" fill="transparent" />
                            <circle
                              cx="28"
                              cy="28"
                              r="24"
                              stroke={score >= 7 ? '#10B981' : score >= 4 ? '#F59E0B' : '#EF4444'}
                              strokeWidth="4.5"
                              fill="transparent"
                              strokeDasharray="150"
                              strokeDashoffset={150 - (150 * score) / 10}
                              className="transition-all duration-500"
                            />
                          </svg>
                          <span className="absolute text-sm font-black">{score}/10</span>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Socratic Score</p>
                          <p className={`text-sm font-black ${score >= 7 ? 'text-emerald-400' : score >= 4 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                            {score >= 7 ? 'Mastered!' : score >= 4 ? 'Needs Review' : 'Missing Foundations'}
                          </p>
                        </div>
                      </div>

                      {/* Mascot floating */}
                      <TimMascot size={64} mood={selectedOption.mood} className="flex-shrink-0" />
                    </div>

                    {/* Socratic Feedback */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-indigo-300">Feedback</span>
                      <p className="text-xs font-medium text-slate-200 leading-relaxed border-l-3 border-primary pl-3">
                        &ldquo;{selectedOption.feedback}&rdquo;
                      </p>
                    </div>

                    {/* Missing concepts */}
                    {selectedOption.missingConcepts.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-rose-300">Missing Concepts (Review Recommended)</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedOption.missingConcepts.map((c) => (
                            <span key={c} className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    className="flex flex-col items-center justify-center py-12 space-y-4 text-center"
                  >
                    <TimMascot size={90} mood="happy" />
                    <p className="text-sm font-bold text-slate-300">Select one of the three answers to the left to watch TIM evaluate it in real time!</p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </section>

      {/* The Roadmap Winding Teaser Preview */}
      <section id="roadmap" className="py-20 px-6 relative bg-[#FFFDF9]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: Text explaining the roadmap */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-black text-primary uppercase tracking-widest bg-[#FFF2E6] border-2 border-primary/20 px-4 py-2 rounded-2xl">
                Gamified Progression
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2c1e14] mt-4 mb-4 leading-tight">
                Learn Step-by-Step with the Interactive Winding Roadmap
              </h2>
              <p className="text-base text-[#2c1e14]/75 font-semibold leading-relaxed">
                We believe that learning is a journey. Subjects are represented as winding staggered milestones. You can't skip ahead or rush. Real science requires solid building blocks.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 font-bold border-2 border-[#2c1e14] shadow-[1px_1px_0px_#2c1e14]">✓</div>
                  <div>
                    <h4 className="font-bold text-xs uppercase text-[#2c1e14]">1. Passed Milestones</h4>
                    <p className="text-xs font-semibold text-muted-foreground">Chapters you've passed. Keep moving or jump back to review them anytime!</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white flex-shrink-0 font-bold border-2 border-[#2c1e14] shadow-[1px_1px_0px_#2c1e14] animate-pulse">★</div>
                  <div>
                    <h4 className="font-bold text-xs uppercase text-primary">2. Glowing Active Node</h4>
                    <p className="text-xs font-semibold text-muted-foreground">Your current study hub. Watch concept videos, read notes, chat with AI, and test your mastery.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0 font-bold border-2 border-[#2c1e14]/30 shadow-[1px_1px_0px_rgba(44,30,20,0.15)]"><Lock className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-bold text-xs uppercase text-muted-foreground/80">3. Gated Locks</h4>
                    <p className="text-xs font-semibold text-muted-foreground/60">Locked chapters. Earn at least 70% average on the current active milestone to unlock the next chapter.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Visual Roadmap Mockup */}
            <div className="lg:col-span-6">
              <div className="relative border-4 border-[#2c1e14] bg-[#FAF6EE] rounded-3xl p-8 shadow-[6px_6px_0px_#2c1e14]">
                <h4 className="font-display font-extrabold text-[#2c1e14] text-sm uppercase tracking-wider mb-8 text-center">Roadmap Path Preview</h4>

                <div className="relative flex flex-col items-center gap-10 py-4">
                  {/* SVG Connector Path */}
                  <svg className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-24 h-full pointer-events-none" fill="none">
                    <path
                      d="M 48 0 C 10 50, 80 100, 48 150 C 10 200, 80 250, 48 300 C 10 350, 80 400, 48 450"
                      stroke="#2c1e14"
                      strokeWidth="4"
                      strokeDasharray="8 8"
                    />
                  </svg>

                  {/* Milestone 1: Kinematics (Passed) */}
                  <div className="z-10 flex flex-col items-center translate-x-[-30px]">
                    <div className="w-14 h-14 rounded-full bg-emerald-500 border-4 border-[#2c1e14] flex items-center justify-center text-white shadow-[3px_3px_0px_#2c1e14] hover:scale-105 transition-all">
                      <Check className="w-6 h-6 stroke-[3px]" />
                    </div>
                    <span className="text-xs font-bold text-[#2c1e14] mt-2">1. Kinematics</span>
                  </div>

                  {/* Milestone 2: Laws of Motion (Active) */}
                  <div className="z-10 flex flex-col items-center translate-x-[30px] relative group">
                    <div className="w-16 h-16 rounded-full bg-primary border-4 border-[#2c1e14] flex items-center justify-center text-white shadow-[4px_4px_0px_#2c1e14] animate-pulse-glow cursor-pointer hover:scale-105 transition-all">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-extrabold text-primary mt-2">2. Laws of Motion</span>

                    {/* Speech bubble */}
                    <div className="absolute left-[80px] -top-6 w-52 bg-white border-2 border-[#2c1e14] rounded-2xl p-3 shadow-[4px_4px_0px_#2c1e14] transition-all opacity-100 group-hover:scale-105">
                      <div className="flex items-start gap-2">
                        <TimMascot size={32} mood="happy" className="flex-shrink-0 animate-bounce-subtle" />
                        <div>
                          <p className="text-[10px] font-black text-primary">CURRENT CHAPTER</p>
                          <p className="text-xs font-bold text-[#2c1e14]">Score &ge; 70% to unlock next topic!</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milestone 3: Work, Energy & Power (Locked) */}
                  <div className="z-10 flex flex-col items-center translate-x-[-20px]">
                    <div className="w-14 h-14 rounded-full bg-white border-4 border-[#2c1e14]/25 flex items-center justify-center text-muted-foreground/40 shadow-[3px_3px_0px_rgba(44,30,20,0.15)]">
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground/40 mt-2">3. Work & Energy</span>
                  </div>

                  {/* Milestone 4: Rotational Motion (Locked) */}
                  <div className="z-10 flex flex-col items-center translate-x-[20px]">
                    <div className="w-14 h-14 rounded-full bg-white border-4 border-[#2c1e14]/25 flex items-center justify-center text-muted-foreground/40 shadow-[3px_3px_0px_rgba(44,30,20,0.15)]">
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground/40 mt-2">4. Rotational Motion</span>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why We Built This */}
      <section id="why" className="py-20 px-6 border-t-4 border-[#2c1e14] bg-[#FAF6EE] relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 border-2 border-indigo-500/20 px-4 py-2 rounded-2xl">
              Why We Built This
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2c1e14] mt-4 mb-4">
              Passive Learning is Broken.
            </h2>
            <p className="text-sm font-bold text-[#2c1e14]/70">
              Watching videos and reading summaries feels productive, but it results in poor recall. We built TIM to make science active and engaging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Box 1 */}
            <div className="p-6 rounded-3xl bg-white border-4 border-[#2c1e14] shadow-[4px_4px_0px_#2c1e14] hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border-2 border-[#2c1e14] flex items-center justify-center text-primary mb-5 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-[#2c1e14] mb-3">📚 Passive Recall Fails</h3>
              <p className="text-xs text-[#2c1e14]/75 leading-relaxed font-bold">
                Reading static notes or watching long playlists creates the "illusion of competence". Without answering Socratic questions, 80% is forgotten within 48 hours.
              </p>
            </div>

            {/* Box 2 */}
            <div className="p-6 rounded-3xl bg-white border-4 border-[#2c1e14] shadow-[4px_4px_0px_#2c1e14] hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border-2 border-[#2c1e14] flex items-center justify-center text-primary mb-5 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-[#2c1e14] mb-3">👨‍🏫 Missing Personal Feedback</h3>
              <p className="text-xs text-[#2c1e14]/75 leading-relaxed font-bold">
                Standard courses cannot look at your specific explanation and correct your core reasoning gaps. TIM bridges this by grading explanations in seconds.
              </p>
            </div>

            {/* Box 3 */}
            <div className="p-6 rounded-3xl bg-white border-4 border-[#2c1e14] shadow-[4px_4px_0px_#2c1e14] hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border-2 border-[#2c1e14] flex items-center justify-center text-primary mb-5 group-hover:scale-105 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-[#2c1e14] mb-3">⏳ Knowing What You Don't Know</h3>
              <p className="text-xs text-[#2c1e14]/75 leading-relaxed font-bold">
                A student cannot resolve misconceptions without trying to apply ideas in unseen contexts. TIM pushes you from simple memorization to deep application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Teach - Bloom's Taxonomy */}
      <section id="subjects" className="py-20 px-6 relative bg-[#FFFDF9]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-black text-primary uppercase tracking-widest bg-[#FFF2E6] border-2 border-primary/20 px-4 py-2 rounded-2xl">
                Bloom's Engine
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2c1e14] mt-4 mb-6">
                Evaluating Understanding at Three Cognitive Levels
              </h2>
              <p className="text-base text-[#2c1e14]/75 font-semibold leading-relaxed">
                Top schools and competitions evaluate more than memory. TIM ensures you master every chapter across all three levels before allowing progression:
              </p>
              <div className="p-4 rounded-2xl bg-[#FAF6EE] border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] flex items-center gap-3">
                <TimMascot size={48} mood="happy" className="flex-shrink-0 animate-bounce-subtle" />
                <p className="text-xs font-bold text-[#2c1e14]">
                  "TIM evaluates your written response against strict guidelines!"
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {/* Remember */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border-2 border-[#2c1e14] flex items-center justify-center text-blue-600 font-black flex-shrink-0">
                  R
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm uppercase mb-1">🔵 Remember — Core Foundation</h4>
                  <p className="text-xs text-muted-foreground font-semibold mb-2">Can you recall fundamental definitions, formulas, and units with absolute precision?</p>
                  <p className="text-xs font-bold text-[#2c1e14] bg-[#FAF6EE] p-2.5 rounded-xl border border-[#2c1e14]/20">
                    <span className="text-primary font-black">E.g.,</span> "State the SI unit of electric charge and define it."
                  </p>
                </div>
              </div>

              {/* Understand */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border-2 border-[#2c1e14] flex items-center justify-center text-indigo-500 font-black flex-shrink-0">
                  U
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm uppercase mb-1">🟣 Understand — Socratic Logic</h4>
                  <p className="text-xs text-muted-foreground font-semibold mb-2">Can you explain a physical phenomenon in your own words rather than repeating facts?</p>
                  <p className="text-xs font-bold text-[#2c1e14] bg-[#FAF6EE] p-2.5 rounded-xl border border-[#2c1e14]/20">
                    <span className="text-primary font-black">E.g.,</span> "Why does a charged particle travel in a circle inside a magnetic field?"
                  </p>
                </div>
              </div>

              {/* Apply */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-[#2c1e14] flex items-center justify-center text-amber-600 font-black flex-shrink-0">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm uppercase mb-1">🟠 Apply — Solve Under Pressure</h4>
                  <p className="text-xs text-muted-foreground font-semibold mb-2">Can you apply physical laws to solve numerical or conceptual problem steps?</p>
                  <p className="text-xs font-bold text-[#2c1e14] bg-[#FAF6EE] p-2.5 rounded-xl border border-[#2c1e14]/20">
                    <span className="text-primary font-black">E.g.,</span> "Determine the velocity after 5 seconds for a 2kg block pushed by 10N."
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Honest Learning / Anti-Cheat Monitoring */}
      <section id="integrity" className="py-20 px-6 border-t-4 border-[#2c1e14] bg-[#FAF6EE] relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black text-rose-500 uppercase tracking-widest bg-rose-50 border-2 border-rose-500/20 px-4 py-2 rounded-2xl">
              Honest Learning
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2c1e14] mt-4 mb-4">
              Real Mastery Requires Honest Efforts
            </h2>
            <p className="text-sm font-bold text-[#2c1e14]/70">
              TIM includes client-side telemetry to detect copying, text pasting, tab-switching, and robotic timing behavior during tests, securing your true preparation progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="p-5 rounded-3xl bg-white border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] hover:scale-102 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-[#2c1e14]/15 flex items-center justify-center text-primary mb-4 font-bold">
                ⌨️
              </div>
              <h4 className="font-bold text-xs uppercase text-[#2c1e14] mb-1.5">Keystroke Telemetry</h4>
              <p className="text-[11px] font-semibold text-muted-foreground leading-relaxed">
                TIM analyzes typing intervals and patterns. Pasted answers and bot-like uniform timing are automatically flagged.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] hover:scale-102 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-[#2c1e14]/15 flex items-center justify-center text-indigo-500 mb-4 font-bold">
                🎙️
              </div>
              <h4 className="font-bold text-xs uppercase text-[#2c1e14] mb-1.5">Voice Ans Mode</h4>
              <p className="text-[11px] font-semibold text-muted-foreground leading-relaxed">
                Speak your answer naturally. Native dictation processes your explanation and types it into the chat live.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] hover:scale-102 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-[#2c1e14]/15 flex items-center justify-center text-amber-500 mb-4 font-bold">
                👁️
              </div>
              <h4 className="font-bold text-xs uppercase text-[#2c1e14] mb-1.5">Focus Tracking</h4>
              <p className="text-[11px] font-semibold text-muted-foreground leading-relaxed">
                Swapping tabs or opening side windows during evaluations are logged to maintain test integrity.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] hover:scale-102 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-[#2c1e14]/15 flex items-center justify-center text-emerald-500 mb-4 font-bold">
                🔒
              </div>
              <h4 className="font-bold text-xs uppercase text-[#2c1e14] mb-1.5">Gated Unlock</h4>
              <p className="text-[11px] font-semibold text-muted-foreground leading-relaxed">
                Chapters remain locked until you pass current active nodes, keeping you dedicated to structured, solid revisions.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 px-6 bg-[#FFFDF9] relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black text-primary uppercase tracking-widest bg-[#FFF2E6] border-2 border-primary/20 px-4 py-2 rounded-2xl">
              Student Reviews
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2c1e14] mt-4">
              Cheered by Mastery Builders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Student 1 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] flex flex-col justify-between">
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed italic mb-6">
                "I used to mark chapters as done just by looking at notes. TIM showed me I was fooling myself. The AI feedback on my Chemistry derivations is sharper than my personal tutor!"
              </p>
              <div className="flex items-center gap-2">
                <TimMascot size={32} mood="happy" className="flex-shrink-0" />
                <div>
                  <span className="text-xs font-black text-[#2c1e14] block">Arjun S.</span>
                  <span className="text-[9px] text-muted-foreground font-black">PUNE · Grade 12</span>
                </div>
              </div>
            </div>

            {/* Student 2 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] flex flex-col justify-between">
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed italic mb-6">
                "The Bloom's radar chart metrics hit differently. I realized I could remember facts but failed to apply them. That single dashboard insight changed how I study completely."
              </p>
              <div className="flex items-center gap-2">
                <TimMascot size={32} mood="thinking" className="flex-shrink-0" />
                <div>
                  <span className="text-xs font-black text-[#2c1e14] block">Priya M.</span>
                  <span className="text-[9px] text-muted-foreground font-black">NAGPUR · Science Prep</span>
                </div>
              </div>
            </div>

            {/* Student 3 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] flex flex-col justify-between">
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed italic mb-6">
                "Speaking my physics explanations out loud was a game changer. The Socratic voice dictation translates instantly and grades details in real-time. Extremely engaging!"
              </p>
              <div className="flex items-center gap-2">
                <TimMascot size={32} mood="cheering" className="flex-shrink-0" />
                <div>
                  <span className="text-xs font-black text-[#2c1e14] block">Rohan K.</span>
                  <span className="text-[9px] text-muted-foreground font-black">BENGALURU · Boards Prep</span>
                </div>
              </div>
            </div>

            {/* Student 4 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#2c1e14] shadow-[3px_3px_0px_#2c1e14] flex flex-col justify-between">
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed italic mb-6">
                "The chapter-gating was annoying at first. But when I scored 75% and unlocked Laws of Motion, the sense of accomplishment was real. This is how learning should be."
              </p>
              <div className="flex items-center gap-2">
                <TimMascot size={32} mood="happy" className="flex-shrink-0 animate-bounce-subtle" />
                <div>
                  <span className="text-xs font-black text-[#2c1e14] block">Sneha T.</span>
                  <span className="text-[9px] text-muted-foreground font-black">HYDERABAD · Grade 11</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/10 via-[#FFFDF9] to-indigo-500/10 border-t-4 border-[#2c1e14] relative">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs font-black text-primary tracking-widest bg-[#FFF2E6] border-2 border-primary/20 px-4 py-2 rounded-2xl uppercase inline-block">
            Start Your Journey
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-[#2c1e14] leading-tight">
            Stop Memorizing. Start Mastering.
          </h2>
          <p className="text-sm font-semibold text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join thousands of school and college students who built actual science confidence. One stepping stone at a time.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 max-w-md mx-auto pt-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-wider btn-3d-primary text-center flex-1"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 stroke-[3px]" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-wider btn-3d-primary text-center flex-1"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border-2 border-[#2c1e14] text-[#2c1e14] font-black text-sm uppercase tracking-wider shadow-[3px_3px_0px_#2c1e14] hover:bg-muted/40 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#2c1e14] transition-all text-center flex-1"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-[#2c1e14] bg-white py-16 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white border-2 border-[#2c1e14] shadow-[1px_1px_0px_#2c1e14]">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="font-display font-black text-[#2c1e14] text-lg">Teacher in Machine</span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold">
              Active recall. Gamified roadmaps. Honest preparation.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#2c1e14] mb-4">Features</h4>
            <ul className="space-y-2 text-xs font-bold text-muted-foreground">
              <li><a href="#why" className="hover:text-primary transition-colors">Why Active Learning</a></li>
              <li><a href="#simulator" className="hover:text-primary transition-colors">AI Socratic Evaluator</a></li>
              <li><a href="#roadmap" className="hover:text-primary transition-colors">Mastery Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#2c1e14] mb-4">Core Subjects</h4>
            <ul className="space-y-2 text-xs font-bold text-muted-foreground">
              <li><span className="hover:text-primary cursor-pointer transition-colors">Physics Concepts</span></li>
              <li><span className="hover:text-primary cursor-pointer transition-colors">Chemistry Reactions</span></li>
              <li><span className="hover:text-primary cursor-pointer transition-colors">Mathematics Analysis</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#2c1e14] mb-4">Portal Access</h4>
            <ul className="space-y-2 text-xs font-bold text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Student Dashboard</Link></li>
              <li><Link href="/admin-login" className="hover:text-primary transition-colors text-indigo-600 font-black">Tutor / Admin Login</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-[#2c1e14]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-semibold">
          <p>
            &copy; 2026 Teacher in Machine. Built in India. Powered by D-6503.
          </p>
          <div className="flex gap-4">
            <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
