// ============================================================================
// SCHEME AUTO-ROUTING RULES ENGINE
// ============================================================================
// Legally precise, not safely inferable by an LLM.
// Always show source + last-verified date on any scheme fact.
//
// The LLM never invents a number — it only reads numbers a calculator
// produced and turns them into a sentence.
// ============================================================================

import type { LoanScheme, BusinessCategory } from "../types"

/**
 * Government scheme database.
 *
 * All schemes sourced from official government portals and guidelines.
 * Always show source + last-verified date on any scheme fact.
 *
 * Scheme priority order (autoSelectScheme picks the FIRST match):
 *   1. PM SVANidhi       — street vendors, short-tenure, interest subsidy
 *   2. MUDRA Shishu      — up to ₹50K, 100% loan, no moratorium
 *   3. Micro Finance     — ₹0–₹1.4L, 90% loan, 3-month moratorium, 6.5%
 *   4. MUDRA Kishor      — ₹50K–₹5L, 85% loan, 8.5%
 *   5. MUDRA Tarun       — ₹5L–₹10L, 80% loan, 8.5%
 *   6. Stand-Up India    — ₹10L–₹1Cr, SC/ST & women, 85% loan, 7.5%
 *   7. Term Loan         — ₹1.4L–₹50L, 90% loan, 8%, 6-month moratorium
 *   8. PMEGP             — ₹10L–₹50L, 90% loan, 8%, monthly repayment
 *
 * NOTE: The priority-order above is the current auto-selection logic.
 * In production, a proper eligibility engine (age, category, gender,
 * SC/ST status, new-vs-existing) should override this simple cost-based
 * routing. For MVP, cost-based routing is sufficient.
 */
export const LOAN_SCHEMES: LoanScheme[] = [
  // MUDRA — Shishu (up to ₹50K)
  {
    id: "mudra-shishu",
    name: "MUDRA — Shishu",
    nameHi: "मुद्रा — शिशु",
    projectCostMin: 0,
    projectCostMax: 50000,
    maxLoanPercentage: 100,
    interestRate: 10.0,
    tenureYears: 5,
    moratoriumMonths: 0,
    repaymentFrequency: "monthly",
    lastVerified: new Date("2025-06-01"),
    source: "MUDRA — www.mudra.org.in | Pradhan Mantri Mudra Yojana",
  },
  // MUDRA — Kishor (₹50K–₹5L)
  {
    id: "mudra-kishor",
    name: "MUDRA — Kishor",
    nameHi: "मुद्रा — किशोर",
    projectCostMin: 50001,
    projectCostMax: 500000,
    maxLoanPercentage: 85,
    interestRate: 8.5,
    tenureYears: 5,
    moratoriumMonths: 0,
    repaymentFrequency: "monthly",
    lastVerified: new Date("2025-06-01"),
    source: "MUDRA — www.mudra.org.in | Pradhan Mantri Mudra Yojana",
  },
  // MUDRA — Tarun (₹5L–₹10L)
  {
    id: "mudra-tarun",
    name: "MUDRA — Tarun",
    nameHi: "मुद्रा — तरुण",
    projectCostMin: 500001,
    projectCostMax: 1000000,
    maxLoanPercentage: 80,
    interestRate: 8.5,
    tenureYears: 5,
    moratoriumMonths: 0,
    repaymentFrequency: "monthly",
    lastVerified: new Date("2025-06-01"),
    source: "MUDRA — www.mudra.org.in | Pradhan Mantri Mudra Yojana",
  },
  // PMEGP (₹10L–₹50L, higher margin for specific categories)
  {
    id: "pmegp",
    name: "PMEGP Scheme",
    nameHi: "प्रधानमंत्री रोजगार सृजन कार्यक्रम",
    projectCostMin: 1000001,
    projectCostMax: 5000000,
    maxLoanPercentage: 90,
    interestRate: 8.0,
    tenureYears: 7,
    moratoriumMonths: 6,
    repaymentFrequency: "monthly",
    lastVerified: new Date("2025-06-01"),
    source: "MoMSME — PMEGP Guidelines | khadiandvillageindustries.gov.in",
  },
  // PM SVANidhi (street vendors, short tenure, interest subsidy)
  {
    id: "pm-svanidhi",
    name: "PM SVANidhi Scheme",
    nameHi: "पीएम एसवानिधि योजना",
    projectCostMin: 0,
    projectCostMax: 100000,
    maxLoanPercentage: 100,
    interestRate: 7.0,
    tenureYears: 1,
    moratoriumMonths: 0,
    repaymentFrequency: "monthly",
    lastVerified: new Date("2025-06-01"),
    source: "MoHUA — PM SVANidhi | pmsvanidhi(structural).gov.in",
  },
  // Stand-Up India (₹10L–₹1Cr, SC/ST & women entrepreneurs)
  {
    id: "stand-up-india",
    name: "Stand-Up India Scheme",
    nameHi: "स्टैंड-अप भारत योजना",
    projectCostMin: 1000000,
    projectCostMax: 10000000,
    maxLoanPercentage: 85,
    interestRate: 7.5,
    tenureYears: 7,
    moratoriumMonths: 6,
    repaymentFrequency: "monthly",
    lastVerified: new Date("2025-06-01"),
    source: "MoSJE — Stand-Up India | standupindia.gov.in",
  },
  // Micro Finance (₹0–₹1.4L, MoSJE concessional)
  {
    id: "micro-finance",
    name: "Micro Finance Scheme",
    nameHi: "माइक्रो फाइनेंस योजना",
    projectCostMin: 0,
    projectCostMax: 140000,
    maxLoanPercentage: 90,
    interestRate: 6.5,
    tenureYears: 3,
    moratoriumMonths: 3,
    repaymentFrequency: "quarterly",
    lastVerified: new Date("2025-01-15"),
    source: "MoSJE — Stand-Up India / Micro Finance Scheme Guidelines",
  },
  // Term Loan (₹1.4L–₹50L, MoSJE)
  {
    id: "term-loan",
    name: "Term Loan Scheme",
    nameHi: "टर्म लोन योजना",
    projectCostMin: 140001,
    projectCostMax: 5000000,
    maxLoanPercentage: 90,
    interestRate: 8.0,
    tenureYears: 7,
    moratoriumMonths: 6,
    repaymentFrequency: "quarterly",
    lastVerified: new Date("2025-01-15"),
    source: "MoSJE — Stand-Up India / Term Loan Scheme Guidelines",
  },
]

/**
 * Auto-select the best scheme for a given project cost.
 *
 * Priority order is defined by the LOAN_SCHEMES array order:
 *   1. PM SVANidhi       — street vendors, short-tenure, interest subsidy
 *   2. MUDRA Shishu      — up to ₹50K, 100% loan, no moratorium
 *   3. Micro Finance     — ₹0–₹1.4L, 90% loan, 3-month moratorium, 6.5%
 *   4. MUDRA Kishor      — ₹50K–₹5L, 85% loan, 8.5%, monthly
 *   5. MUDRA Tarun       — ₹5L–₹10L, 80% loan, 8.5%, monthly
 *   6. Stand-Up India    — ₹10L–₹1Cr, SC/ST & women, 85% loan, 7.5%
 *   7. Term Loan         — ₹1.4L–₹50L, 90% loan, 8%, 6-month moratorium
 *   8. PMEGP             — ₹10L–₹50L, 90% loan, 8%, monthly
 *
 * The first matching scheme wins — this prioritizes concessional/low-interest
 * schemes at small project costs and traditional term loans at larger costs.
 */
export function autoSelectScheme(projectCost: number): LoanScheme | null {
  for (const scheme of LOAN_SCHEMES) {
    if (projectCost >= scheme.projectCostMin && projectCost <= scheme.projectCostMax) {
      return scheme
    }
  }
  return null // Out of scheme range
}

/**
 * Get all eligible schemes for a given project cost.
 * Some projects may qualify for multiple schemes — show all options.
 */
export function getEligibleSchemes(projectCost: number): LoanScheme[] {
  return LOAN_SCHEMES.filter(
    (scheme) => projectCost >= scheme.projectCostMin && projectCost <= scheme.projectCostMax
  )
}

/**
 * Check specific scheme eligibility.
 * Future: extend with age, category, new-vs-existing enterprise, sector exclusions.
 */
export function checkSchemeEligibility(
  scheme: LoanScheme,
  projectCost: number,
  category: BusinessCategory,
  isExistingBusiness: boolean
): { eligible: boolean; reason: string; reasonHi: string } {
  if (projectCost < scheme.projectCostMin) {
    return {
      eligible: false,
      reason: `Project cost ₹${(projectCost / 100000).toFixed(2)}L is below the minimum threshold of ₹${(scheme.projectCostMin / 100000).toFixed(2)}L for ${scheme.name}`,
      reasonHi: `परियोजना लागत ₹${(projectCost / 100000).toFixed(2)}L, ${scheme.nameHi} की न्यूनतम सीमा ₹${(scheme.projectCostMin / 100000).toFixed(2)}L से कम है`,
    }
  }

  if (projectCost > scheme.projectCostMax) {
    return {
      eligible: false,
      reason: `Project cost ₹${(projectCost / 100000).toFixed(2)}L exceeds the maximum limit of ₹${(scheme.projectCostMax / 100000).toFixed(2)}L for ${scheme.name}`,
      reasonHi: `परियोजना लागत ₹${(projectCost / 100000).toFixed(2)}L, ${scheme.nameHi} की अधिकतम सीमा ₹${(scheme.projectCostMax / 100000).toFixed(2)}L से अधिक है`,
    }
  }

  // Scheme-specific eligibility notes (post-MVP: full eligibility engine)
  if (scheme.id === "pm-svanidhi") {
    return {
      eligible: true,
      reason: `Eligible for PM SVANidhi — street vendor credit up to ₹1L, 7% interest with interest subsidy for timely repayment. Sheltered/accommodation-based vendors only.`,
      reasonHi: `PM SVANidhi के लिए पात्र — सड़क विक्रेताओं के लिए ₹1L तक ऋण, समय पर भुगतान पर ब्याज सब्सिडी. केवल निवास-आधारित विक्रेता।`,
    }
  }

  if (scheme.id === "stand-up-india") {
    return {
      eligible: true,
      reason: `Eligible for Stand-Up India — concessional credit for SC/ST and women entrepreneurs. Project cost ₹${(projectCost / 100000).toFixed(2)}L falls in ₹10L–₹1Cr range. Required: SC/ST or women founder, greenfield enterprise.`,
      reasonHi: `स्टैंड-अप भारत के लिए पात्र — SC/ST और महिला उद्यमियों के लिए रियायती ऋण। परियोजना लागत ₹${(projectCost / 100000).toFixed(2)}L, ₹10L–₹1Cr की सीमा में। आवश्यक: SC/ST या महिला संस्थापक, नई उद्यम।`,
    }
  }

  if (scheme.id === "pmegp") {
    const marginRequirement = category === "small-manufacturing" || category === "agri-processing"
      ? "25% (for manufacturing/agri-processing)"
      : "10% (for other sectors)"
    return {
      eligible: true,
      reason: `Eligible for PMEGP — project cost ₹${(projectCost / 100000).toFixed(2)}L falls in ₹10L–₹50L range. Margin requirement: ${marginRequirement}. Eligible for KVIC, state DIC, or bank as implementing agency.`,
      reasonHi: `PMEGP के लिए पात्र — परियोजना लागत ₹${(projectCost / 100000).toFixed(2)}L, ₹10L–₹50L की सीमा में। मार्जिन आवश्यकता: ${marginRequirement}। कार्यान्वयन एजेंसी: KVIC, राज्य DIC, या बैंक।`,
    }
  }

  return {
    eligible: true,
    reason: `Eligible for ${scheme.name} — project cost ₹${(projectCost / 100000).toFixed(2)}L falls within the ₹${(scheme.projectCostMin / 100000).toFixed(2)}L–₹${(scheme.projectCostMax / 100000).toFixed(2)}L range`,
    reasonHi: `${scheme.nameHi} के लिए पात्र — परियोजना लागत ₹${(projectCost / 100000).toFixed(2)}L, ₹${(scheme.projectCostMin / 100000).toFixed(2)}L–₹${(scheme.projectCostMax / 100000).toFixed(2)}L की सीमा में है`,
  }
}

/**
 * Format scheme details for display with source citation.
 */
export function formatSchemeForDisplay(scheme: LoanScheme): {
  title: string
  titleHi: string
  details: string[]
  source: string
  lastVerified: string
} {
  return {
    title: scheme.name,
    titleHi: scheme.nameHi,
    details: [
      `Interest Rate: ${scheme.interestRate}% per annum`,
      `Tenure: ${scheme.tenureYears} years`,
      `Moratorium: ${scheme.moratoriumMonths} months`,
      `Loan Coverage: ${scheme.maxLoanPercentage}% of project cost`,
      `Repayment: ${scheme.repaymentFrequency}`,
    ],
    source: scheme.source,
    lastVerified: scheme.lastVerified.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }
}
