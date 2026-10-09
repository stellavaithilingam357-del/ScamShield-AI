import React from 'react';
import { 
  Shield, ArrowRight, CheckCircle2, AlertTriangle, Cpu, 
  Search, Lock, ExternalLink, Sparkles, FileText, ChevronRight,
  Building2, Activity, UserCheck, HelpCircle
} from 'lucide-react';
import { SAMPLE_CASES, SampleCase } from '../data/samples';

interface LandingPageProps {
  onAnalyzeNow: () => void;
  onSelectSample: (sample: SampleCase) => void;
  onNavigateToTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onAnalyzeNow,
  onSelectSample,
  onNavigateToTab,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Landing Top Navigation */}
      <header className="sticky top-0 z-50 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigateToTab('landing')}>
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
              <p className="text-[11px] text-slate-400 hidden sm:block">Explainable Job Scam Risk Assessment</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs sm:text-sm font-medium text-slate-300">
            <button onClick={() => onNavigateToTab('landing')} className="text-white hover:text-blue-400 transition-colors">Home</button>
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-blue-400 transition-colors">How It Works</a>
            <button onClick={() => onNavigateToTab('samples')} className="hover:text-blue-400 transition-colors">Sample Cases</button>
            <button onClick={() => onNavigateToTab('settings')} className="hover:text-blue-400 transition-colors">Safety Guide</button>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigateToTab('overview')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs sm:text-sm font-semibold transition-all cursor-pointer hidden sm:block"
            >
              Open Dashboard
            </button>
            <button
              onClick={onAnalyzeNow}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Analyze Job</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-800/80">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[700px] h-96 sm:h-[450px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable AI & Threat Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans max-w-4xl mx-auto">
            Don't Trust Every Job Offer. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
              Verify It Before You Commit.
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-lg text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
            Protect your career, finances, and identity against fraudulent recruiters, advance-fee scams, fake checks, and phishing traps. 
            Powered by a transparent <strong>Dual-Engine Architecture</strong> uniting Machine Learning with Security Rule Forensics.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onAnalyzeNow}
              className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/25 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Analyze a Job Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#features"
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Explore Features</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Interactive Sample Launcher Chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Try Sample Scenarios:</span>
            <button
              onClick={() => onSelectSample(SAMPLE_CASES[0])}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition-colors cursor-pointer"
            >
              Advance-Fee MacBook Scam
            </button>
            <button
              onClick={() => onSelectSample(SAMPLE_CASES[1])}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
            >
              Fake Cashier Check Mule
            </button>
            <button
              onClick={() => onSelectSample(SAMPLE_CASES[5])}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
            >
              Legitimate Stripe Offer
            </button>
          </div>

          {/* Live Preview of Risk Report Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl text-left backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">Sample Forensic Assessment Preview</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">ScamShield Dual-Engine Forensics</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col items-center justify-center text-center">
                <div className="text-4xl font-extrabold text-red-400 font-mono">97</div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">/ 100 Risk Score</span>
                <span className="mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                  High Risk
                </span>
                <span className="text-[11px] text-slate-400 mt-2">98% Model Confidence</span>
              </div>

              <div className="md:col-span-2 space-y-2 text-xs">
                <div className="font-semibold text-slate-200">Suspicious Evidence Found:</div>
                <div className="p-3 rounded-lg bg-slate-950 text-slate-300 font-sans border border-slate-800 leading-relaxed">
                  "Congratulations! You are hired for Data Entry paying <mark className="bg-amber-500/25 text-amber-200 px-1 rounded">$65/hr</mark>. Wire a refundable <mark className="bg-red-500/25 text-red-200 px-1 rounded">equipment deposit</mark> of $250 via <mark className="bg-red-500/25 text-red-200 px-1 rounded">Zelle</mark> to receive your MacBook..."
                </div>
                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">Advance Fee (CRITICAL)</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">Irreversible Zelle P2P</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">Unrealistic $65/hr Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Feature Cards Section */}
      <section id="features" className="py-20 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Enterprise-Grade Fraud Analysis Features
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-400">
              Engineered with zero black-box obscurity. Every warning connects directly to textual evidence and verifiable threat heuristics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Dual-Engine AI & Rules</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Combines statistical TF-IDF and Logistic Regression machine learning with deterministic pattern scanning to reliably catch both novel vocabulary and classic scam formulas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Exact Phrase Highlighting</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Inspect text with interactive color-coded highlights. Click any highlighted phrase to read why it triggered a warning and which fraud pattern it aligns with.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Recruiter Domain Verification</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Cross-references recruiter emails with official company domains to detect lookalikes, homoglyphs, and commercial webmail abuse with zero fabricated verification claims.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Actionable Safety Guidance</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Receive specific countermeasures: stop payment, secure compromised banking credentials, independent switchboard verification, and links to FTC/IC3 fraud portals.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Real Computed Analytics</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Dynamic aggregation charts calculated directly from saved analysis data, including risk category ratios, weekly trends, and top indicator frequencies.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Printable Security Briefs</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Generate clean, print-ready formal PDF audit summaries and JSON exports suitable for documentation or submission to consumer fraud bureaus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Three-Step Workflow Section */}
      <section id="workflow" className="py-20 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Three-Step Threat Assessment Workflow
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-400">
              How ScamShield AI processes your job communication from input to actionable defense.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-xs mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-white mb-2">Input Recruitment Text</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Paste job descriptions, emails, SMS, WhatsApp messages, or upload .txt / .csv files. Optionally provide the company website and recruiter email.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-xs mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-white mb-2">Dual-Engine Scanning</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                The TF-IDF model evaluates token probabilities while deterministic heuristics scan for advance fees, fake checks, banking PIN requests, and homoglyphs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-xs mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-white mb-2">Review & Take Action</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Review the 0–100 risk score, highlighted evidence phrases, domain alignment checks, and concrete safety actions. Export or print the report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Privacy & Responsible AI Notice */}
      <section className="py-16 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Zero-Credential Commitment & Responsible AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            ScamShield AI never collects passwords, bank PINs, OTP codes, or Social Security Numbers. 
            All risk scores are mathematical estimates based on pattern matching and do not constitute formal criminal accusations. 
            We do not fabricate verification badges for unauthenticated companies.
          </p>
          <button
            onClick={() => onNavigateToTab('settings')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Read Ethics & Responsible AI Disclosures
          </button>
        </div>
      </section>

      {/* 6. Landing Footer */}
      <footer className="py-10 bg-slate-950 text-slate-400 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white">ScamShield AI</span>
            <span>• Explainable Job Scam Detection Platform</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <button onClick={() => onNavigateToTab('overview')} className="hover:text-white transition-colors">Dashboard</button>
            <button onClick={() => onNavigateToTab('analyzer')} className="hover:text-white transition-colors">Analyzer</button>
            <button onClick={() => onNavigateToTab('verifier')} className="hover:text-white transition-colors">Verification</button>
            <button onClick={() => onNavigateToTab('dataset')} className="hover:text-white transition-colors">Dataset (110 rows)</button>
            <button onClick={() => onNavigateToTab('settings')} className="hover:text-white transition-colors">Privacy & Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
