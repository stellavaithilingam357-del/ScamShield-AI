/**
 * ScamShield AI — Automated Test Suite
 * Validates Rule-Based Heuristics, ML Inference, Edge Cases, and Recruiter Verification.
 */

import { ScamShieldEngine } from '../server/engine.ts';

function runTests() {
  console.log("=== SCAMSHIELD AI TEST SUITE STARTING ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Empty Text Validation
  try {
    ScamShieldEngine.analyze("   ");
    assert(false, "Test 1: Empty text should throw error");
  } catch (err: any) {
    assert(err.message.includes("empty"), "Test 1: Empty text throws expected error");
  }

  // 2. Extremely Long Text (> 50,000 chars)
  try {
    const huge = "a".repeat(50001);
    ScamShieldEngine.analyze(huge);
    assert(false, "Test 2: Extremely long text should throw error");
  } catch (err: any) {
    assert(err.message.includes("exceeds"), "Test 2: Oversized text throws expected error");
  }

  // 3. Legitimate Job Offer (Low Risk)
  const legitText = `Hi Alex, thank you for interviewing for the Software Engineer role at Stripe. We would like to invite you for a 45-minute technical video screen next Tuesday on our official careers portal at careers.stripe.com.`;
  const legitResult = ScamShieldEngine.analyze(legitText, "email", {
    companyName: "Stripe",
    officialWebsite: "https://stripe.com",
    recruiterEmail: "talent@stripe.com"
  });
  assert(legitResult.riskCategory === "Low Risk", "Test 3a: Legitimate job offer produces Low Risk");
  assert(legitResult.riskScore < 35, `Test 3b: Legitimate score is low (${legitResult.riskScore}/100)`);
  assert(legitResult.detectedIndicators.length === 0, "Test 3c: Zero fraudulent indicators detected for legitimate offer");

  // 4. Advance-Fee Scam (High Risk)
  const advanceFeeText = `Congratulations! You are hired for Data Entry paying $65/hr. To receive your Apple MacBook, wire a refundable equipment deposit of $250 via Zelle to our HR coordinator.`;
  const scamResult = ScamShieldEngine.analyze(advanceFeeText, "email");
  assert(scamResult.riskCategory === "High Risk", "Test 4a: Advance-fee scam produces High Risk");
  assert(scamResult.riskScore >= 70, `Test 4b: Score reflects severe threat (${scamResult.riskScore}/100)`);
  assert(scamResult.detectedIndicators.some(i => i.id === "advance_fee_payment"), "Test 4c: Advance-fee indicator triggered");
  assert(scamResult.detectedIndicators.some(i => i.id === "p2p_crypto_channels"), "Test 4d: P2P payment channel (Zelle) triggered");

  // 5. Credential Theft / Phishing (High Risk)
  const phishingText = `Your Bank of America position is approved. Reply immediately with your full Social Security Number (SSN), mother's maiden name, and your bank account PIN for direct deposit activation.`;
  const phishingResult = ScamShieldEngine.analyze(phishingText, "email");
  assert(phishingResult.riskCategory === "High Risk", "Test 5a: Credential phishing produces High Risk");
  assert(phishingResult.detectedIndicators.some(i => i.id === "credential_sensitive_harvesting"), "Test 5b: Credential harvesting indicator triggered");

  // 6. Fake Check / Reshipping Scheme
  const fakeCheckText = `We will send you an official cashier's check of $4,500. Deposit it in your bank, keep $500, and wire the remaining $4,000 via Bitcoin ATM to our software contractor.`;
  const fakeCheckResult = ScamShieldEngine.analyze(fakeCheckText, "sms_whatsapp");
  assert(fakeCheckResult.detectedIndicators.some(i => i.id === "fake_check_overpayment"), "Test 6: Fake check / overpayment indicator triggered");

  // 7. Interactive Text Highlighting Offset Integrity
  assert(scamResult.highlightSpans.length > 0, "Test 7a: Highlights generated");
  for (const span of scamResult.highlightSpans) {
    const extracted = advanceFeeText.substring(span.start, span.end);
    assert(extracted.toLowerCase() === span.phrase.toLowerCase(), `Test 7b: Span offset exact substring matches ("${span.phrase}")`);
  }

  // 8. Recruiter Verification Domain Mismatch
  const mismatchVerification = ScamShieldEngine.verifyRecruiter({
    companyName: "Apple",
    officialWebsite: "https://apple.com",
    recruiterEmail: "apple.hr.team@gmail.com"
  });
  const emailCheck = mismatchVerification.checks.find(c => c.item === "Recruiter Email Domain");
  assert(emailCheck?.status === "DISCREPANCY", "Test 8a: Free webmail detected as discrepancy for corporate recruiter");

  const matchVerification = ScamShieldEngine.verifyRecruiter({
    companyName: "Stripe",
    officialWebsite: "https://stripe.com",
    recruiterEmail: "recruiting@stripe.com"
  });
  const domainCheck = matchVerification.checks.find(c => c.item === "Domain Alignment");
  assert(domainCheck?.status === "MATCH", "Test 8b: Matching domain verified");

  console.log(`\n=== TEST SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
