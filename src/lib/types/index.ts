// ============================================================================
// Core Domain Types for Rural Advisory Assistant
// ============================================================================

/** User onboarding profile */
export interface BusinessProfile {
  id: string
  name: string
  location: {
    village: string
    block: string
    district: string
    state: string
  }
  category: BusinessCategory
  isExistingBusiness: boolean
  monthlyRevenue: number
  monthlyCOGS: number
  monthlyOperatingExpenses: number
  availableMarginCapital: number
  singleBuyerDependency: boolean
  createdAt: Date
}

export type BusinessCategory =
  | "dairy"
  | "retail"
  | "tailoring"
  | "agri-processing"
  | "small-manufacturing"
  | "services"
  | "trading"
  | "other"

// ============================================================================
// Module 2: Financial Calculator Types
// ============================================================================

export interface LoanScheme {
  id: string
  name: string
  nameHi: string
  projectCostMin: number
  projectCostMax: number
  maxLoanPercentage: number
  interestRate: number // annual %
  tenureYears: number
  moratoriumMonths: number
  repaymentFrequency: "monthly" | "quarterly"
  lastVerified: Date
  source: string
}

export interface FinancialCalculation {
  marginCapital: number
  projectCost: number
  loanAmount: number
  loanPercentage: number
  emi: number
  totalInterest: number
  totalPayment: number
  postMoratoriumEMI: number
  riskBuffer: number
  netCashSurplus: number
  netCashSurplusAfterEMI: number
  dscr: number
  breakEvenMonths: number
  recommendedScheme: LoanScheme
  repaymentSchedule: RepaymentPeriod[]
}

export interface RepaymentPeriod {
  period: number
  quarter: string
  principal: number
  interest: number
  totalPayment: number
  outstandingBalance: number
  isMoratorium: boolean
}

// ============================================================================
// Module 1: Feasibility Report Types
// ============================================================================

export interface FeasibilityInput {
  location: {
    village: string
    block: string
    district: string
    state: string
  }
  category: BusinessCategory
  isExistingBusiness: boolean
  availableMarginCapital: number
}

export interface MarketAnalysis {
  estimatedConsumerBase: number
  estimatedDemand: number
  estimatedSupply: number
  supplyDemandGap: number
  demandDeficit: boolean
  competitorDensity: "low" | "moderate" | "high"
  singleBuyerRisk: boolean
}

export interface SWOT {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export interface FeasibilityReport {
  input: FeasibilityInput
  marketAnalysis: MarketAnalysis
  swot: SWOT
  financialViability: {
    estimatedMonthlyRevenue: number
    estimatedMonthlyExpenses: number
    estimatedNetSurplus: number
    viabilityScore: "high" | "moderate" | "low"
  }
  recommendations: string[]
  warnings: string[]
  generatedAt: Date
}

// ============================================================================
// Module 3: Business Health Tracker Types
// ============================================================================

export type HealthState = "thriving" | "surviving" | "at-risk"

export interface MonthlyEntry {
  id: string
  businessId: string
  month: string // "YYYY-MM"
  revenue: number
  cogs: number
  operatingExpenses: number
  emiPaid: number
  emiDue: number
  singleBuyerRevenue: number
  capturedVia: "whatsapp" | "sms" | "ivr" | "manual"
  capturedAt: Date
}

export interface QuarterlyAggregation {
  quarter: string // "Q1-2026"
  totalRevenue: number
  totalCOGS: number
  totalOpEx: number
  totalEMI: number
  netCashSurplus: number
  grossMarginPercent: number
  netMarginPercent: number
  dscr: number
  healthState: HealthState
  riskBufferMet: boolean
}

export interface HealthInsight {
  id: string
  type: "warning" | "alert" | "positive" | "recommendation"
  metric: string
  message: string
  messageHi: string
  severity: "info" | "warning" | "critical"
  linkedLineItem: string
}

export interface HealthReport {
  businessId: string
  currentQuarter: QuarterlyAggregation
  previousQuarter?: QuarterlyAggregation
  trend: "improving" | "stable" | "declining"
  healthState: HealthState
  insights: HealthInsight[]
  dscrLive: number
  riskBufferStatus: "met" | "breached" | "critical"
  singleBuyerDependencyFlag: boolean
  generatedAt: Date
}

// ============================================================================
// LLM Narrator Types
// ============================================================================

export interface NarratorInput {
  language: "hi" | "en" | "hi-en"
  calculationType: "feasibility" | "financial" | "health"
  data: Record<string, unknown>
  tone: "friendly" | "warning" | "celebratory" | "neutral"
}

export interface NarratorOutput {
  text: string
  voiceScript: string // Simplified text for TTS
  attribution: {
    isDeterministic: boolean
    isRuleBased: boolean
    isLLMGenerated: boolean
    sourceCalculation?: string
    sourceRule?: string
  }
}

// ============================================================================
// Report Export Types
// ============================================================================

export interface NABARDReport {
  businessProfile: BusinessProfile
  feasibilityReport?: FeasibilityReport
  financialCalculation: FinancialCalculation
  healthReport?: HealthReport
  generatedAt: Date
  reportType: "feasibility" | "financial" | "health" | "comprehensive"
}
