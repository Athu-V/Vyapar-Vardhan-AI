// ============================================================================
// PROXY-DATA MARKET ANALYSIS ENGINE
// ============================================================================
// There is no live "local market demand" API for rural India.
// This module uses Census population data × NSSO consumption rates
// to estimate local demand without needing an API that doesn't exist.
//
// State this proxy-methodology openly in the product — it builds
// credibility rather than exposing a gap.
// ============================================================================

import type {
  FeasibilityInput,
  FeasibilityReport,
  MarketAnalysis,
  SWOT,
  BusinessCategory,
} from "../types"
import {
  PER_CAPITA_CONSUMPTION,
  POPULATION_ESTIMATES,
  COMPETITOR_DENSITY,
  SINGLE_BUYER_IMPACT,
  CATEGORY_NAMES,
} from "../data/sources"

/**
 * Estimate the reachable consumer base within 5-10 km radius.
 *
 * For rural India, the effective market radius is typically 5-10 km
 * (distance to the nearest market town/block headquarters).
 *
 * We estimate ~60-70% of block population as the effective consumer base
 * for a rural retail/service business (some travel further, some don't buy).
 */
export function estimateConsumerBase(
  state: string,
  blockPopulationOverride?: number
): number {
  const stateData = POPULATION_ESTIMATES[state] || POPULATION_ESTIMATES.DEFAULT
  const blockPopulation = blockPopulationOverride || stateData.avgBlockPopulation

  // ~65% of block population are effective consumers within reach
  return Math.round(blockPopulation * 0.65)
}

/**
 * Estimate local demand using proxy-data methodology:
 *
 *   Local Demand Estimate = Local Population (Census)
 *                          × Per-Capita Consumption Rate (NSSO data, category-specific)
 */
export function estimateLocalDemand(
  consumerBase: number,
  category: BusinessCategory
): number {
  const consumption = PER_CAPITA_CONSUMPTION[category]
  return Math.round(consumerBase * consumption.annualPerCapitaINR)
}

/**
 * Estimate existing local supply based on competitor density
 * and average business size per block.
 *
 * Sources: Livestock Census 2019, Udyam Registration data
 */
export function estimateLocalSupply(
  category: BusinessCategory,
  state: string
): number {
  const competitors = COMPETITOR_DENSITY[category]
  const stateData = POPULATION_ESTIMATES[state] || POPULATION_ESTIMATES.DEFAULT

  // Average revenue per existing competitor (estimated from MSME data)
  const avgRevenuePerCompetitor: Record<BusinessCategory, number> = {
    dairy: 360000,
    retail: 480000,
    tailoring: 240000,
    "agri-processing": 600000,
    "small-manufacturing": 720000,
    services: 300000,
    trading: 540000,
    other: 360000,
  }

  return competitors.avgPerBlock * avgRevenuePerCompetitor[category]
}

/**
 * Full market analysis combining demand estimation and supply assessment.
 */
export function analyzeMarket(input: FeasibilityInput): MarketAnalysis {
  const consumerBase = estimateConsumerBase(input.location.state)
  const demand = estimateLocalDemand(consumerBase, input.category)
  const supply = estimateLocalSupply(input.category, input.location.state)
  const gap = demand - supply

  const competitors = COMPETITOR_DENSITY[input.category]

  return {
    estimatedConsumerBase: consumerBase,
    estimatedDemand: demand,
    estimatedSupply: supply,
    supplyDemandGap: gap,
    demandDeficit: gap > 0,
    competitorDensity: competitors.classification,
    singleBuyerRisk: false, // Will be set from user input
  }
}

/**
 * Generate SWOT analysis tailored to the specific micro-budget and category.
 *
 * This is a rule-based generation — not LLM-generated. Each point is
 * deterministic based on the input parameters.
 */
export function generateSWOT(
  input: FeasibilityInput,
  market: MarketAnalysis
): SWOT {
  const categoryName = CATEGORY_NAMES[input.category]

  const strengths: string[] = [
    `Low initial investment requirement (₹${(input.availableMarginCapital / 100000).toFixed(1)}L margin)`,
    `${categoryName.en} is a local-need business with immediate demand`,
  ]

  const weaknesses: string[] = []

  if (input.availableMarginCapital < 50000) {
    weaknesses.push("Very limited margin capital — restricts inventory and working capital")
  }

  if (!input.isExistingBusiness) {
    weaknesses.push("First-time entrepreneur — no established customer base or operational experience")
  }

  if (market.competitorDensity === "high") {
    weaknesses.push(`High competitor density in the block (${market.competitorDensity})`)
  }

  const opportunities: string[] = []

  if (market.demandDeficit) {
    opportunities.push(
      `Supply-demand gap of ₹${(market.supplyDemandGap / 100000).toFixed(1)}L indicates room for new entrants`
    )
  }

  if (input.category === "dairy") {
    opportunities.push(
      "Government dairy cooperatives provide guaranteed procurement channels"
    )
  }

  if (input.category === "agri-processing") {
    opportunities.push(
      "Value addition to raw agriculture — higher margins than raw commodity trading"
    )
  }

  opportunities.push("Concessional credit available through government schemes (6.5-8% interest)")

  const threats: string[] = [
    "Seasonal demand fluctuations may create cash-flow gaps",
    "Supply chain bottlenecks for raw materials in rural areas",
  ]

  if (market.singleBuyerRisk) {
    threats.push(SINGLE_BUYER_IMPACT.recommendation)
  }

  if (input.category === "dairy") {
    threats.push("Perishable inventory — requires cold chain or rapid turnover")
  }

  if (input.category === "retail" || input.category === "trading") {
    threats.push(
      "Online retail penetration increasing — focus on products where physical presence adds value"
    )
  }

  return { strengths, weaknesses, opportunities, threats }
}

/**
 * Generate specific recommendations based on the analysis.
 */
export function generateRecommendations(
  input: FeasibilityInput,
  market: MarketAnalysis
): string[] {
  const recommendations: string[] = []

  if (market.demandDeficit) {
    recommendations.push(
      `Market demand exceeds supply — favorable conditions for a new ${CATEGORY_NAMES[input.category].en} business`
    )
  } else {
    recommendations.push(
      "Market is already well-served — differentiate on quality, service, or niche products"
    )
  }

  if (input.availableMarginCapital < 100000) {
    recommendations.push(
      "Consider starting as a micro-enterprise under the Micro Finance Scheme (up to ₹1.40L project cost)"
    )
  }

  if (market.singleBuyerRisk) {
    recommendations.push(
      "Connect with local Mandi board or form a producer group to diversify buyer base"
    )
  }

  recommendations.push(
    "Track daily revenue and expenses from day one — this becomes your credit history"
  )

  recommendations.push(
    "Maintain 3-month cash reserve before taking any loan — the Risk Buffer calculation will guide you"
  )

  return recommendations
}

/**
 * Generate warnings based on risk factors.
 */
export function generateWarnings(
  input: FeasibilityInput,
  market: MarketAnalysis
): string[] {
  const warnings: string[] = []

  if (market.singleBuyerRisk) {
    warnings.push(
      `⚠️ SINGLE BUYER DEPENDENCY: ${SINGLE_BUYER_IMPACT.recommendation}`
    )
  }

  if (market.competitorDensity === "high") {
    warnings.push(
      "⚠️ HIGH COMPETITION: Block already has significant competitor presence. Success depends on differentiation."
    )
  }

  if (input.availableMarginCapital < 30000) {
    warnings.push(
      "⚠️ LOW MARGIN CAPITAL: ₹" +
        (input.availableMarginCapital / 1000).toFixed(0) +
        "K margin limits project cost to ₹" +
        (input.availableMarginCapital / 0.10 / 100000).toFixed(1) +
        "L. Consider additional savings or partnership."
    )
  }

  return warnings
}

/**
 * Full feasibility report generation.
 * Combines market analysis, SWOT, and financial viability assessment.
 */
export function generateFeasibilityReport(
  input: FeasibilityInput
): FeasibilityReport {
  const market = analyzeMarket(input)
  const swot = generateSWOT(input, market)
  const recommendations = generateRecommendations(input, market)
  const warnings = generateWarnings(input, market)

  // Financial viability estimate (rough, based on proxy data)
  const estimatedMonthlyRevenue = market.estimatedDemand / 12 * 0.05 // 5% market capture
  const estimatedMonthlyExpenses = estimatedMonthlyRevenue * 0.7 // 70% cost ratio
  const estimatedNetSurplus = estimatedMonthlyRevenue - estimatedMonthlyExpenses

  let viabilityScore: "high" | "moderate" | "low" = "moderate"
  if (market.demandDeficit && market.competitorDensity === "low") {
    viabilityScore = "high"
  } else if (!market.demandDeficit && market.competitorDensity === "high") {
    viabilityScore = "low"
  }

  return {
    input,
    marketAnalysis: market,
    swot,
    financialViability: {
      estimatedMonthlyRevenue: Math.round(estimatedMonthlyRevenue),
      estimatedMonthlyExpenses: Math.round(estimatedMonthlyExpenses),
      estimatedNetSurplus: Math.round(estimatedNetSurplus),
      viabilityScore,
    },
    recommendations,
    warnings,
    generatedAt: new Date(),
  }
}
