import React, { useState } from 'react';
import { ScreeningWeights } from '../types';
import { Play, Sliders, CheckCircle2, Cpu, Zap, RefreshCw, Sparkles } from 'lucide-react';

interface ScreeningControlsProps {
  onRunScreening: () => void;
  isScreening: boolean;
  progress: number;
  currentScreeningName: string;
  candidateCount: number;
  weights: ScreeningWeights;
  onWeightsChange: (updated: ScreeningWeights) => void;
  hasScreened: boolean;
}

export const ScreeningControls: React.FC<ScreeningControlsProps> = ({
  onRunScreening,
  isScreening,
  progress,
  currentScreeningName,
  candidateCount,
  weights,
  onWeightsChange,
  hasScreened
}) => {
  const [showWeightSliders, setShowWeightSliders] = useState(false);

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl shadow-xl p-6 text-white border border-blue-700/30">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Engine Details & Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Dual-Engine Evaluation</span>
            </span>
            <span className="text-xs text-slate-400">
              TF-IDF Cosine Similarity + Gemini 3.8 Flash AI
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Automated Resume Screening & Ranking Engine
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Extracts candidate skills, compares qualifications against requisition requirements, calculates multi-factor alignment, and sorts candidates into actionable recruiter tiers.
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Custom Weight Sliders Toggle */}
          <button
            type="button"
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              showWeightSliders
                ? 'bg-blue-600/30 border-blue-400 text-blue-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Scoring Weights</span>
          </button>

          {/* Screening Trigger Button */}
          <button
            type="button"
            disabled={isScreening || candidateCount === 0}
            onClick={onRunScreening}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition transform active:scale-95 cursor-pointer"
          >
            {isScreening ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Screening ({Math.round(progress)}%)...</span>
              </>
            ) : hasScreened ? (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Re-Run AI Screening ({candidateCount})</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run AI Resume Screening ({candidateCount})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar when screening */}
      {isScreening && (
        <div className="mt-5 pt-4 border-t border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span className="font-semibold flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Analyzing: {currentScreeningName || 'Processing candidates...'}</span>
            </span>
            <span className="font-mono text-blue-300">{Math.round(progress)}% Completed</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Configurable Weight Sliders Panel */}
      {showWeightSliders && (
        <div className="mt-5 pt-5 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-800/40 p-4 rounded-xl">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold">Technical Skills Match</span>
              <span className="font-bold text-blue-400">{Math.round(weights.skillsWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.7"
              step="0.05"
              value={weights.skillsWeight}
              onChange={(e) => onWeightsChange({ ...weights, skillsWeight: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold">Work Experience Depth</span>
              <span className="font-bold text-blue-400">{Math.round(weights.experienceWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.6"
              step="0.05"
              value={weights.experienceWeight}
              onChange={(e) => onWeightsChange({ ...weights, experienceWeight: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold">Education & Degree</span>
              <span className="font-bold text-blue-400">{Math.round(weights.educationWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.4"
              step="0.05"
              value={weights.educationWeight}
              onChange={(e) => onWeightsChange({ ...weights, educationWeight: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold">NLP TF-IDF Vector</span>
              <span className="font-bold text-blue-400">{Math.round(weights.semanticWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.4"
              step="0.05"
              value={weights.semanticWeight}
              onChange={(e) => onWeightsChange({ ...weights, semanticWeight: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
