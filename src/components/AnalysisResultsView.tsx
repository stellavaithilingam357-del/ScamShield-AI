import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Cpu, CheckCircle2, 
  ExternalLink, Download, Printer, ArrowLeft, HelpCircle, 
  Sparkles, Info, Lock, Building2, ChevronRight, FileCode, Check
} from 'lucide-react';
import { AnalysisResult, HighlightSpan, RuleIndicatorMatch } from '../types';

interface AnalysisResultsViewProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
  onOpenReportModal: () => void;
}

export const AnalysisResultsView: React.FC<AnalysisResultsViewProps> = ({
  result,
  onNewAnalysis,
  onOpenReportModal,
}) => {
  const [selectedSpan, setSelectedSpan] = useState<HighlightSpan | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'text' | 'dual_engine' | 'verification' | 'deep_ai'>('overview');
  
  // Deep AI Forensics state (Gemini 3.8 Flash)
  const [deepAiLoading, setDeepAiLoading] = useState(false);
  const [deepAiResponse, setDeepAiResponse] = useState<{
    available: boolean;
    source: string;
    explanation: string;
  } | null>(null);
  const [deepAiError, setDeepAiError] = useState<string | null>(null);

  const isHighRisk = result.riskCategory === 'High Risk';
  const isMediumRisk = result.riskCategory === 'Medium Risk';
  const isLowRisk = result.riskCategory === 'Low Risk';

  // Risk styling helpers
  const getBadgeStyle = () => {
    if (isHighRisk) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (isMediumRisk) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  };

  const getScoreColor = () => {
    if (isHighRisk) return 'text-red-400 stroke-red-500';
    if (isMediumRisk) return 'text-amber-400 stroke-amber-500';
    return 'text-emerald-400 stroke-emerald-500';
  };

  const handleRequestDeepAi = async () => {
    setDeepAiLoading(true);
    setDeepAiError(null);
    try {
      const resp = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: result.fullText,
          riskScore: result.riskScore,
          indicators: result.detectedIndicators,
        }),
      });

      if (!resp.ok) {
        throw new Error('Failed to fetch Deep AI explanation');
      }

      const data = await resp.json();
      setDeepAiResponse(data);
      setActiveTab('deep_ai');
    } catch (err: any) {
      setDeepAiError(err.message || 'Error executing AI forensics query.');
    } finally {
      setDeepAiLoading(false);
    }
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `scamshield_analysis_${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Render text with interactive highlighted spans
  const renderHighlightedText = () => {
    const text = result.fullText;
    const spans = [...result.highlightSpans].sort((a, b) => a.start - b.start);

    if (spans.length === 0) {
      return (
        <div className="p-4 bg-slate-950 rounded-xl text-slate-300 font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed border border-slate-800">
          {text}
        </div>
      );
    }

    const segments: React.ReactNode[] = [];
    let currentIndex = 0;

    spans.forEach((span, index) => {
      // Non-highlighted chunk preceding this span
      if (span.start > currentIndex) {
        segments.push(
          <span key={`text-${currentIndex}`}>
            {text.substring(currentIndex, span.start)}
          </span>
        );
      }

      // Highlighted span
      const isSelected = selectedSpan?.start === span.start && selectedSpan?.end === span.end;
      const highlightColor = span.severity === 'CRITICAL' 
        ? 'bg-red-500/25 text-red-200 border-red-500/50 hover:bg-red-500/40'
        : span.severity === 'HIGH'
        ? 'bg-amber-500/25 text-amber-200 border-amber-500/50 hover:bg-amber-500/40'
        : 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40 hover:bg-yellow-500/35';

      segments.push(
        <mark
          key={`span-${index}`}
          onClick={() => setSelectedSpan(span)}
          className={`cursor-pointer px-1 py-0.5 rounded border text-xs sm:text-sm font-medium transition-all ${highlightColor} ${
            isSelected ? 'ring-2 ring-white shadow-lg' : ''
          }`}
          title={`${span.indicatorName}: ${span.explanation}`}
        >
          {text.substring(span.start, span.end)}
        </mark>
      );

      currentIndex = span.end;
    });

    // Remainder text
    if (currentIndex < text.length) {
      segments.push(
        <span key={`text-tail`}>
          {text.substring(currentIndex)}
        </span>
      );
    }

    return (
      <div className="p-5 bg-slate-950 rounded-xl text-slate-300 font-sans text-xs sm:text-sm whitespace-pre-wrap leading-relaxed border border-slate-800/80">
        {segments}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          onClick={onNewAnalysis}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Analyze Another Job Message</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print Security Report</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleRequestDeepAi}
            disabled={deepAiLoading}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {deepAiLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Forensics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>Deep AI Threat Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Score & Risk Summary Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Radial Gauge */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-800"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={getScoreColor()}
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * result.riskScore) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4xl font-extrabold font-mono tracking-tight ${getScoreColor()}`}>
                {result.riskScore}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">/ 100 Risk</span>
            </div>
          </div>

          <div className="mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getBadgeStyle()}`}>
              {result.riskCategory}
            </span>
          </div>

          <p className="mt-3 text-xs text-slate-400 max-w-xs">
            Confidence estimate: <strong className="text-slate-200">{result.confidenceEstimate}%</strong> (Statistical proximity to decision threshold)
          </p>
        </div>

        {/* Narrative & Dual-Engine Overview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Dual-Engine Evaluation Summary</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {isHighRisk && "High Probability of Employment Fraud Detected"}
              {isMediumRisk && "Irregular Patterns & Unverified Recruitment Outreach"}
              {isLowRisk && "Consistent with Legitimate Professional Recruitment"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {result.explanationSummary}
            </p>
          </div>

          {/* Quick Dual Engine breakdown pills */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Rule Score</span>
              <span className="font-mono font-bold text-slate-200">{result.ruleScore}/100</span>
              <span className="text-[10px] text-slate-400 block">{result.detectedIndicators.length} rules triggered</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">ML Probability</span>
              <span className="font-mono font-bold text-slate-200">{(result.mlProbability * 100).toFixed(1)}%</span>
              <span className="text-[10px] text-slate-400 block">Logistic Regression</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 block">Evidence Spans</span>
              <span className="font-mono font-bold text-blue-400">{result.highlightSpans.length} phrase matches</span>
              <span className="text-[10px] text-slate-400 block">Interactive highlights</span>
            </div>
          </div>

          {/* Non-definitive proof disclaimer */}
          <div className="mt-4 text-[11px] text-slate-400 flex items-start space-x-1.5">
            <Info className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 mt-0.5" />
            <span>
              Disclaimer: This score is a pattern-based heuristic estimate and does not represent absolute legal proof of fraud. Always conduct independent verification.
            </span>
          </div>
        </div>
      </div>

      {/* Tabs for Detailed Navigation */}
      <div className="border-b border-slate-800 flex space-x-4 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Indicators & Evidence ({result.detectedIndicators.length})
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
            activeTab === 'text'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Highlighted Message Text
        </button>

        <button
          onClick={() => setActiveTab('dual_engine')}
          className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
            activeTab === 'dual_engine'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ML vs Rule Engine Transparency
        </button>

        {result.verificationReport && (
          <button
            onClick={() => setActiveTab('verification')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'verification'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Company & Domain Verification
          </button>
        )}

        {deepAiResponse && (
          <button
            onClick={() => setActiveTab('deep_ai')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'deep_ai'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-indigo-400 hover:text-indigo-200'
            }`}
          >
            Deep AI Threat Forensics
          </button>
        )}
      </div>

      {/* TAB 1: Indicators & Evidence */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Detected Warning Indicators */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Detected Fraud Warning Indicators ({result.detectedIndicators.length})</span>
            </h4>

            {result.detectedIndicators.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h5 className="text-sm font-semibold text-white">No Suspicious Indicators Detected</h5>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  The submitted text does not contain requests for advance fees, banking logins, cryptocurrency transfers, or off-platform communication.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.detectedIndicators.map(indicator => (
                  <div
                    key={indicator.id}
                    className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                          indicator.severity === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : indicator.severity === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {indicator.severity} ({indicator.points} pts)
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{indicator.category}</span>
                      </div>

                      <h5 className="text-sm font-bold text-white mb-1.5">{indicator.name}</h5>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {indicator.explanation}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-400 font-medium block mb-1">Evidence in Text:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {indicator.evidencePhrases.map((phrase, pIdx) => (
                          <span
                            key={pIdx}
                            className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800"
                          >
                            "{phrase}"
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Safety Actions */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Recommended Protective Actions</span>
            </h4>
            <div className="space-y-3">
              {result.recommendedActions.map((action, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-mono">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Highlighted Message Text */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Click on any highlighted phrase below to view its specific indicator explanation.</span>
            </div>
            <span className="font-mono text-slate-400">
              {result.highlightSpans.length} phrase matches
            </span>
          </div>

          {/* Selected Span Detail Popover / Card */}
          {selectedSpan && (
            <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/40 shadow-xl flex items-start justify-between space-x-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                    {selectedSpan.severity} Flag
                  </span>
                  <span className="text-xs font-bold text-white">{selectedSpan.indicatorName}</span>
                </div>
                <div className="font-mono text-xs text-amber-300 mb-1">
                  Matched String: "{selectedSpan.phrase}"
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedSpan.explanation}
                </p>
              </div>
              <button
                onClick={() => setSelectedSpan(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {renderHighlightedText()}
        </div>
      )}

      {/* TAB 3: Dual-Engine ML vs Rule Transparency */}
      {activeTab === 'dual_engine' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Machine Learning Pipeline Evidence */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center space-x-2 mb-3">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">Machine Learning Engine (TF-IDF + Logistic Regression)</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Trained on a 110-sample benchmark dataset of legitimate and fraudulent job communications. The model evaluates sublinear term frequencies against learned coefficients.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">Raw Model Probability:</span>
              <span className="font-mono font-bold text-indigo-300">{(result.mlProbability * 100).toFixed(2)}%</span>
            </div>

            <h5 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Influential Feature Tokens</h5>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {result.mlFeatures.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No strong vocabulary weights triggered.</div>
              ) : (
                result.mlFeatures.map((feat, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-slate-200 font-medium">"{feat.token}"</span>
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono text-[11px] ${
                        feat.impact === 'SUSPICIOUS' ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {feat.weight > 0 ? `+${feat.weight}` : feat.weight}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        feat.impact === 'SUSPICIOUS' ? 'bg-red-500/10 text-red-300' : 'bg-emerald-500/10 text-emerald-300'
                      }`}>
                        {feat.impact}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Rule-Based Deterministic Engine */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center space-x-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Rule-Based Heuristic Indicator Engine</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Deterministic regex and pattern matching targeting concrete fraud signatures (e.g. advance payment demands, P2P channels, credential harvesting).
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Rule Indicator Points:</span>
              <span className="font-mono font-bold text-amber-300">{result.ruleScore} / 100</span>
            </div>

            <h5 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Triggered Heuristics</h5>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {result.detectedIndicators.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No deterministic rules triggered.</div>
              ) : (
                result.detectedIndicators.map(rule => (
                  <div
                    key={rule.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200">{rule.name}</span>
                      <span className="font-mono text-amber-400">+{rule.points} pts</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{rule.explanation}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Recruiter & Organization Verification */}
      {activeTab === 'verification' && result.verificationReport && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>Recruiter & Company Identity Verification</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Domain alignment analysis and safe manual verification guidance.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] px-2.5 py-1 rounded-full font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Status: Not Verified (No Live WHOIS)
              </span>
            </div>
          </div>

          {/* Verification checks list */}
          <div className="space-y-3">
            {result.verificationReport.checks.map((check, cIdx) => (
              <div
                key={cIdx}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3 text-xs"
              >
                <div className="mt-0.5">
                  {check.status === 'MATCH' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {check.status === 'DISCREPANCY' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  {check.status === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {check.status === 'UNVERIFIED' && <Info className="w-4 h-4 text-slate-400" />}
                  {check.status === 'INFO' && <Info className="w-4 h-4 text-blue-400" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span className="font-semibold text-slate-200">{check.item}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      check.status === 'MATCH' ? 'bg-emerald-500/20 text-emerald-300' :
                      check.status === 'DISCREPANCY' ? 'bg-red-500/20 text-red-300' :
                      check.status === 'WARNING' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {check.status}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
            <strong>Important Policy:</strong> ScamShield AI never claims a company or recruiter is verified without a cryptographically authenticated registry connection. We strictly avoid fabricating verification badges.
          </div>
        </div>
      )}

      {/* TAB 5: Deep AI Threat Forensics (Gemini 3.8 Flash) */}
      {activeTab === 'deep_ai' && deepAiResponse && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h4 className="text-base font-bold text-white">Deep AI Threat Forensics</h4>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              {deepAiResponse.source}
            </span>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 text-slate-200 font-sans text-xs sm:text-sm whitespace-pre-wrap leading-relaxed border border-slate-800">
            {deepAiResponse.explanation}
          </div>
        </div>
      )}
    </div>
  );
};
