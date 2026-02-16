import { ArrowLeft, Code2, Flame, AtSign, Shield, Upload, Sparkles, Cpu, TestTube2, Braces, FileCode, Zap } from 'lucide-react';

export default function AboutPage({ onBack }) {
  return (
    <div className="h-screen flex flex-col bg-[#0a0a12] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to App
        </button>
        <div className="flex items-center gap-2">
          <TestTube2 size={20} className="text-green-400" />
          <span className="text-lg font-black bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            Instant Test
          </span>
        </div>
        <div className="w-[100px]" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">

          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-400/20 rounded-full blur-3xl" />
              <TestTube2 size={56} className="relative text-green-400 animate-float" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent">
              How Instant Test Works
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              AI-powered JUnit 5 test generation that understands your code, your business logic, and your priorities.
            </p>
          </div>

          {/* Why Section */}
          <div className="glass rounded-2xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-200 flex items-center gap-3">
              <Zap size={22} className="text-yellow-400" />
              Why Instant Test?
            </h2>
            <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
              <p>
                Writing unit tests is essential but time-consuming. Developers spend up to <span className="text-green-400 font-semibold">30% of their time</span> writing and maintaining tests. Most AI tools generate generic tests that don't understand your business rules.
              </p>
              <p>
                <span className="text-white font-semibold">Instant Test is different.</span> It doesn't just look at your code — it understands <span className="text-green-400 font-semibold">what type of class</span> you're testing, <span className="text-green-400 font-semibold">which methods are critical</span>, and <span className="text-green-400 font-semibold">what business rules</span> matter to you.
              </p>
              <p>
                The result? Production-ready JUnit 5 tests with proper mocking, meaningful assertions, and edge case coverage — in seconds.
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-200 text-center">How It Works</h2>

            {/* Step 1 */}
            <div className="glass rounded-2xl p-6 flex gap-5">
              <div className="shrink-0">
                <span className="bg-gradient-to-br from-green-400 to-emerald-500 text-black w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-lg shadow-green-500/20">1</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
                  <Code2 size={18} className="text-green-400" />
                  Paste or Import Your Java Code
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Paste your Java class directly into the editor or click <span className="text-green-400 font-semibold">Import</span> to load a <code className="text-green-400/80 bg-green-500/10 px-1.5 py-0.5 rounded text-xs">.java</code> file. You can also drag & drop files onto the editor.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  The app <span className="text-white font-semibold">auto-detects</span> your class type:
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {[
                    { label: 'Controller', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                    { label: 'Service', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
                    { label: 'Repository', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                    { label: 'Entity', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
                    { label: 'DTO', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
                    { label: 'Utility', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
                  ].map(t => (
                    <span key={t.label} className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${t.color}`}>{t.label}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Each class type triggers a different test strategy (MockMvc for Controllers, @DataJpaTest for Repositories, etc.)
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass rounded-2xl p-6 flex gap-5">
              <div className="shrink-0">
                <span className="bg-gradient-to-br from-green-400 to-emerald-500 text-black w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-lg shadow-green-500/20">2</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
                  <Flame size={18} className="text-green-400" />
                  Set Method Priorities
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Not all methods are equal. Click the priority button next to each detected method to cycle through:
                </p>
                <div className="space-y-1.5 mt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-[10px]">Critical</span>
                    <span className="text-gray-500">Exhaustive tests — every edge case, every branch, multiple scenarios</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-bold text-[10px]">Important</span>
                    <span className="text-gray-500">Thorough tests — main paths + key edge cases</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-bold text-[10px]">Normal</span>
                    <span className="text-gray-500">Standard coverage — happy path + basic edge cases</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-gray-800/50 text-gray-600 border border-gray-700 font-bold text-[10px]">Skip</span>
                    <span className="text-gray-500">No tests generated for this method</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass rounded-2xl p-6 flex gap-5">
              <div className="shrink-0">
                <span className="bg-gradient-to-br from-green-400 to-emerald-500 text-black w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-lg shadow-green-500/20">3</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
                  <AtSign size={18} className="text-green-400" />
                  Add Business Logic Notes
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Describe your business rules in plain language. Use <code className="text-green-400/80 bg-green-500/10 px-1.5 py-0.5 rounded text-xs">@methodName</code> to tag specific methods. The AI will pay special attention to tagged methods.
                </p>
                <div className="bg-[#0e0e18] rounded-lg p-3 mt-2 border border-white/5">
                  <p className="text-xs font-mono text-gray-500">
                    <span className="text-green-400">@findById</span> should throw exception if user is inactive.
                    <br />
                    <span className="text-green-400">@save</span> must validate email format before persisting.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="glass rounded-2xl p-6 flex gap-5">
              <div className="shrink-0">
                <span className="bg-gradient-to-br from-green-400 to-emerald-500 text-black w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-lg shadow-green-500/20">4</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
                  <Shield size={18} className="text-green-400" />
                  Configure Edge Cases
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Set priority levels for different categories of edge cases. Click to cycle between High, Medium, Low, and Off.
                </p>
                <div className="space-y-1.5 mt-2 text-xs text-gray-500">
                  <p><span className="text-white font-semibold">Null inputs</span> — NullPointerException is the #1 Java runtime error</p>
                  <p><span className="text-white font-semibold">Empty collections</span> — code that works with data often breaks without it</p>
                  <p><span className="text-white font-semibold">Boundary values</span> — bugs hide at 0, -1, MAX_VALUE</p>
                  <p><span className="text-white font-semibold">Exceptions</span> — verify correct exceptions with correct messages</p>
                  <p><span className="text-white font-semibold">Concurrency</span> — thread safety for shared state (usually off)</p>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="glass rounded-2xl p-6 flex gap-5">
              <div className="shrink-0">
                <span className="bg-gradient-to-br from-green-400 to-emerald-500 text-black w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-lg shadow-green-500/20">5</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
                  <Sparkles size={18} className="text-green-400" />
                  Generate & Use
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Click <span className="text-green-400 font-semibold">Generate Tests</span> and the AI builds a complete, ready-to-run JUnit 5 test class. You can:
                </p>
                <div className="space-y-1 mt-2 text-xs text-gray-500">
                  <p>- <span className="text-white font-semibold">Copy</span> the code to clipboard</p>
                  <p>- <span className="text-white font-semibold">Download</span> as a <code className="text-green-400/80 bg-green-500/10 px-1 py-0.5 rounded text-[10px]">.java</code> file</p>
                  <p>- Paste directly into your IDE and run</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="glass rounded-2xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-200 flex items-center gap-3">
              <Cpu size={22} className="text-green-400" />
              Tech Stack
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Frontend</h3>
                <div className="space-y-1 text-gray-400">
                  <p>React + Vite</p>
                  <p>TailwindCSS</p>
                  <p>Monaco Editor</p>
                  <p>Lucide Icons</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Backend</h3>
                <div className="space-y-1 text-gray-400">
                  <p>Node.js + Express</p>
                  <p>Google Gemini AI</p>
                  <p>Smart Prompt Engineering</p>
                  <p>Class-Type-Aware Strategy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Tests Include */}
          <div className="glass rounded-2xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-200 flex items-center gap-3">
              <FileCode size={22} className="text-green-400" />
              What Gets Generated
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                <span>JUnit 5 annotations (@Test, @BeforeEach)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                <span>Mockito mocking (@Mock, @InjectMocks)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                <span>MockMvc for Controllers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                <span>@DataJpaTest for Repositories</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                <span>Descriptive test names</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                <span>assertThrows for exceptions</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                <span>Edge case coverage</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                <span>Ready to copy-paste & run</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8 border-t border-white/5 space-y-3">
            <p className="text-sm text-gray-500">
              Developed by <span className="text-green-400 font-bold">Taha Labrahimi</span>
            </p>
            <p className="text-xs text-gray-700">
              Powered by Google Gemini AI
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
