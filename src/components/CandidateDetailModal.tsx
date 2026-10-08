import React, { useState } from 'react';
import {
  CandidateAnalysisResult,
  CandidateResume,
  CandidateStatus
} from '../types';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Mail,
  HelpCircle,
  Copy,
  Check,
  Brain,
  GraduationCap,
  Clock,
  Briefcase,
  Layers,
  Send,
  MessageSquare
} from 'lucide-react';

interface CandidateDetailModalProps {
  candidateResult: CandidateAnalysisResult;
  candidateResume?: CandidateResume;
  roleTitle: string;
  onClose: () => void;
  onUpdateStatus: (candidateId: string, newStatus: CandidateStatus) => void;
  onUpdateNotes: (candidateId: string, notes: string) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidateResult,
  candidateResume,
  roleTitle,
  onClose,
  onUpdateStatus,
  onUpdateNotes
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'skills' | 'interview' | 'email' | 'resume'>('summary');
  const [notes, setNotes] = useState(candidateResult.recruiterNotes || '');
  const [emailType, setEmailType] = useState<'INVITE' | 'REJECT'>('INVITE');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);

  const handleNotesBlur = () => {
    onUpdateNotes(candidateResult.candidateId, notes);
  };

  const handleGenerateEmail = async (type: 'INVITE' | 'REJECT') => {
    setEmailType(type);
    setIsGeneratingEmail(true);
    try {
      const res = await fetch('/api/candidate-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: type,
          candidateName: candidateResult.candidateName,
          roleTitle: roleTitle,
          strengths: candidateResult.strengths,
          gaps: candidateResult.gaps
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedEmail(data);
      } else {
        // Fallback email
        setGeneratedEmail({
          subject: type === 'INVITE' ? `Interview Invitation: ${roleTitle}` : `Update on your application: ${roleTitle}`,
          body: type === 'INVITE'
            ? `Dear ${candidateResult.candidateName},\n\nThank you for applying to the ${roleTitle} role. We were very impressed with your background and achievements in ${candidateResult.matchedSkills.slice(0, 3).join(', ')}.\n\nWe would love to invite you to a 45-minute technical conversation with our team.\n\nPlease let us know your availability over the upcoming week.\n\nWarm regards,\nRecruiting Team`
            : `Dear ${candidateResult.candidateName},\n\nThank you for taking the time to apply for the ${roleTitle} role. After careful review, we have decided to proceed with other candidates whose technical profile more closely matches our immediate requirements.\n\nWe appreciate your interest in our company and wish you continued success.\n\nSincerely,\nRecruiting Team`
        });
      }
    } catch {
      setGeneratedEmail({
        subject: type === 'INVITE' ? `Interview Invitation: ${roleTitle}` : `Update on your application: ${roleTitle}`,
        body: type === 'INVITE'
          ? `Dear ${candidateResult.candidateName},\n\nWe would like to invite you to an interview for ${roleTitle}.\n\nBest,\nRecruiting Team`
          : `Dear ${candidateResult.candidateName},\n\nThank you for applying to ${roleTitle}. We wish you the best in your job search.\n\nBest,\nRecruiting Team`
      });
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleCopyEmail = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-500/25 ring-2 ring-white/20">
              {candidateResult.candidateName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white">{candidateResult.candidateName}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  candidateResult.tier === 'TOP_MATCH'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : candidateResult.tier === 'STRONG_FIT'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : candidateResult.tier === 'MODERATE_FIT'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {candidateResult.tier.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {candidateResult.currentRole} • {candidateResult.experienceYears} Years Exp • {candidateResult.education}
              </p>
            </div>
          </div>

          {/* Right Header: Score & Pipeline Status */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Fit Score</span>
              <span className={`text-2xl font-black ${
                candidateResult.overallScore >= 85
                  ? 'text-emerald-400'
                  : candidateResult.overallScore >= 70
                  ? 'text-blue-400'
                  : candidateResult.overallScore >= 55
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}>
                {candidateResult.overallScore}%
              </span>
            </div>

            <div className="h-8 w-px bg-slate-700 mx-1" />

            {/* Pipeline status changer */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-0.5">Pipeline</label>
              <select
                value={candidateResult.status}
                onChange={(e) => onUpdateStatus(candidateResult.candidateId, e.target.value as CandidateStatus)}
                className="text-xs font-bold bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="PENDING">Pending Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Score Breakdown Cards Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Skills Match</span>
            <span className="text-base font-extrabold text-slate-900">{candidateResult.skillsScore}%</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Experience Depth</span>
            <span className="text-base font-extrabold text-slate-900">{candidateResult.experienceScore}%</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Education Alignment</span>
            <span className="text-base font-extrabold text-slate-900">{candidateResult.educationScore}%</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">NLP TF-IDF Vector</span>
            <span className="text-base font-extrabold text-blue-600">{candidateResult.nlpCosineScore}%</span>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 flex space-x-6 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer transition whitespace-nowrap ${
              activeTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>AI Executive Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer transition whitespace-nowrap ${
              activeTab === 'skills' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Skill Alignment Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('interview')}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer transition whitespace-nowrap ${
              activeTab === 'interview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>AI Interview Questions ({candidateResult.interviewQuestions.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('email');
              if (!generatedEmail) handleGenerateEmail('INVITE');
            }}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer transition whitespace-nowrap ${
              activeTab === 'email' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Recruiter Outreach</span>
          </button>

          <button
            onClick={() => setActiveTab('resume')}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer transition whitespace-nowrap ${
              activeTab === 'resume' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Original Resume</span>
          </button>
        </div>

        {/* Modal Tab Content Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center space-x-2 mb-2 text-blue-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Recruiter Executive Assessment</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {candidateResult.executiveSummary}
                </p>
              </div>

              {/* Strengths and Gaps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Key Candidate Strengths</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {candidateResult.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-600 font-bold shrink-0">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps / Risks */}
                <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs uppercase tracking-wider mb-3">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Missing Skills & Requisition Gaps</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {candidateResult.gaps.map((gap, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-rose-600 font-bold shrink-0">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recruiter Notes Log */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    <span>Recruiter Evaluation Notes</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Autosaves on leave</span>
                </div>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="Record your phone screen observations, candidate salary expectations, or interview team feedback here..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SKILL ALIGNMENT MATRIX */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Mandatory Skills */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mandatory Requisition Skills Alignment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {candidateResult.skillAlignments
                    .filter(sa => sa.type === 'REQUIRED')
                    .map((sa) => (
                      <div
                        key={sa.skill}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                          sa.matched
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                            : 'bg-rose-50/60 border-rose-200 text-rose-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {sa.matched ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span className="font-bold">{sa.skill}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          sa.matched ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                        }`}>
                          {sa.matched ? 'Verified' : 'Missing'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Bonus / Extra Skills */}
              {candidateResult.bonusSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Bonus & Complementary Skills Detected
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {candidateResult.bonusSkills.map(bSkill => (
                      <span
                        key={bSkill}
                        className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-lg"
                      >
                        + {bSkill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI INTERVIEW QUESTIONS */}
          {activeTab === 'interview' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900">
                <strong>Interviewer Guidance:</strong> These questions are dynamically tailored to probe the candidate’s specific resume gaps and declared strengths.
              </div>

              {candidateResult.interviewQuestions.map((iq, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                      Question #{idx + 1}
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900">{iq.question}</h5>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-800 block text-[11px] uppercase">Interviewer Rationale:</span>
                    <span>{iq.rationale}</span>
                  </div>

                  <div className="text-xs text-slate-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-800 block text-[11px] uppercase">Benchmark for a Top Answer:</span>
                    <span>{iq.expectedResponse}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: OUTREACH EMAIL COMPOSER */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleGenerateEmail('INVITE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    emailType === 'INVITE'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Draft Interview Invitation
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateEmail('REJECT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    emailType === 'REJECT'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Draft Respectful Rejection
                </button>
              </div>

              {isGeneratingEmail ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  <Sparkles className="w-5 h-5 mx-auto text-blue-500 animate-spin mb-2" />
                  <span>Drafting tailored outreach email with Gemini AI...</span>
                </div>
              ) : generatedEmail ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-700">Subject: {generatedEmail.subject}</span>
                    <button
                      onClick={handleCopyEmail}
                      className="flex items-center space-x-1 text-xs text-blue-600 font-bold hover:text-blue-800 cursor-pointer"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
                    </button>
                  </div>
                  <pre className="text-xs font-sans text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {generatedEmail.body}
                  </pre>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 5: ORIGINAL RESUME TEXT */}
          {activeTab === 'resume' && (
            <div>
              <pre className="text-xs font-mono bg-slate-900 text-slate-200 p-4 rounded-2xl whitespace-pre-wrap leading-relaxed border border-slate-800">
                {candidateResume?.rawText || 'Raw resume text unavailable.'}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateStatus(candidateResult.candidateId, 'SHORTLISTED')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
            >
              Shortlist Candidate
            </button>
            <button
              onClick={() => onUpdateStatus(candidateResult.candidateId, 'INTERVIEW_SCHEDULED')}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
            >
              Invite to Interview
            </button>
            <button
              onClick={() => onUpdateStatus(candidateResult.candidateId, 'REJECTED')}
              className="bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
            >
              Reject
            </button>
          </div>

          <button
            onClick={onClose}
            className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
