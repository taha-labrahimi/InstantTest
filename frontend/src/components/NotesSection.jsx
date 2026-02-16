import { useState, useRef } from 'react';
import { FileText, AtSign } from 'lucide-react';

export default function NotesSection({ value, onChange, methods }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredMethods, setFilteredMethods] = useState([]);
  const [cursorPos, setCursorPos] = useState(0);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const textareaRef = useRef(null);

  const handleInput = (e) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    onChange(text);
    setCursorPos(cursor);

    const textBeforeCursor = text.slice(0, cursor);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch && methods && methods.length > 0) {
      const query = atMatch[1].toLowerCase();
      const matches = methods.filter(m =>
        m.name.toLowerCase().startsWith(query)
      );
      setFilteredMethods(matches);
      setShowSuggestions(matches.length > 0);

      const ta = textareaRef.current;
      if (ta) {
        const lineHeight = 22;
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length;
        const charInLine = lines[lines.length - 1].length;
        setMenuPos({
          top: currentLine * lineHeight + 8,
          left: Math.min(charInLine * 7.5, ta.offsetWidth - 220)
        });
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMethod = (methodName) => {
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    const newText = textBeforeCursor.slice(0, atIndex) + '@' + methodName + ' ' + textAfterCursor;
    onChange(newText);
    setShowSuggestions(false);

    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = atIndex + methodName.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const taggedMethods = value.match(/@(\w+)/g) || [];

  return (
    <div className="flex flex-col">
      <label className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-3">
        <span className="bg-gradient-to-br from-green-400 to-emerald-500 text-black w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-lg shadow-green-500/20">3</span>
        <FileText size={18} className="text-green-400" />
        <span>Business Logic Notes</span>
        <span className="text-gray-600 text-xs font-normal ml-1">- use @ to tag methods</span>
      </label>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          placeholder={'Type @ to tag methods from your code...\n\nExample: "@findById should throw exception if user is inactive. @save must validate email before persisting."'}
          className="w-full h-32 px-4 py-3 bg-[#141420] border border-green-500/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500/40 focus:border-green-500/30 resize-none text-gray-300 placeholder:text-gray-600 font-mono text-sm transition-all duration-300 hover:border-green-500/20"
        />

        {showSuggestions && (
          <div
            className="absolute z-50 bg-[#1a1a2e] border border-green-500/30 rounded-xl shadow-2xl shadow-black/50 min-w-[280px] animate-fade-in"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <div className="px-3 py-2 bg-green-500/10 text-xs font-semibold text-green-400 border-b border-green-500/20 sticky top-0 z-10">
              Detected Methods ({filteredMethods.length})
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {filteredMethods.map((method, i) => (
                <button
                  key={i}
                  onClick={() => insertMethod(method.name)}
                  className="w-full text-left px-4 py-2.5 hover:bg-green-500/10 transition-colors flex items-center gap-2 text-sm border-b border-white/5 last:border-0"
                >
                  <AtSign size={14} className="text-green-400 shrink-0" />
                  <span className="font-mono font-semibold text-green-300 truncate">{method.name}</span>
                  <span className="text-gray-500 text-xs truncate">({method.parameters})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-wrap gap-2">
          {taggedMethods.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-md text-xs font-mono font-medium animate-fade-in">
              <AtSign size={11} />
              {tag.slice(1)}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-600 font-medium">{value.length} chars</p>
      </div>
    </div>
  );
}
