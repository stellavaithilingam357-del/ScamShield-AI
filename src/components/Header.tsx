import React from 'react';
import { Shield, ShieldAlert, Cpu, BarChart3, History, Database, HelpCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { SAMPLE_CASES, SampleCase } from '../data/samples';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectSample: (sample: SampleCase) => void;
  hasActiveResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSelectSample,
  hasActiveResult,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('analyzer')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white font-sans">ScamShield</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Explainable Job Scam Detection Platform</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'analyzer'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Analyzer
            </button>

            {hasActiveResult && (
              <button
                onClick={() => setActiveTab('results')}
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                  activeTab === 'results'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Analysis Results
              </button>
            )}

            <button
              onClick={() => setActiveTab('verifier')}
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'verifier'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Recruiter Verification
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Analytics
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              History
            </button>

            <button
              onClick={() => setActiveTab('dataset')}
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'dataset'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Dataset & ML
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'privacy'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Ethics & Privacy
            </button>
          </nav>

          {/* Right Action: Quick Demo Samples Dropdown & Model Status */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors shadow-sm"
              >
                <span>Load Sample</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-xs"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Synthetic Demo Case
                  </div>
                  <div className="max-h-80 overflow-y-auto">
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

            {/* Model Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Dual-Engine Online</span>
            </div>
          </div>
        </div>

        {/* Mobile Nav strip */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-900 scrollbar-none">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'analyzer' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-900'
            }`}
          >
            Analyzer
          </button>
          {hasActiveResult && (
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                activeTab === 'results' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-900'
              }`}
            >
              Results
            </button>
          )}
          <button
            onClick={() => setActiveTab('verifier')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'verifier' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-900'
            }`}
          >
            Verify
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-900'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-900'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('dataset')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'dataset' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-900'
            }`}
          >
            Dataset & ML
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'privacy' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-900'
            }`}
          >
            Privacy
          </button>
        </div>
      </div>
    </header>
  );
};
