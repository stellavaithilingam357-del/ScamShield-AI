import React, { useEffect, useState } from 'react';
import { 
  FileText, Download, Printer, Eye, Calendar, 
  ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight, RefreshCw
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface ReportsPageProps {
  onOpenReportModal: (result: AnalysisResult) => void;
  onAnalyzeNew: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onOpenReportModal, onAnalyzeNew }) => {
  const [reports, setReports] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/history');
      if (resp.ok) {
        const data = await resp.json();
        setReports(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownloadCsv = () => {
    if (reports.length === 0) return;
    const headers = ["ID", "Timestamp", "Risk Score", "Risk Category", "Confidence", "Rule Score", "ML Score", "Indicators Count", "Excerpt"];
    const rows = reports.map(item => [
      item.id,
      item.timestamp,
      item.riskScore,
      item.riskCategory,
      `${item.confidenceEstimate}%`,
      item.ruleScore,
      item.mlScore,
      item.detectedIndicators.length,
      `"${item.inputTextExcerpt.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `scamshield_reports_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Title & Global Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>Forensic Assessment Reports & Exports</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Downloadable executive summaries and formal printable security briefs for documented risk management or law enforcement reporting.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {reports.length > 0 && (
            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Export All as CSV</span>
            </button>
          )}

          <button
            onClick={fetchReports}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            title="Refresh Reports"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Compiling report index...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No Assessment Reports Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto mb-4">
            Run your first job text or email analysis to generate formal downloadable security reports.
          </p>
          <button
            onClick={onAnalyzeNew}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center space-x-1.5"
          >
            <span>Analyze Job Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(report => {
            const isHigh = report.riskCategory === 'High Risk';
            const isMed = report.riskCategory === 'Medium Risk';

            return (
              <div
                key={report.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] text-slate-400">
                      Audit #{report.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isHigh ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      isMed ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {report.riskCategory} ({report.riskScore}/100)
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center space-x-2 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(report.timestamp).toLocaleString()}</span>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                    {report.inputTextExcerpt}
                  </p>

                  <div className="text-[11px] text-slate-400">
                    Indicators Triggered: <strong className="text-slate-200">{report.detectedIndicators.length}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-3">
                  <span className="text-[11px] text-slate-400 font-mono">Format: {report.formatType}</span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onOpenReportModal(report)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View & Print</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
