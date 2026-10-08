import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  JobDescription,
  CandidateResume,
  CandidateAnalysisResult,
  ScreeningWeights,
  CandidateStatus
} from './types';
import {
  SAMPLE_JOB_DESCRIPTIONS,
  SAMPLE_CANDIDATE_RESUMES
} from './data/sampleData';
import { screenCandidate, evaluateCandidateLocally } from './utils/screeningService';

import { Header } from './components/Header';
import { JobDescriptionEditor } from './components/JobDescriptionEditor';
import { ResumeUploader } from './components/ResumeUploader';
import { ScreeningControls } from './components/ScreeningControls';
import { CandidateEvaluationMatrix } from './components/CandidateEvaluationMatrix';
import { CandidateDetailModal } from './components/CandidateDetailModal';
import { CandidateComparisonModal } from './components/CandidateComparisonModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PythonStreamlitGuideModal } from './components/PythonStreamlitGuideModal';
import { AndroidStudioGuideModal } from './components/AndroidStudioGuideModal';
import { LocalhostGuideModal } from './components/LocalhostGuideModal';
import { RecruiterChatbot } from './components/RecruiterChatbot';
import { HRExportModal } from './components/HRExportModal';
import { ArrowRight, Sparkles, FileText, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

const EMPTY_JOB_DESCRIPTION: JobDescription = {
  id: 'jd-user',
  title: '',
  department: '',
  minExperienceYears: 0,
  educationLevel: '',
  summary: '',
  requiredSkills: [],
  preferredSkills: [],
  responsibilities: [],
  rawText: ''
};

export default function App() {
  // Core State: Starts completely clean with no inbuilt mock candidates
  const [jobDescription, setJobDescription] = useState<JobDescription>(EMPTY_JOB_DESCRIPTION);
  const [candidates, setCandidates] = useState<CandidateResume[]>([]);
  const [results, setResults] = useState<CandidateAnalysisResult[]>([]);
  const [isScreening, setIsScreening] = useState(false);
  const [screeningProgress, setScreeningProgress] = useState(0);
  const [currentScreeningName, setCurrentScreeningName] = useState('');
  const [hasScreened, setHasScreened] = useState(false);

  // Scoring Weights
  const [weights, setWeights] = useState<ScreeningWeights>({
    skillsWeight: 0.40,
    experienceWeight: 0.30,
    educationWeight: 0.15,
    semanticWeight: 0.15,
  });

  // Modals & Chatbot State
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateAnalysisResult | null>(null);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isPythonGuideOpen, setIsPythonGuideOpen] = useState(false);
  const [isAndroidGuideOpen, setIsAndroidGuideOpen] = useState(false);
  const [isLocalhostGuideOpen, setIsLocalhostGuideOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHRExportOpen, setIsHRExportOpen] = useState(false);

  // Run comprehensive screening (AI + NLP) across all candidates
  const triggerBatchScreening = async (currentJD: JobDescription, candidateList: CandidateResume[]) => {
    if (candidateList.length === 0 || isScreening) return;

    setIsScreening(true);
    setScreeningProgress(0);
    const newResults: CandidateAnalysisResult[] = [];

    for (let i = 0; i < candidateList.length; i++) {
      const cand = candidateList[i];
      setCurrentScreeningName(cand.name);
      setScreeningProgress(Math.round((i / candidateList.length) * 100));

      const res = await screenCandidate(currentJD, cand, weights);
      newResults.push(res);
      setScreeningProgress(Math.round(((i + 1) / candidateList.length) * 100));
    }

    setResults(newResults);
    setIsScreening(false);
    setCurrentScreeningName('');
    setHasScreened(true);

    const hasTop = newResults.some(r => r.overallScore >= 85);
    if (hasTop) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  const screeningDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleRunScreening = () => {
    triggerBatchScreening(jobDescription, candidates);
  };

  // Called whenever JD attributes change (e.g. typing or adjusting sliders)
  const handleJobDescriptionChange = (updated: JobDescription) => {
    setJobDescription(updated);
    if (candidates.length > 0) {
      // 1. Immediately re-evaluate candidates against the updated JD and experience
      const instant = candidates.map(c => evaluateCandidateLocally(updated, c, weights));
      setResults(instant);
      setHasScreened(true);

      // 2. Debounce trigger of full AI screening so background scoring starts smoothly
      if (screeningDebounceRef.current) {
        clearTimeout(screeningDebounceRef.current);
      }
      screeningDebounceRef.current = setTimeout(() => {
        triggerBatchScreening(updated, candidates);
      }, 700);
    }
  };

  // Called automatically whenever JD is pasted or auto-extracted
  const handleJobDescriptionParsed = (updatedJD: JobDescription) => {
    if (screeningDebounceRef.current) {
      clearTimeout(screeningDebounceRef.current);
    }
    setJobDescription(updatedJD);
    if (candidates.length > 0) {
      // 1. Instantly evaluate locally so scores and pills show without any delay
      const instant = candidates.map(c => evaluateCandidateLocally(updatedJD, c, weights));
      setResults(instant);
      setHasScreened(true);

      // 2. Run background AI screening
      triggerBatchScreening(updatedJD, candidates);
    }
  };

  // Add new candidate resume
  const handleAddCandidate = (newCand: CandidateResume) => {
    const updatedCandidates = [newCand, ...candidates];
    setCandidates(updatedCandidates);

    // If JD is present, automatically evaluate the new candidate immediately
    if (jobDescription.rawText || jobDescription.title || jobDescription.requiredSkills.length > 0 || jobDescription.minExperienceYears > 0) {
      const evalRes = evaluateCandidateLocally(jobDescription, newCand, weights);
      setResults(prev => [evalRes, ...prev]);
      setHasScreened(true);

      // Deep evaluate in background
      screenCandidate(jobDescription, newCand, weights).then(aiResult => {
        setResults(prev => prev.map(r => r.candidateId === newCand.id ? aiResult : r));
      });
    }
  };

  // Remove candidate
  const handleRemoveCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
    setResults(prev => prev.filter(r => r.candidateId !== id));
    setSelectedForComparison(prev => prev.filter(candId => candId !== id));
    if (selectedCandidate?.candidateId === id) {
      setSelectedCandidate(null);
    }
  };

  // Clear workspace
  const handleClearWorkspace = () => {
    setJobDescription(EMPTY_JOB_DESCRIPTION);
    setCandidates([]);
    setResults([]);
    setSelectedForComparison([]);
    setSelectedCandidate(null);
    setHasScreened(false);
  };

  // Optional: Quick Load sample data if requested for testing
  const handleLoadSampleDemo = () => {
    setJobDescription(SAMPLE_JOB_DESCRIPTIONS[0]);
    setCandidates(SAMPLE_CANDIDATE_RESUMES);
    const initial = SAMPLE_CANDIDATE_RESUMES.map(c =>
      evaluateCandidateLocally(SAMPLE_JOB_DESCRIPTIONS[0], c, weights)
    );
    setResults(initial);
    setHasScreened(true);
  };

  // Update pipeline status
  const handleUpdateStatus = (candidateId: string, newStatus: CandidateStatus) => {
    setResults(prev =>
      prev.map(r => r.candidateId === candidateId ? { ...r, status: newStatus } : r)
    );
    if (selectedCandidate && selectedCandidate.candidateId === candidateId) {
      setSelectedCandidate(prev => prev ? { ...prev, status: newStatus } : null);
    }
    if (newStatus === 'SHORTLISTED') {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.6 }
      });
    }
  };

  // Update recruiter notes
  const handleUpdateNotes = (candidateId: string, notes: string) => {
    setResults(prev =>
      prev.map(r => r.candidateId === candidateId ? { ...r, recruiterNotes: notes } : r)
    );
    if (selectedCandidate && selectedCandidate.candidateId === candidateId) {
      setSelectedCandidate(prev => prev ? { ...prev, recruiterNotes: notes } : null);
    }
  };

  // Toggle selection for comparison modal (up to 3)
  const handleToggleCompare = (candidateId: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], candidateId];
      }
      return [...prev, candidateId];
    });
  };

  const comparedCandidates = results.filter(r => selectedForComparison.includes(r.candidateId));

  const hasInputs = Boolean(jobDescription.rawText || jobDescription.title || candidates.length > 0);

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-900 flex flex-col antialiased selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <Header
        onOpenLocalhostGuide={() => setIsLocalhostGuideOpen(true)}
        onOpenPythonGuide={() => setIsPythonGuideOpen(true)}
        onOpenAndroidGuide={() => setIsAndroidGuideOpen(true)}
        onClearWorkspace={handleClearWorkspace}
        onToggleChat={() => setIsChatOpen(prev => !prev)}
        isChatOpen={isChatOpen}
        candidateCount={candidates.length}
        screenedCount={results.length}
      />

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Welcome Guide when empty */}
        {!hasInputs && (
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-400/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Custom Input Mode</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30">
                  <span>Localhost Ready (port 3000)</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                AI Resume Screening & Qualification System
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Provide your custom <strong>Job Description</strong> and upload your <strong>Candidate Resumes</strong> below. The system extracts requirements, executes mathematical TF-IDF vector matching, and performs deep qualitative analysis with Gemini AI.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400">
                <span>• Upload or paste JD text</span>
                <span>• Batch upload candidate resumes</span>
                <span>• Ask questions with AI Copilot</span>
                <button
                  type="button"
                  onClick={() => setIsLocalhostGuideOpen(true)}
                  className="text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
                >
                  Run on Localhost Guide
                </button>
                <button
                  type="button"
                  onClick={() => setIsAndroidGuideOpen(true)}
                  className="text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
                >
                  Android Studio Setup
                </button>
                <button
                  type="button"
                  onClick={handleLoadSampleDemo}
                  className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                >
                  Load sample data for testing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Requisition & Resumes Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <JobDescriptionEditor
            jobDescription={jobDescription}
            onChange={handleJobDescriptionChange}
            onAutoParsed={handleJobDescriptionParsed}
          />

          <ResumeUploader
            candidates={candidates}
            onAddCandidate={handleAddCandidate}
            onRemoveCandidate={handleRemoveCandidate}
            onClearAll={() => {
              setCandidates([]);
              setResults([]);
              setSelectedForComparison([]);
            }}
          />
        </section>

        {/* Live Auto-Evaluation Status Banner */}
        {results.length > 0 && (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 shadow-2xs animate-in fade-in duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-sm">
                  {jobDescription.title || 'Job Requisition'} — Automatically Evaluated
                </p>
                <p className="text-slate-600 mt-0.5">
                  Target: <strong>{jobDescription.minExperienceYears || 0}+ yrs exp</strong> • <strong>{jobDescription.requiredSkills.length} Mandatory Skills</strong> ({jobDescription.requiredSkills.slice(0, 5).join(', ')}{jobDescription.requiredSkills.length > 5 ? '...' : ''}) • <strong>{jobDescription.preferredSkills.length} Bonus Skills</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{results.length} Resumes Evaluated</span>
              </span>
            </div>
          </div>
        )}

        {/* Screening Execution Bar (Visible when both JD and Resumes exist) */}
        {candidates.length > 0 && (
          <section>
            <ScreeningControls
              onRunScreening={handleRunScreening}
              isScreening={isScreening}
              progress={screeningProgress}
              currentScreeningName={currentScreeningName}
              candidateCount={candidates.length}
              weights={weights}
              onWeightsChange={(newWeights) => {
                setWeights(newWeights);
                setResults(candidates.map(c => evaluateCandidateLocally(jobDescription, c, newWeights)));
              }}
              hasScreened={hasScreened}
            />
          </section>
        )}

        {/* Candidate Evaluation Matrix */}
        {results.length > 0 && (
          <section>
            <CandidateEvaluationMatrix
              jobDescription={jobDescription}
              results={results}
              onSelectCandidate={(cand) => setSelectedCandidate(cand)}
              onUpdateStatus={handleUpdateStatus}
              selectedForComparison={selectedForComparison}
              onToggleCompare={handleToggleCompare}
              onOpenComparisonModal={() => setIsComparisonOpen(true)}
              onOpenHRExport={() => setIsHRExportOpen(true)}
            />
          </section>
        )}

        {/* Analytics & Keyword Alignment Visualizer */}
        {results.length > 0 && (
          <section>
            <AnalyticsDashboard
              results={results}
              jobDescription={jobDescription}
            />
          </section>
        )}
      </main>

      {/* Floating / Docked Gemini Chatbot */}
      <RecruiterChatbot
        jobDescription={jobDescription}
        candidateResults={results}
        isOpen={isChatOpen}
        onToggleOpen={() => setIsChatOpen(prev => !prev)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} ScreenAI • Professional Resume Screening & Qualification Assessment</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsLocalhostGuideOpen(true)}
              className="text-indigo-700 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Run on Localhost (Browser)
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAndroidGuideOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              Android Studio Project Guide
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPythonGuideOpen(true)}
              className="text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
            >
              Python / Streamlit Exporter
            </button>
            <span>•</span>
            <span className="text-slate-400">TF-IDF Vector Matching + Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>

      {/* Localhost Guide Modal */}
      <LocalhostGuideModal
        isOpen={isLocalhostGuideOpen}
        onClose={() => setIsLocalhostGuideOpen(false)}
      />

      {/* Candidate Full Dossier Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidateResult={selectedCandidate}
          candidateResume={candidates.find(c => c.id === selectedCandidate.candidateId)}
          roleTitle={jobDescription.title || 'Target Role'}
          onClose={() => setSelectedCandidate(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateNotes={handleUpdateNotes}
        />
      )}

      {/* Side-by-Side Comparison Modal */}
      {isComparisonOpen && (
        <CandidateComparisonModal
          candidates={comparedCandidates}
          onClose={() => setIsComparisonOpen(false)}
          onSelectCandidate={(cand) => {
            setIsComparisonOpen(false);
            setSelectedCandidate(cand);
          }}
        />
      )}

      {/* Python & Streamlit Project Guide Modal */}
      {isPythonGuideOpen && (
        <PythonStreamlitGuideModal
          onClose={() => setIsPythonGuideOpen(false)}
        />
      )}

      {/* Android Studio Integration Guide Modal */}
      {isAndroidGuideOpen && (
        <AndroidStudioGuideModal
          onClose={() => setIsAndroidGuideOpen(false)}
        />
      )}

      {/* HR Export & Audit Record Modal */}
      {isHRExportOpen && (
        <HRExportModal
          jobDescription={jobDescription}
          results={results}
          onClose={() => setIsHRExportOpen(false)}
        />
      )}
    </div>
  );
}
