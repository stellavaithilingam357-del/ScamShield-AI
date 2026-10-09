import React, { useState, useRef } from 'react';
import { 
  FileText, Mail, MessageSquare, Briefcase, Upload, AlertCircle, 
  Sparkles, Check, X, ShieldAlert, ArrowRight, Building2, Globe, AtSign, Link2, ChevronDown, ChevronUp
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { SAMPLE_CASES, SampleCase } from '../data/samples';

interface JobAnalyzerProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  initialText?: string;
  initialFormat?: "job_post" | "email" | "sms_whatsapp" | "offer_letter" | "auto";
  initialVerification?: {
    companyName?: string;
    officialWebsite?: string;
    recruiterEmail?: string;
    jobUrl?: string;
  };
}

export const JobAnalyzer: React.FC<JobAnalyzerProps> = ({
  onAnalysisComplete,
  initialText = '',
  initialFormat = 'auto',
  initialVerification = {},
}) => {
  const [text, setText] = useState<string>(initialText);
  const [formatType, setFormatType] = useState<"job_post" | "email" | "sms_whatsapp" | "offer_letter" | "auto">(initialFormat);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Recruiter verification optional section
  const [showVerificationFields, setShowVerificationFields] = useState<boolean>(
    Boolean(initialVerification.companyName || initialVerification.recruiterEmail)
  );
  const [companyName, setCompanyName] = useState<string>(initialVerification.companyName || '');
  const [officialWebsite, setOfficialWebsite] = useState<string>(initialVerification.officialWebsite || '');
  const [recruiterEmail, setRecruiterEmail] = useState<string>(initialVerification.recruiterEmail || '');
  const [jobUrl, setJobUrl] = useState<string>(initialVerification.jobUrl || '');

  // File upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    const validExtensions = ['.txt', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setError("Unsupported file format. Please upload a .txt or .csv text file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File exceeds 2MB limit. Please upload a smaller excerpt.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content || !content.trim()) {
        setError("Uploaded file is empty.");
        return;
      }

      if (fileName.endsWith('.csv')) {
        const lines = content.split('\n').filter(l => l.trim().length > 0);
        if (lines.length > 1) {
          const row1 = lines[1];
          const quotedMatch = row1.match(/"([^"]+)"/);
          setText(quotedMatch ? quotedMatch[1] : row1);
        } else {
          setText(content.substring(0, 15000));
        }
      } else {
        setText(content.substring(0, 25000));
      }
      setUploadedFileName(file.name);
    };

    reader.onerror = () => {
      setError("Error reading the selected file.");
    };

    reader.readAsText(file);
  };

  // Synchronize when initialText changes externally (e.g. from sample load)
  React.useEffect(() => {
    if (initialText) {
      setText(initialText);
      setError(null);
    }
    if (initialFormat) {
      setFormatType(initialFormat);
    }
    if (initialVerification.companyName) setCompanyName(initialVerification.companyName);
    if (initialVerification.officialWebsite) setOfficialWebsite(initialVerification.officialWebsite);
    if (initialVerification.recruiterEmail) setRecruiterEmail(initialVerification.recruiterEmail);
    if (initialVerification.jobUrl) setJobUrl(initialVerification.jobUrl);
    if (initialVerification.companyName || initialVerification.recruiterEmail) {
      setShowVerificationFields(true);
    }
  }, [initialText, initialFormat, initialVerification]);

  const handleClear = () => {
    setText('');
    setUploadedFileName(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
        setError(null);
      }
    } catch {
      setError("Clipboard access denied. Please paste text directly into the text area.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const validExtensions = ['.txt', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setError("Unsupported file format. Please upload a .txt or .csv text file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File exceeds 2MB limit. Please upload a smaller excerpt.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content || !content.trim()) {
        setError("Uploaded file is empty.");
        return;
      }

      if (fileName.endsWith('.csv')) {
        // Parse CSV: check if multiple rows or single column
        const lines = content.split('\n').filter(l => l.trim().length > 0);
        if (lines.length > 1) {
          // If CSV has header with message_text or text, grab first data row
          const header = lines[0].toLowerCase();
          if (header.includes('message_text') || header.includes('text') || header.includes('description')) {
            // Pick row 1
            const row1 = lines[1];
            // Match quoted string or comma split
            const quotedMatch = row1.match(/"([^"]+)"/);
            setText(quotedMatch ? quotedMatch[1] : row1);
          } else {
            setText(content.substring(0, 15000));
          }
        } else {
          setText(content.substring(0, 15000));
        }
      } else {
        setText(content.substring(0, 25000));
      }
      setUploadedFileName(file.name);
    };

    reader.onerror = () => {
      setError("Error reading the selected file.");
    };

    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();

    if (!trimmed) {
      setError("Please paste or type the job description or recruitment message to analyze.");
      return;
    }

    if (trimmed.length > 50000) {
      setError("Text exceeds 50,000 characters limit. Please shorten your input.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: trimmed,
          formatType,
          companyName: companyName.trim() || undefined,
          officialWebsite: officialWebsite.trim() || undefined,
          recruiterEmail: recruiterEmail.trim() || undefined,
          jobUrl: jobUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error occurred during analysis.');
      }

      const result: AnalysisResult = await response.json();
      onAnalysisComplete(result);
    } catch (err: any) {
      setError(err.message || "Failed to communicate with ScamShield AI server. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                  Detection Module
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2 mt-1">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Check Before You Trust</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Job Scam Analyzer: Paste any job description, email outreach, WhatsApp message, or offer letter for instant explainable risk assessment.
              </p>
            </div>

            {/* Quick Sample Selector */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 hidden lg:inline">Quick load:</span>
              <button
                type="button"
                onClick={() => {
                  setText(SAMPLE_CASES[0].text);
                  setFormatType("email");
                  setCompanyName(SAMPLE_CASES[0].verificationData?.companyName || '');
                  setOfficialWebsite(SAMPLE_CASES[0].verificationData?.officialWebsite || '');
                  setRecruiterEmail(SAMPLE_CASES[0].verificationData?.recruiterEmail || '');
                  setShowVerificationFields(true);
                  setError(null);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-medium transition-colors cursor-pointer"
              >
                Sample Scam
              </button>
              <button
                type="button"
                onClick={() => {
                  setText(SAMPLE_CASES[5].text);
                  setFormatType("email");
                  setCompanyName(SAMPLE_CASES[5].verificationData?.companyName || '');
                  setOfficialWebsite(SAMPLE_CASES[5].verificationData?.officialWebsite || '');
                  setRecruiterEmail(SAMPLE_CASES[5].verificationData?.recruiterEmail || '');
                  setShowVerificationFields(true);
                  setError(null);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium transition-colors cursor-pointer"
              >
                Sample Legitimate
              </button>
            </div>
          </div>

          {/* Format selector tabs */}
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 self-center mr-1">Message Format:</span>
            {[
              { id: 'auto', label: 'Auto Detect', icon: Sparkles },
              { id: 'email', label: 'Recruitment Email', icon: Mail },
              { id: 'sms_whatsapp', label: 'SMS / WhatsApp', icon: MessageSquare },
              { id: 'job_post', label: 'Job Listing / Post', icon: Briefcase },
              { id: 'offer_letter', label: 'Formal Offer Letter', icon: FileText },
            ].map(tab => {
              const Icon = tab.icon;
              const active = formatType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFormatType(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1 leading-relaxed">{error}</div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Text Input Area */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                Message or Job Description Content
              </label>
              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="hover:text-blue-400 transition-colors"
                >
                  Paste from Clipboard
                </button>
                {text && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="hover:text-red-400 transition-colors"
                  >
                    Clear Text
                  </button>
                )}
                <span className="font-mono text-[11px] text-slate-400">
                  {text.length.toLocaleString()} / 50,000 chars
                </span>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              rows={9}
              placeholder="Paste email text, SMS/Telegram recruitment chat, job board posting, or interview questionnaire here...&#10;&#10;e.g. 'Congratulations! You have been selected for Data Entry Clerk paying $65/hr. To receive your MacBook, wire a $250 equipment deposit via Zelle...'"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder:text-slate-500 font-sans text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-y"
            />
          </div>

          {/* Drag-and-Drop File Upload Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border transition-all gap-3 ${
              isDragging 
                ? 'bg-blue-600/10 border-blue-500 border-dashed ring-2 ring-blue-500/30' 
                : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <Upload className={`w-5 h-5 ${isDragging ? 'text-blue-400 animate-bounce' : 'text-blue-400'}`} />
              <div>
                <span className="font-semibold text-slate-200">
                  {isDragging ? 'Drop file here to load text' : 'Drag & Drop or Upload File: '}
                </span>
                <span className="text-slate-400 block sm:inline">
                  Supports .txt and .csv job postings (max 2MB)
                </span>
                {uploadedFileName && (
                  <span className="ml-2 font-mono text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {uploadedFileName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer transition-colors"
              >
                Choose File
              </label>
              {uploadedFileName && (
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFileName(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Optional Recruiter & Organization Verification Accordion */}
          <div className="border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowVerificationFields(!showVerificationFields)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-200">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Optional: Recruiter & Organization Verification Data</span>
                <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">(Cross-checks domains & email alignment)</span>
              </div>
              {showVerificationFields ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showVerificationFields && (
              <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Company / Organization Name</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apple Inc. or Stripe"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1 flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Official Company Website</span>
                  </label>
                  <input
                    type="text"
                    value={officialWebsite}
                    onChange={(e) => setOfficialWebsite(e.target.value)}
                    placeholder="e.g. https://apple.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1 flex items-center space-x-1.5">
                    <AtSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Recruiter Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    placeholder="e.g. recruiter@apple.com or hr@gmail.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1 flex items-center space-x-1.5">
                    <Link2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Job Listing or Application URL</span>
                  </label>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="e.g. https://careers.apple.com/us/en/job/..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-slate-400 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>Zero Credential Collection: We never ask for passwords, bank PINs, or SSNs.</span>
            </div>

            <button
              type="submit"
              disabled={loading || !text.trim()}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer ${
                loading || !text.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Running Dual-Engine Inspection...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Analyze with ScamShield AI</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
