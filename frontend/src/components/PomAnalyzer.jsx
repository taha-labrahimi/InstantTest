import { useRef, useState } from 'react';
import { FileText, Upload, AlertTriangle, AlertCircle, Info, Check, Copy, ChevronDown, ChevronUp, X, Package } from 'lucide-react';
import { parsePomXml, analyzeDependencies } from '../utils/pomParser';

const LEVEL_STYLES = {
  error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-400' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400' },
};

const CAT_COLORS = {
  'test-framework': 'text-green-400 bg-green-500/10 border-green-500/20',
  'mocking': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'assertion': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'spring': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'database': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'api-test': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'serialization': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  'utility': 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  'other': 'text-gray-500 bg-gray-500/5 border-gray-500/10',
};

export default function PomAnalyzer({ classType, onAnalysis }) {
  const fileInputRef = useRef(null);
  const [analysis, setAnalysis] = useState(null);
  const [pomLoaded, setPomLoaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.xml')) {
      alert('Please select a pom.xml file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const parsed = parsePomXml(content);
      const result = analyzeDependencies(parsed, classType?.type);
      setAnalysis({ ...result, deps: parsed.dependencies });
      setPomLoaded(true);
      setFileName(file.name);
      setExpanded(true);
      if (onAnalysis) onAnalysis({ ...result, deps: parsed.dependencies });
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e) => {
    handleFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleCopy = async (xml, idx) => {
    try {
      await navigator.clipboard.writeText(xml);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleRemove = () => {
    setAnalysis(null);
    setPomLoaded(false);
    setFileName('');
    setExpanded(false);
    if (onAnalysis) onAnalysis(null);
  };

  const testDeps = analysis?.deps?.filter(d => d.isTestDep) || [];
  const errorCount = analysis?.suggestions?.filter(s => s.level === 'error').length || 0;
  const warnCount = analysis?.suggestions?.filter(s => s.level === 'warning').length || 0;

  return (
    <div className="flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-gray-300 flex items-center gap-3">
          <Package size={18} className="text-green-400" />
          <span>Dependencies</span>
          <span className="text-gray-600 text-xs font-normal ml-1">- optional</span>
        </label>
        <div className="flex items-center gap-2">
          {pomLoaded && (
            <>
              {errorCount > 0 && (
                <span className="text-[10px] text-red-400 font-semibold">{errorCount} missing</span>
              )}
              {warnCount > 0 && (
                <span className="text-[10px] text-yellow-400 font-semibold">{warnCount} warnings</span>
              )}
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button
                onClick={handleRemove}
                className="text-gray-600 hover:text-red-400 transition-colors"
                title="Remove pom.xml"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upload area or results */}
      {!pomLoaded ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 border border-dashed border-white/10 hover:border-green-500/30 rounded-xl text-center transition-all duration-200 hover:bg-green-500/5 group"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload size={20} className="text-gray-600 group-hover:text-green-400 transition-colors" />
            <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
              Upload <span className="font-mono text-green-400/60">pom.xml</span> to analyze dependencies
            </span>
          </div>
        </button>
      ) : expanded && analysis ? (
        <div className="space-y-3 animate-fade-in">
          {/* Java version + file info */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-600 flex items-center gap-1">
              <FileText size={10} />
              {fileName}
            </span>
            {analysis.javaVersion && (
              <span className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold">
                Java {analysis.javaVersion}
              </span>
            )}
            {analysis.detected.testFramework && (
              <span className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold">
                {analysis.detected.testFramework === 'junit5' ? 'JUnit 5' : 'JUnit 4'}
              </span>
            )}
            {analysis.detected.mockingLib && (
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold">
                Mockito
              </span>
            )}
            {analysis.detected.assertionLib && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                {analysis.detected.assertionLib === 'assertj' ? 'AssertJ' : 'Hamcrest'}
              </span>
            )}
          </div>

          {/* Test dependencies found */}
          {testDeps.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {testDeps.map((dep, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-medium ${CAT_COLORS[dep.category] || CAT_COLORS.other}`}
                  title={`${dep.groupId}:${dep.artifactId}${dep.version ? ':' + dep.version : ''}`}
                >
                  <Check size={9} />
                  {dep.name}
                  {dep.version && <span className="opacity-50">{dep.version}</span>}
                </span>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              {analysis.suggestions.map((sug, i) => {
                const style = LEVEL_STYLES[sug.level];
                const Icon = style.icon;
                return (
                  <div key={i} className={`rounded-lg border p-3 ${style.bg}`}>
                    <div className="flex items-start gap-2">
                      <Icon size={14} className={`${style.color} shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${style.color}`}>{sug.message}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{sug.suggestion}</p>
                        {sug.xml && (
                          <div className="mt-2 relative">
                            <pre className="text-[10px] text-gray-400 bg-black/30 rounded-md p-2 overflow-x-auto font-mono">{sug.xml}</pre>
                            <button
                              onClick={() => handleCopy(sug.xml, i)}
                              className="absolute top-1 right-1 p-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                              title="Copy to clipboard"
                            >
                              {copiedIdx === i ? <Check size={10} className="text-green-400" /> : <Copy size={10} className="text-gray-500" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {analysis.suggestions.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-green-400/80 py-2">
              <Check size={14} />
              <span>All testing dependencies look good!</span>
            </div>
          )}
        </div>
      ) : pomLoaded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors text-left"
        >
          pom.xml loaded — click to expand
        </button>
      )}
    </div>
  );
}
