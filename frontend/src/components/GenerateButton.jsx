import { Sparkles, Loader2 } from 'lucide-react';

export default function GenerateButton({ onClick, loading, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-4 px-8 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.97] flex items-center justify-center gap-3 relative overflow-hidden ${
        disabled && !loading
          ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
          : loading
          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30 cursor-wait'
          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-black border border-green-400/50 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30'
      }`}
    >
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-shimmer" />
      )}
      <div className="relative flex items-center gap-3">
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Generating Tests...</span>
          </>
        ) : (
          <>
            <Sparkles size={20} />
            <span>Generate Tests</span>
          </>
        )}
      </div>
    </button>
  );
}
