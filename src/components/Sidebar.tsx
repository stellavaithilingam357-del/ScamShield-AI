import React from 'react';
import { 
  LayoutDashboard, FileSearch, History, Building2, 
  BarChart3, Sparkles, FileText, Settings, Shield, 
  ChevronLeft, ChevronRight, Home, Database
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  hasActiveResult: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  hasActiveResult,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Job Analyzer', icon: FileSearch },
    ...(hasActiveResult ? [{ id: 'results', label: 'Analysis Results', icon: Shield }] : []),
    { id: 'verifier', label: 'Company Verification', icon: Building2 },
    { id: 'history', label: 'Analysis History', icon: History },
    { id: 'analytics', label: 'Threat Analytics', icon: BarChart3 },
    { id: 'samples', label: 'Sample Demo Centre', icon: Sparkles },
    { id: 'reports', label: 'Reports & Exports', icon: FileText },
    { id: 'dataset', label: 'Dataset & ML', icon: Database },
    { id: 'settings', label: 'Settings & Privacy', icon: Settings },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div
          className="flex items-center space-x-3 cursor-pointer overflow-hidden"
          onClick={() => setActiveTab('landing')}
          title="Return to Landing Page"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          {!collapsed && (
            <div className="whitespace-nowrap">
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-bold text-white tracking-tight">ScamShield</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">AI</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-sans">Cyber Threat Forensics</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Footer Return to Landing Page */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={() => setActiveTab('landing')}
          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Return to Landing Page"
        >
          <Home className="w-4 h-4 text-blue-400 flex-shrink-0" />
          {!collapsed && <span>Landing Page</span>}
        </button>
      </div>
    </aside>
  );
};
