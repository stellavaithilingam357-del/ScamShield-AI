import React, { useState } from 'react';
import { 
  Building2, Globe, AtSign, Link2, CheckCircle2, AlertTriangle, 
  Info, Shield, Search, ArrowRight, ExternalLink, HelpCircle
} from 'lucide-react';
import { VerificationReport, VerificationCheck } from '../types';

export const RecruiterVerifier: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName && !officialWebsite && !recruiterEmail && !jobUrl) {
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/verify-recruiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim() || undefined,
          officialWebsite: officialWebsite.trim() || undefined,
          recruiterEmail: recruiterEmail.trim() || undefined,
          jobUrl: jobUrl.trim() || undefined,
        }),
      });

      if (!resp.ok) {
        throw new Error('Verification request failed.');
      }
      const data: VerificationReport = await resp.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCompanyName('');
    setOfficialWebsite('');
    setRecruiterEmail('');
    setJobUrl('');
    setReport(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Building2 className="w-6 h-6 text-blue-400" />
          <span>Company & Recruiter Verification Tool</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Evaluate recruiter email alignment, identify lookalike phishing domains, and follow structured safe manual verification protocols.
        </p>
      </div>

      {/* Input Form */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Company Name</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Microsoft, Google, Stripe"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Official Corporate Website</span>
              </label>
              <input
                type="text"
                value={officialWebsite}
                onChange={(e) => setOfficialWebsite(e.target.value)}
                placeholder="e.g. https://stripe.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1.5">
                <AtSign className="w-3.5 h-3.5 text-blue-400" />
                <span>Recruiter Email Address</span>
              </label>
              <input
                type="email"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="e.g. recruiter@stripe.com or hr-desk@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1.5">
                <Link2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Job Listing URL</span>
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="e.g. https://careers.stripe.com/jobs/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white"
            >
              Reset Fields
            </button>

            <button
              type="submit"
              disabled={loading || (!companyName && !officialWebsite && !recruiterEmail && !jobUrl)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Evaluating...' : 'Run Verification Audit'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Verification Output */}
      {report && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-white">Heuristic Verification Audit Results</h3>
              <p className="text-xs text-slate-400">{report.summary}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Official Status: Not Verified
              </span>
            </div>
          </div>

          {/* Checks list */}
          <div className="space-y-3">
            {report.checks.map((check, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3 text-xs"
              >
                <div className="mt-0.5">
                  {check.status === 'MATCH' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {check.status === 'DISCREPANCY' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  {check.status === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {check.status === 'UNVERIFIED' && <Info className="w-4 h-4 text-slate-400" />}
                  {check.status === 'INFO' && <Info className="w-4 h-4 text-blue-400" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
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
        </div>
      )}

      {/* Manual Verification Step-by-Step Guide */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>Safe Manual Verification Protocol (Zero-Trust Standard)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Follow these 5 independent verification steps before signing agreements or sharing sensitive identification:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-blue-400 mb-1">1. DNS & Email Domain Matching</div>
            <p className="text-slate-300 leading-relaxed">
              Ensure recruiter emails originate from <code className="text-slate-200 bg-slate-900 px-1 py-0.5 rounded">@company.com</code>. Watch for lookalike homoglyphs such as <code className="text-red-300 bg-slate-900 px-1 py-0.5 rounded">@company-careers-hr.com</code> or <code className="text-red-300 bg-slate-900 px-1 py-0.5 rounded">@company.biz</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-blue-400 mb-1">2. Official Requisition ID Lookup</div>
            <p className="text-slate-300 leading-relaxed">
              Navigate manually to the organization's public career site (e.g. <code className="text-slate-200 bg-slate-900 px-1 py-0.5 rounded">company.com/careers</code>). Search the exact Job ID to verify it is an active public requisition.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-blue-400 mb-1">3. Corporate Telephone Switchboard</div>
            <p className="text-slate-300 leading-relaxed">
              Find the company's publicly listed headquarters phone number on Google Maps or official filings. Call and ask the operator to connect you to the named recruiter in Talent Acquisition.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-blue-400 mb-1">4. LinkedIn Directory Cross-Check</div>
            <p className="text-slate-300 leading-relaxed">
              Search the recruiter's name under the company's verified LinkedIn "People" page. Verify account longevity, shared connections, and authentic professional tenure.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 md:col-span-2">
            <div className="font-bold text-blue-400 mb-1">5. WHOIS Creation Date Verification</div>
            <p className="text-slate-300 leading-relaxed">
              Use a free WHOIS lookup tool (e.g., <code className="text-slate-200 bg-slate-900 px-1 py-0.5 rounded">whois.domaintools.com</code>) to check the registration date of any domain linked in the offer. Domains registered less than 90 days ago are severe red flags for disposable scam infrastructure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
