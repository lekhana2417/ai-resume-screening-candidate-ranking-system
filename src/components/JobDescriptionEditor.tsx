import React, { useState, useRef } from 'react';
import { JobDescription } from '../types';
import { extractJobDescriptionFields } from '../utils/nlpEngine';
import {
  Briefcase,
  Plus,
  X,
  Sparkles,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  GraduationCap,
  RefreshCw,
  Zap
} from 'lucide-react';

interface JobDescriptionEditorProps {
  jobDescription: JobDescription;
  onChange: (updated: JobDescription) => void;
  onAutoParsed?: (updated: JobDescription) => void;
}

export const JobDescriptionEditor: React.FC<JobDescriptionEditorProps> = ({
  jobDescription,
  onChange,
  onAutoParsed
}) => {
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automatically process pasted or uploaded JD text
  const processJobDescriptionText = async (raw: string) => {
    if (!raw || raw.trim().length < 15) return;

    // 1. Instant local extraction - fills fields within milliseconds
    const local = extractJobDescriptionFields(raw);
    const updated: JobDescription = {
      ...jobDescription,
      title: local.title || jobDescription.title || 'Target Role',
      department: local.department || jobDescription.department || 'Engineering',
      minExperienceYears: local.minExperienceYears !== undefined ? local.minExperienceYears : (jobDescription.minExperienceYears || 0),
      educationLevel: local.educationLevel || jobDescription.educationLevel || "Bachelor's Degree or equivalent",
      requiredSkills: local.requiredSkills.length > 0 ? local.requiredSkills : jobDescription.requiredSkills,
      preferredSkills: local.preferredSkills.length > 0 ? local.preferredSkills : jobDescription.preferredSkills,
      summary: local.summary || jobDescription.summary,
      rawText: raw
    };

    onChange(updated);
    if (onAutoParsed) {
      onAutoParsed(updated);
    }
    setExtractSuccess(true);

    // 2. Also trigger AI extraction to refine and enhance in background
    setIsExtracting(true);
    try {
      const res = await fetch('/api/extract-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: raw })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.extracted) {
          const ext = data.extracted;
          const refined: JobDescription = {
            ...updated,
            title: ext.title || updated.title,
            department: ext.department || updated.department,
            minExperienceYears: ext.minExperienceYears !== undefined ? ext.minExperienceYears : updated.minExperienceYears,
            educationLevel: ext.educationLevel || updated.educationLevel,
            requiredSkills: ext.requiredSkills && ext.requiredSkills.length > 0 ? ext.requiredSkills : updated.requiredSkills,
            preferredSkills: ext.preferredSkills && ext.preferredSkills.length > 0 ? ext.preferredSkills : updated.preferredSkills,
            summary: ext.summary || updated.summary,
            rawText: raw
          };
          onChange(refined);
          if (onAutoParsed) {
            onAutoParsed(refined);
          }
        }
      }
    } catch (e) {
      console.warn('AI refinement skipped, using instant local extraction:', e);
    } finally {
      setIsExtracting(false);
      setTimeout(() => setExtractSuccess(false), 4000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processJobDescriptionText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleAddRequiredSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequiredSkill.trim()) return;
    const skill = newRequiredSkill.trim();
    if (!jobDescription.requiredSkills.includes(skill)) {
      const updated = {
        ...jobDescription,
        requiredSkills: [...jobDescription.requiredSkills, skill]
      };
      onChange(updated);
      if (onAutoParsed) onAutoParsed(updated);
    }
    setNewRequiredSkill('');
  };

  const handleRemoveRequiredSkill = (skillToRemove: string) => {
    const updated = {
      ...jobDescription,
      requiredSkills: jobDescription.requiredSkills.filter(s => s !== skillToRemove)
    };
    onChange(updated);
    if (onAutoParsed) onAutoParsed(updated);
  };

  const handleAddPreferredSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPreferredSkill.trim()) return;
    const skill = newPreferredSkill.trim();
    if (!jobDescription.preferredSkills.includes(skill)) {
      const updated = {
        ...jobDescription,
        preferredSkills: [...jobDescription.preferredSkills, skill]
      };
      onChange(updated);
      if (onAutoParsed) onAutoParsed(updated);
    }
    setNewPreferredSkill('');
  };

  const handleRemovePreferredSkill = (skillToRemove: string) => {
    const updated = {
      ...jobDescription,
      preferredSkills: jobDescription.preferredSkills.filter(s => s !== skillToRemove)
    };
    onChange(updated);
    if (onAutoParsed) onAutoParsed(updated);
  };

  const isConfigured = Boolean(jobDescription.title && (jobDescription.rawText || jobDescription.requiredSkills.length > 0));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">1. Job Description & Requisition</h2>
              {isConfigured && (
                <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Ready & Evaluating</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Paste your JD below—fields auto-fill and resumes evaluate immediately</p>
          </div>
        </div>

        {/* Upload JD File Button */}
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload JD File</span>
          </button>
        </div>
      </div>

      {/* Primary JD Text Input */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Paste Job Description (Auto-fills title, experience & skills on paste)</span>
          </label>

          {isExtracting && (
            <span className="flex items-center space-x-1 text-xs text-blue-600 font-semibold animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>AI Refining Requirements...</span>
            </span>
          )}

          {extractSuccess && !isExtracting && (
            <span className="flex items-center space-x-1 text-xs text-emerald-600 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Auto-filled & Evaluating!</span>
            </span>
          )}
        </div>

        <textarea
          rows={5}
          value={jobDescription.rawText}
          onPaste={(e) => {
            const pastedText = e.clipboardData.getData('text');
            if (pastedText && pastedText.trim().length > 15) {
              setTimeout(() => processJobDescriptionText(pastedText), 30);
            }
          }}
          onChange={(e) => {
            const val = e.target.value;
            onChange({ ...jobDescription, rawText: val });
            // If user typed or pasted text and skills aren't yet populated
            if (val.trim().length > 40 && jobDescription.requiredSkills.length === 0) {
              processJobDescriptionText(val);
            }
          }}
          placeholder="Paste complete Job Description here... We will automatically extract the Title, Required Experience, Mandatory Core Skills, and Bonus Skills, then start evaluating the resumes immediately!"
          className="w-full text-xs font-mono bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition leading-relaxed placeholder:font-sans"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <p className="text-[11px] text-slate-500 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {jobDescription.minExperienceYears > 0 
                ? `Extracted from JD: ${jobDescription.minExperienceYears}+ years required experience`
                : 'Min experience will automatically extract from the given JD text above'}
            </span>
          </p>
          {jobDescription.rawText && (
            <button
              type="button"
              onClick={() => processJobDescriptionText(jobDescription.rawText)}
              disabled={isExtracting}
              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{isExtracting ? 'Extracting & Screening...' : 'Update from JD & Start AI Screening'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Auto-filled Attributes */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
            <span>Job Title (Auto-Filled)</span>
            {jobDescription.title && (
              <span className="text-[10px] text-blue-600 font-semibold lowercase">auto-extracted</span>
            )}
          </label>
          <input
            type="text"
            value={jobDescription.title}
            onChange={(e) => {
              const updated = { ...jobDescription, title: e.target.value };
              onChange(updated);
              if (onAutoParsed) onAutoParsed(updated);
            }}
            placeholder="Auto-extracted from JD..."
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Min. Experience</span>
            </span>
            {jobDescription.minExperienceYears > 0 && (
              <span className="text-[10px] text-blue-600 font-semibold lowercase">auto-extracted</span>
            )}
          </label>
          <input
            type="number"
            min="0"
            max="30"
            value={jobDescription.minExperienceYears || ''}
            onChange={(e) => {
              const updated = { ...jobDescription, minExperienceYears: parseInt(e.target.value) || 0 };
              onChange(updated);
              if (onAutoParsed) onAutoParsed(updated);
            }}
            placeholder="Years (e.g. 5)"
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Mandatory Required Skills */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Mandatory Core Skills ({jobDescription.requiredSkills.length})</span>
          </label>
          <span className="text-[11px] text-slate-400">Auto-filled from JD • Click ✕ to remove or type to add</span>
        </div>

        <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80 min-h-[46px] items-center">
          {jobDescription.requiredSkills.map(skill => (
            <span
              key={skill}
              className="inline-flex items-center space-x-1.5 bg-white border border-rose-200 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs animate-in fade-in duration-200"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveRequiredSkill(skill)}
                className="hover:text-rose-900 hover:bg-rose-100 rounded-full p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <form onSubmit={handleAddRequiredSkill} className="inline-flex items-center">
            <input
              type="text"
              value={newRequiredSkill}
              onChange={(e) => setNewRequiredSkill(e.target.value)}
              placeholder="+ Add required skill..."
              className="text-xs bg-transparent border-none px-2 py-1 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0 min-w-[150px]"
            />
          </form>
        </div>
      </div>

      {/* Preferred / Bonus Skills */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>Bonus Skills ({jobDescription.preferredSkills.length})</span>
          </label>
          <span className="text-[11px] text-slate-400">Auto-filled nice-to-haves • Extra points in evaluation</span>
        </div>

        <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80 min-h-[46px] items-center">
          {jobDescription.preferredSkills.map(skill => (
            <span
              key={skill}
              className="inline-flex items-center space-x-1.5 bg-white border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs animate-in fade-in duration-200"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemovePreferredSkill(skill)}
                className="hover:text-indigo-900 hover:bg-indigo-100 rounded-full p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <form onSubmit={handleAddPreferredSkill} className="inline-flex items-center">
            <input
              type="text"
              value={newPreferredSkill}
              onChange={(e) => setNewPreferredSkill(e.target.value)}
              placeholder="+ Add bonus skill..."
              className="text-xs bg-transparent border-none px-2 py-1 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0 min-w-[150px]"
            />
          </form>
        </div>
      </div>
    </div>
  );
};
