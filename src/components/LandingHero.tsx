import React from 'react';
import { Shield, Sparkles, FileSearch, CheckCircle, AlertTriangle, Cpu, ArrowRight } from 'lucide-react';
import { SAMPLE_CASES, SampleCase } from '../data/samples';

interface LandingHeroProps {
  onAnalyzeClick: () => void;
  onSelectSample: (sample: SampleCase) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onAnalyzeClick, onSelectSample }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80 pt-10 pb-12 sm:pt-16 sm:pb-20">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[450px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cybersecurity Intelligence & Explainable AI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Explainable AI-Based <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
              Job Scam Detection & Risk Assessment
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
            Protect yourself against employment advance-fee scams, counterfeit checks, phishing traps, and fraudulent recruiters. 
            ScamShield AI uses a dual-engine architecture combining statistical <strong>TF-IDF machine learning</strong> with 
            deterministic <strong>security heuristics</strong> to provide transparent, evidence-backed risk assessments.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onAnalyzeClick}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <FileSearch className="w-4 h-4" />
              <span>Analyze Job Message</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectSample(SAMPLE_CASES[0])}
              className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center space-x-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Load Sample Advance-Fee Scam</span>
            </button>
          </div>

          {/* Quick Scenario Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Scenarios:</span>
            <button
              onClick={() => onSelectSample(SAMPLE_CASES[1])}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            >
              Fake Check Mule
            </button>
            <button
              onClick={() => onSelectSample(SAMPLE_CASES[2])}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            >
              Credential Phishing
            </button>
            <button
              onClick={() => onSelectSample(SAMPLE_CASES[5])}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            >
              Legitimate Stripe Offer
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Dual-Engine Transparency</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Separates statistical machine-learning predictions from deterministic rule triggers. View exact token weights alongside pattern matches with zero black-box obscurity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <FileSearch className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Exact Phrase Evidence Highlighting</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Interactive textual highlighting identifies specific suspicious substrings—such as Zelle deposits, WhatsApp redirection, or PIN requests—with contextual explanations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Safe Verification Checklist</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Analyzes recruiter domain alignment against official company websites without fabricating verification badges. Provides safe, actionable manual cross-checking guidance.
            </p>
          </div>
        </div>

        {/* Methodology notice bar */}
        <div className="mt-8 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Methodology Notice: </span>
          Risk scores (0–100) are probabilistic estimates based on trained patterns and heuristics, not definitive legal proof that an employer is fraudulent.
        </div>
      </div>
    </div>
  );
};
