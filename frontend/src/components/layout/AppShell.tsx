'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import TopNav from './TopNav';
import ChapterSidebar from './ChapterSidebar';
import { Menu, X } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-80 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } top-16 lg:top-0`}
        >
          <ChapterSidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col justify-between">
          <div className="max-w-6xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <footer className="w-full max-w-6xl mx-auto mt-16 pt-6 border-t-2 border-[#2c1e14]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-semibold">
            <p>&copy; 2026 Teacher in Machine. Built in India. Powered by D-6503.</p>
            <div className="flex gap-4 text-[#2c1e14]/50">
              <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
              <span>·</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
