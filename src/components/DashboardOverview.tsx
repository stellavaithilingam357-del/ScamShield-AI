import React, { useEffect, useState } from 'react';
import { 
  Activity, ShieldAlert, ShieldCheck, AlertTriangle, 
  FileSearch, ArrowUpRight, Clock, Plus, RefreshCw, 
  TrendingUp, BarChart3, CheckCircle2, ChevronRight
} from 'lucide-react';
import { AnalyticsData, AnalysisResult } from '../types';

interface DashboardOverviewProps {
  onAnalyzeNewJob: () => void;
  onViewAnalysis: (result: AnalysisResult) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onAnalyzeNewJob,
  onViewAnalysis,
  onNavigateToTab,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentItems, setRecentItems] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsResp, historyResp] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/history?limit=5')
      ]);

      if (analyticsResp.ok) {
        const aData = await analyticsResp.json();
        setAnalytics(aData);
      }
      if (historyResp.ok) {
        const hData = await historyResp.json();
        setRecentItems(hData.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !analytics) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading Security Operations Center overview...</p>
      </div>
    );
  }

  const total = analytics?.totalAnalyses || 0;
  const high = analytics?.riskDistribution.high || 0;
  const medium = analytics?.riskDistribution.medium || 0;
  const low = analytics?.riskDistribution.low || 0;
  const avg = analytics?.averageRiskScore || 0;

  const highPct = total > 0 ? Math.round((high / total) * 100) : 0;
  const medPct = total > 0 ? Math.round((medium / total) * 100) : 0;
  const lowPct = total > 0 ? Math.round((low / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Security Operations Overview</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time threat intelligence and fraud indicators computed from saved job audits.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onAnalyzeNewJob}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/25 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Analyze New Job</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Total Inspected</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Historical audits</span>
            <span className="text-blue-400 font-mono font-medium">Avg Score: {avg}/100</span>
          </div>
        </div>

        {/* High Risk Scams */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-red-400 text-xs font-medium mb-1">
            <span>High Risk Scams</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 font-mono mt-1">{high}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{highPct}% of audits</span>
            <span className="text-red-400 font-medium">Critical Actions</span>
          </div>
        </div>

        {/* Medium Risk Cases */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-amber-400 text-xs font-medium mb-1">
            <span>Medium / Suspicious</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">{medium}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{medPct}% of audits</span>
            <span className="text-amber-400 font-medium">Caution Urged</span>
          </div>
        </div>

        {/* Low Risk Safe */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-medium mb-1">
            <span>Low Risk (Benign)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">{low}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{lowPct}% of audits</span>
            <span className="text-emerald-400 font-medium">Standard Diligence</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Risk Distribution & Common Warning Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Risk Distribution Ratio</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{total} total</span>
          </div>

          {/* Progress Stack */}
          <div className="h-5 w-full rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
            <div style={{ width: `${highPct}%` }} className="bg-red-500 h-full" title={`High: ${highPct}%`} />
            <div style={{ width: `${medPct}%` }} className="bg-amber-500 h-full" title={`Med: ${medPct}%`} />
            <div style={{ width: `${lowPct}%` }} className="bg-emerald-500 h-full" title={`Low: ${lowPct}%`} />
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-slate-200">High Risk Threat</span>
              </div>
              <span className="font-mono font-bold text-red-400">{high} ({highPct}%)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-200">Medium Risk Suspicious</span>
              </div>
              <span className="font-mono font-bold text-amber-400">{medium} ({medPct}%)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-200">Low Risk Legitimate</span>
              </div>
              <span className="font-mono font-bold text-emerald-400">{low} ({lowPct}%)</span>
            </div>
          </div>
        </div>

        {/* Common Warning Indicators */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Common Fraud Warning Indicators</span>
            </h3>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>View Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(!analytics?.topIndicators || analytics.topIndicators.length === 0) ? (
              <div className="text-xs text-slate-500 py-6 text-center italic">
                No indicators logged yet.
              </div>
            ) : (
              analytics.topIndicators.slice(0, 4).map(ind => {
                const maxCount = Math.max(...analytics.topIndicators.map(t => t.count), 1);
                const barPercent = Math.round((ind.count / maxCount) * 100);

                return (
                  <div key={ind.id} className="text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-medium text-slate-200">{ind.name}</span>
                      <span className="font-mono text-slate-400">{ind.count} matches</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${barPercent}%` }}
                        className={`h-full rounded-full ${
                          ind.severity === 'CRITICAL' ? 'bg-red-500' :
                          ind.severity === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Analyses */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Recent Job Risk Analyses</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Audit log of latest message assessments.</p>
          </div>

          <button
            onClick={() => onNavigateToTab('history')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            <span>View Full History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 rounded-xl bg-slate-950 border border-slate-800">
            No analysis history recorded. Click "Analyze New Job" to begin.
          </div>
        ) : (
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            {recentItems.slice(0, 4).map(item => (
              <div
                key={item.id}
                onClick={() => onViewAnalysis(item)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900 transition-colors cursor-pointer text-xs"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1">
                    <span className="font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="uppercase font-mono">{item.formatType}</span>
                    {item.verificationReport?.companyName && (
                      <>
                        <span>•</span>
                        <span className="text-slate-300 font-semibold">{item.verificationReport.companyName}</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-200 line-clamp-1 font-medium leading-relaxed">
                    {item.inputTextExcerpt}
                  </p>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                    item.riskCategory === 'High Risk' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    item.riskCategory === 'Medium Risk' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {item.riskCategory} ({item.riskScore})
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
