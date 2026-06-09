'use client';
import { motion } from 'framer-motion';

interface Props {
  className?: string;
  size?: number;
  mood?: 'happy' | 'thinking' | 'studying' | 'cheering';
  speechBubble?: string;
}

export default function TimMascot({ className = '', size = 80, mood = 'happy', speechBubble }: Props) {
  // Cute Expressive Eyes based on mood
  const renderEyes = () => {
    switch (mood) {
      case 'thinking':
        return (
          <>
            {/* Thinking / Curious eyes */}
            <ellipse cx="28" cy="38" rx="4" ry="1.5" fill="#2c1e14" />
            <ellipse cx="52" cy="38" rx="4" ry="1.5" fill="#2c1e14" />
            {/* Thinking eyebrows */}
            <path d="M24 32 Q28 34 32 32" stroke="#2c1e14" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M48 30 Q52 32 56 34" stroke="#2c1e14" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        );
      case 'cheering':
        return (
          <>
            {/* Cheering squinty eyes (arcs) */}
            <path d="M22 40 Q28 32 34 40" stroke="#2c1e14" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M46 40 Q52 32 58 40" stroke="#2c1e14" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </>
        );
      case 'studying':
        return (
          <>
            {/* Rounded study glasses or focused eyes */}
            <circle cx="28" cy="38" r="6" fill="none" stroke="#2c1e14" strokeWidth="3" />
            <circle cx="52" cy="38" r="6" fill="none" stroke="#2c1e14" strokeWidth="3" />
            <path d="M34 38 L46 38" stroke="#2c1e14" strokeWidth="3" />
            <circle cx="28" cy="38" r="2.5" fill="#2c1e14" />
            <circle cx="52" cy="38" r="2.5" fill="#2c1e14" />
          </>
        );
      case 'happy':
      default:
        return (
          <>
            {/* Big happy round eyes with highlights */}
            <circle cx="28" cy="38" r="5" fill="#2c1e14" />
            <circle cx="52" cy="38" r="5" fill="#2c1e14" />
            <circle cx="26.5" cy="36.5" r="1.5" fill="#ffffff" />
            <circle cx="50.5" cy="36.5" r="1.5" fill="#ffffff" />
          </>
        );
    }
  };

  // Cute mouth based on mood
  const renderMouth = () => {
    if (mood === 'thinking') {
      // Wavy / straight line mouth
      return <path d="M36 48 Q40 46 44 48" stroke="#2c1e14" strokeWidth="3" strokeLinecap="round" fill="none" />;
    }
    // Wide happy open mouth
    return <path d="M35 46 Q40 52 45 46" stroke="#2c1e14" strokeWidth="3.5" strokeLinecap="round" fill="#e11d48" />;
  };

  return (
    <div className={`relative flex items-center gap-3 ${className}`}>
      {/* Cartoon Speech Bubble */}
      {speechBubble && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          className="relative bg-card border-2 border-border p-3 rounded-2xl shadow-sm text-xs font-bold text-foreground max-w-[180px] leading-relaxed after:content-[''] after:absolute after:top-1/2 after:-right-[10px] after:-translate-y-1/2 after:border-y-8 after:border-y-transparent after:border-l-8 after:border-l-card before:content-[''] before:absolute before:top-1/2 before:-right-[12px] before:-translate-y-1/2 before:border-y-8 before:border-y-transparent before:border-l-8 before:border-l-border before:-z-10"
        >
          {speechBubble}
        </motion.div>
      )}

      {/* SVG Cartoon Character */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-bob"
      >
        {/* Antennas */}
        <path d="M40 18 L40 8" stroke="#0084C9" strokeWidth="4" strokeLinecap="round" />
        <circle cx="40" cy="6" r="3.5" fill="#FF6200" stroke="#0084C9" strokeWidth="1.5" />

        {/* Ears / Sidebolts */}
        <rect x="6" y="28" width="8" height="14" rx="3" fill="#0084C9" />
        <rect x="66" y="28" width="8" height="14" rx="3" fill="#0084C9" />

        {/* Robot Head Outer Body */}
        <rect x="12" y="16" width="56" height="42" rx="18" fill="#FF6200" stroke="#2c1e14" strokeWidth="4" />

        {/* Screen/Face */}
        <rect x="18" y="22" width="44" height="30" rx="10" fill="#FFF2E6" stroke="#2c1e14" strokeWidth="3" />

        {/* Cheeks blush */}
        <circle cx="23" cy="44" r="2.5" fill="#f43f5e" opacity="0.4" />
        <circle cx="57" cy="44" r="2.5" fill="#f43f5e" opacity="0.4" />

        {/* Render eyes & mouth */}
        {renderEyes()}
        {renderMouth()}

        {/* Body neck */}
        <rect x="34" y="58" width="12" height="8" rx="2" fill="#0084C9" stroke="#2c1e14" strokeWidth="3.5" />

        {/* Cute Hands (if cheering) */}
        {mood === 'cheering' ? (
          <>
            <motion.path
              d="M10 52 Q3 44 8 38"
              stroke="#FF6200"
              strokeWidth="4.5"
              strokeLinecap="round"
              animate={{ rotate: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <motion.path
              d="M70 52 Q77 44 72 38"
              stroke="#FF6200"
              strokeWidth="4.5"
              strokeLinecap="round"
              animate={{ rotate: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          </>
        ) : (
          <>
            <path d="M10 52 Q4 56 6 62" stroke="#FF6200" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M70 52 Q76 56 74 62" stroke="#FF6200" strokeWidth="4.5" strokeLinecap="round" />
          </>
        )}

        {/* Shoulders / Base */}
        <path d="M22 66 C22 66 26 76 40 76 C54 76 58 66 58 66 Z" fill="#0084C9" stroke="#2c1e14" strokeWidth="4" />
        {/* Decorative chest node */}
        <circle cx="40" cy="71" r="2" fill="#FFF2E6" />
      </motion.svg>
    </div>
  );
}
