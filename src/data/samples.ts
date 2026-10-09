export interface SampleCase {
  id: string;
  title: string;
  tag: "Scam" | "Legitimate" | "Suspicious";
  category: string;
  expectedRisk: "High Risk" | "Medium Risk" | "Low Risk";
  text: string;
  formatType: "email" | "job_post" | "sms_whatsapp" | "offer_letter";
  verificationData?: {
    companyName: string;
    officialWebsite: string;
    recruiterEmail: string;
    jobUrl?: string;
  };
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: "sample_advance_fee",
    title: "Equipment Advance Fee Scam",
    tag: "Scam",
    category: "Advance-Fee Fraud",
    expectedRisk: "High Risk",
    formatType: "email",
    verificationData: {
      companyName: "Apple Inc.",
      officialWebsite: "https://apple.com",
      recruiterEmail: "apple.hr.logistics@gmail.com",
    },
    text: `Congratulations! You have been selected for an online Data Entry Specialist position paying $65/hour. 

To begin onboarding and receive your brand new Apple MacBook Pro and company mobile phone, our policy requires you to wire a refundable equipment insurance deposit of $250 via Zelle to our designated HR logistics agent. 

Once your Zelle payment is confirmed, the courier tracking number will be provided within 2 hours. Your $250 deposit will be completely reimbursed in your first bi-weekly paycheck.`
  },
  {
    id: "sample_fake_check",
    title: "Counterfeit Check / Money Mule",
    tag: "Scam",
    category: "Financial Laundering",
    expectedRisk: "High Risk",
    formatType: "sms_whatsapp",
    verificationData: {
      companyName: "Apex Global Supplies",
      officialWebsite: "http://apex-global-supplies.net",
      recruiterEmail: "hiring@apex-global-supplies.net",
    },
    text: `URGENT Work from Home Assistant position! We will send you an official cashier's check of $4,500. 

You will deposit the check into your personal bank account, keep $500 as your weekly advance salary, and transfer the remaining $4,000 via Bitcoin ATM or Western Union to our certified software vendor to set up your home workstation. 

Do not mention the software vendor to your bank teller. Send confirmation slip to our WhatsApp support immediately.`
  },
  {
    id: "sample_credential_theft",
    title: "Phishing & Identity / PIN Harvesting",
    tag: "Scam",
    category: "Credential Theft",
    expectedRisk: "High Risk",
    formatType: "email",
    verificationData: {
      companyName: "Bank of America",
      officialWebsite: "https://bankofamerica.com",
      recruiterEmail: "bofa-careers-portal@consultant.com",
    },
    text: `Dear applicant, your remote audit role with Bank of America is confirmed. 

Before we can dispatch your employee badge, company compliance mandates immediate verification of your direct deposit account. 

Please reply with:
1. Full Social Security Number (SSN)
2. Front and back photo of your driver's license
3. Online banking login username and debit card PIN
4. Mother's maiden name

Failure to respond within 24 hours will result in forfeiture of your position.`
  },
  {
    id: "sample_telegram_task",
    title: "Unrealistic Pay & Telegram Task Scam",
    tag: "Scam",
    category: "Social Engineering",
    expectedRisk: "High Risk",
    formatType: "sms_whatsapp",
    text: `Hi! We noticed your profile on Indeed. Amazon Customer Support is urgently hiring 15 remote clerks! 

Daily salary: $500 for just 1 to 2 hours of simple mobile tasks. No interview or experience needed! 

Message our hiring bot on Telegram right now: @amazon_hiring_manager_bot to claim your spot. Limited slots available, act fast within 2 hours!`
  },
  {
    id: "sample_ambiguous_freelance",
    title: "Ambiguous Freelance Editor (Gmail Recruiter)",
    tag: "Suspicious",
    category: "Unverified Outreach",
    expectedRisk: "Medium Risk",
    formatType: "email",
    verificationData: {
      companyName: "Apex Media Creative",
      officialWebsite: "http://apexmediacreative.org",
      recruiterEmail: "apexmedia.recruiter22@gmail.com",
    },
    text: `Hello, I came across your portfolio online and wanted to check if you are open to contract writing and video captioning work. 

The pay is $45 per article. We work with various lifestyle blogs. We do not have a formal interview process for this tier, but we would need you to complete a brief trial assignment. 

Reach back out to me at this Gmail address if you would like to proceed with the brief trial.`
  },
  {
    id: "sample_legit_stripe",
    title: "Legitimate Senior Systems Engineer (Stripe)",
    tag: "Legitimate",
    category: "Corporate Recruitment",
    expectedRisk: "Low Risk",
    formatType: "email",
    verificationData: {
      companyName: "Stripe",
      officialWebsite: "https://stripe.com",
      recruiterEmail: "talent@stripe.com",
      jobUrl: "https://stripe.com/jobs/infrastructure-systems-491",
    },
    text: `Hi Alex,

Thank you for your interest in Stripe! We reviewed your background and open-source contributions, and our engineering leadership team would love to invite you for a 45-minute technical video screen for our Infrastructure Systems Engineer position.

The call will be conducted via Google Meet with one of our staff engineers. We will discuss distributed systems scalability and walkthrough an architectural problem.

Please select a convenient time using our recruiting portal at careers.stripe.com/schedule. You can review our engineering interview prep guide attached to this message.

Best regards,
Stripe Talent Acquisition Team`
  },
  {
    id: "sample_legit_university",
    title: "Legitimate University Research Assistant",
    tag: "Legitimate",
    category: "Academic Recruitment",
    expectedRisk: "Low Risk",
    formatType: "job_post",
    verificationData: {
      companyName: "Stanford University",
      officialWebsite: "https://stanford.edu",
      recruiterEmail: "cs-hiring@cs.stanford.edu",
      jobUrl: "https://stanford.edu/careers/req-40291",
    },
    text: `Position: Graduate Research Assistant — Natural Language Processing Group
Department: Computer Science, Stanford University
Appointment: 50% FTE (20 hours/week)
Stipend: Standard University graduate student assistantship scale plus full tuition allowance.

Responsibilities:
- Collaborate with faculty and postdoctoral scholars on training parameter-efficient language models.
- Assist in preparing empirical evaluations for submissions to ACL and NeurIPS.
- Participate in weekly laboratory seminars and present intermediate findings.

Requirements:
- Enrolled graduate student in Computer Science, Statistics, or related technical disciplines.
- Proficiency in PyTorch, Python, and modern transformer architectures.
- Applications must be submitted through the official Stanford University Postdoctoral & Graduate Job Portal.`
  }
];
