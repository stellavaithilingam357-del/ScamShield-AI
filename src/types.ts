export type RiskCategory = "Low Risk" | "Medium Risk" | "High Risk";
export type IndicatorSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface HighlightSpan {
  phrase: string;
  start: number;
  end: number;
  indicatorId: string;
  indicatorName: string;
  severity: IndicatorSeverity;
  explanation: string;
}

export interface RuleIndicatorMatch {
  id: string;
  name: string;
  category: string;
  severity: IndicatorSeverity;
  points: number;
  explanation: string;
  evidencePhrases: string[];
  matchedSpans: HighlightSpan[];
}

export interface MLFeatureContribution {
  token: string;
  weight: number;
  impact: "SUSPICIOUS" | "BENIGN";
}

export interface VerificationCheck {
  item: string;
  status: "MATCH" | "DISCREPANCY" | "UNVERIFIED" | "WARNING" | "INFO";
  detail: string;
}

export interface VerificationReport {
  companyName?: string;
  officialWebsite?: string;
  recruiterEmail?: string;
  jobUrl?: string;
  checks: VerificationCheck[];
  summary: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  inputTextExcerpt: string;
  fullText: string;
  textLength: number;
  formatType: "job_post" | "email" | "sms_whatsapp" | "offer_letter" | "auto";
  riskScore: number;
  riskCategory: RiskCategory;
  confidenceEstimate: number;
  ruleScore: number;
  mlProbability: number;
  mlScore: number;
  detectedIndicators: RuleIndicatorMatch[];
  highlightSpans: HighlightSpan[];
  mlFeatures: MLFeatureContribution[];
  explanationSummary: string;
  recommendedActions: string[];
  disclaimer: string;
  verificationReport?: VerificationReport;
}

export interface AnalyticsData {
  totalAnalyses: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  averageRiskScore: number;
  topIndicators: Array<{
    id: string;
    count: number;
    name: string;
    severity: string;
  }>;
  recentTimeline: Array<{
    id: string;
    timestamp: string;
    riskScore: number;
    riskCategory: RiskCategory;
    indicatorsCount: number;
    excerpt: string;
  }>;
}

export interface DatasetRow {
  id: number;
  message_text: string;
  label: number;
  scam_type: string;
  warning_indicators: string;
}
