import React, { useState, useEffect } from 'react';
import { 
  History, Search, Trash2, Download, Eye, 
  AlertTriangle, ShieldCheck, ShieldAlert, ArrowRight, RefreshCw, X, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import { AnalysisResult, RiskCategory } from '../types';

interface AnalysisHistoryProps {
  onViewDetails: (result: AnalysisResult) => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ onViewDetails }) => {
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Deletion confirmation modal
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/history';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter !== 'all') params.append('riskCategory', categoryFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Failed to load history.');
      const data = await resp.json();
      setItems(data.items || []);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || 'Error fetching analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [categoryFilter]);

  // Date filtering logic
  const now = Date.now();
  const dateFilteredItems = items.filter(item => {
    if (dateFilter === 'all') return true;
    const itemTime = new Date(item.timestamp).getTime();
    const diffDays = (now - itemTime) / (1000 * 3600 * 24);
    if (dateFilter === '7days') return diffDays <= 7;
    if (dateFilter === '30days') return diffDays <= 30;
    if (dateFilter === '90days') return diffDays <= 90;
    return true;
  });

  const totalPages = Math.ceil(dateFilteredItems.length / pageSize) || 1;
  const paginatedItems = dateFilteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      const resp = await fetch(`/api/history/${itemToDelete}`, { method: 'DELETE' });
      if (resp.ok) {
        setItems(prev => prev.filter(i => i.id !== itemToDelete));
        setItemToDelete(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all analysis history records?")) {
      return;
    }
    try {
      const resp = await fetch('/api/history', { method: 'DELETE' });
      if (resp.ok) {
        setItems([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = () => {
    if (dateFilteredItems.length === 0) return;

    const headers = ["ID", "Timestamp", "Risk Score", "Risk Category", "Confidence", "Rule Score", "ML Score", "Indicators Count", "Excerpt"];
    const rows = dateFilteredItems.map(item => [
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
    link.setAttribute("download", `scamshield_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <History className="w-6 h-6 text-blue-400" />
            <span>Analysis History Audit Log</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Audit trail of all previous job scam evaluations. Search, filter by timeframe, inspect evidence details, or export to CSV.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {items.length > 0 && (
            <>
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleClearAll}
                className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/30 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Search input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
              placeholder="Search text, company, or indicator..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto">
            <span className="text-slate-400 mr-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeframe:</span>
            </span>
            {[
              { id: 'all', label: 'All Time' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
              { id: '90days', label: 'Last 90 Days' },
            ].map(tf => (
              <button
                key={tf.id}
                onClick={() => {
                  setDateFilter(tf.id as any);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  dateFilter === tf.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Category Pills */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80 text-xs overflow-x-auto">
          <span className="text-slate-400 mr-1">Risk Category:</span>
          {['all', 'High Risk', 'Medium Risk', 'Low Risk'].map(cat => (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Risks' : cat}
            </button>
          ))}
          <button
            onClick={fetchHistory}
            className="p-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 ml-auto"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* History Items List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading historical audit records...</span>
        </div>
      ) : dateFilteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-300">No Analysis History Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search ? 'No saved audits matched your query or filter.' : 'Run your first job text or email analysis to see records here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedItems.map(record => (
            <div
              key={record.id}
              onClick={() => onViewDetails(record)}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <span className="font-mono">{new Date(record.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span className="uppercase font-mono">{record.formatType}</span>
                  {record.verificationReport?.companyName && (
                    <>
                      <span>•</span>
                      <span className="text-slate-300 font-semibold">{record.verificationReport.companyName}</span>
                    </>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed">
                  {record.inputTextExcerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {record.detectedIndicators.slice(0, 3).map((ind, iIdx) => (
                    <span
                      key={iIdx}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono"
                    >
                      {ind.name}
                    </span>
                  ))}
                  {record.detectedIndicators.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-400 font-mono">
                      +{record.detectedIndicators.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Right side score badge & actions */}
              <div className="flex items-center space-x-3 self-end sm:self-center">
                <div className="text-right">
                  <div className="font-mono text-sm font-extrabold text-white">
                    {record.riskScore} <span className="text-[10px] text-slate-400">/100</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                    record.riskCategory === 'High Risk' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    record.riskCategory === 'Medium Risk' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {record.riskCategory}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToDelete(record.id);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
              <span>
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, dateFilteredItems.length)} of {dateFilteredItems.length} records
              </span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-40 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-slate-200">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-40 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-xs">
            <div className="flex items-center space-x-2 text-red-400 font-bold text-sm mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Record Deletion</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              Are you sure you want to permanently delete audit record <code className="text-slate-200 bg-slate-950 px-1 py-0.5 rounded font-mono font-bold">#{itemToDelete}</code> from the persistent database? This action cannot be reversed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteItem}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
