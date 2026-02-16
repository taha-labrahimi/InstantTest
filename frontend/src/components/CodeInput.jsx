import { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Code2, Braces, Upload, FileUp, AtSign } from 'lucide-react';

const TYPE_COLORS = {
  controller: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  service: 'bg-green-500/15 text-green-400 border-green-500/30',
  repository: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  entity: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  config: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  component: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  dto: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  utility: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  unknown: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

const ANNOTATION_CATEGORY_COLORS = {
  'spring-web': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'spring-core': 'bg-green-500/10 text-green-400 border-green-500/20',
  'transaction': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'caching': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'validation': 'bg-red-500/10 text-red-400 border-red-500/20',
  'jpa': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'lombok': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'security': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'async': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'scheduling': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

export default function CodeInput({ value, onChange, methods, classType, annotations = [] }) {
  const typeColor = TYPE_COLORS[classType?.type] || TYPE_COLORS.unknown;
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.java')) {
      alert('Please select a .java file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e) => {
    handleFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col h-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".java"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-gray-300 flex items-center gap-3">
          <span className="bg-gradient-to-br from-green-400 to-emerald-500 text-black w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-lg shadow-green-500/20">1</span>
          <Code2 size={18} className="text-green-400" />
          <span>Java Code</span>
        </label>
        <div className="flex items-center gap-2">
          {classType && classType.type !== 'unknown' && (
            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold animate-fade-in ${typeColor}`}>
              {classType.label}
            </span>
          )}
          {methods && methods.length > 0 && (
            <span className="text-[10px] text-gray-500 animate-fade-in">{methods.length} methods</span>
          )}
          {fileName && (
            <span className="text-[10px] text-gray-600 animate-fade-in truncate max-w-[100px]">{fileName}</span>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
            title="Import a .java file"
          >
            <Upload size={12} />
            Import
          </button>
        </div>
      </div>
      <div
        className={`flex-1 rounded-xl overflow-hidden border transition-all duration-300 shadow-lg shadow-black/20 relative ${
          isDragging
            ? 'border-green-400 bg-green-500/5'
            : 'border-green-500/10 hover:border-green-500/25'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
            <div className="flex flex-col items-center gap-2 animate-fade-in">
              <FileUp size={32} className="text-green-400" />
              <span className="text-green-400 font-bold text-sm">Drop .java file here</span>
            </div>
          </div>
        )}
        <Editor
          height="100%"
          defaultLanguage="java"
          theme="vs-dark"
          value={value}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'gutter',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
          }}
        />
      </div>
      {/* Detected annotations */}
      {annotations.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 animate-fade-in">
          <AtSign size={12} className="text-gray-500 mt-0.5" />
          {annotations.slice(0, 8).map((a, i) => (
            <span
              key={i}
              title={a.testHint}
              className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold cursor-default transition-all hover:scale-105 ${
                ANNOTATION_CATEGORY_COLORS[a.category] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
              }`}
            >
              @{a.name}
            </span>
          ))}
          {annotations.length > 8 && (
            <span className="text-[9px] text-gray-600 mt-0.5">+{annotations.length - 8} more</span>
          )}
        </div>
      )}
    </div>
  );
}
