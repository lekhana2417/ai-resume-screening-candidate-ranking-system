import React from 'react';
import { Sparkles, Code2, Users, FileCheck2, Trash2, MessageSquare, Smartphone, Laptop } from 'lucide-react';

interface HeaderProps {
  onOpenLocalhostGuide: () => void;
  onOpenPythonGuide: () => void;
  onOpenAndroidGuide: () => void;
  onClearWorkspace: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  candidateCount: number;
  screenedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLocalhostGuide,
  onOpenPythonGuide,
  onOpenAndroidGuide,
  onClearWorkspace,
  onToggleChat,
  isChatOpen,
  candidateCount,
  screenedCount
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                ScreenAI
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                NLP + Gemini AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Professional Resume Screening & Qualification Assessment System
            </p>
          </div>
        </div>

        {/* Status badges & Quick Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Stats pills */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Resumes: <strong className="text-white">{candidateCount}</strong></span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Screened: <strong className="text-emerald-400">{screenedCount}</strong></span>
            </div>
          </div>

          {/* AI Recruiter Copilot Button */}
          <button
            onClick={onToggleChat}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              isChatOpen
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700'
            }`}
            title="Chat with AI Recruiter Copilot"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>

          {/* Run on Localhost Button */}
          <button
            onClick={onOpenLocalhostGuide}
            className="flex items-center space-x-1 sm:space-x-1.5 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 px-2 sm:px-3 py-1.5 rounded-lg border border-indigo-700/60 text-xs font-semibold transition cursor-pointer shadow-2xs"
            title="How to run directly on localhost (npm run dev)"
          >
            <Laptop className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden md:inline">Run Localhost</span>
            <span className="md:hidden">Localhost</span>
          </button>

          {/* Android Studio Project Guide Button */}
          <button
            onClick={onOpenAndroidGuide}
            className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
            title="View Android Studio WebView & Emulator code"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden md:inline">Android Studio</span>
            <span className="md:hidden">Android</span>
          </button>

          {/* Python & Streamlit Project Guide Button */}
          <button
            onClick={onOpenPythonGuide}
            className="hidden sm:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium transition cursor-pointer"
            title="View Python, Streamlit code & setup instructions"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Python Code</span>
          </button>

          {/* Clear Workspace button */}
          {(candidateCount > 0 || screenedCount > 0) && (
            <button
              onClick={onClearWorkspace}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs font-medium transition cursor-pointer"
              title="Clear all inputs and reset workspace"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
