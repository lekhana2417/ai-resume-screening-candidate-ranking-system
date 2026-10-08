import React from 'react';
import { CandidateAnalysisResult } from '../types';
import { X, GitCompare, CheckCircle2, AlertTriangle, Trophy, Sparkles } from 'lucide-react';

interface CandidateComparisonModalProps {
  candidates: CandidateAnalysisResult[];
  onClose: () => void;
  onSelectCandidate: (candidate: CandidateAnalysisResult) => void;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  candidates,
  onClose,
  onSelectCandidate
}) => {
  if (candidates.length === 0) return null;

  // Best candidate among selected
  const topCandidate = [...candidates].sort((a, b) => b.overallScore - a.overallScore)[0];

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Side-by-Side Candidate Comparison</h2>
              <p className="text-xs text-slate-400">Head-to-head qualification, skill overlap, and trade-off evaluation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Winner Callout */}
          <div className="bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-indigo-500/15 border border-amber-300/40 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Top Candidate Recommendation</p>
              <p className="text-xs sm:text-sm text-slate-800">
                <strong>{topCandidate.candidateName}</strong> leads with a composite score of <strong>{topCandidate.overallScore}%</strong> and strong coverage in core requisition competencies.
              </p>
            </div>
          </div>

          {/* Side-by-Side Comparison Columns */}
          <div className={`grid grid-cols-1 md:grid-cols-${candidates.length} gap-4`}>
            {candidates.map((cand) => {
              const isWinner = cand.candidateId === topCandidate.candidateId;
              return (
                <div
                  key={cand.id}
                  className={`bg-slate-50/70 border rounded-2xl p-4 flex flex-col transition ${
                    isWinner ? 'border-amber-400 shadow-md ring-1 ring-amber-300/50 bg-amber-50/20' : 'border-slate-200'
                  }`}
                >
                  {/* Candidate Header */}
                  <div className="pb-3 border-b border-slate-200">
                    {isWinner && (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mb-2">
                        <Sparkles className="w-3 h-3" />
                        <span>Highest Rated</span>
                      </span>
                    )}
                    <h3 className="font-extrabold text-base text-slate-900">{cand.candidateName}</h3>
                    <p className="text-xs text-slate-500">{cand.currentRole}</p>
                    <p className="text-xs text-slate-500">{cand.experienceYears} Years Exp • {cand.education}</p>

                    {/* Overall Score */}
                    <div className="mt-3 flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-600">Composite Score</span>
                      <span className="text-lg font-black text-blue-600">{cand.overallScore}%</span>
                    </div>
                  </div>

                  {/* Metrics List */}
                  <div className="py-3 border-b border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Skills Match</span>
                      <span className="font-bold text-slate-800">{cand.skillsScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Experience Score</span>
                      <span className="font-bold text-slate-800">{cand.experienceScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">NLP Cosine Sim.</span>
                      <span className="font-bold text-slate-800">{cand.nlpCosineScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tier</span>
                      <span className="font-bold text-slate-800">{cand.tier.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Matched Skills */}
                  <div className="py-3 border-b border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Matched Skills ({cand.matchedSkills.length})</span>
                    <div className="flex flex-wrap gap-1">
                      {cand.matchedSkills.map(s => (
                        <span key={s} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="py-3 border-b border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Missing Skills ({cand.missingRequiredSkills.length})</span>
                    <div className="flex flex-wrap gap-1">
                      {cand.missingRequiredSkills.length > 0 ? (
                        cand.missingRequiredSkills.map(s => (
                          <span key={s} className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                            ✕ {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">All required skills met!</span>
                      )}
                    </div>
                  </div>

                  {/* Top Strength */}
                  <div className="py-3 space-y-1 text-xs flex-1">
                    <span className="font-bold text-slate-700 block">Primary Strength:</span>
                    <p className="text-slate-600 text-[11px]">{cand.strengths[0] || 'Solid background'}</p>
                  </div>

                  {/* Action */}
                  <div className="pt-3">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectCandidate(cand);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl transition cursor-pointer"
                    >
                      Inspect Full Dossier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
