import { Flame, AlertTriangle, Minus, EyeOff } from 'lucide-react';

const LEVELS = [
  { value: 'skip', label: 'Skip', icon: EyeOff, btnClass: 'bg-gray-800/50 text-gray-600 border-gray-700', dot: 'bg-gray-600' },
  { value: 'normal', label: 'Normal', icon: Minus, btnClass: 'bg-green-500/10 text-green-400 border-green-500/30', dot: 'bg-green-400' },
  { value: 'important', label: 'Important', icon: AlertTriangle, btnClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400' },
  { value: 'critical', label: 'Critical', icon: Flame, btnClass: 'bg-red-500/10 text-red-400 border-red-500/30', dot: 'bg-red-400', glow: 'shadow-red-500/15' },
];

export default function MethodPriority({ methods, methodPriorities, onChange }) {
  if (!methods || methods.length === 0) return null;

  const cycle = (methodName) => {
    const order = ['normal', 'important', 'critical', 'skip'];
    const current = methodPriorities[methodName] || 'normal';
    const nextIndex = (order.indexOf(current) + 1) % order.length;
    const updated = { ...methodPriorities, [methodName]: order[nextIndex] };
    onChange(updated);
  };

  const getLevel = (methodName) => {
    const val = methodPriorities[methodName] || 'normal';
    return LEVELS.find(l => l.value === val);
  };

  const criticalCount = methods.filter(m => (methodPriorities[m.name] || 'normal') === 'critical').length;
  const importantCount = methods.filter(m => (methodPriorities[m.name] || 'normal') === 'important').length;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-gray-300 flex items-center gap-3">
          <span className="bg-gradient-to-br from-green-400 to-emerald-500 text-black w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-lg shadow-green-500/20">2</span>
          <Flame size={18} className="text-green-400" />
          <span>Method Focus</span>
          <span className="text-gray-600 text-xs font-normal ml-1">- click to set priority</span>
        </label>
        <div className="flex items-center gap-3 text-[11px]">
          {criticalCount > 0 && (
            <span className="text-red-400 font-semibold">{criticalCount} critical</span>
          )}
          {importantCount > 0 && (
            <span className="text-yellow-400 font-semibold">{importantCount} important</span>
          )}
        </div>
      </div>

      <div className="max-h-[180px] overflow-y-auto rounded-xl border border-white/5 bg-[#0e0e18]">
        {methods.map((method, idx) => {
          const level = getLevel(method.name);
          const Icon = level.icon;
          const isSkip = level.value === 'skip';
          return (
            <div
              key={method.name}
              className={`flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0 transition-all duration-200 ${
                isSkip ? 'opacity-40' : ''
              } ${level.glow ? `shadow-inner ${level.glow}` : ''}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${level.dot}`} />
              <div className="flex-1 min-w-0">
                <span className={`font-mono text-xs font-semibold truncate block ${
                  isSkip ? 'text-gray-600 line-through' : 'text-gray-300'
                }`}>
                  {method.name}
                </span>
              </div>
              <button
                onClick={() => cycle(method.name)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer min-w-[80px] justify-center ${level.btnClass}`}
              >
                <Icon size={12} />
                {level.label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
