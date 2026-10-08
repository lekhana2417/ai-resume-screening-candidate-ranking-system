import React from 'react';
import { CandidateAnalysisResult, JobDescription } from '../types';
import {
  BarChart3,
  PieChart,
  Users,
  Target,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

interface AnalyticsDashboardProps {
  results: CandidateAnalysisResult[];
  jobDescription: JobDescription;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  results,
  jobDescription
}) => {
  if (results.length === 0) return null;

  const total = results.length;
  const avgScore = Math.round(results.reduce((acc, c) => acc + c.overallScore, 0) / total);
  const meetingExpCount = results.filter(
    c => c.experienceYears >= (jobDescription.minExperienceYears || 0)
  ).length;

  // Tiers count
  const topMatchCount = results.filter(c => c.tier === 'TOP_MATCH').length;
  const strongFitCount = results.filter(c => c.tier === 'STRONG_FIT').length;
  const moderateCount = results.filter(c => c.tier === 'MODERATE_FIT').length;
  const lowMatchCount = results.filter(c => c.tier === 'LOW_MATCH').length;

  // Pipeline count
  const shortlistedCount = results.filter(c => c.status === 'SHORTLISTED').length;
  const interviewCount = results.filter(c => c.status === 'INTERVIEW_SCHEDULED').length;
  const rejectedCount = results.filter(c => c.status === 'REJECTED').length;
  const pendingCount = results.filter(c => c.status === 'PENDING').length;

  // Skill coverage calculation
  const skillCoverage = (jobDescription.requiredSkills || []).map(skill => {
    const matchingCandidates = results.filter(c =>
      c.matchedSkills.some(s => s.toLowerCase() === skill.toLowerCase())
    ).length;
    const percentage = Math.round((matchingCandidates / total) * 100);
    return {
      skill,
      matchingCount: matchingCandidates,
      percentage
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 transition">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Talent Pool Analytics & Keyword Alignment</h2>
            <p className="text-xs text-slate-500">Aggregate insights on applicant qualifications, skill penetration, and pipeline status</p>
          </div>
        </div>
      </div>

      {/* Quick Metric Cards */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Average Match Score</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{avgScore}%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Across {total} screened resumes</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Interview Ready</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {topMatchCount + strongFitCount} <span className="text-xs font-normal text-slate-500">({Math.round(((topMatchCount + strongFitCount) / total) * 100)}%)</span>
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Top Matches & Strong Contenders</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>JD Required Experience</span>
            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {jobDescription.minExperienceYears > 0 ? `${jobDescription.minExperienceYears}+` : '0+'} <span className="text-xs font-normal text-slate-500">yrs</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Updated from given JD • {meetingExpCount} of {total} candidates qualify
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Active Pipeline</span>
            <Target className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">
            {shortlistedCount + interviewCount} <span className="text-xs font-normal text-slate-500">candidates</span>
          </div>
          <span className="text-[11px] text-purple-700 mt-1 block">Shortlisted or Interview scheduled</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Required Skills Penetration in Applicant Pool */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Required Skills Penetration (% of applicants)
            </h3>
            <span className="text-[11px] text-slate-400">Identifies talent bottlenecks</span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {skillCoverage.map(({ skill, matchingCount, percentage }) => (
              <div key={skill} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{skill}</span>
                  <span className="font-mono text-slate-600 text-[11px]">
                    {matchingCount} of {total} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 75
                        ? 'bg-emerald-500'
                        : percentage >= 50
                        ? 'bg-blue-500'
                        : percentage >= 25
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Tier Distribution */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Candidate Qualification Funnel
              </h3>
              <span className="text-[11px] text-slate-400">Score distribution</span>
            </div>

            <div className="space-y-3">
              {/* Top Match */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-emerald-200">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Top Match (85%+)</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {topMatchCount} candidates ({Math.round((topMatchCount / total) * 100)}%)
                </span>
              </div>

              {/* Strong Fit */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Strong Contenders (70-84%)</span>
                </div>
                <span className="text-xs font-mono font-bold text-blue-700">
                  {strongFitCount} candidates ({Math.round((strongFitCount / total) * 100)}%)
                </span>
              </div>

              {/* Moderate Fit */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Moderate Fit (55-69%)</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-700">
                  {moderateCount} candidates ({Math.round((moderateCount / total) * 100)}%)
                </span>
              </div>

              {/* Low Match */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-rose-200">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Low Alignment (&lt;55%)</span>
                </div>
                <span className="text-xs font-mono font-bold text-rose-700">
                  {lowMatchCount} candidates ({Math.round((lowMatchCount / total) * 100)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Pipeline: {pendingCount} Pending, {shortlistedCount} Shortlisted, {rejectedCount} Rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
