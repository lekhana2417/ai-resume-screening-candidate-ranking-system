import React, { useState } from 'react';
import {
  CandidateAnalysisResult,
  CandidateTier,
  CandidateStatus,
  JobDescription
} from '../types';
import { exportFormattedCSV, exportFormattedPDF } from '../utils/reportExport';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Eye,
  GitCompare,
  UserCheck,
  UserX,
  Sparkles,
  Layers,
  GraduationCap,
  Briefcase,
  FileText,
  FileSpreadsheet,
  ShieldCheck,
  X
} from 'lucide-react';

interface CandidateEvaluationMatrixProps {
  jobDescription: JobDescription;
  results: CandidateAnalysisResult[];
  onSelectCandidate: (candidate: CandidateAnalysisResult) => void;
  onUpdateStatus: (candidateId: string, newStatus: CandidateStatus) => void;
  selectedForComparison: string[];
  onToggleCompare: (candidateId: string) => void;
  onOpenComparisonModal: () => void;
  onOpenHRExport?: () => void;
}

export const CandidateEvaluationMatrix: React.FC<CandidateEvaluationMatrixProps> = ({
  jobDescription,
  results,
  onSelectCandidate,
  onUpdateStatus,
  selectedForComparison,
  onToggleCompare,
  onOpenComparisonModal,
  onOpenHRExport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'overall' | 'nlp' | 'skills' | 'experience'>('overall');

  // Filter candidates by Name, Status, or Keyword
  const normalizedQuery = searchQuery.toLowerCase().trim();

  const filtered = results.filter((cand) => {
    // Dropdown filters
    const matchesDropdownStatus = statusFilter === 'ALL' || cand.status === statusFilter;
    const matchesDropdownTier = tierFilter === 'ALL' || cand.tier === tierFilter;

    if (!normalizedQuery) {
      return matchesDropdownStatus && matchesDropdownTier;
    }

    // 1. Match by Candidate Name
    const matchesName = cand.candidateName.toLowerCase().includes(normalizedQuery);

    // 2. Match by Candidate Status (e.g. "shortlist", "interview", "pending", "hold", "rejected")
    const formattedStatus = cand.status.toLowerCase().replace('_', ' ');
    const matchesStatus =
      formattedStatus.includes(normalizedQuery) ||
      cand.status.toLowerCase().includes(normalizedQuery);

    // 3. Match by Keyword across all candidate data:
    // - Core, missing, or bonus skills
    const allSkills = [
      ...cand.matchedSkills,
      ...cand.missingRequiredSkills,
      ...cand.missingPreferredSkills,
      ...cand.bonusSkills
    ];
    const matchesSkills = allSkills.some(s => s.toLowerCase().includes(normalizedQuery));

    // - Role, education, strengths, gaps, summary, recruiter notes
    const matchesRole = cand.currentRole.toLowerCase().includes(normalizedQuery);
    const matchesEducation = cand.education.toLowerCase().includes(normalizedQuery);
    const matchesStrengths = cand.strengths.some(str => str.toLowerCase().includes(normalizedQuery));
    const matchesGaps = cand.gaps.some(g => g.toLowerCase().includes(normalizedQuery));
    const matchesSummary = cand.executiveSummary.toLowerCase().includes(normalizedQuery);
    const matchesNotes = cand.recruiterNotes?.toLowerCase().includes(normalizedQuery);
    const matchesTier = cand.tier.toLowerCase().replace('_', ' ').includes(normalizedQuery);

    const matchesSearch =
      matchesName ||
      matchesStatus ||
      matchesSkills ||
      matchesRole ||
      matchesEducation ||
      matchesStrengths ||
      matchesGaps ||
      matchesSummary ||
      matchesNotes ||
      matchesTier;

    return matchesSearch && matchesDropdownStatus && matchesDropdownTier;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'overall') return b.overallScore - a.overallScore;
    if (sortBy === 'nlp') return b.nlpCosineScore - a.nlpCosineScore;
    if (sortBy === 'skills') return b.skillsScore - a.skillsScore;
    if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
    return 0;
  });

  const getTierDisplay = (tier: CandidateTier) => {
    switch (tier) {
      case 'TOP_MATCH':
        return {
          label: 'Strong Match',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'STRONG_FIT':
        return {
          label: 'Qualified',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'MODERATE_FIT':
        return {
          label: 'Partial Match',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'LOW_MATCH':
      default:
        return {
          label: 'Low Alignment',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
        };
    }
  };

  const handleDownloadPDF = () => {
    if (results.length === 0) return;
    exportFormattedPDF(jobDescription, results);
  };

  const handleDownloadCSV = () => {
    if (results.length === 0) return;
    exportFormattedCSV(jobDescription, results);
  };

  // Status counts for quick filter tabs
  const statusCounts = {
    ALL: results.length,
    SHORTLISTED: results.filter(r => r.status === 'SHORTLISTED').length,
    INTERVIEW_SCHEDULED: results.filter(r => r.status === 'INTERVIEW_SCHEDULED').length,
    PENDING: results.filter(r => r.status === 'PENDING').length,
    ON_HOLD: results.filter(r => r.status === 'ON_HOLD').length,
    REJECTED: results.filter(r => r.status === 'REJECTED').length,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 transition">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Candidate Evaluation & Screening Matrix ({results.length})
              </h2>
              <p className="text-xs text-slate-500">
                Multi-factor assessment of uploaded resumes matched against job description
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar: Compare, PDF, CSV, HR Export */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedForComparison.length > 0 && (
            <button
              onClick={onOpenComparisonModal}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Selected ({selectedForComparison.length}/3)</span>
            </button>
          )}

          {/* Quick PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={results.length === 0}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:border-rose-200 transition cursor-pointer disabled:opacity-50"
            title="Download formatted PDF report for HR record-keeping"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>Download PDF</span>
          </button>

          {/* Quick CSV Button */}
          <button
            onClick={handleDownloadCSV}
            disabled={results.length === 0}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:border-emerald-200 transition cursor-pointer disabled:opacity-50"
            title="Download formatted CSV report for ATS/Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download CSV</span>
          </button>

          {/* HR Export Modal Trigger */}
          {onOpenHRExport && (
            <button
              onClick={onOpenHRExport}
              disabled={results.length === 0}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-blue-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              title="Open full HR export and compliance record options"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>HR Audit Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Search Bar: Filter by Name, Status, or Keyword */}
      <div className="mt-5 space-y-3.5">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-blue-600" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates by name (e.g. Sophia), status (e.g. shortlisted), or keyword (e.g. Python, Docker, Master's)..."
            className="w-full text-xs sm:text-sm bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-28 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition shadow-2xs"
          />
          <div className="absolute right-3 flex items-center space-x-2">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
              {filtered.length} of {results.length}
            </span>
          </div>
        </div>

        {/* Quick Filter Bar: Status Pills & Secondary Dropdowns */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Quick Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Status:
            </span>
            {[
              { label: 'All', value: 'ALL', count: statusCounts.ALL },
              { label: 'Shortlisted', value: 'SHORTLISTED', count: statusCounts.SHORTLISTED },
              { label: 'Interview', value: 'INTERVIEW_SCHEDULED', count: statusCounts.INTERVIEW_SCHEDULED },
              { label: 'Pending', value: 'PENDING', count: statusCounts.PENDING },
              { label: 'On Hold', value: 'ON_HOLD', count: statusCounts.ON_HOLD },
              { label: 'Rejected', value: 'REJECTED', count: statusCounts.REJECTED },
            ].map(tab => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  statusFilter === tab.value
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'
                }`}
              >
                {tab.label} <span className="opacity-70 text-[10px]">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Secondary Controls: Qualification Tier & Sort */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">All Qualification Levels</option>
                <option value="TOP_MATCH">Strong Match (85%+)</option>
                <option value="STRONG_FIT">Qualified (70-84%)</option>
                <option value="MODERATE_FIT">Partial Match (55-69%)</option>
                <option value="LOW_MATCH">Low Alignment (&lt;55%)</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
              >
                <option value="overall">Highest Match Score</option>
                <option value="nlp">NLP TF-IDF Cosine Score</option>
                <option value="skills">Skills Match Score</option>
                <option value="experience">Experience (Years)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Evaluation Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((cand) => {
          const isSelected = selectedForComparison.includes(cand.candidateId);
          const tierInfo = getTierDisplay(cand.tier);

          return (
            <div
              key={cand.id}
              className={`bg-white rounded-2xl border p-5 transition flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-400 shadow-md ring-2 ring-blue-500/20 bg-blue-50/10'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                      {cand.candidateName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => onSelectCandidate(cand)}
                          className="font-bold text-slate-900 hover:text-blue-600 text-sm text-left transition cursor-pointer"
                        >
                          {cand.candidateName}
                        </button>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${tierInfo.badgeClass}`}>
                          {tierInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cand.currentRole} • {cand.experienceYears}y exp • {cand.education}
                      </p>
                    </div>
                  </div>

                  {/* Overall Fit Score Circle */}
                  <div className="text-right shrink-0">
                    <span className={`text-xl font-black ${
                      cand.overallScore >= 85
                        ? 'text-emerald-600'
                        : cand.overallScore >= 70
                        ? 'text-blue-600'
                        : cand.overallScore >= 55
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}>
                      {cand.overallScore}%
                    </span>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Fit Score</span>
                  </div>
                </div>

                {/* Score Breakdown Pills */}
                <div className="mt-3.5 grid grid-cols-4 gap-2 text-center text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Skills</span>
                    <strong className="text-slate-800">{cand.skillsScore}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Experience</span>
                    <strong className="text-slate-800">{cand.experienceScore}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">NLP Vector</span>
                    <strong className="text-blue-600">{cand.nlpCosineScore}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Degree</span>
                    <strong className="text-slate-800">{cand.educationScore}%</strong>
                  </div>
                </div>

                {/* Skill Match Breakdown */}
                <div className="mt-3.5 space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Matched Skills ({cand.matchedSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cand.matchedSkills.length > 0 ? (
                        cand.matchedSkills.slice(0, 5).map(skill => (
                          <span
                            key={skill}
                            className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            ✓ {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No direct keyword overlap</span>
                      )}
                      {cand.matchedSkills.length > 5 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{cand.matchedSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {cand.missingRequiredSkills.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Missing Requirements ({cand.missingRequiredSkills.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {cand.missingRequiredSkills.slice(0, 4).map(skill => (
                          <span
                            key={skill}
                            className="bg-rose-50 text-rose-700 border border-rose-200/60 text-[10px] font-medium px-2 py-0.5 rounded-md"
                          >
                            ✕ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Strength snippet */}
                {cand.strengths.length > 0 && (
                  <p className="mt-3 text-[11px] text-slate-600 line-clamp-2 bg-slate-50/60 p-2 rounded-lg border border-slate-100">
                    <strong className="text-slate-800">Highlight:</strong> {cand.strengths[0]}
                  </p>
                )}
              </div>

              {/* Card Footer: Pipeline & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleCompare(cand.candidateId)}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-medium">Compare</span>
                  </label>

                  <select
                    value={cand.status}
                    onChange={(e) => onUpdateStatus(cand.candidateId, e.target.value as CandidateStatus)}
                    className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="SHORTLISTED">Shortlist</option>
                    <option value="INTERVIEW_SCHEDULED">Interview</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="REJECTED">Reject</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onSelectCandidate(cand)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Dossier</span>
                  </button>

                  {cand.status !== 'SHORTLISTED' && (
                    <button
                      onClick={() => onUpdateStatus(cand.candidateId, 'SHORTLISTED')}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                      title="Shortlist"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  )}

                  {cand.status !== 'REJECTED' && (
                    <button
                      onClick={() => onUpdateStatus(cand.candidateId, 'REJECTED')}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Reject"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-xl mt-4 border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">
            {searchQuery
              ? `No candidates match "${searchQuery}" across names, statuses, or keywords.`
              : 'No candidates match the selected filters.'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try searching by candidate name, current status (e.g. "shortlisted", "interview"), or tech skill.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setTierFilter('ALL'); setStatusFilter('ALL'); }}
            className="text-xs text-blue-600 font-bold hover:underline mt-3 cursor-pointer"
          >
            Clear Search & Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
