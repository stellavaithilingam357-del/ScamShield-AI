import React, { useEffect, useState } from 'react';
import { 
  BarChart3, TrendingUp, AlertTriangle, ShieldCheck, 
  ShieldAlert, Activity, RefreshCw, Clock, ArrowUpRight, Calendar, Layers
} from 'lucide-react';
import { AnalyticsData, AnalysisResult } from '../types';

interface AnalyticsDashboardProps {
  onSelectResultById?: (id: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onSelectResultById }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [historyItems, setHistoryItems] = useState<AnalysisResult[]>([]);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsResp, historyResp] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/history')
      ]);

      if (!analyticsResp.ok) {
        throw new Error('Failed to retrieve computed analytics.');
      }
      const aData: AnalyticsData = await analyticsResp.json();
      setAnalytics(aData);

      if (historyResp.ok) {
        const hData = await historyResp.json();
        setHistoryItems(hData.items || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !analytics) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Computing real-time fraud risk metrics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-12 text-center text-red-400">
        <p className="text-sm mb-4">{error || 'Could not load analytics.'}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Filter history by date range
  const now = Date.now();
  const filteredHistory = historyItems.filter(item => {
    if (dateRange === 'all') return true;
    const time = new Date(item.timestamp).getTime();
    const diffDays = (now - time) / (1000 * 3600 * 24);
    if (dateRange === '7days') return diffDays <= 7;
    if (dateRange === '30days') return diffDays <= 30;
    if (dateRange === '90days') return diffDays <= 90;
    return true;
  });

  const totalFiltered = filteredHistory.length;
  const highCount = filteredHistory.filter(i => i.riskCategory === 'High Risk').length;
  const medCount = filteredHistory.filter(i => i.riskCategory === 'Medium Risk').length;
  const lowCount = filteredHistory.filter(i => i.riskCategory === 'Low Risk').length;

  const highPercent = totalFiltered > 0 ? Math.round((highCount / totalFiltered) * 100) : 0;
  const medPercent = totalFiltered > 0 ? Math.round((medCount / totalFiltered) * 100) : 0;
  const lowPercent = totalFiltered > 0 ? Math.round((lowCount / totalFiltered) * 100) : 0;

  const avgScore = totalFiltered > 0
    ? Math.round(filteredHistory.reduce((acc, curr) => acc + curr.riskScore, 0) / totalFiltered)
    : 0;

  // Breakdown by message format type
  const formatCounts: Record<string, number> = {
    email: 0,
    sms_whatsapp: 0,
    job_post: 0,
    offer_letter: 0,
    auto: 0,
  };
  filteredHistory.forEach(item => {
    const fmt = item.formatType || 'auto';
    formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>Risk Intelligence & Threat Analytics</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Empirical visualizations and frequency distributions computed from stored analysis data.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            {[
              { id: '7days', label: '7D' },
              { id: '30days', label: '30D' },
              { id: '90days', label: '90D' },
              { id: 'all', label: 'All' },
            ].map(range => (
              <button
                key={range.id}
                onClick={() => setDateRange(range.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  dateRange === range.id
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Analyses in Window</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">{totalFiltered}</div>
          <p className="text-[11px] text-slate-400 mt-1">Total messages evaluated</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-red-400 text-xs font-medium mb-1">
            <span>High Risk Threats</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 font-mono mt-1">{highCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">{highPercent}% of window total</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-amber-400 text-xs font-medium mb-1">
            <span>Medium / Suspicious</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">{medCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">{medPercent}% of window total</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-medium mb-1">
            <span>Average Risk Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-blue-400 font-mono mt-1">{avgScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
          <p className="text-[11px] text-slate-400 mt-1">Mean heuristic threat score</p>
        </div>
      </div>

      {/* Middle Row: Risk Distribution & Message Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Ratio */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Risk Distribution Breakdown ({dateRange.toUpperCase()})</span>
          </h3>

          <div className="h-6 w-full rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
            <div style={{ width: `${highPercent}%` }} className="bg-red-500 h-full transition-all duration-500" title={`High: ${highPercent}%`} />
            <div style={{ width: `${medPercent}%` }} className="bg-amber-500 h-full transition-all duration-500" title={`Med: ${medPercent}%`} />
            <div style={{ width: `${lowPercent}%` }} className="bg-emerald-500 h-full transition-all duration-500" title={`Low: ${lowPercent}%`} />
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs pt-2">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
              <div>
                <div className="text-slate-200 font-semibold">High Risk ({highPercent}%)</div>
                <div className="text-[11px] text-slate-400">{highCount} cases</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
              <div>
                <div className="text-slate-200 font-semibold">Medium Risk ({medPercent}%)</div>
                <div className="text-[11px] text-slate-400">{medCount} cases</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
              <div>
                <div className="text-slate-200 font-semibold">Low Risk ({lowPercent}%)</div>
                <div className="text-[11px] text-slate-400">{lowCount} cases</div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Type Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Breakdown by Message Format</span>
          </h3>

          <div className="space-y-2 text-xs">
            {[
              { label: 'Recruitment Email', count: formatCounts['email'] || 0 },
              { label: 'SMS / WhatsApp', count: formatCounts['sms_whatsapp'] || 0 },
              { label: 'Job Board Post', count: formatCounts['job_post'] || 0 },
              { label: 'Offer Letter', count: formatCounts['offer_letter'] || 0 },
            ].map((fItem, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">{fItem.label}</span>
                <span className="font-mono font-bold text-white">{fItem.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Frequent Warning Indicators */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Most Frequent Warning Indicators</span>
        </h3>

        {(!analytics.topIndicators || analytics.topIndicators.length === 0) ? (
          <div className="text-xs text-slate-500 py-6 text-center italic">
            No indicators recorded in current storage.
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.topIndicators.map(ind => {
              const maxCount = Math.max(...analytics.topIndicators.map(t => t.count), 1);
              const barPercent = Math.round((ind.count / maxCount) * 100);

              return (
                <div key={ind.id} className="text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-slate-200">{ind.name}</span>
                    <span className="font-mono text-slate-400">{ind.count} occurrences</span>
                  </div>
                  <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${barPercent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        ind.severity === 'CRITICAL' ? 'bg-red-500' :
                        ind.severity === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
