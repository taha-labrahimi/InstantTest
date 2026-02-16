import { AlertCircle, Box, Zap, Users, Shield } from 'lucide-react';

const PRIORITIES = [
  { value: 'off', label: 'Off', btnClass: 'bg-gray-800/50 text-gray-500 border-gray-700', dot: 'bg-gray-600' },
  { value: 'low', label: 'Low', btnClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30', dot: 'bg-blue-400', glow: 'shadow-blue-500/10' },
  { value: 'medium', label: 'Med', btnClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400', glow: 'shadow-yellow-500/10' },
  { value: 'high', label: 'High', btnClass: 'bg-red-500/10 text-red-400 border-red-500/30', dot: 'bg-red-400', glow: 'shadow-red-500/10' },
];

export default function EdgeCaseSelector({ casePriorities, onChange }) {
  const edgeCases = [
    { id: 'null', label: 'Null inputs', description: 'null params & returns', icon: AlertCircle, iconColor: 'text-red-400' },
    { id: 'empty', label: 'Empty collections', description: 'lists, sets, maps, arrays', icon: Box, iconColor: 'text-orange-400' },
    { id: 'boundary', label: 'Boundary values', description: '0, -1, MAX_VALUE', icon: Zap, iconColor: 'text-yellow-400' },
    { id: 'exception', label: 'Exceptions', description: 'error handling & throws', icon: Shield, iconColor: 'text-purple-400' },
    { id: 'concurrent', label: 'Concurrency', description: 'thread safety', icon: Users, iconColor: 'text-blue-400' }
  ];

  const cyclePriority = (caseId) => {
    const order = ['off', 'low', 'medium', 'high'];
    const current = casePriorities[caseId] || 'off';
    const nextIndex = (order.indexOf(current) + 1) % order.length;
    onChange({ ...casePriorities, [caseId]: order[nextIndex] });
  };

  const getPriority = (caseId) => {
    const val = casePriorities[caseId] || 'off';
    return PRIORITIES.find(p => p.value === val);
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-3">
        <span className="bg-gradient-to-br from-green-400 to-emerald-500 text-black w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-lg shadow-green-500/20">4</span>
        <Shield size={18} className="text-green-400" />
        <span>Edge Cases & Priority</span>
        <span className="text-gray-600 text-xs font-normal ml-1">- click to cycle</span>
      </label>
      <div className="grid grid-cols-1 gap-2">
        {edgeCases.map((edgeCase, idx) => {
          const Icon = edgeCase.icon;
          const priority = getPriority(edgeCase.id);
          const isOff = priority.value === 'off';
          return (
            <div
              key={edgeCase.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 animate-fade-in-up ${
                isOff
                  ? 'border-white/5 bg-[#141420]/50 opacity-50'
                  : `border-white/5 bg-[#141420] hover:bg-[#1a1a2e] ${priority.glow ? `shadow-lg ${priority.glow}` : ''}`
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <Icon size={18} className={isOff ? 'text-gray-600' : edgeCase.iconColor} />
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-xs ${isOff ? 'text-gray-600' : 'text-gray-300'}`}>{edgeCase.label}</div>
                <div className="text-[11px] text-gray-600 truncate">{edgeCase.description}</div>
              </div>
              <button
                onClick={() => cyclePriority(edgeCase.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-bold transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer min-w-[70px] justify-center ${priority.btnClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                {priority.label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
