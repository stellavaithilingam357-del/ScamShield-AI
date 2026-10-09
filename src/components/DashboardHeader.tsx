import React, { useState } from 'react';
import { 
  Bell, ChevronDown, Sparkles, Shield, User, 
  Search, CheckCircle2, ChevronRight, Menu, Plus
} from 'lucide-react';
import { SAMPLE_CASES, SampleCase } from '../data/samples';

interface DashboardHeaderProps {
  activeTab: string;
  onSelectSample: (sample: SampleCase) => void;
  onAnalyzeNew: () => void;
  onToggleSidebarMobile: () => void;
}

const TAB_TITLES: Record<string, { title: string; category: string }> = {
  overview: { title: 'Overview Dashboard', category: 'Security Operations' },
  analyzer: { title: 'Job Scam Analyzer', category: 'Forensics & Detection' },
  results: { title: 'Analysis Assessment Results', category: 'Audit Report' },
  verifier: { title: 'Company & Recruiter Verification', category: 'Domain Trust' },
  history: { title: 'Analysis History Audit', category: 'Audit Trail' },
  analytics: { title: 'Threat Intelligence Analytics', category: 'Computed Metrics' },
  samples: { title: 'Sample Demo Centre', category: 'Synthetic Benchmarks' },
  reports: { title: 'Assessment Reports & Exports', category: 'Documentation' },
  dataset: { title: 'Synthetic Dataset & ML Pipeline', category: 'Model Benchmarking' },
  settings: { title: 'Settings & Data Governance', category: 'System Governance' },
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeTab,
  onSelectSample,
  onAnalyzeNew,
  onToggleSidebarMobile,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const currentMeta = TAB_TITLES[activeTab] || { title: 'Dashboard', category: 'Platform' };

  return (
    <header className="h-16 bg-slate-950/90 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebarMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 hidden sm:inline">{currentMeta.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
          <span className="font-bold text-white text-sm">{currentMeta.title}</span>
        </div>
      </div>

      {/* Right: Quick actions, notifications, status badge */}
      <div className="flex items-center space-x-3">
        {/* Quick Sample Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-850 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Load Sample</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-xs"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Synthetic Case
              </div>
              <div className="max-h-72 overflow-y-auto">
                {SAMPLE_CASES.map(sample => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      onSelectSample(sample);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800/80 transition-colors flex items-start justify-between space-x-2"
                  >
                    <div>
                      <div className="font-medium text-slate-200">{sample.title}</div>
                      <div className="text-[11px] text-slate-400">{sample.category}</div>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                        sample.expectedRisk === 'High Risk'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : sample.expectedRisk === 'Medium Risk'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {sample.expectedRisk}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors relative"
            title="Threat Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
          </button>

          {notificationsOpen && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 text-xs"
              onMouseLeave={() => setNotificationsOpen(false)}
            >
              <div className="font-bold text-white mb-2 pb-1.5 border-b border-slate-800">
                Threat Intelligence Updates
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-white">Dual-Engine Active</div>
                  <div className="text-[11px] text-slate-400">TF-IDF Model and Deterministic Rules active.</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-white">Dataset Benchmark</div>
                  <div className="text-[11px] text-slate-400">110 synthetic validation samples loaded.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Engine Status Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>TF-IDF + Rules Active</span>
        </div>
      </div>
    </header>
  );
};
