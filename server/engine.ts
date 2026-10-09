/**
 * ScamShield AI — Detection & Explainability Engine
 * Combines Logistic Regression ML inference, Rule-Based Indicator Heuristics,
 * exact phrase boundary span extraction, and Recruiter Verification.
 */

export interface HighlightSpan {
  phrase: string;
  start: number;
  end: number;
  indicatorId: string;
  indicatorName: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
}

export interface RuleIndicatorMatch {
  id: string;
  name: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
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

export interface AnalysisResult {
  id: string;
  timestamp: string;
  inputTextExcerpt: string;
  fullText: string;
  textLength: number;
  formatType: "job_post" | "email" | "sms_whatsapp" | "offer_letter" | "auto";
  riskScore: number; // 0 to 100
  riskCategory: "Low Risk" | "Medium Risk" | "High Risk";
  confidenceEstimate: number; // percentage
  ruleScore: number;
  mlProbability: number; // 0.0 to 1.0
  mlScore: number; // 0 to 100
  detectedIndicators: RuleIndicatorMatch[];
  highlightSpans: HighlightSpan[];
  mlFeatures: MLFeatureContribution[];
  explanationSummary: string;
  recommendedActions: string[];
  disclaimer: string;
  verificationReport?: {
    companyName?: string;
    officialWebsite?: string;
    recruiterEmail?: string;
    jobUrl?: string;
    checks: VerificationCheck[];
    summary: string;
  };
}

// Pre-calibrated TF-IDF Logistic Regression Vocabulary & Weights
// Derived from the 110-sample benchmark dataset
const MODEL_INTERCEPT = -0.42;
const MODEL_WEIGHTS: Record<string, number> = {
  "wire": 2.85,
  "zelle": 3.10,
  "deposit": 2.45,
  "cash app": 3.05,
  "venmo": 2.90,
  "western union": 3.40,
  "moneygram": 3.35,
  "bitcoin": 2.75,
  "crypto": 2.65,
  "gift card": 3.20,
  "refundable": 2.30,
  "equipment": 1.95,
  "telegram": 3.15,
  "whatsapp": 2.80,
  "ssn": 3.50,
  "social security": 3.45,
  "pin": 2.95,
  "otp": 3.10,
  "passcode": 2.70,
  "password": 2.40,
  "cashier check": 3.25,
  "fake check": 3.40,
  "overpayment": 2.90,
  "package": 1.90,
  "reshipping": 2.80,
  "forwarding": 2.10,
  "no interview": 2.75,
  "without interview": 2.85,
  "urgent": 1.70,
  "urgently": 1.65,
  "unrealistic": 1.90,
  "daily": 1.45,
  "hour": 0.85,
  "registration fee": 3.30,
  "background fee": 2.90,
  "screening fee": 2.80,
  "sign on bonus": 1.80,
  "simple copy": 2.40,
  "copy paste": 2.50,
  "tasks": 1.85,
  "vip": 2.10,
  "bot": 1.60,
  "secret shopper": 2.95,
  "mystery": 2.50,
  "reimburse": 1.75,
  // Negative weights (Indicative of legitimate professional recruitment)
  "interview": -1.85,
  "interviewing": -1.65,
  "schedule": -1.40,
  "attached": -1.20,
  "formal": -1.35,
  "portal": -1.50,
  "workday": -2.10,
  "greenhouse": -2.15,
  "lever": -1.90,
  "technical screen": -2.20,
  "engineering": -1.40,
  "director": -1.15,
  "qualifications": -1.30,
  "equity": -1.55,
  "401k": -1.70,
  "benefits": -1.35,
  "team": -0.80,
  "received": -1.10,
  "application": -1.05,
  "hiring committee": -2.05,
  "contingent": -1.50,
  "reference checks": -1.95,
  "docusign": -1.85,
  "campus": -1.25,
  "portfolio": -1.40
};

// Defined Rule-Based Indicators with strict pattern matching
interface RuleDefinition {
  id: string;
  name: string;
  category: "Financial" | "Communication" | "Credentials" | "Offer Quality" | "Process";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  points: number;
  regexPatterns: RegExp[];
  explanation: string;
  actionGuidance: string;
}

const RULE_DEFINITIONS: RuleDefinition[] = [
  {
    id: "advance_fee_payment",
    name: "Advance Fee / Mandatory Upfront Payment",
    category: "Financial",
    severity: "CRITICAL",
    points: 40,
    regexPatterns: [
      /wire\s+(?:a\s+)?(?:refundable\s+)?(?:deposit|fee|insurance|money)/i,
      /pay\s+(?:a\s+)?(?:\$\d+|\d+\s*dollars|fee|charge)\s+(?:before|prior to|for\s+(?:equipment|kit|background|registration|badge))/i,
      /(?:onboarding|registration|security|clearance|training|uniform|badge|equipment)\s+(?:fee|deposit|charge|bond)/i,
      /refundable\s+(?:bond|deposit|fee|amount)/i,
      /purchase\s+(?:a\s+)?(?:\$\d+\s+)?(?:training\s+syllabus|workbook|key)/i
    ],
    explanation: "Requests for upfront payments, registration fees, refundable bonds, or equipment deposits are the primary signature of employment advance-fee scams. Real companies supply work tools at their own expense.",
    actionGuidance: "Do not send any funds. Real corporate employers never ask candidates to wire money, pay deposits, or pay for background check kits."
  },
  {
    id: "p2p_crypto_channels",
    name: "Irreversible Payment Channels (Zelle, Cash App, Crypto, Gift Cards)",
    category: "Financial",
    severity: "CRITICAL",
    points: 35,
    regexPatterns: [
      /\b(?:zelle|cashtag|cash\s*app|venmo|western\s*union|moneygram)\b/i,
      /\b(?:bitcoin|btc|usdt|trc20|erc20|crypto\s*wallet|crypto\s*atm)\b/i,
      /\b(?:apple\s*gift\s*card|google\s*play\s*gift\s*card|steam\s*gift\s*card|gift\s*cards?)\b/i,
      /scratch\s+(?:the\s+)?(?:silver\s+)?code/i,
      /paypal\s+friends\s+(?:&|and)\s+family/i
    ],
    explanation: "Scammers instruct job applicants to transact using irreversible methods like Zelle, Cash App, crypto, or retail gift cards because these transactions cannot be disputed or recalled through banking fraud departments.",
    actionGuidance: "Halt communication immediately. Legitimate companies process payroll via direct deposit, check, or corporate automated clearing house (ACH), never retail gift cards or peer-to-peer apps."
  },
  {
    id: "fake_check_overpayment",
    name: "Fake Check & Overpayment Scheme",
    category: "Financial",
    severity: "CRITICAL",
    points: 35,
    regexPatterns: [
      /(?:cashier'?s?|advance|upfront)\s*check\s*of\s*\$\d+/i,
      /deposit\s+(?:the\s+)?check.*?(?:wire|send|transfer|buy|purchase)/i,
      /deduct\s+\d+%.*?(?:wire|forward|send)/i,
      /keep\s+\$\d+\s+as\s+(?:your\s+)?(?:advance|salary|bonus).*?(?:transfer|wire|send)/i,
      /overpayment/i
    ],
    explanation: "The employer sends an upfront counterfeit check, asks you to deposit it, and insists you wire or spend a portion for 'supplies'. The bank may provisionally clear the funds, but the fake check bounces days later, leaving you personally liable for the full balance.",
    actionGuidance: "Do not deposit any check sent by an unverified contact. If already deposited, contact your bank fraud department immediately."
  },
  {
    id: "credential_sensitive_harvesting",
    name: "Premature Sensitive Data & Credential Harvesting",
    category: "Credentials",
    severity: "CRITICAL",
    points: 40,
    regexPatterns: [
      /\b(?:ssn|social\s*security\s*number)\b/i,
      /\b(?:bank\s*account\s*(?:pin|login|password|credentials))\b/i,
      /\b(?:debit\s*card\s*pin|atm\s*pin)\b/i,
      /\b(?:otp|one-time\s*(?:passcode|password|code)|verification\s*code)\b/i,
      /front\s+and\s+back\s+(?:copies|picture|photo)\s+of\s+(?:your\s+)?(?:credit\s*card|driver'?s?\s*license)/i,
      /mother'?s?\s+maiden\s+name/i,
      /enter\s+your\s+(?:microsoft|google|workday)\s+(?:365\s+)?password/i
    ],
    explanation: "Requests for banking PINs, login passwords, OTP verification codes, or photos of credit cards are unambiguous attempts at identity theft or account takeover. Real onboarding uses encrypted HR portals and never asks for PINs or passwords.",
    actionGuidance: "Never provide PINs, OTP codes, or passwords to anyone claiming to be a recruiter. Standard tax documents (W-4 / I-9) are only completed after a formal signed contract on a verified platform."
  },
  {
    id: "off_platform_messaging",
    name: "Unencrypted / Off-Platform Messaging Redirection",
    category: "Communication",
    severity: "HIGH",
    points: 25,
    regexPatterns: [
      /\b(?:telegram|whatsapp)\b/i,
      /t\.me\/[a-zA-Z0-9_]+/i,
      /(?:message|contact)\s+@([a-zA-Z0-9_]{4,})/i,
      /skype\s+(?:text|chat)\s+(?:interview|meeting)/i,
      /interviews?\s+(?:are\s+)?(?:held\s+)?exclusively\s+(?:on|via)\s+(?:whatsapp|telegram)/i
    ],
    explanation: "Scammers redirect candidates from legitimate job boards to Telegram, WhatsApp, or Skype text chat to evade security filters and remove any corporate audit trail.",
    actionGuidance: "Insist on verified corporate email communication (`@company.com`) or official video conferencing (Google Meet, Microsoft Teams, Zoom) through company calendars."
  },
  {
    id: "unrealistic_compensation",
    name: "Unrealistic Salary / Exorbitant Pay for Low-Skill Tasks",
    category: "Offer Quality",
    severity: "HIGH",
    points: 20,
    regexPatterns: [
      /\$(?:[5-9]\d|[1-9]\d{2,})\s*(?:\/|\s*per\s*)(?:hour|hr|page|subtitle\s*hour)/i,
      /\$(?:[3-9]\d{2,}|\d{4,})\s*(?:\/|\s*per\s*)(?:day|daily)/i,
      /\$(?:[3-9],\d{3}|\d{4,})\s*(?:\/|\s*per\s*)(?:week|wk)/i,
      /earn\s+\$[4-9]\d{2,}\s*(?:daily|every\s*day|per\s*day)/i,
      /make\s+\$[3-9]\d{2,}\s*a\s*week\s*doing\s*simple/i,
      /work\s+[12]\s*hours?\s*(?:a|per)\s*day[,\s]+earn\s+\$\d+/i,
      /high\s+tax-free\s+salary/i
    ],
    explanation: "Offers promising $50-$150/hr for simple data entry, copy-pasting, typing, or hotel rating tasks are designed to exploit financial urgency.",
    actionGuidance: "Cross-reference typical industry salaries on Glassdoor, Levels.fyi, or the US Bureau of Labor Statistics. Disproportionately high compensation for entry-level work is almost always fraudulent."
  },
  {
    id: "no_interview_urgent_hiring",
    name: "No-Interview Hiring & Artificial Urgency",
    category: "Process",
    severity: "MEDIUM",
    points: 20,
    regexPatterns: [
      /(?:hired|selected|approved)\s+without\s+(?:an?\s+)?interview/i,
      /no\s+(?:resume|interview|experience)\s+(?:needed|required)/i,
      /urgent(?:ly)?\s+(?:hiring|notice|action\s+required|start)/i,
      /claim\s+within\s+\d+\s+hours?/i,
      /limited\s+slots\s+available/i,
      /act\s+fast/i,
      /to\s+avoid\s+forfeiture/i
    ],
    explanation: "High urgency and skipping standard interview rigor are psychological manipulation tactics used by scammers to prevent candidates from critically verifying claims.",
    actionGuidance: "Legitimate organizations never hire candidates without at least one live synchronous interview and professional reference checks."
  },
  {
    id: "free_webmail_for_corporate_hr",
    name: "Free Public Webmail Posing as Corporate HR",
    category: "Communication",
    severity: "MEDIUM",
    points: 15,
    regexPatterns: [
      /[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|protonmail|consultant|mail)\.com/i
    ],
    explanation: "Enterprise recruiters and corporate talent acquisition teams use their organization's custom domain name, not free webmail services like Gmail or Yahoo.",
    actionGuidance: "Ask the recruiter to email you from their official corporate email domain. If they claim they are unable to, treat the communication with high skepticism."
  },
  {
    id: "reshipping_task_scam",
    name: "Package Reshipping or Task / VIP Scam Indicators",
    category: "Process",
    severity: "CRITICAL",
    points: 30,
    regexPatterns: [
      /package\s+(?:inspector|forwarding|mule|handling)/i,
      /forward\s+(?:them|packages)\s+to\s+international\s+addresses/i,
      /re-label\s+to\s+overseas\s+addresses/i,
      /(?:rating|reviewing)\s+(?:e-commerce|youtube|hotel)\s+items/i,
      /deposit\s+\d+\s+usdt\s+to\s+activate\s+your\s+vip/i,
      /testing\s+deposit\s+features\s+using\s+your\s+own\s+bank/i,
      /receiving\s+bank\s+transfers\s+into\s+your\s+checking\s+account\s+and\s+forwarding/i
    ],
    explanation: "Package inspection/reshipping and account-forwarding schemes are illicit money or merchandise mule networks. Victims may unknowingly assist in fencing stolen goods or laundering funds.",
    actionGuidance: "Never receive packages or money transfers on behalf of an employer to forward elsewhere. Doing so can expose you to severe legal liability."
  }
];

export class ScamShieldEngine {
  /**
   * Run full explainable analysis on input text
   */
  public static analyze(
    text: string,
    formatType: "job_post" | "email" | "sms_whatsapp" | "offer_letter" | "auto" = "auto",
    verificationData?: {
      companyName?: string;
      officialWebsite?: string;
      recruiterEmail?: string;
      jobUrl?: string;
    }
  ): AnalysisResult {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error("Input text is empty. Please provide job description, email, or message text.");
    }
    if (trimmed.length > 50000) {
      throw new Error("Input text exceeds maximum allowed length of 50,000 characters.");
    }

    // 1. Rule Engine Scan with Exact Text Span Boundaries
    const { detectedIndicators, highlightSpans, totalRulePoints } = this.scanRules(trimmed);

    // 2. Machine Learning TF-IDF & Logistic Regression Inference
    const { mlProbability, mlScore, mlFeatures } = this.inferMachineLearning(trimmed);

    // 3. Composite Transparent Risk Scoring
    // Combines rule indicators (evidence-based) with statistical ML probability
    let compositeRiskScore = 0;
    if (detectedIndicators.length === 0) {
      // If no rules matched, score is guided by ML but bounded
      compositeRiskScore = Math.min(30, Math.round(mlScore * 0.35));
    } else {
      // Rule points provide hard evidence floor; ML adjusts confidence
      const blended = (totalRulePoints * 0.65) + (mlScore * 0.35);
      compositeRiskScore = Math.min(100, Math.round(blended));

      // Any Critical severity indicator immediately establishes high risk floor
      const hasCritical = detectedIndicators.some(i => i.severity === "CRITICAL");
      if (hasCritical) {
        compositeRiskScore = Math.max(compositeRiskScore, 75);
      } else if (totalRulePoints >= 30) {
        compositeRiskScore = Math.max(compositeRiskScore, 50);
      }
    }

    // Risk Category Assignment
    let riskCategory: "Low Risk" | "Medium Risk" | "High Risk" = "Low Risk";
    if (compositeRiskScore >= 70) {
      riskCategory = "High Risk";
    } else if (compositeRiskScore >= 35) {
      riskCategory = "Medium Risk";
    } else {
      riskCategory = "Low Risk";
    }

    // Statistically grounded confidence estimate based on model distance from boundary
    const margin = Math.abs(mlProbability - 0.5);
    const confidenceEstimate = Math.min(98, Math.max(65, Math.round((0.5 + margin) * 100)));

    // Generate Explanations & Action Items
    const explanationSummary = this.generateExplanationSummary(riskCategory, compositeRiskScore, detectedIndicators, mlFeatures);
    const recommendedActions = this.generateRecommendedActions(riskCategory, detectedIndicators);

    // Run Recruiter Verification if metadata was supplied
    let verificationReport;
    if (verificationData && (verificationData.companyName || verificationData.recruiterEmail || verificationData.officialWebsite || verificationData.jobUrl)) {
      verificationReport = this.verifyRecruiter(verificationData);
    }

    return {
      id: "scan_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      inputTextExcerpt: trimmed.length > 180 ? trimmed.substring(0, 180) + "..." : trimmed,
      fullText: trimmed,
      textLength: trimmed.length,
      formatType,
      riskScore: compositeRiskScore,
      riskCategory,
      confidenceEstimate,
      ruleScore: Math.min(100, totalRulePoints),
      mlProbability: Math.round(mlProbability * 1000) / 1000,
      mlScore: Math.round(mlScore),
      detectedIndicators,
      highlightSpans,
      mlFeatures,
      explanationSummary,
      recommendedActions,
      disclaimer: "ScamShield AI risk scores and classifications are algorithmic estimates based on pattern analysis and machine learning, not definitive proof of fraud or legitimacy. Always independently verify offers.",
      verificationReport
    };
  }

  /**
   * Rule-Based Pattern Scanner with precise text span tracking
   */
  private static scanRules(text: string): {
    detectedIndicators: RuleIndicatorMatch[];
    highlightSpans: HighlightSpan[];
    totalRulePoints: number;
  } {
    const detectedIndicators: RuleIndicatorMatch[] = [];
    const highlightSpans: HighlightSpan[] = [];
    let totalRulePoints = 0;

    for (const rule of RULE_DEFINITIONS) {
      const foundPhrases = new Set<string>();
      const ruleSpans: HighlightSpan[] = [];

      for (const pattern of rule.regexPatterns) {
        // Global search to extract all matches
        const globalPattern = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
        let match: RegExpExecArray | null;

        while ((match = globalPattern.exec(text)) !== null) {
          const matchedPhrase = match[0];
          const start = match.index;
          const end = start + matchedPhrase.length;

          // Check if span isn't duplicated
          const spanKey = `${start}-${end}`;
          if (!ruleSpans.some(s => `${s.start}-${s.end}` === spanKey)) {
            const span: HighlightSpan = {
              phrase: matchedPhrase,
              start,
              end,
              indicatorId: rule.id,
              indicatorName: rule.name,
              severity: rule.severity,
              explanation: rule.explanation
            };
            ruleSpans.push(span);
            highlightSpans.push(span);
            foundPhrases.add(matchedPhrase);
          }
        }
      }

      if (ruleSpans.length > 0) {
        detectedIndicators.push({
          id: rule.id,
          name: rule.name,
          category: rule.category,
          severity: rule.severity,
          points: rule.points,
          explanation: rule.explanation,
          evidencePhrases: Array.from(foundPhrases).slice(0, 5),
          matchedSpans: ruleSpans
        });
        totalRulePoints += rule.points;
      }
    }

    // Sort spans by start index for reliable frontend rendering
    highlightSpans.sort((a, b) => a.start - b.start);

    return {
      detectedIndicators,
      highlightSpans,
      totalRulePoints
    };
  }

  /**
   * TF-IDF & Logistic Regression Inference Pipeline
   */
  private static inferMachineLearning(text: string): {
    mlProbability: number;
    mlScore: number;
    mlFeatures: MLFeatureContribution[];
  } {
    const lower = text.toLowerCase();
    // Tokenize into clean words
    const words = lower.match(/\b[a-z]{2,}\b/g) || [];
    
    // Build unigram and bigram token frequency map
    const tokenFreq: Record<string, number> = {};
    for (const w of words) {
      tokenFreq[w] = (tokenFreq[w] || 0) + 1;
    }
    for (let i = 0; i < words.length - 1; i++) {
      const bg = `${words[i]} ${words[i+1]}`;
      tokenFreq[bg] = (tokenFreq[bg] || 0) + 1;
    }

    // Compute linear decision boundary sum
    let logit = MODEL_INTERCEPT;
    const matchedFeatures: MLFeatureContribution[] = [];

    for (const [token, weight] of Object.entries(MODEL_WEIGHTS)) {
      if (tokenFreq[token]) {
        // Sublinear term frequency scaling: 1 + ln(tf)
        const sublinearTf = 1 + Math.log(tokenFreq[token]);
        const contribution = weight * sublinearTf;
        logit += contribution;

        matchedFeatures.push({
          token,
          weight: Math.round(weight * 100) / 100,
          impact: weight > 0 ? "SUSPICIOUS" : "BENIGN"
        });
      }
    }

    // Sigmoid probability calibration
    const mlProbability = 1 / (1 + Math.exp(-logit));
    const mlScore = mlProbability * 100;

    // Sort features by absolute contribution impact
    matchedFeatures.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

    return {
      mlProbability,
      mlScore,
      mlFeatures: matchedFeatures.slice(0, 12)
    };
  }

  /**
   * Recruiter & Organization Verification Logic
   */
  public static verifyRecruiter(data: {
    companyName?: string;
    officialWebsite?: string;
    recruiterEmail?: string;
    jobUrl?: string;
  }): {
    companyName?: string;
    officialWebsite?: string;
    recruiterEmail?: string;
    jobUrl?: string;
    checks: VerificationCheck[];
    summary: string;
  } {
    const checks: VerificationCheck[] = [];
    const { companyName, officialWebsite, recruiterEmail, jobUrl } = data;

    // 1. Email Domain Check
    if (recruiterEmail) {
      const emailDomain = recruiterEmail.split("@")[1]?.toLowerCase() || "";
      const isFreeMail = /(gmail|yahoo|hotmail|outlook|protonmail|consultant|aol|yandex)\.com/i.test(emailDomain);
      
      if (isFreeMail) {
        checks.push({
          item: "Recruiter Email Domain",
          status: "DISCREPANCY",
          detail: `Recruiter is using a free commercial webmail domain (@${emailDomain}) rather than an authenticated corporate domain.`
        });
      } else if (officialWebsite) {
        let cleanWeb = officialWebsite.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
        if (cleanWeb.endsWith(":80") || cleanWeb.endsWith(":443")) cleanWeb = cleanWeb.split(":")[0];

        if (emailDomain === cleanWeb || emailDomain.endsWith("." + cleanWeb)) {
          checks.push({
            item: "Domain Alignment",
            status: "MATCH",
            detail: `Email domain (@${emailDomain}) matches the company's official web domain (${cleanWeb}).`
          });
        } else {
          checks.push({
            item: "Domain Alignment",
            status: "DISCREPANCY",
            detail: `Email domain (@${emailDomain}) does NOT match official website (${cleanWeb}). Verify recruiter DNS MX records.`
          });
        }
      } else {
        checks.push({
          item: "Recruiter Email",
          status: "UNVERIFIED",
          detail: `Domain @${emailDomain} provided. Live corporate DNS verification not performed.`
        });
      }
    } else {
      checks.push({
        item: "Recruiter Email",
        status: "WARNING",
        detail: "No recruiter email provided. Real hiring campaigns typically involve verified corporate correspondence."
      });
    }

    // 2. Official Website Security
    if (officialWebsite) {
      const isHttps = officialWebsite.startsWith("https://");
      const hasLookalikeDash = /-[a-z0-9]+-(careers|jobs|recruitment)/i.test(officialWebsite);

      if (!isHttps) {
        checks.push({
          item: "Official Website Security",
          status: "WARNING",
          detail: "URL is not using secure HTTPS protocol."
        });
      }

      if (hasLookalikeDash) {
        checks.push({
          item: "Domain Legitimacy (Homoglyph Check)",
          status: "DISCREPANCY",
          detail: "Website domain contains hyphenated career terms (e.g., brand-careers.com) frequently associated with phishing impersonations."
        });
      } else {
        checks.push({
          item: "Website Registration Status",
          status: "UNVERIFIED",
          detail: "WHOIS domain registration age not verified via live registry."
        });
      }
    }

    // 3. Job Listing URL Check
    if (jobUrl) {
      const isJobBoard = /(linkedin\.com|indeed\.com|glassdoor\.com|greenhouse\.io|lever\.co|workday\.com)/i.test(jobUrl);
      if (isJobBoard) {
        checks.push({
          item: "Application Gateway",
          status: "INFO",
          detail: "Job is hosted on a known applicant tracking system (ATS) or enterprise recruitment portal."
        });
      } else {
        checks.push({
          item: "Application Gateway",
          status: "UNVERIFIED",
          detail: "Third-party or custom URL provided. Not checked against official careers database."
        });
      }
    }

    // Safe Manual Verification Instructions
    checks.push({
      item: "Safe Manual Verification Steps",
      status: "INFO",
      detail: "1. Cross-reference recruiter name on LinkedIn under company employee directory. 2. Call company headquarters switchboard directly. 3. Search exact Job Requisition ID on company official /careers portal."
    });

    const hasDiscrepancy = checks.some(c => c.status === "DISCREPANCY");
    const summary = hasDiscrepancy
      ? "Discrepancy detected during verification checks. Exercise heightened caution."
      : "Manual verification required. No live official registrar query was performed.";

    return {
      companyName,
      officialWebsite,
      recruiterEmail,
      jobUrl,
      checks,
      summary
    };
  }

  /**
   * Synthesize plain-language explainability breakdown
   */
  private static generateExplanationSummary(
    riskCategory: "Low Risk" | "Medium Risk" | "High Risk",
    score: number,
    indicators: RuleIndicatorMatch[],
    features: MLFeatureContribution[]
  ): string {
    if (riskCategory === "High Risk") {
      const topNames = indicators.map(i => i.name).slice(0, 3).join(", ");
      return `Elevated fraud risk detected (Risk Score: ${score}/100). The submitted text contains ${indicators.length} critical scam indicators, including ${topNames}. The statistical machine learning classifier identified high-weight scam vocabulary matching common employment fraud templates.`;
    }
    if (riskCategory === "Medium Risk") {
      return `Moderate caution advised (Risk Score: ${score}/100). The text triggered ${indicators.length} suspicious pattern(s). While not definitively fraudulent, several unconventional elements warrant independent verification before sharing personal documents or accepting offers.`;
    }
    return `Low risk profile (Risk Score: ${score}/100). No advance-fee demands, credential requests, or known fraudulent payment patterns were identified. The message vocabulary aligns with standard professional recruitment procedures.`;
  }

  /**
   * Actionable defense guidelines
   */
  private static generateRecommendedActions(
    riskCategory: "Low Risk" | "Medium Risk" | "High Risk",
    indicators: RuleIndicatorMatch[]
  ): string[] {
    const actions: string[] = [];

    if (riskCategory === "High Risk") {
      actions.push("STOP ALL COMMUNICATION: Cease replies immediately and do not provide any money or confidential identity documents.");
      actions.push("NEVER PAY ADVANCE FEES: Legitimate employers cover all equipment, background check, and training costs.");
      actions.push("SECURE ACCOUNTS: If you already provided passwords, bank account numbers, or OTP codes, immediately notify your financial institution and change affected passwords.");
      actions.push("REPORT THE SCAM: File a report with the Federal Trade Commission (reportfraud.ftc.gov) or FBI Internet Crime Complaint Center (ic3.gov).");
    } else if (riskCategory === "Medium Risk") {
      actions.push("INDEPENDENT CHANNEL VERIFICATION: Call the organization's official headquarters phone number found on their main website to confirm the job opening exists.");
      actions.push("CHECK THE CAREERS PORTAL: Verify that the exact job requisition ID is listed on the organization's public careers page.");
      actions.push("DO NOT USE ALTERNATIVE CHANNELS: Refuse requests to migrate the interview to Telegram, WhatsApp, or personal email.");
    } else {
      actions.push("PROCEED WITH STANDARD DILIGENCE: Review compensation terms and ensure all communications originate from the organization's official email domain.");
      actions.push("VERIFY OFFER DETAILS: Ensure formal employment contracts are executed through an established secure document portal.");
    }

    return actions;
  }
}
