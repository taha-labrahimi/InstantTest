import { useState } from 'react';
import { Zap, SlidersHorizontal, ShieldCheck, Eye, EyeOff, ArrowRight, TestTube2 } from 'lucide-react';

const FEATURES = [
  { icon: Zap,               color: 'text-green-400',  bg: 'bg-green-400/10  border-green-400/20',  text: 'Paste your Java class — get JUnit tests in seconds' },
  { icon: SlidersHorizontal, color: 'text-sky-400',    bg: 'bg-sky-400/10    border-sky-400/20',    text: 'Covers null, boundary, exception & concurrent edge cases' },
  { icon: ShieldCheck,       color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20', text: 'Your key stays in your browser — never stored on our servers' },
];

export default function ApiKeyScreen({ onKeySubmit, initialError = '' }) {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState(initialError);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed.startsWith('AIza')) {
      setError('Invalid key — Gemini keys start with "AIza".');
      return;
    }
    onKeySubmit(trimmed);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a12] p-4">
      <div className="w-full max-w-lg animate-fade-in-up">

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-semibold tracking-widest uppercase">AI-Powered · Free to use</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-2.5 rounded-xl shadow-lg shadow-green-500/20 animate-float">
              <TestTube2 size={24} className="text-black" />
            </div>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-green-300 via-green-400 to-emerald-400 bg-clip-text text-transparent">Instant</span>
              <span className="text-white"> Test</span>
            </h1>
          </div>

          <p className="text-white/50 text-base font-light leading-relaxed">
            Stop writing JUnit tests by hand.<br />
            Paste your Java code, get complete tests instantly.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-col gap-2.5 mb-8">
          {FEATURES.map(({ icon: Icon, color, bg, text }, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/8 rounded-2xl px-4 py-3.5">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon size={15} className={color} />
              </div>
              <span className="text-sm text-white/65 font-medium">{text}</span>
            </div>
          ))}
        </div>

        {/* API Key card */}
        <div className="glass rounded-2xl p-6">
          <p className="text-white font-semibold text-sm mb-1">One last thing — bring your Gemini API key</p>
          <p className="text-white/40 text-xs mb-5 font-light">
            This app runs on your own Gemini quota. Get a free key at{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 underline underline-offset-2 transition-colors"
            >
              aistudio.google.com
            </a>
            .
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={key}
                onChange={e => { setKey(e.target.value); setError(''); }}
                placeholder="Paste your key here — AIza..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-green-500/50 transition-all pr-12 font-medium"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

            <button
              type="submit"
              disabled={!key.trim()}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-400 hover:to-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
            >
              Start Generating Tests
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
