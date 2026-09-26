// ============================================================================
// LLM NARRATOR LAYER
// ============================================================================
// The LLM never invents a number — it only reads numbers a calculator
// produced and turns them into a sentence.
//
// This module provides pre-computed narration templates that use
// deterministic values from the financial engine and rules engine.
// In production, this would call an LLM API with the deterministic
// values injected as context. For the MVP, we use structured templates.
// ============================================================================

import type { NarratorInput, NarratorOutput, FinancialCalculation } from "../types"
import type { FeasibilityReport } from "../types"
import type { HealthReport } from "../types"
import { CATEGORY_NAMES } from "../data/sources"
import { formatINR as formatINRUtil, financialTerm } from "../ui/utils"
import type { AppLanguageCode } from "../i18n/languages"

// Use the shared formatter (compact mode gives lakhs/crores shorthand)
const formatINR = (amount: number): string => formatINRUtil(amount, true)

/**
 * Neutral Hindi address — works for all users regardless of gender/age.
 * "सुनिए" (listen) is respectful and inclusive.
 */
const HI_ADDRESS = "सुनिए"

/**
 * Narrate financial calculation results in Hindi-English mix (voice-friendly).
 *
 * CRITICAL: Every number in this narration comes from the deterministic
 * engine — the narrator only converts them to sentences.
 */
export function narrateFinancials(
  calc: FinancialCalculation,
  language: "hi" | "en" | "hi-en" = "hi-en",
  code: AppLanguageCode = "en"
): NarratorOutput {
  if (language === "hi-en" || language === "hi") {
    return {
      text: `Aapka margin capital ${formatINR(calc.marginCapital)} hai.\n\n` +
        `📐 **Deterministic Calculation:**\n` +
        `• Project Cost: ${formatINR(calc.projectCost)} (${calc.marginCapital.toLocaleString("en-IN")} / 10%)\n` +
        `• Loan Eligibility: ${formatINR(calc.loanAmount)} (${calc.loanPercentage}% of project cost)\n` +
        `• ${financialTerm("emi", code, "EMI")} (monthly): ${formatINR(calc.emi)}\n\n` +
        `⚠️ **Post-Moratorium Reality (The Silent Moratorium Killer):**\n` +
        `• After ${calc.recommendedScheme.moratoriumMonths} months moratorium, your actual ${financialTerm("emi", code, "EMI")} will be: ${formatINR(calc.postMoratoriumEMI)}/month\n` +
        `• Interest compounds during moratorium — "6 months free" ≠ 6 months break\n\n` +
        `🛡️ **Risk Buffer (Most Important Number):**\n` +
        `• Minimum monthly ${financialTerm("profit", code, "मुनाफा")} needed to safely absorb a bad month AND pay ${financialTerm("emi", code, "EMI")}: ${formatINR(calc.riskBuffer)}/month\n` +
        `• If your business can't consistently earn this, the loan is too risky.\n\n` +
        `💰 **Net Cash Position:**\n` +
        `• Revenue − COGS − OpEx − ${financialTerm("emi", code, "EMI")} = ${formatINR(calc.netCashSurplusAfterEMI)}/month\n` +
        (calc.netCashSurplusAfterEMI < 0 ? "❌ NEGATIVE — business not viable as structured!" : `✅ Positive — business can sustain the ${financialTerm("emi", code, "EMI")}.`) + "\n\n" +
        `📊 **DSCR: ${calc.dscr}** ${calc.dscr >= 1.25 ? "(Healthy)" : calc.dscr >= 1.0 ? "(Tight)" : `(Below 1 — cannot cover ${financialTerm("emi", code, "EMI")} from operations)`}`,
      voiceScript: `${HI_ADDRESS}, aapka ${financialTerm("margin", code, "मार्जिन")} capital ${formatINR(calc.marginCapital)} hai. ` +
        `Is hisaab se aapki ${financialTerm("projectCost", code, "प्रोजेक्ट लागत")} ${formatINR(calc.projectCost)} ban-ti hai. ` +
        `Loan milega ${formatINR(calc.loanAmount)}. ` +
        `Lekin suniye — moratorium khatam hone ke baad aapki ${financialTerm("emi", code, "EMI")} ${formatINR(calc.postMoratoriumEMI)} mahine ki hogi. ` +
        `Aaj se har mahine itna bachakar rakhna shuru karo, nahi toh mushkil hogi. ` +
        `Risk buffer hai ${formatINR(calc.riskBuffer)} — matlab kam se kam itna ${financialTerm("profit", code, "मुनाफा")} har mahine chahiye taaki ek bura mahina bhi aapki ${financialTerm("emi", code, "EMI")} cover kar sake.`,
      attribution: {
        isDeterministic: true,
        isRuleBased: false,
        isLLMGenerated: false,
        sourceCalculation: "computeFullFinancials → narrateFinancials",
      },
    }
  }

  // English version
  return {
      text: `**Financial Analysis (Deterministic):**\n\n` +
      `• Margin Capital: ${formatINR(calc.marginCapital)}\n` +
      `• Project Cost: ${formatINR(calc.projectCost)} (= margin ÷ 10%)\n` +
      `• Loan Amount: ${formatINR(calc.loanAmount)} (90% of project cost)\n` +
      `• Monthly EMI: ${formatINR(calc.emi)}\n` +
      `• Post-Moratorium EMI: ${formatINR(calc.postMoratoriumEMI)}/month\n` +
      `• Risk Buffer: ${formatINR(calc.riskBuffer)}/month minimum ${financialTerm("profit", code, "मुनाफा")} needed\n` +
      `• Net Cash Surplus: ${formatINR(calc.netCashSurplusAfterEMI)}/month\n` +
      `• DSCR: ${calc.dscr}`,
      voiceScript: `Your margin capital is ${formatINR(calc.marginCapital)}. ` +
      `Project cost is ${formatINR(calc.projectCost)}. ` +
      `Loan eligibility is ${formatINR(calc.loanAmount)}. ` +
      `After the moratorium period, your EMI will be ${formatINR(calc.postMoratoriumEMI)} per month. ` +
      `You need at least ${formatINR(calc.riskBuffer)} monthly ${financialTerm("profit", code, "मुनाफा")} as a safety buffer.`,
    attribution: {
      isDeterministic: true,
      isRuleBased: false,
      isLLMGenerated: false,
      sourceCalculation: "computeFullFinancials → narrateFinancials",
    },
  }
}

/**
 * Narrate feasibility report findings.
 */
export function narrateFeasibility(
  report: FeasibilityReport,
  language: "hi" | "en" | "hi-en" = "hi-en",
  code: AppLanguageCode = "en"
): NarratorOutput {
  const category = CATEGORY_NAMES[report.input.category]
  const market = report.marketAnalysis

  if (language === "hi-en" || language === "hi") {
    return {
      text: `📊 **Market Analysis (Proxy Data — Census × NSSO):**\n\n` +
        `• Location: ${report.input.location.block}, ${report.input.location.district}\n` +
        `• Estimated consumer base (5-10 km): ${market.estimatedConsumerBase.toLocaleString("en-IN")} people\n` +
        `• Annual demand estimate: ${formatINR(market.estimatedDemand)}\n` +
        `• Current supply estimate: ${formatINR(market.estimatedSupply)}\n` +
        `• Supply-demand gap: ${market.demandDeficit ? "✅ POSITIVE" : "❌ NEGATIVE"} (${formatINR(Math.abs(market.supplyDemandGap))})\n` +
        `• Competitor density: ${market.competitorDensity}\n\n` +
        `📋 **SWOT Summary:**\n` +
        `Strengths: ${report.swot.strengths.map((s) => `• ${s}`).join("\n")}\n` +
        `Opportunities: ${report.swot.opportunities.map((o) => `• ${o}`).join("\n")}\n` +
        `Threats: ${report.swot.threats.map((t) => `• ${t}`).join("\n")}\n\n` +
        `💰 **Financial Viability:**\n` +
        `• Viability Score: ${report.financialViability.viabilityScore.toUpperCase()}\n` +
        `• Estimated monthly ${financialTerm("revenue", code, "राजस्व")}: ${formatINR(report.financialViability.estimatedMonthlyRevenue)}`,
      voiceScript: `Aapke area mein ${category.hi} ke liye estimated consumer base ${market.estimatedConsumerBase.toLocaleString("en-IN")} log hain. ` +
        `Annual demand hai ${formatINR(market.estimatedDemand)}. ` +
        `${market.demandDeficit ? `Demand zyada hai supply se — naye business ke liye mauka hai.` : `Supply zyada hai demand se — competition tough hoga.`}`,
      attribution: {
        isDeterministic: true,
        isRuleBased: true,
        isLLMGenerated: false,
        sourceCalculation: "generateFeasibilityReport → narrateFeasibility",
        sourceRule: "Census × NSSO proxy data methodology",
      },
    }
  }    return {
      text: `**Market Analysis (Proxy Data — Census × NSSO):**\n\n` +
      `• Consumer base: ${market.estimatedConsumerBase.toLocaleString("en-IN")}\n` +
      `• ${financialTerm("demand", code, "मांग")}: ${formatINR(market.estimatedDemand)}\n` +
      `• ${financialTerm("supply", code, "पूर्ति")}: ${formatINR(market.estimatedSupply)}\n` +
      `• ${financialTerm("gap", code, "अंतर")}: ${formatINR(market.supplyDemandGap)}\n` +
      `• Viability: ${report.financialViability.viabilityScore}`,
      voiceScript: `Estimated consumer base is ${market.estimatedConsumerBase.toLocaleString("en-IN")}. ` +
      `Demand exceeds supply by ${formatINR(market.supplyDemandGap)}.`,
    attribution: {
      isDeterministic: true,
      isRuleBased: true,
      isLLMGenerated: false,
      sourceCalculation: "generateFeasibilityReport → narrateFeasibility",
      sourceRule: "Census × NSSO proxy data methodology",
    },
  }
}

/**
 * Narrate business health report findings.
 */
export function narrateHealth(
  report: HealthReport,
  language: "hi" | "en" | "hi-en" = "hi-en",
  code: AppLanguageCode = "en"
): NarratorOutput {
  const q = report.currentQuarter

  const healthEmoji = {
    thriving: "🟢",
    surviving: "🟡",
    "at-risk": "🔴",
  }

  const healthLabel = {
    thriving: "THRIVING",
    surviving: "SURVIVING",
    "at-risk": "AT RISK",
  }

  if (language === "hi-en" || language === "hi") {
    return {
      text: `🏥 **Business Health Report — ${healthEmoji[report.healthState]} ${healthLabel[report.healthState]}**\n\n` +
        `📊 **Quarterly Numbers:**\n` +
        `• ${financialTerm("revenue", code, "राजस्व")}: ${formatINR(q.totalRevenue)}\n` +
        `• ${financialTerm("cost", code, "लागत")} (COGS): ${formatINR(q.totalCOGS)}\n` +
        `• Operating ${financialTerm("expense", code, "खर्च")}: ${formatINR(q.totalOpEx)}\n` +
        `• ${financialTerm("emi", code, "EMI")} Paid: ${formatINR(q.totalEMI)}\n` +
        `• Net Cash ${financialTerm("surplus", code, "अधिशेष")}: ${formatINR(q.netCashSurplus)}\n` +
        `• Gross ${financialTerm("margin", code, "मार्जिन")}: ${q.grossMarginPercent}%\n` +
        `• Net ${financialTerm("margin", code, "मार्जिन")}: ${q.netMarginPercent}%\n` +
        `• DSCR: ${q.dscr}\n\n` +
        `${report.insights.map((i) => `${i.type === "alert" ? "🚨" : i.type === "warning" ? "⚠️" : "✅"} ${i.message}`).join("\n\n")}\n\n` +
        `${report.singleBuyerDependencyFlag ? "⚠️ **SINGLE BUYER DEPENDENCY DETECTED** — Revenue concentration in one buyer exceeds 60%. Diversify your buyer base." : ""}\n` +
        `📈 ${financialTerm("trend", code, "रुझान")}: ${report.trend}`,
      voiceScript: `Aapka business ${healthLabel[report.healthState]} hai. ` +
        `Is quarter mein revenue tha ${formatINR(q.totalRevenue)}, expenses ${formatINR(q.totalCOGS + q.totalOpEx)}, aur EMI ${formatINR(q.totalEMI)}. ` +
        `Net bacha ${formatINR(q.netCashSurplus)}. ` +
        `${report.healthState === "at-risk" ? "Lekin situation serious hai — abhi kuch karna padega." : report.healthState === "thriving" ? "Bahut accha hai — business profit mein hai." : "Theek hai, lekin safety margin kam hai."}`,
      attribution: {
        isDeterministic: true,
        isRuleBased: true,
        isLLMGenerated: false,
        sourceCalculation: "generateHealthReport → narrateHealth",
        sourceRule: "Health classification rules engine",
      },
    }
  }

  return {
    text: `**Business Health: ${healthLabel[report.healthState]}**\n\n` +
      `Revenue: ${formatINR(q.totalRevenue)} | Net Margin: ${q.netMarginPercent}% | DSCR: ${q.dscr}\n\n` +
      report.insights.map((i) => `${i.message}`).join("\n"),
    voiceScript: `Your business is ${healthLabel[report.healthState]}. ` +
      `Net ${financialTerm("margin", code, "मार्जिन")} is ${q.netMarginPercent}% with DSCR of ${q.dscr}.`,
    attribution: {
      isDeterministic: true,
      isRuleBased: true,
      isLLMGenerated: false,
      sourceCalculation: "generateHealthReport → narrateHealth",
      sourceRule: "Health classification rules engine",
    },
  }
}
