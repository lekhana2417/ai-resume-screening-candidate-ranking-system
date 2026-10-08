import React, { useState, useRef } from 'react';
import { CandidateResume } from '../types';
import { parseResumeDetails } from '../utils/nlpEngine';
import {
  UploadCloud,
  FileText,
  Trash2,
  PlusCircle,
  Users,
  Eye,
  CheckCircle2,
  ClipboardPaste,
  FileUp,
  X
} from 'lucide-react';

interface ResumeUploaderProps {
  candidates: CandidateResume[];
  onAddCandidate: (candidate: CandidateResume) => void;
  onRemoveCandidate: (id: string) => void;
  onClearAll: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  candidates,
  onAddCandidate,
  onRemoveCandidate,
  onClearAll
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [pasteName, setPasteName] = useState('');
  const [pasteRole, setPasteRole] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [previewCandidate, setPreviewCandidate] = useState<CandidateResume | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await readFileAsText(file);
        const parsed = parseResumeDetails(text, file.name);

        const newCand: CandidateResume = {
          id: `cand-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: parsed.name || file.name.replace(/\.[^/.]+$/, ''),
          email: parsed.email,
          phone: parsed.phone,
          currentRole: 'Candidate',
          experienceYears: parsed.experienceYears,
          education: parsed.education,
          skills: [],
          summary: text.slice(0, 160).trim() + '...',
          rawText: text,
          fileName: file.name
        };

        onAddCandidate(newCand);
      } catch (err) {
        console.error('Failed to read file:', file.name, err);
      }
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;

    const parsed = parseResumeDetails(pasteText);
    const candidateName = pasteName.trim() || parsed.name || `Candidate #${candidates.length + 1}`;

    const newCandidate: CandidateResume = {
      id: `cand-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: candidateName,
      email: parsed.email,
      phone: parsed.phone,
      currentRole: pasteRole.trim() || 'Software Engineer',
      experienceYears: parsed.experienceYears,
      education: parsed.education,
      skills: [],
      summary: pasteText.slice(0, 180).trim() + '...',
      rawText: pasteText,
      fileName: 'Pasted Resume.txt'
    };

    onAddCandidate(newCandidate);
    setPasteName('');
    setPasteRole('');
    setPasteText('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">2. Candidate Resumes Pool</h2>
              {candidates.length > 0 && (
                <span className="flex items-center space-x-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  <span>{candidates.length} Resumes Loaded</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Provide multiple candidate resumes to compare against your Job Description</p>
          </div>
        </div>

        {candidates.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-slate-500 hover:text-rose-600 font-semibold px-2 py-1 transition cursor-pointer"
          >
            Clear All ({candidates.length})
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-4 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-2.5 px-4 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border-b-2 ${
            activeTab === 'upload'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Files (.pdf, .txt, .docx, .md)</span>
        </button>
        <button
          onClick={() => setActiveTab('paste')}
          className={`pb-2.5 px-4 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border-b-2 ${
            activeTab === 'paste'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardPaste className="w-4 h-4" />
          <span>Paste Resume Text Directly</span>
        </button>
      </div>

      {/* Upload Zone */}
      {activeTab === 'upload' ? (
        <div className="mt-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.docx,.md"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Drag & drop candidate resumes here, or <span className="text-indigo-600 underline">browse files</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Select multiple resumes at once to screen in batch
            </p>
          </div>
        </div>
      ) : (
        /* Direct Paste Form */
        <form onSubmit={handlePasteSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Candidate Name (Optional)</label>
              <input
                type="text"
                value={pasteName}
                onChange={(e) => setPasteName(e.target.value)}
                placeholder="Auto-extracted if left blank"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Current Role (Optional)</label>
              <input
                type="text"
                value={pasteRole}
                onChange={(e) => setPasteRole(e.target.value)}
                placeholder="e.g. Lead Developer"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Resume Text (Work History, Skills, Education)</label>
            <textarea
              rows={4}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste candidate resume text here..."
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={!pasteText.trim()}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Candidate to Screening Pool</span>
          </button>
        </form>
      )}

      {/* Candidate List in Queue */}
      {candidates.length > 0 ? (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Uploaded Resumes ({candidates.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50/40 rounded-xl border border-slate-200 transition group"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                    {cand.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{cand.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{cand.currentRole} • {cand.experienceYears}y exp</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewCandidate(cand)}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-white cursor-pointer"
                    title="Preview resume"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveCandidate(cand.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-white cursor-pointer"
                    title="Remove candidate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500 border border-slate-200/60">
          No resumes added yet. Upload files above or paste resume text to begin screening.
        </div>
      )}

      {/* Quick Resume Preview Modal */}
      {previewCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">{previewCandidate.name}</h3>
                <p className="text-xs text-slate-500">{previewCandidate.currentRole} • {previewCandidate.education}</p>
              </div>
              <button
                onClick={() => setPreviewCandidate(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 flex-1 overflow-y-auto">
              <pre className="text-xs font-mono bg-slate-950 text-slate-200 p-4 rounded-xl whitespace-pre-wrap leading-relaxed">
                {previewCandidate.rawText}
              </pre>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewCandidate(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
