import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Header from './components/Header';
import CodeInput from './components/CodeInput';
import NotesSection from './components/NotesSection';
import EdgeCaseSelector from './components/EdgeCaseSelector';
import GenerateButton from './components/GenerateButton';
import TestOutput from './components/TestOutput';
import MethodPriority from './components/MethodPriority';
import AboutPage from './components/AboutPage';
import PomAnalyzer from './components/PomAnalyzer';
import ApiKeyScreen from './components/ApiKeyScreen';
import { extractMethods, detectClassType, extractAnnotations } from './utils/javaParser';
import { Clock, History, X } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';
const MAX_HISTORY = 6;

const SAMPLE_CODE = `public class UserService {
    private UserRepository userRepository;

    public User findById(Long id) {
        if (id == null || id < 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        return userRepository.findById(id).orElse(null);
    }

    public User save(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        return userRepository.save(user);
    }
}`;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('test_history') || '[]'); } catch { return []; }
}
function saveHistory(items) {
  localStorage.setItem('test_history', JSON.stringify(items));
}

function App() {
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [invalidKeyError, setInvalidKeyError] = useState('');
  const [code, setCode] = useState(SAMPLE_CODE);
  const [notes, setNotes] = useState('');
  const [casePriorities, setCasePriorities] = useState({
    null: 'high', empty: 'medium', boundary: 'medium', exception: 'high', concurrent: 'off'
  });
  const [testCode, setTestCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [detectedMethods, setDetectedMethods] = useState([]);
  const [methodPriorities, setMethodPriorities] = useState({});
  const [classType, setClassType] = useState({ type: 'unknown', label: 'Class', color: 'gray', description: '' });
  const [annotations, setAnnotations] = useState([]);
  const [page, setPage] = useState('app');
  const [pomAnalysis, setPomAnalysis] = useState(null);
  const [history, setHistory] = useState(loadHistory);
  const shouldAutoRetry = useRef(false);

  useEffect(() => {
    const methods = extractMethods(code);
    setDetectedMethods(methods);
    setClassType(detectClassType(code));
    setAnnotations(extractAnnotations(code));
    setMethodPriorities(prev => {
      const updated = { ...prev };
      methods.forEach(m => { if (!(m.name in updated)) updated[m.name] = 'normal'; });
      return updated;
    });
  }, [code]);

  // Rate limit countdown + auto-retry
  useEffect(() => {
    if (rateLimitCountdown <= 0) {
      if (shouldAutoRetry.current) {
        shouldAutoRetry.current = false;
        handleGenerate();
      }
      return;
    }
    const timer = setTimeout(() => setRateLimitCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [rateLimitCountdown]);

  // Ctrl+Enter to generate
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !loading) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, code]);

  const handleKeySubmit = (key) => {
    localStorage.setItem('gemini_api_key', key);
    setGeminiApiKey(key);
    setInvalidKeyError('');
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setGeminiApiKey('');
  };

  const pushToHistory = (generatedCode) => {
    const className = generatedCode.match(/class\s+(\w+)/)?.[1] || 'Test';
    const entry = { id: Date.now(), className, testCode: generatedCode, generatedAt: new Date().toISOString() };
    const updated = [entry, ...history].slice(0, MAX_HISTORY);
    setHistory(updated);
    saveHistory(updated);
  };

  const handleGenerate = useCallback(async () => {
    if (!code.trim()) { setError('Please enter some Java code'); return; }
    setLoading(true);
    setError('');
    setTestCode('');
    setRateLimitCountdown(0);

    try {
      const response = await axios.post(`${API_URL}/generate`, {
        apiKey: geminiApiKey,
        code, notes, casePriorities, methodPriorities,
        classType: classType.type,
        annotations: annotations.map(a => ({ name: a.name, category: a.category, testHint: a.testHint })),
        pomInfo: pomAnalysis ? {
          testFramework: pomAnalysis.detected.testFramework,
          mockingLib: pomAnalysis.detected.mockingLib,
          assertionLib: pomAnalysis.detected.assertionLib,
          springBoot: pomAnalysis.detected.springBoot,
          springWeb: pomAnalysis.detected.springWeb,
          springJpa: pomAnalysis.detected.springJpa,
          hasH2: pomAnalysis.detected.hasH2,
          hasLombok: pomAnalysis.detected.hasLombok,
          javaVersion: pomAnalysis.javaVersion,
        } : null
      });

      if (response.data.success) {
        setTestCode(response.data.testCode);
        pushToHistory(response.data.testCode);
      } else {
        setError(response.data.error || 'Failed to generate test');
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 401 && data?.invalidKey) {
        localStorage.removeItem('gemini_api_key');
        setGeminiApiKey('');
        setInvalidKeyError('Your API key is invalid or expired. Please enter a valid key.');
        return;
      }

      if (status === 429 && data?.rateLimited) {
        const wait = data.retryAfter || 30;
        setError(`Rate limited — auto-retrying in ${wait}s`);
        setRateLimitCountdown(wait);
        shouldAutoRetry.current = true;
        return;
      }

      setError(err.response?.data?.error || 'Failed to connect to server. Make sure the backend is running on port 3000.');
    } finally {
      setLoading(false);
    }
  }, [geminiApiKey, code, notes, casePriorities, methodPriorities, classType, annotations, pomAnalysis]);

  if (!geminiApiKey) {
    return <ApiKeyScreen onKeySubmit={handleKeySubmit} initialError={invalidKeyError} />;
  }

  if (page === 'about') {
    return <AboutPage onBack={() => setPage('app')} />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a12] overflow-hidden">
      <Header onAbout={() => setPage('about')} onClearKey={handleClearKey} />

      <main className="flex-1 p-5 min-h-0">
        <div className="max-w-[1900px] mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">

            {/* Left Panel */}
            <div className="glass rounded-2xl flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="h-[350px] animate-fade-in-up">
                  <CodeInput value={code} onChange={setCode} methods={detectedMethods} classType={classType} annotations={annotations} />
                </div>

                {detectedMethods.length > 0 && (
                  <div className="animate-fade-in-up delay-1">
                    <MethodPriority methods={detectedMethods} methodPriorities={methodPriorities} onChange={setMethodPriorities} />
                  </div>
                )}

                <div className="animate-fade-in-up delay-2">
                  <NotesSection value={notes} onChange={setNotes} methods={detectedMethods} />
                </div>

                <div className="animate-fade-in-up delay-3">
                  <EdgeCaseSelector casePriorities={casePriorities} onChange={setCasePriorities} />
                </div>

                <div className="animate-fade-in-up delay-4">
                  <PomAnalyzer classType={classType} onAnalysis={setPomAnalysis} />
                </div>

                {/* Rate limit countdown */}
                {rateLimitCountdown > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 rounded-xl animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-yellow-400" />
                        <p className="text-xs font-semibold text-yellow-400">Rate limited — auto-retrying in {rateLimitCountdown}s</p>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-1000"
                        style={{ width: `${(rateLimitCountdown / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && rateLimitCountdown === 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl animate-fade-in">
                    <p className="font-bold text-xs mb-1">Error</p>
                    <p className="text-xs text-red-400/80">{error}</p>
                  </div>
                )}

                {/* History */}
                {history.length > 0 && (
                  <div className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-white/30 font-semibold uppercase tracking-wider">
                        <History size={11} />
                        Recent
                      </div>
                      <button
                        onClick={() => { setHistory([]); saveHistory([]); }}
                        className="text-[10px] text-white/20 hover:text-white/50 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {history.map((h) => (
                        <button
                          key={h.id}
                          onClick={() => setTestCode(h.testCode)}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-white/50 hover:text-green-400 bg-white/[0.03] hover:bg-green-500/10 border border-white/8 hover:border-green-500/25 rounded-lg transition-all"
                          title={new Date(h.generatedAt).toLocaleTimeString()}
                        >
                          {h.className}.java
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky generate button */}
              <div className="p-5 pt-3 border-t border-white/5">
                <div className="flex items-center justify-end mb-2">
                  <span className="text-[10px] text-white/20 font-medium">Ctrl + Enter</span>
                </div>
                <GenerateButton onClick={handleGenerate} loading={loading} disabled={!code.trim() || rateLimitCountdown > 0} />
              </div>
            </div>

            {/* Right Panel - Output */}
            <div className="glass rounded-2xl p-6 min-h-0 overflow-hidden">
              <TestOutput testCode={testCode} loading={loading} sourceMethods={detectedMethods} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
