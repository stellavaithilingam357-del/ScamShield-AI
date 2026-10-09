import React from 'react';
import { X, Printer, Download, Shield, ShieldAlert, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ReportModalProps {
  result: AnalysisResult;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ result, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const isHighRisk = result.riskCategory === 'High Risk';
  const isMediumRisk = result.riskCategory === 'Medium Risk';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative text-slate-200">
        {/* Sticky Header with Actions */}
        <div className="sticky top-0 z-10 bg-slate-950/95 border-b border-slate-800 px-6 py-4 flex items-center justify-between backdrop-blur">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-white text-sm sm:text-base">ScamShield AI Security Assessment Report</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div id="printable-report" className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
          {/* Metadata Header */}
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xl font-bold text-white">Employment Fraud Risk Evaluation</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Audit ID: <span className="font-mono text-slate-300">{result.id}</span>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>Date Generated: <span className="text-slate-300">{new Date(result.timestamp).toUTCString()}</span></div>
              <div>Platform: <span className="text-slate-300">ScamShield AI Dual-Engine v1.0</span></div>
            </div>
          </div>

          {/* Risk Overview Banner */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Assessed Threat Level</div>
              <div className="text-2xl font-extrabold text-white mt-1 flex items-center space-x-2">
                <span>{result.riskCategory}</span>
                <span className="text-sm font-normal text-slate-400">({result.riskScore}/100)</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Confidence Estimate: {result.confidenceEstimate}% (Distance metric)
              </div>
            </div>

            <div className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase border ${
              isHighRisk ? 'bg-red-500/20 text-red-300 border-red-500/30' :
              isMediumRisk ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              {result.riskCategory}
            </div>
          </div>

          {/* Submitted Message Excerpt */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Analyzed Message Text / Excerpt
            </h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
              {result.fullText}
            </div>
          </div>

          {/* Triggered Indicator Evidence */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Triggered Indicators & Text Evidence ({result.detectedIndicators.length})
            </h4>
            {result.detectedIndicators.length === 0 ? (
              <div className="p-3 rounded-lg bg-slate-950 text-slate-400 text-xs">
                No deterministic fraud indicators detected.
              </div>
            ) : (
              <div className="space-y-2">
                {result.detectedIndicators.map(ind => (
                  <div key={ind.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">{ind.name}</span>
                      <span className="font-mono text-amber-400 font-bold">{ind.severity} (+{ind.points} pts)</span>
                    </div>
                    <p className="text-slate-300 mb-2">{ind.explanation}</p>
                    <div className="flex flex-wrap gap-1 text-[11px] font-mono">
                      <span className="text-slate-500">Matching quotes:</span>
                      {ind.evidencePhrases.map((p, idx) => (
                        <span key={idx} className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded">
                          "{p}"
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Protective Actions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Safety & Remediation Steps
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
              {result.recommendedActions.map((act, idx) => (
                <li key={idx} className="leading-relaxed">{act}</li>
              ))}
            </ul>
          </div>

          {/* Legal Disclaimer */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            <strong>Notice:</strong> This security report is generated programmatically by ScamShield AI for informational risk assessment purposes. Risk scores represent heuristic estimations based on synthetically trained classifiers and regex patterns, not legally binding proof of fraudulent intent.
          </div>
        </div>
      </div>
    </div>
  );
};
