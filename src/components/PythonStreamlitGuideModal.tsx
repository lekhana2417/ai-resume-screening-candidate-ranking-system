import React, { useState } from 'react';
import {
  PYTHON_STREAMLIT_CODE,
  PYTHON_REQUIREMENTS
} from '../data/sampleData';
import {
  X,
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  FolderTree,
  ExternalLink,
  Laptop,
  CheckCircle2
} from 'lucide-react';

interface PythonStreamlitGuideModalProps {
  onClose: () => void;
}

export const PythonStreamlitGuideModal: React.FC<PythonStreamlitGuideModalProps> = ({
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'reqs' | 'guide'>('code');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReqs, setCopiedReqs] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PYTHON_STREAMLIT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyReqs = () => {
    navigator.clipboard.writeText(PYTHON_REQUIREMENTS);
    setCopiedReqs(true);
    setTimeout(() => setCopiedReqs(false), 2000);
  };

  const handleDownloadAppPy = () => {
    const blob = new Blob([PYTHON_STREAMLIT_CODE], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadRequirements = () => {
    const blob = new Blob([PYTHON_REQUIREMENTS], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'requirements.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Python & Streamlit Project Guide</span>
                <span className="text-[11px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  VS Code Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete runnable Python code, TF-IDF vectorizer scripts, and setup commands
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 flex space-x-6 text-xs font-bold bg-slate-50/50">
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer transition ${
              activeTab === 'code' ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Streamlit App Code (app.py)</span>
          </button>

          <button
            onClick={() => setActiveTab('reqs')}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer transition ${
              activeTab === 'reqs' ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>requirements.txt & Structure</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer transition ${
              activeTab === 'guide' ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>VS Code Step-by-Step Setup</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* TAB 1: app.py */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Python Code (Streamlit + Scikit-Learn TF-IDF + Gemini API)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy app.py'}</span>
                  </button>
                  <button
                    onClick={handleDownloadAppPy}
                    className="flex items-center space-x-1 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download app.py</span>
                  </button>
                </div>
              </div>

              <pre className="text-xs font-mono bg-slate-950 text-slate-200 p-4 rounded-2xl overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
                {PYTHON_STREAMLIT_CODE}
              </pre>
            </div>
          )}

          {/* TAB 2: requirements.txt & Project Structure */}
          {activeTab === 'reqs' && (
            <div className="space-y-6">
              {/* Project Structure */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Recommended Project Folder Structure
                </h4>
                <pre className="text-xs font-mono bg-slate-900 text-emerald-400 p-4 rounded-xl leading-relaxed border border-slate-800">
{`ai-resume-screener/
├── app.py                  # Streamlit web application & screening pipeline
├── requirements.txt        # Python libraries
├── README.md               # Documentation & setup guide
├── resumes/                # Directory to store candidate PDF/DOCX files
│   ├── candidate_1.pdf
│   └── candidate_2.pdf
└── data/
    └── sample_jobs.json    # Sample job descriptions`}
                </pre>
              </div>

              {/* requirements.txt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    requirements.txt
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyReqs}
                      className="flex items-center space-x-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                    >
                      {copiedReqs ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedReqs ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownloadRequirements}
                      className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download requirements.txt</span>
                    </button>
                  </div>
                </div>

                <pre className="text-xs font-mono bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 leading-relaxed">
                  {PYTHON_REQUIREMENTS}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: VS Code Setup Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  How to run this in VS Code and Python:
                </h4>

                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong>Open VS Code & Create Project Folder</strong>
                      <p className="text-slate-500 mt-0.5">Create a new folder named <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">ai-resume-screener</code> and open it in VS Code.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong>Create Virtual Environment (Recommended)</strong>
                      <p className="text-slate-500 mt-0.5">Open terminal (<kbd className="bg-slate-200 px-1 py-0.5 rounded">Ctrl+`</kbd> or <kbd className="bg-slate-200 px-1 py-0.5 rounded">Cmd+`</kbd>) and run:</p>
                      <pre className="bg-slate-900 text-slate-200 p-2 rounded mt-1 font-mono">python -m venv venv{"\n"}# On Windows: venv\Scripts\activate{"\n"}# On Mac/Linux: source venv/bin/activate</pre>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong>Install Dependencies</strong>
                      <pre className="bg-slate-900 text-slate-200 p-2 rounded mt-1 font-mono">pip install -r requirements.txt</pre>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">4</span>
                    <div>
                      <strong>Launch Streamlit Web Application</strong>
                      <pre className="bg-slate-900 text-emerald-400 p-2 rounded mt-1 font-mono">streamlit run app.py</pre>
                      <p className="text-slate-500 mt-1">This will open your browser at <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">http://localhost:8501</code> with the interactive resume screening dashboard!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
