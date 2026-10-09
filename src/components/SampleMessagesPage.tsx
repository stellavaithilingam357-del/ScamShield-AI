import React, { useState } from 'react';
import { 
  Sparkles, AlertTriangle, CheckCircle2, ShieldAlert, 
  ArrowRight, Eye, X, Mail, MessageSquare, Briefcase, FileText
} from 'lucide-react';
import { SAMPLE_CASES, SampleCase } from '../data/samples';

interface SampleMessagesPageProps {
  onAnalyzeSample: (sample: SampleCase) => void;
}

export const SampleMessagesPage: React.FC<SampleMessagesPageProps> = ({ onAnalyzeSample }) => {
  const [previewSample, setPreviewSample] = useState<SampleCase | null>(null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-blue-400" />
          <span>Synthetic Sample Demo Centre</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Pre-configured synthetic job messages modeling both advanced scam playbooks and legitimate corporate recruitments. Test the dual-engine pipeline with one click.
        </p>
      </div>

      {/* Demo Notice */}
      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center space-x-2">
        <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span>
          <strong>Synthetic Demo Data:</strong> These cases are synthetic simulations generated to safely demonstrate indicators without exposing real victims' personal information.
        </span>
      </div>

      {/* Grid of Sample Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SAMPLE_CASES.map(sample => {
          const isHigh = sample.expectedRisk === 'High Risk';
          const isMed = sample.expectedRisk === 'Medium Risk';
          const isLow = sample.expectedRisk === 'Low Risk';

          return (
            <div
              key={sample.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    isHigh ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    isMed ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {sample.expectedRisk}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase">{sample.formatType}</span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{sample.title}</h3>
                <div className="text-[11px] text-blue-400 font-medium mb-2">{sample.category}</div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4 font-sans bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  {sample.text}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewSample(sample)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => onAnalyzeSample(sample)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <span>Analyze Sample</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-xs font-bold text-white">{previewSample.title}</span>
                <span className="text-[11px] text-slate-400 block">{previewSample.category}</span>
              </div>
              <button
                onClick={() => setPreviewSample(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Message Content:</div>
                <div className="p-4 rounded-xl bg-slate-950 text-slate-200 whitespace-pre-wrap font-sans leading-relaxed border border-slate-800">
                  {previewSample.text}
                </div>
              </div>

              {previewSample.verificationData && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                  <div className="font-semibold text-slate-300">Simulated Recruiter Metadata:</div>
                  <div className="text-slate-400">Company: <span className="text-slate-200">{previewSample.verificationData.companyName}</span></div>
                  <div className="text-slate-400">Website: <span className="text-slate-200">{previewSample.verificationData.officialWebsite}</span></div>
                  <div className="text-slate-400">Email: <span className="text-slate-200">{previewSample.verificationData.recruiterEmail}</span></div>
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setPreviewSample(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const sample = previewSample;
                    setPreviewSample(null);
                    onAnalyzeSample(sample);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center space-x-1"
                >
                  <span>Analyze This Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
