import React, { useState } from 'react';
import {
  X,
  Terminal,
  Laptop,
  Check,
  Copy,
  CheckCircle2,
  ExternalLink,
  Zap,
  FolderCode,
  Globe,
  FileSpreadsheet,
  FileText,
  Search,
  Sparkles
} from 'lucide-react';

interface LocalhostGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalhostGuideModal: React.FC<LocalhostGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      step: 1,
      title: 'Prerequisites',
      desc: 'Ensure you have Node.js installed (v18, v20, or v22 recommended).',
      command: 'node -v\nnpm -v',
      note: 'If not installed, download from https://nodejs.org'
    },
    {
      step: 2,
      title: 'Install Dependencies',
      desc: 'Open your terminal in the project folder and run:',
      command: 'npm install',
      note: 'Installs React 19, Vite, Express, TailwindCSS, jsPDF, and all required packages.'
    },
    {
      step: 3,
      title: 'Start Localhost Development Server',
      desc: 'Run the single unified development command:',
      command: 'npm run dev',
      note: 'Starts the Express backend with mounted Vite frontend simultaneously on port 3000.'
    },
    {
      step: 4,
      title: 'Open in Your Browser',
      desc: 'Open your favorite web browser (Chrome, Edge, Firefox, Brave) and navigate to:',
      command: 'http://localhost:3000',
      note: 'No Android Studio, emulator, or mobile SDK required! Everything works directly in the browser.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">Run on Localhost (Browser)</h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  Ready & Error-Free
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Simple 2-step setup to run on your local computer via port 3000
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Quick Announcement */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800 space-y-1">
              <p className="font-semibold text-emerald-950">
                Localhost is the fastest, cleanest way to run ScreenAI!
              </p>
              <p>
                You do <strong>not</strong> need Android Studio, Android SDKs, or mobile emulators. The application runs natively in any desktop or mobile browser on <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono">http://localhost:3000</code>.
              </p>
            </div>
          </div>

          {/* Quick Terminal One-Liner */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Start Command (Copy & Paste)</span>
              </span>
              <button
                onClick={() => copyToClipboard('npm install && npm run dev', 999)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-medium cursor-pointer"
              >
                {copiedIndex === 999 ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy one-liner</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs flex items-center justify-between border border-slate-800">
              <code>npm install && npm run dev</code>
            </div>
          </div>

          {/* Running from Android Studio */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 text-xs space-y-2 text-slate-300">
            <div className="flex items-center space-x-2 font-bold text-emerald-400">
              <Laptop className="w-4 h-4 text-emerald-400" />
              <span>Running inside Android Studio:</span>
            </div>
            <p>
              If you have Android Studio open, you can run the app directly: open the built-in <b>Terminal</b> tab (<kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">Alt + F12</kbd> or <kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">Option + F12</kbd>), run <code className="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded font-mono">npm run dev</code>, and your app is live at <b>http://localhost:3000</b>!
            </p>
          </div>

          {/* Step by step */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-600" />
              <span>Step-by-Step Instructions</span>
            </h4>

            {steps.map((st, idx) => (
              <div
                key={st.step}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {st.step}
                    </span>
                    <span className="font-semibold text-slate-900 text-xs">
                      {st.title}
                    </span>
                  </div>
                  {st.command && (
                    <button
                      onClick={() => copyToClipboard(st.command, idx)}
                      className="text-xs text-slate-500 hover:text-indigo-600 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600">{st.desc}</p>

                {st.command && (
                  <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-xs overflow-x-auto">
                    {st.command}
                  </pre>
                )}

                <p className="text-[11px] text-slate-500 italic">💡 {st.note}</p>
              </div>
            ))}
          </div>

          {/* What Works on Localhost */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Included & Verified on Localhost</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Auto JD field extraction (Title, Exp, Skills)</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Multi-resume batch upload & parsing</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Live search bar by name, status, or keyword</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Export formatted PDF & CSV HR records</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>NLP TF-IDF cosine similarity ranking</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>AI Recruiter Copilot assistant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>URL: <strong>http://localhost:3000</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            Got It, Close
          </button>
        </div>
      </div>
    </div>
  );
};
