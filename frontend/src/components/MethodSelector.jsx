import { Target } from 'lucide-react';

export default function MethodSelector({ methods, selectedMethod, onChange, className }) {
  if (!methods || methods.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <Target size={18} className="text-primary-600" />
        <span>Select Method to Test</span>
      </label>
      <select
        value={selectedMethod}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-md hover:border-primary-400 transition-colors text-gray-700 font-mono text-sm bg-white cursor-pointer"
      >
        <option value="">-- Test entire class ({className}) --</option>
        {methods.map((method, index) => (
          <option key={index} value={method.name}>
            {method.signature}
          </option>
        ))}
      </select>
      {selectedMethod && (
        <p className="text-xs text-gray-500 mt-2">
          Tests will focus on the <span className="font-semibold text-primary-600">{selectedMethod}</span> method
        </p>
      )}
    </div>
  );
}
