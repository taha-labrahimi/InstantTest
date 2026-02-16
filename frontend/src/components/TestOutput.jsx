import { useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Download, CheckCheck, FileCode, TestTube2, Loader2, Code2, Braces, Search, CheckCircle2, Sparkles, FlaskConical } from 'lucide-react';

// Extract individual test methods from generated code
function extractTestMethods(code) {
  if (!code) return [];
  const methods = [];
  const lines = code.split('\n');
  let i = 0;
  while (i < lines.length) {
    // Look for @Test annotation
    if (lines[i].trim().startsWith('@Test')) {
      let start = i;
      // Check for annotations above @Test (like @DisplayName)
      while (start > 0 && (lines[start - 1].trim().startsWith('@') || lines[start - 1].trim() === '')) {
        if (lines[start - 1].trim() === '') break;
        start--;
      }
      // Find the method signature line
      let sigLine = i + 1;
      while (sigLine < lines.length && !lines[sigLine].includes('(')) sigLine++;
      // Extract method name
      const nameMatch = lines[sigLine]?.match(/void\s+(\w+)\s*\(/);
      const methodName = nameMatch ? nameMatch[1] : `test_${methods.length + 1}`;
      // Find closing brace by counting braces
      let braceCount = 0;
      let end = sigLine;
      let foundOpen = false;
      for (let j = sigLine; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') { braceCount++; foundOpen = true; }
          if (ch === '}') braceCount--;
        }
        if (foundOpen && braceCount === 0) { end = j; break; }
      }
      methods.push({
        name: methodName,
        displayName: methodName.replace(/_/g, ' '),
        code: lines.slice(start, end + 1).join('\n'),
        startLine: start + 1,
        endLine: end + 1,
      });
      i = end + 1;
    } else {
      i++;
    }
  }
  return methods;
}

// Loading skeleton component
function LoadingSkeleton({ step }) {
  const steps = [
    { label: 'Parsing code structure', icon: Code2, delay: 0 },
    { label: 'Analyzing methods & dependencies', icon: Search, delay: 1500 },
    { label: 'Generating test scenarios', icon: FlaskConical, delay: 4000 },
    { label: 'Writing test methods', icon: Braces, delay: 7000 },
    { label: 'Finalizing output', icon: Sparkles, delay: 10000 },
  ];

  return (
    <div className="flex flex-col h-full px-6 py-8">
      {/* Animated header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl animate-pulse" />
          <Loader2 size={32} className="relative text-green-400 animate-spin" />
        </div>
        <div>
          <h3 className="text-base font-bold text-green-400">Generating Tests...</h3>
          <p className="text-xs text-gray-500">AI is analyzing your code</p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="space-y-3 mb-8">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step >= idx;
          const isCurrent = step === idx;
          return (
            <div key={idx} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 ${
              isActive ? 'bg-green-500/5 border border-green-500/15' : 'bg-white/[0.02] border border-white/5'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                isActive && !isCurrent ? 'bg-green-500/20' : isCurrent ? 'bg-green-500/30 animate-pulse' : 'bg-white/5'
              }`}>
                {isActive && !isCurrent ? (
                  <CheckCircle2 size={14} className="text-green-400" />
                ) : (
                  <Icon size={14} className={isCurrent ? 'text-green-400' : 'text-gray-600'} />
                )}
              </div>
              <span className={`text-xs font-medium transition-all duration-500 ${
                isActive ? 'text-gray-300' : 'text-gray-600'
              }`}>{s.label}</span>
              {isCurrent && (
                <div className="ml-auto flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Code skeleton */}
      <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] p-4 overflow-hidden">
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-green-500/8 rounded w-2/3" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
          <div className="h-3 bg-white/5 rounded w-3/4" />
          <div className="h-3 bg-white/3 rounded w-1/3 mt-4" />
          <div className="h-3 bg-green-500/5 rounded w-5/6" />
          <div className="h-3 bg-white/5 rounded w-2/3" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
          <div className="h-3 bg-white/3 rounded w-2/5 mt-4" />
          <div className="h-3 bg-green-500/5 rounded w-4/5" />
          <div className="h-3 bg-white/5 rounded w-3/5" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
          <div className="h-3 bg-white/3 rounded w-1/4 mt-4" />
          <div className="h-3 bg-green-500/8 rounded w-2/3" />
          <div className="h-3 bg-white/5 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

export default function TestOutput({ testCode, loading, sourceMethods = [] }) {
  const [copied, setCopied] = useState(false);
  const [copiedMethod, setCopiedMethod] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState('code'); // 'code' or 'methods'
  const [highlightedMethod, setHighlightedMethod] = useState(null);

  // Advance loading steps on a timer
  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    setLoadingStep(0);
    const timers = [
      setTimeout(() => setLoadingStep(1), 1500),
      setTimeout(() => setLoadingStep(2), 4000),
      setTimeout(() => setLoadingStep(3), 7000),
      setTimeout(() => setLoadingStep(4), 10000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  // Extract test methods from generated code
  const testMethods = useMemo(() => extractTestMethods(testCode), [testCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(testCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyMethod = async (method) => {
    try {
      await navigator.clipboard.writeText(method.code);
      setCopiedMethod(method.name);
      setTimeout(() => setCopiedMethod(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const className = testCode.match(/class\s+(\w+)/)?.[1] || 'Test';
    const blob = new Blob([testCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${className}.java`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Find which source method a test is for
  const getSourceMethod = (testName) => {
    const lower = testName.toLowerCase();
    return sourceMethods.find(m => lower.includes(m.name.toLowerCase()));
  };

  // Empty state
  if (!testCode && !loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center px-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-green-400/10 rounded-full blur-2xl" />
          <TestTube2 size={48} className="relative text-green-500/30 animate-float" />
        </div>
        <h3 className="text-lg font-bold text-gray-400 mb-2">No Tests Generated Yet</h3>
        <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
          Paste your Java code, add business logic notes, set edge case priorities, and hit <span className="text-green-400 font-semibold">Generate</span>.
        </p>
        <div className="flex items-center gap-4 mt-8 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500/40" />
            JUnit 5
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500/40" />
            Mockito
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500/40" />
            AssertJ
          </div>
        </div>
      </div>
    );
  }

  // Loading state with skeleton
  if (loading) {
    return <LoadingSkeleton step={loadingStep} />;
  }

  // Results state with tabs
  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 border ${
              activeTab === 'code'
                ? 'bg-green-500/15 text-green-400 border-green-500/30'
                : 'bg-white/[0.02] text-gray-500 border-white/5 hover:text-gray-400'
            }`}
          >
            <FileCode size={14} />
            Full Code
          </button>
          <button
            onClick={() => setActiveTab('methods')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 border ${
              activeTab === 'methods'
                ? 'bg-green-500/15 text-green-400 border-green-500/30'
                : 'bg-white/[0.02] text-gray-500 border-white/5 hover:text-gray-400'
            }`}
          >
            <FlaskConical size={14} />
            Methods
            {testMethods.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-green-500/20 text-green-400">{testMethods.length}</span>
            )}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border ${
              copied
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-300'
            }`}
          >
            {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy All'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-green-500/20"
          >
            <Download size={14} />
            .java
          </button>
        </div>
      </div>

      {/* Full Code tab */}
      {activeTab === 'code' && (
        <div className="flex-1 rounded-xl overflow-hidden border border-green-500/10 hover:border-green-500/25 transition-all duration-300 shadow-lg shadow-black/20">
          <Editor
            height="100%"
            defaultLanguage="java"
            theme="vs-dark"
            value={testCode}
            options={{
              readOnly: true,
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
              smoothScrolling: true,
            }}
          />
        </div>
      )}

      {/* Methods tab — individual test methods with copy + source linking */}
      {activeTab === 'methods' && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {testMethods.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No individual test methods detected
            </div>
          ) : (
            testMethods.map((method, idx) => {
              const sourceMethod = getSourceMethod(method.name);
              const isCopied = copiedMethod === method.name;
              const isHighlighted = highlightedMethod === method.name;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                    isHighlighted
                      ? 'border-green-500/40 bg-green-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-green-500/20'
                  }`}
                  onMouseEnter={() => setHighlightedMethod(method.name)}
                  onMouseLeave={() => setHighlightedMethod(null)}
                >
                  {/* Method header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                    <div className="flex items-center gap-2 min-w-0">
                      <FlaskConical size={12} className="text-green-400 shrink-0" />
                      <span className="text-xs font-semibold text-gray-300 truncate">{method.name}</span>
                      {sourceMethod && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                          tests {sourceMethod.name}()
                        </span>
                      )}
                      <span className="text-[10px] text-gray-600 shrink-0">L{method.startLine}-{method.endLine}</span>
                    </div>
                    <button
                      onClick={() => handleCopyMethod(method)}
                      className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md transition-all duration-200 hover:scale-105 active:scale-95 border shrink-0 ${
                        isCopied
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-white/5 text-gray-500 border-white/10 hover:text-gray-300'
                      }`}
                    >
                      {isCopied ? <CheckCheck size={10} /> : <Copy size={10} />}
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  {/* Method code */}
                  <pre className="px-3 py-2 text-[11px] leading-relaxed text-gray-400 overflow-x-auto font-mono max-h-[200px] overflow-y-auto">
                    <code>{method.code}</code>
                  </pre>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
