// ============================================================================
// BUSINESS HEALTH CLASSIFICATION RULES ENGINE
// ============================================================================
// Because these users have no patience for dashboards, the tracker must
// output a VERDICT, not just numbers.
//
// Rules:
//   Thriving  — Net margin comfortably clears Risk Buffer; flat-to-rising trend
//   Surviving — Positive net cash surplus but thin — no cushion for a bad month
//   At Risk   — Net cash surplus trending toward zero/negative over 2+ periods
// ============================================================================

import type {
  MonthlyEntry,
  QuarterlyAggregation,
  HealthReport,
  HealthInsight,
  HealthState,
  FinancialCalculation,
} from "../types"
import {
  calculateGrossMarginPercent,
  calculateNetMarginPercent,
  calculateDSCR,
  calculateRiskBuffer,
} from "../engine/financial"

/**
 * Aggregate monthly entries into a quarterly summary.
 */
export function aggregateQuarterly(
  entries: MonthlyEntry[],
  quarter: string
): QuarterlyAggregation {
  const quarterEntries = entries.filter((e) => {
    const month = new Date(e.month)
    const q = Math.ceil((month.getMonth() + 1) / 3)
    return `Q${q}-${month.getFullYear()}` === quarter
  })

  const totalRevenue = quarterEntries.reduce((sum, e) => sum + e.revenue, 0)
  const totalCOGS = quarterEntries.reduce((sum, e) => sum + e.cogs, 0)
  const totalOpEx = quarterEntries.reduce((sum, e) => sum + e.operatingExpenses, 0)
  const totalEMI = quarterEntries.reduce((sum, e) => sum + e.emiPaid, 0)

  const netCashSurplus = totalRevenue - totalCOGS - totalOpEx - totalEMI
  const grossMarginPercent = calculateGrossMarginPercent(totalRevenue, totalCOGS)
  const netMarginPercent = calculateNetMarginPercent(netCashSurplus, totalRevenue)

  // DSCR (quarterly annualized)
  const annualNetOperatingIncome = (totalRevenue - totalCOGS - totalOpEx) * 4
  const annualDebtService = totalEMI * 4
  const dscr = calculateDSCR(annualNetOperatingIncome, annualDebtService)

  // Health classification
  // Compare monthly net cash surplus against the Risk Buffer threshold
  const monthlyNetCashSurplus = netCashSurplus / 3
  const monthlyEMI = totalEMI / 3
  const riskBuffer = calculateRiskBuffer(monthlyEMI)
  const riskBufferMet = monthlyNetCashSurplus >= riskBuffer

  const healthState = classifyHealth(netMarginPercent, riskBufferMet, dscr)

  return {
    quarter,
    totalRevenue,
    totalCOGS,
    totalOpEx,
    totalEMI,
    netCashSurplus,
    grossMarginPercent,
    netMarginPercent,
    dscr,
    healthState,
    riskBufferMet,
  }
}

/**
 * Classify business health based on net margin, risk buffer, and DSCR.
 *
 * Thresholds (industry-standard benchmarks for micro-enterprises):
 *   Thriving  — Net margin ≥ 20% AND Risk Buffer met AND DSCR ≥ 1.25
 *               (comfortably clears all safety thresholds)
 *   At Risk   — Net margin < 5% OR DSCR < 1.0 OR Risk Buffer breached
 *               (cannot reliably service debt from operations)
 *   Surviving — Positive but below thriving thresholds
 *               (EMI is being paid but no cushion for a bad month)
 */
export function classifyHealth(
  netMarginPercent: number,
  riskBufferMet: boolean,
  dscr: number
): HealthState {
  // Thriving: healthy margin, risk buffer met, good DSCR
  if (netMarginPercent >= 20 && riskBufferMet && dscr >= 1.25) {
    return "thriving"
  }

  // At Risk: thin margin or DSCR below 1
  if (netMarginPercent < 5 || dscr < 1.0 || !riskBufferMet) {
    return "at-risk"
  }

  // Surviving: positive but thin
  return "surviving"
}

/**
 * Determine trend from quarterly data (improving, stable, declining).
 */
export function determineTrend(
  current: QuarterlyAggregation,
  previous?: QuarterlyAggregation
): "improving" | "stable" | "declining" {
  if (!previous) return "stable"

  const marginDiff = current.netMarginPercent - previous.netMarginPercent
  if (marginDiff > 3) return "improving"
  if (marginDiff < -3) return "declining"
  return "stable"
}

/**
 * Generate specific, actionable insights — NOT generic advice.
 * Every insight must point to a specific line item.
 */
export function generateInsights(
  current: QuarterlyAggregation,
  previous: QuarterlyAggregation | undefined,
  financialCalc: FinancialCalculation
): HealthInsight[] {
  const insights: HealthInsight[] = []

  // COGS rising faster than revenue
  if (previous && current.totalCOGS > previous.totalCOGS) {
    const cogsGrowth = ((current.totalCOGS - previous.totalCOGS) / previous.totalCOGS) * 100
    const revenueGrowth = previous.totalRevenue > 0
      ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100
      : 0

    if (cogsGrowth > revenueGrowth) {
      insights.push({
        id: `cogs-rising-${current.quarter}`,
        type: "warning",
        metric: "COGS",
        message: `Your raw material cost increased by ${cogsGrowth.toFixed(1)}% while revenue grew only ${revenueGrowth.toFixed(1)}%. This is eating your margin — check your supplier prices.`,
        messageHi: `आपकी कच्चे माल की लागत ${cogsGrowth.toFixed(1)}% बढ़ गई जबकि राजस्व केवल ${revenueGrowth.toFixed(1)}% बढ़ा। यह आपके मार्जिन को खा रहा है — अपने सप्लायर की कीमत चेक करें।`,
        severity: "warning",
        linkedLineItem: "COGS / Raw Material Cost",
      })
    }
  }

  // Revenue flat, expenses rising
  if (previous) {
    const expenseGrowth = previous.totalOpEx > 0
      ? ((current.totalOpEx - previous.totalOpEx) / previous.totalOpEx) * 100
      : 0
    const revenueGrowth = previous.totalRevenue > 0
      ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100
      : 0

    if (revenueGrowth < 2 && expenseGrowth > 10) {
      insights.push({
        id: `expenses-rising-${current.quarter}`,
        type: "alert",
        metric: "Operating Expenses",
        message: `Revenue is flat (${revenueGrowth.toFixed(1)}% change) but operating expenses rose ${expenseGrowth.toFixed(1)}%. Your operating costs are rising without corresponding revenue growth.`,
        messageHi: `राजस्व स्थिर है (${revenueGrowth.toFixed(1)}% परिवर्तन) लेकिन परिचालन खर्च ${expenseGrowth.toFixed(1)}% बढ़ गया। आपके खर्च बिना राजस्व वृद्धि के बढ़ रहे हैं।`,
        severity: "critical",
        linkedLineItem: "Operating Expenses",
      })
    }
  }

  // Net surplus positive but below Risk Buffer threshold
  if (current.netCashSurplus > 0 && !current.riskBufferMet) {
    insights.push({
      id: `risk-buffer-breach-${current.quarter}`,
      type: "warning",
      metric: "Risk Buffer",
      message: `Your net cash surplus (₹${(current.netCashSurplus / 3).toLocaleString("en-IN")}/month) is positive but below the Risk Buffer threshold. One bad month could push you into EMI default.`,
      messageHi: `आपका शुद्ध नकदी अधिशेष (₹${(current.netCashSurplus / 3).toLocaleString("en-IN")}/माह) सकारात्मक है लेकिन जोखिम बफर सीमा से कम है। एक खराब महीना EMI डिफ़ॉल्ट में धकेल सकता है।`,
      severity: "warning",
      linkedLineItem: "Net Cash Surplus",
    })
  }

  // DSCR below 1
  if (current.dscr < 1.0) {
    insights.push({
      id: `dscr-low-${current.quarter}`,
      type: "alert",
      metric: "DSCR",
      message: `Your Debt Service Coverage Ratio is ${current.dscr.toFixed(2)} — below 1.0 means your business income cannot cover your EMI payments from operations alone.`,
      messageHi: `आपका ऋण सेवा कवरेज अनुपात ${current.dscr.toFixed(2)} है — 1.0 से नीचे का मतलब है कि आपकी व्यापारिक आय अकेले EMI भुगतान को कवर नहीं कर सकती।`,
      severity: "critical",
      linkedLineItem: "DSCR / Repayment Capacity",
    })
  }

  // Positive health
  if (current.healthState === "thriving") {
    insights.push({
      id: `thriving-${current.quarter}`,
      type: "positive",
      metric: "Overall Health",
      message: `Your business is thriving — net margin of ${current.netMarginPercent.toFixed(1)}% clears the Risk Buffer with room to spare. Consider reinvestment or expansion options.`,
      messageHi: `आपका व्यवसाय अच्छा कर रहा है — ${current.netMarginPercent.toFixed(1)}% शुद्ध मार्जिन जोखिम बफर को आराम से पार करता है। पुनर्निवेश या विस्तार के विकल्पों पर विचार करें।`,
      severity: "info",
      linkedLineItem: "Net Margin %",
    })
  }

  // Recommendations for at-risk businesses
  if (current.healthState === "at-risk") {
    insights.push({
      id: `at-risk-recommendation-${current.quarter}`,
      type: "recommendation",
      metric: "Business Health",
      message: `Your business is at risk. Immediate actions: (1) Renegotiate supplier prices, (2) Reduce operating expenses, (3) Consider a working-capital scheme for temporary relief, (4) Diversify buyer base if single-buyer dependent.`,
      messageHi: `आपका व्यवसाय जोखिम में है। तत्काल कार्रवाई: (1) सप्लायर कीमतों पर फिर से बात करें, (2) परिचालन खर्च कम करें, (3) अस्थायी राहत के लिए वर्किंग-कैपिटल स्कीम पर विचार करें, (4) एकल-खरीदार निर्भरता है तो खरीदारों को विविध बनाएं।`,
      severity: "critical",
      linkedLineItem: "Business Health Classification",
    })
  }

  return insights
}

/**
 * Check single-buyer dependency from actual tracked revenue concentration.
 * Recomputed from data, not just the onboarding survey answer.
 */
export function checkSingleBuyerDependency(
  entries: MonthlyEntry[]
): { isDependent: boolean; concentrationPercent: number } {
  const totalRevenue = entries.reduce((sum, e) => sum + e.revenue, 0)
  const totalSingleBuyerRevenue = entries.reduce((sum, e) => sum + e.singleBuyerRevenue, 0)

  if (totalRevenue === 0) return { isDependent: false, concentrationPercent: 0 }

  const concentration = (totalSingleBuyerRevenue / totalRevenue) * 100
  return {
    isDependent: concentration > 60,
    concentrationPercent: Math.round(concentration),
  }
}

/**
 * Full health report generation.
 */
export function generateHealthReport(
  entries: MonthlyEntry[],
  currentQuarter: string,
  previousQuarter: string | undefined,
  financialCalc: FinancialCalculation,
  previousQuarterData?: QuarterlyAggregation
): HealthReport {
  const current = aggregateQuarterly(entries, currentQuarter)
  const trend = determineTrend(current, previousQuarterData)
  const insights = generateInsights(current, previousQuarterData, financialCalc)
  const singleBuyer = checkSingleBuyerDependency(entries)

  // Live DSCR recomputed from actual tracked numbers
  const annualNetOperatingIncome =
    (current.totalRevenue - current.totalCOGS - current.totalOpEx) * 4
  const annualDebtService = current.totalEMI * 4
  const dscrLive = calculateDSCR(annualNetOperatingIncome, annualDebtService)

  // Risk buffer status
  const riskBuffer = calculateRiskBuffer(current.totalEMI / 3)
  const monthlyNetMargin = current.netCashSurplus / 3
  let riskBufferStatus: "met" | "breached" | "critical" = "met"
  if (monthlyNetMargin < 0) riskBufferStatus = "critical"
  else if (monthlyNetMargin < riskBuffer) riskBufferStatus = "breached"

  return {
    businessId: entries[0]?.businessId || "",
    currentQuarter: current,
    previousQuarter: previousQuarterData,
    trend,
    healthState: current.healthState,
    insights,
    dscrLive,
    riskBufferStatus,
    singleBuyerDependencyFlag: singleBuyer.isDependent,
    generatedAt: new Date(),
  }
}
