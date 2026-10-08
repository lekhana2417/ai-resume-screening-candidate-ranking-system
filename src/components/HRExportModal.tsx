import React, { useState } from 'react';
import { JobDescription, CandidateAnalysisResult } from '../types';
import { exportFormattedCSV, exportFormattedPDF } from '../utils/reportExport';
import {
  X,
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  Calendar,
  Users
} from 'lucide-react';

interface HRExportModalProps {
  jobDescription: JobDescription;
  results: CandidateAnalysisResult[];
  onClose: () => void;
}

export const HRExportModal: React.FC<HRExportModalProps> = ({
  jobDescription,
  results,
  onClose
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownloadPDF = () => {
    exportFormattedPDF(jobDescription, results);
    setDownloadSuccess('PDF report downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadCSV = () => {
    exportFormattedCSV(jobDescription, results);
    setDownloadSuccess('CSV report downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrint = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print();
      } else {
        handleDownloadPDF();
      }
    } catch {
      handleDownloadPDF();
    }
  };

  const topMatchCount = results.filter(r => r.tier === 'TOP_MATCH').length;
  const strongFitCount = results.filter(r => r.tier === 'STRONG_FIT').length;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Export Candidate Evaluation & Ranking Report
              </h2>
              <p className="text-xs text-slate-500">
                Generate formatted documentation for HR record-keeping, compliance, and hiring manager review
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Overview Card */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-sm">
              {jobDescription.title || 'Target Requisition'}
            </span>
            <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
              {results.length} Candidates Evaluated
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Department</span>
              <strong className="text-slate-800">{jobDescription.department || 'Engineering'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Min Experience</span>
              <strong className="text-slate-800">{jobDescription.minExperienceYears || 0}+ Years</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Highly Qualified</span>
              <strong className="text-emerald-700">{topMatchCount + strongFitCount} Candidates</strong>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Export Options Cards */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option 1: PDF Report */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formal PDF</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Formatted PDF Report</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Executive-ready PDF dossier complete with Requisition Header, Candidate Ranking Matrix, detailed skill gap cards, and HR sign-off line.
              </p>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="mt-4 w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF (.pdf)</span>
            </button>
          </div>

          {/* Option 2: CSV Report */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spreadsheet</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Formatted CSV Export</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Clean spreadsheet compatible with Excel, Google Sheets, and HRIS/ATS systems with requisition metadata and granular candidate scores.
              </p>
            </div>

            <button
              onClick={handleDownloadCSV}
              className="mt-4 w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV (.csv)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Current Screen</span>
          </button>

          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
