/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardOverview } from './components/DashboardOverview';
import { JobAnalyzer } from './components/JobAnalyzer';
import { AnalysisResultsView } from './components/AnalysisResultsView';
import { RecruiterVerifier } from './components/RecruiterVerifier';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AnalysisHistory } from './components/AnalysisHistory';
import { SampleMessagesPage } from './components/SampleMessagesPage';
import { ReportsPage } from './components/ReportsPage';
import { DatasetExplorer } from './components/DatasetExplorer';
import { SettingsPage } from './components/SettingsPage';
import { ReportModal } from './components/ReportModal';
import { AnalysisResult } from './types';
import { SampleCase } from './data/samples';
import { Shield } from 'lucide-react';

export default function App() {
  // Navigation active tab: 'landing' | 'overview' | 'analyzer' | 'results' | 'verifier' | 'history' | 'analytics' | 'samples' | 'reports' | 'dataset' | 'settings'
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportModalData, setReportModalData] = useState<AnalysisResult | null>(null);

  // Sidebar responsive collapse states
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Pre-fill states for analyzer when loading samples
  const [analyzerInitialText, setAnalyzerInitialText] = useState<string>('');
  const [analyzerInitialFormat, setAnalyzerInitialFormat] = useState<"job_post" | "email" | "sms_whatsapp" | "offer_letter" | "auto">('auto');
  const [analyzerVerificationData, setAnalyzerVerificationData] = useState<{
    companyName?: string;
    officialWebsite?: string;
    recruiterEmail?: string;
    jobUrl?: string;
  }>({});

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setCurrentResult(result);
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSample = (sample: SampleCase) => {
    setAnalyzerInitialText(sample.text);
    setAnalyzerInitialFormat(sample.formatType);
    setAnalyzerVerificationData(sample.verificationData || {});
    setActiveTab('analyzer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectResultById = async (id: string) => {
    try {
      const resp = await fetch(`/api/history/${id}`);
      if (resp.ok) {
        const data = await resp.json();
        setCurrentResult(data);
        setActiveTab('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1. If currently in Landing Page mode, render the full Landing Page
  if (activeTab === 'landing') {
    return (
      <LandingPage
        onAnalyzeNow={() => {
          setActiveTab('analyzer');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectSample={handleSelectSample}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // 2. Otherwise render the Cybersecurity SaaS Dashboard Shell
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-blue-600 selection:text-white">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Deep Navy Responsive Sidebar */}
      <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMobileSidebarOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          hasActiveResult={Boolean(currentResult)}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <DashboardHeader
          activeTab={activeTab}
          onSelectSample={handleSelectSample}
          onAnalyzeNew={() => {
            setActiveTab('analyzer');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onToggleSidebarMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Tab View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <DashboardOverview
              onAnalyzeNewJob={() => {
                setActiveTab('analyzer');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onViewAnalysis={(item) => {
                setCurrentResult(item);
                setActiveTab('results');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'analyzer' && (
            <JobAnalyzer
              onAnalysisComplete={handleAnalysisComplete}
              initialText={analyzerInitialText}
              initialFormat={analyzerInitialFormat}
              initialVerification={analyzerVerificationData}
            />
          )}

          {activeTab === 'results' && currentResult && (
            <AnalysisResultsView
              result={currentResult}
              onNewAnalysis={() => setActiveTab('analyzer')}
              onOpenReportModal={() => {
                setReportModalData(currentResult);
                setShowReportModal(true);
              }}
            />
          )}

          {activeTab === 'verifier' && (
            <RecruiterVerifier />
          )}

          {activeTab === 'history' && (
            <AnalysisHistory
              onViewDetails={(item) => {
                setCurrentResult(item);
                setActiveTab('results');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard onSelectResultById={handleSelectResultById} />
          )}

          {activeTab === 'samples' && (
            <SampleMessagesPage
              onAnalyzeSample={(sample) => {
                handleSelectSample(sample);
              }}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              onOpenReportModal={(item) => {
                setReportModalData(item);
                setShowReportModal(true);
              }}
              onAnalyzeNew={() => setActiveTab('analyzer')}
            />
          )}

          {activeTab === 'dataset' && (
            <DatasetExplorer />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>

        {/* Dashboard Footer */}
        <footer className="py-6 px-4 sm:px-8 border-t border-slate-900 bg-slate-950 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-400">ScamShield AI Platform</span>
            <span>• Explainable Risk Assessment (Port 3000)</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <button onClick={() => setActiveTab('landing')} className="hover:text-slate-300">Landing Page</button>
            <button onClick={() => setActiveTab('dataset')} className="hover:text-slate-300">110-Row Dataset</button>
            <button onClick={() => setActiveTab('settings')} className="hover:text-slate-300">Privacy & Terms</button>
          </div>
        </footer>
      </div>

      {/* Printable Report Modal */}
      {showReportModal && reportModalData && (
        <ReportModal
          result={reportModalData}
          onClose={() => {
            setShowReportModal(false);
            setReportModalData(null);
          }}
        />
      )}
    </div>
  );
}
