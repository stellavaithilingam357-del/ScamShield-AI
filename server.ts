/**
 * ScamShield AI — Express Full-Stack Server
 * Hosts REST API endpoints and mounts Vite dev middleware on port 3000.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { ScamShieldEngine, AnalysisResult } from './server/engine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Persistent History Store File
const DATA_DIR = path.resolve(__dirname, 'data');
const HISTORY_FILE = path.resolve(DATA_DIR, 'history.json');
const DATASET_FILE = path.resolve(DATA_DIR, 'job_scam_dataset.csv');

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
let geminiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  geminiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-Memory cache for History with file fallback
let historyStore: AnalysisResult[] = [];

function loadHistory(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(HISTORY_FILE)) {
      const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
      historyStore = JSON.parse(raw);
    } else {
      // Seed initial high-quality demonstration records
      seedDefaultHistory();
      saveHistory();
    }
  } catch (err) {
    console.error('[!] Error loading history file:', err);
    historyStore = [];
    seedDefaultHistory();
  }
}

function saveHistory(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[!] Error saving history:', err);
  }
}

function seedDefaultHistory(): void {
  const seed1 = ScamShieldEngine.analyze(
    "Congratulations! You have been selected for an online Data Entry Specialist position paying $65/hour. To begin onboarding and receive your Apple MacBook and company phone, please wire a refundable equipment insurance deposit of $250 via Zelle to our HR logistics agent.",
    "email",
    {
      companyName: "Apple Inc.",
      officialWebsite: "https://apple.com",
      recruiterEmail: "apple.hr.logistics@gmail.com"
    }
  );

  const seed2 = ScamShieldEngine.analyze(
    "We reviewed your application for the Software Engineer role at Stripe. We would like to invite you for a 45-minute technical phone screen next Tuesday. Please find our engineering interview guide attached and select a time on our official portal at careers.stripe.com.",
    "job_post",
    {
      companyName: "Stripe",
      officialWebsite: "https://stripe.com",
      recruiterEmail: "talent@stripe.com",
      jobUrl: "https://careers.stripe.com/jobs/se-infra-891"
    }
  );

  const seed3 = ScamShieldEngine.analyze(
    "Work from Home Assistant position! We will send you an official cashier's check of $4,500. You will deposit the check into your personal bank account, keep $500 as your weekly advance salary, and transfer the remaining $4,000 via Bitcoin ATM to our software vendor.",
    "sms_whatsapp"
  );

  historyStore = [seed1, seed2, seed3];
}

// Load data on start
loadHistory();

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'ScamShield AI Core Server',
    version: '1.0.0',
    geminiEnabled: Boolean(geminiClient),
    historyCount: historyStore.length,
    datasetAvailable: fs.existsSync(DATASET_FILE),
  });
});

// 2. Analyze job text
app.post('/api/analyze', (req: Request, res: Response) => {
  try {
    const { text, formatType, companyName, officialWebsite, recruiterEmail, jobUrl } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text field is required and must be a string.' });
      return;
    }

    if (text.trim().length === 0) {
      res.status(400).json({ error: 'Cannot analyze empty text.' });
      return;
    }

    if (text.length > 50000) {
      res.status(400).json({ error: 'Text exceeds maximum character limit of 50,000.' });
      return;
    }

    const verificationInput = (companyName || officialWebsite || recruiterEmail || jobUrl)
      ? { companyName, officialWebsite, recruiterEmail, jobUrl }
      : undefined;

    const result = ScamShieldEngine.analyze(text, formatType || 'auto', verificationInput);

    // Save to persistent history
    historyStore.unshift(result);
    // Keep max 200 items in history
    if (historyStore.length > 200) {
      historyStore = historyStore.slice(0, 200);
    }
    saveHistory();

    res.json(result);
  } catch (err: any) {
    console.error('[!] Analysis error:', err);
    res.status(500).json({ error: err.message || 'Internal server error during analysis.' });
  }
});

// 3. Recruiter Verification
app.post('/api/verify-recruiter', (req: Request, res: Response) => {
  try {
    const { companyName, officialWebsite, recruiterEmail, jobUrl } = req.body;
    const report = ScamShieldEngine.verifyRecruiter({
      companyName,
      officialWebsite,
      recruiterEmail,
      jobUrl,
    });
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing recruiter verification.' });
  }
});

// 4. Analysis History List with search & filters
app.get('/api/history', (req: Request, res: Response) => {
  try {
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const riskCategory = (req.query.riskCategory as string) || 'all';

    let filtered = historyStore;

    if (riskCategory && riskCategory !== 'all') {
      filtered = filtered.filter(item => item.riskCategory.toLowerCase() === riskCategory.toLowerCase());
    }

    if (search) {
      filtered = filtered.filter(item =>
        item.inputTextExcerpt.toLowerCase().includes(search) ||
        item.fullText.toLowerCase().includes(search) ||
        item.detectedIndicators.some(i => i.name.toLowerCase().includes(search))
      );
    }

    res.json({
      total: filtered.length,
      items: filtered,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve analysis history.' });
  }
});

// 5. Individual History Item
app.get('/api/history/:id', (req: Request, res: Response) => {
  const item = historyStore.find(i => i.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Analysis record not found.' });
    return;
  }
  res.json(item);
});

// 6. Delete single history item
app.delete('/api/history/:id', (req: Request, res: Response) => {
  const initialLength = historyStore.length;
  historyStore = historyStore.filter(i => i.id !== req.params.id);
  if (historyStore.length === initialLength) {
    res.status(404).json({ error: 'Analysis record not found.' });
    return;
  }
  saveHistory();
  res.json({ success: true, message: 'Record deleted successfully.' });
});

// 7. Clear all history
app.delete('/api/history', (req: Request, res: Response) => {
  historyStore = [];
  saveHistory();
  res.json({ success: true, message: 'All analysis history cleared.' });
});

// 8. Computed Analytics Dashboard data
app.get('/api/analytics', (req: Request, res: Response) => {
  try {
    const total = historyStore.length;
    const lowRiskCount = historyStore.filter(i => i.riskCategory === 'Low Risk').length;
    const mediumRiskCount = historyStore.filter(i => i.riskCategory === 'Medium Risk').length;
    const highRiskCount = historyStore.filter(i => i.riskCategory === 'High Risk').length;

    const avgRiskScore = total > 0
      ? Math.round(historyStore.reduce((acc, curr) => acc + curr.riskScore, 0) / total)
      : 0;

    // Indicator Frequency Count
    const indicatorCounts: Record<string, { count: number; name: string; severity: string }> = {};
    for (const record of historyStore) {
      for (const ind of record.detectedIndicators) {
        if (!indicatorCounts[ind.id]) {
          indicatorCounts[ind.id] = { count: 0, name: ind.name, severity: ind.severity };
        }
        indicatorCounts[ind.id].count += 1;
      }
    }

    const topIndicators = Object.entries(indicatorCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Recent 10 analyses timeline
    const recentTimeline = historyStore.slice(0, 10).map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      riskScore: r.riskScore,
      riskCategory: r.riskCategory,
      indicatorsCount: r.detectedIndicators.length,
      excerpt: r.inputTextExcerpt,
    }));

    res.json({
      totalAnalyses: total,
      riskDistribution: {
        low: lowRiskCount,
        medium: mediumRiskCount,
        high: highRiskCount,
      },
      averageRiskScore: avgRiskScore,
      topIndicators,
      recentTimeline,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute analytics.' });
  }
});

// 9. Download Dataset CSV
app.get('/api/dataset/csv', (req: Request, res: Response) => {
  if (fs.existsSync(DATASET_FILE)) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="scamshield_job_dataset.csv"');
    const stream = fs.createReadStream(DATASET_FILE);
    stream.pipe(res);
  } else {
    res.status(404).json({ error: 'Dataset file not found.' });
  }
});

// 10. Dataset JSON explorer endpoint
app.get('/api/dataset/json', (req: Request, res: Response) => {
  if (!fs.existsSync(DATASET_FILE)) {
    res.status(404).json({ error: 'Dataset file not found.' });
    return;
  }
  const content = fs.readFileSync(DATASET_FILE, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const rows = [];
  // Parse simple CSV with quoted text
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(\d+),"(.*)",(\d+),([^,]+),"(.*)"$/);
    if (match) {
      rows.push({
        id: parseInt(match[1], 10),
        message_text: match[2],
        label: parseInt(match[3], 10),
        scam_type: match[4],
        warning_indicators: match[5],
      });
    }
  }
  res.json({ total: rows.length, rows });
});

// 11. Deep AI Explanation with Server-Side Gemini (gemini-3.8-flash)
app.post('/api/gemini/explain', async (req: Request, res: Response) => {
  try {
    const { text, riskScore, indicators } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text required.' });
      return;
    }

    if (!geminiClient) {
      // Graceful fallback when API key not configured
      res.json({
        available: false,
        source: 'Heuristic Synthesis (Gemini API key not configured)',
        explanation: 'Server-side Gemini 3.8 Flash analysis requires GEMINI_API_KEY environment variable. ScamShield baseline ML and Rule-Based indicator inspection are active and fully operational.',
      });
      return;
    }

    const indicatorNames = (indicators || []).map((i: any) => i.name).join(', ');
    const prompt = `You are a Principal Threat Intelligence & Cybersecurity Fraud Forensic Analyst.
Evaluate this job solicitation message:
"${text.substring(0, 3000)}"

Context:
- Baseline Risk Score: ${riskScore || 'Unknown'}/100
- Flags Detected: ${indicatorNames || 'None'}

Provide a structured, explainable threat report covering:
1. Threat Persona & Attack Vector: Who is the suspected threat actor and what scam playbook are they executing?
2. Social Engineering Mechanisms: How are psychological urgency, authority, or financial greed weaponized?
3. Technical Red Flags: Exact indicators (unregistered domains, P2P payment channels, check bounce mechanisms).
4. Direct Countermeasures: Exactly what steps the candidate must take to protect their identity and finances.

Be concise, authoritative, objective, and professional.`;

    const response = await geminiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an explainable fraud detection specialist at ScamShield AI. Do not speculate beyond the text provided.',
      },
    });

    res.json({
      available: true,
      source: 'Gemini 3.8 Flash Threat Forensics',
      explanation: response.text || 'Analysis completed with no additional commentary.',
    });
  } catch (err: any) {
    console.error('[!] Gemini API Error:', err);
    res.status(500).json({
      error: 'Failed to generate deep AI explanation.',
      details: err.message,
    });
  }
});

// -------------------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC ASSETS
// -------------------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[✓] ScamShield AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[!] Fatal error starting server:', err);
  process.exit(1);
});
