import { TestTube2, Zap, HelpCircle } from 'lucide-react';

export default function Header({ onAbout }) {
  return (
    <header className="relative overflow-hidden border-b border-green-500/10">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 animate-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(74,222,128,0.08)_0%,_transparent_60%)]" />
      
      <div className="relative flex items-center justify-between py-5 px-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400/20 rounded-xl blur-xl" />
            <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 p-2.5 rounded-xl shadow-lg shadow-green-500/20 animate-float">
              <TestTube2 size={28} className="text-black" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-green-300 via-green-400 to-emerald-400 bg-clip-text text-transparent">Instant</span>
              <span className="text-white ml-2">Test</span>
            </h1>
            <p className="text-gray-500 text-xs font-medium tracking-widest uppercase mt-0.5">AI-Powered JUnit Generation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={onAbout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-green-400 border border-white/10 hover:border-green-500/30 rounded-lg transition-all duration-200 hover:bg-green-500/5"
          >
            <HelpCircle size={14} />
            How It Works
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Zap size={14} className="text-green-400" />
            <span>Powered by Gemini</span>
          </div>
        </div>
      </div>
    </header>
  );
}
