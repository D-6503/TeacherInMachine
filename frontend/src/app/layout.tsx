import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';
import Providers from './providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'TIM — Teacher in Machine | AI Adaptive Science Learning',
  description: 'Interactive AI-powered Socratic study platform for physics, chemistry, and mathematics with real-time feedback.',
  keywords: 'TIM, Teacher in Machine, AI, Socratic learning, adaptive learning, physics, chemistry, mathematics, science education',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            theme="light"
            toastOptions={{
              style: {
                background: 'rgba(254, 251, 244, 0.95)',
                border: '1px solid rgba(44, 30, 20, 0.08)',
                color: '#2c1e14',
                backdropFilter: 'blur(12px)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
