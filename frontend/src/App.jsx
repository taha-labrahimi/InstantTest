import { useState, useEffect } from 'react';
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

const API_URL = 'http://localhost:3000/api';

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

function App() {
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [code, setCode] = useState(SAMPLE_CODE);
  const [notes, setNotes] = useState('');
  const [casePriorities, setCasePriorities] = useState({
    null: 'high',
    empty: 'medium',
    boundary: 'medium',
    exception: 'high',
    concurrent: 'off'
  });
  const [testCode, setTestCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectedMethods, setDetectedMethods] = useState([]);
  const [methodPriorities, setMethodPriorities] = useState({});
  const [classType, setClassType] = useState({ type: 'unknown', label: 'Class', color: 'gray', description: '' });
  const [annotations, setAnnotations] = useState([]);
  const [page, setPage] = useState('app');
  const [pomAnalysis, setPomAnalysis] = useState(null);

  useEffect(() => {
    const methods = extractMethods(code);
    setDetectedMethods(methods);
    setClassType(detectClassType(code));
    setAnnotations(extractAnnotations(code));
    // Initialize new methods as 'normal', keep existing priorities
    setMethodPriorities(prev => {
      const updated = { ...prev };
      methods.forEach(m => {
        if (!(m.name in updated)) updated[m.name] = 'normal';
      });
      return updated;
    });
  }, [code]);

  const handleKeySubmit = (key) => {
    localStorage.setItem('gemini_api_key', key);
    setGeminiApiKey(key);
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setGeminiApiKey('');
  };

  const handleGenerate = async () => {
    if (!code.trim()) {
      setError('Please enter some Java code');
      return;
    }

    setLoading(true);
    setError('');
    setTestCode('');

    try {
      const response = await axios.post(`${API_URL}/generate`, {
        apiKey: geminiApiKey,
        code,
        notes,
        casePriorities,
        methodPriorities,
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
      } else {
        setError(response.data.error || 'Failed to generate test');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.response?.data?.error || 'Failed to connect to server. Make sure the backend is running on port 3000.');
    } finally {
      setLoading(false);
    }
  };

  if (!geminiApiKey) {
    return <ApiKeyScreen onKeySubmit={handleKeySubmit} />;
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
            
            {/* Left Panel - Input (scrollable) */}
            <div className="glass rounded-2xl flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="h-[350px] animate-fade-in-up">
                  <CodeInput value={code} onChange={setCode} methods={detectedMethods} classType={classType} annotations={annotations} />
                </div>
                
                {detectedMethods.length > 0 && (
                  <div className="animate-fade-in-up delay-1">
                    <MethodPriority
                      methods={detectedMethods}
                      methodPriorities={methodPriorities}
                      onChange={setMethodPriorities}
                    />
                  </div>
                )}
                
                <div className="animate-fade-in-up delay-2">
                  <NotesSection value={notes} onChange={setNotes} methods={detectedMethods} />
                </div>
                
                <div className="animate-fade-in-up delay-3">
                  <EdgeCaseSelector 
                    casePriorities={casePriorities} 
                    onChange={setCasePriorities} 
                  />
                </div>
                
                <div className="animate-fade-in-up delay-4">
                  <PomAnalyzer 
                    classType={classType}
                    onAnalysis={setPomAnalysis}
                  />
                </div>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl animate-fade-in">
                    <p className="font-bold text-xs mb-1">Error</p>
                    <p className="text-xs text-red-400/80">{error}</p>
                  </div>
                )}
              </div>
              
              {/* Sticky generate button */}
              <div className="p-5 pt-3 border-t border-white/5">
                <GenerateButton 
                  onClick={handleGenerate} 
                  loading={loading}
                  disabled={!code.trim()}
                />
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
