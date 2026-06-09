export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Premium light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFFDF9] via-[#FFF9F2] to-[#F0F5FF]" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      <div className="relative z-10 w-full max-w-md px-4 flex-1 flex items-center justify-center">{children}</div>
      
      {/* Footer */}
      <footer className="relative z-10 w-full max-w-md px-4 py-6 text-center text-xs text-muted-foreground font-semibold">
        <p>&copy; 2026 Teacher in Machine. Built in India. Powered by D-6503.</p>
        <div className="flex justify-center gap-4 text-[#2c1e14]/50 mt-2">
          <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
          <span>·</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
