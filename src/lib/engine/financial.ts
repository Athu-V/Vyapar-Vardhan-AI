// ============================================================================
// DETERMINISTIC FINANCIAL ENGINE
// ============================================================================
// Rule: The LLM never invents a number — it only reads numbers a calculator
// produced and turns them into a sentence.
//
// All functions in this module are pure deterministic formulas.
// No approximation, no LLM inference, no external API calls.
// ============================================================================

import type { LoanScheme, FinancialCalculation, RepaymentPeriod } from "../types"

/**
 * Project Cost = Available Margin Capital / 10%
 * This is the fundamental leverage calculation for government concessional credit.
 */
export function calculateProjectCost(marginCapital: number): number {
  if (marginCapital <= 0) return 0
  return marginCapital / 0.10
}

/**
 * Maximum Loan Amount = 90% × Project Cost
 * The lending agency provides 90% of project cost as loan.
 */
export function calculateLoanAmount(projectCost: number, loanPercentage: number = 0.90): number {
  return projectCost * loanPercentage
}

/**
 * EMI Calculation using the standard reducing-balance formula:
 * EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
 *
 * Where:
 *   P = Principal (loan amount)
 *   r = Monthly interest rate (annual rate / 12)
 *   n = Total number of monthly payments
 */
export function calculateEMI(
  principal: number,
  annualInterestRate: number,
  tenureYears: number
): number {
  if (principal <= 0) return 0

  const r = annualInterestRate / 100 / 12 // monthly rate
  const n = tenureYears * 12 // total months

  if (r === 0) return principal / n

  const factor = Math.pow(1 + r, n)
  const emi = (principal * r * factor) / (factor - 1)

  return Math.round(emi)
}

/**
 * Total interest payable over the loan tenure.
 */
export function calculateTotalInterest(
  principal: number,
  annualInterestRate: number,
  tenureYears: number
): number {
  const emi = calculateEMI(principal, annualInterestRate, tenureYears)
  const totalPayment = emi * tenureYears * 12
  return Math.round(totalPayment - principal)
}

/**
 * Post-Moratorium EMI Calculation:
 * During moratorium, interest compounds on the full principal.
 * After moratorium, the EMI is recalculated on the compounded amount
 * over the remaining tenure.
 *
 * CRITICAL (Doc 2, Fact #3 — "The Silent Moratorium Killer"):
 * Interest continues compounding during the moratorium. Villagers hear
 * "6 months free" and think it's a break. It is not.
 */
export function calculatePostMoratoriumEMI(
  principal: number,
  annualInterestRate: number,
  tenureYears: number,
  moratoriumMonths: number
): number {
  if (principal <= 0 || moratoriumMonths === 0) {
    return calculateEMI(principal, annualInterestRate, tenureYears)
  }

  const r = annualInterestRate / 100 / 12

  // Amount after moratorium (interest compounds on full principal)
  const compoundedPrincipal = principal * Math.pow(1 + r, moratoriumMonths)

  // Remaining tenure after moratorium
  const remainingMonths = tenureYears * 12 - moratoriumMonths

  if (remainingMonths <= 0 || r === 0) return 0

  const factor = Math.pow(1 + r, remainingMonths)
  const postMoratoriumEMI =
    (compoundedPrincipal * r * factor) / (factor - 1)

  return Math.round(postMoratoriumEMI)
}

/**
 * Risk Buffer = Minimum monthly profit required to safely absorb
 * a bad month AND still service the EMI.
 *
 * This is arguably the single most important number in the entire product,
 * because it answers "should I actually take this loan" rather than just
 * "can I take this loan."
 *
 * Formula: Risk Buffer = 1.5 × Post-Moratorium EMI
 * (The 1.5x multiplier ensures a 50% cushion for bad months)
 */
export function calculateRiskBuffer(postMoratoriumEMI: number): number {
  if (postMoratoriumEMI <= 0) return 0
  return Math.round(postMoratoriumEMI * 1.5)
}

/**
 * Net Cash Surplus = Revenue − COGS − Operating Expenses − EMI (current period)
 *
 * If this number is negative, the business is not viable as currently structured,
 * regardless of what the raw revenue looks like.
 *
 * Revenue is not profit, and profit is not cash-in-hand. Most rural
 * micro-businesses fail because they spend cash as it arrives and have
 * nothing left when the EMI hits.
 */
export function calculateNetCashSurplus(
  revenue: number,
  cogs: number,
  operatingExpenses: number,
  emi: number
): number {
  return revenue - cogs - operatingExpenses - emi
}

/**
 * Gross Margin % = (Revenue − COGS) / Revenue × 100
 * Product-level profitability indicator.
 */
export function calculateGrossMarginPercent(revenue: number, cogs: number): number {
  if (revenue <= 0) return 0
  return Math.round(((revenue - cogs) / revenue) * 100 * 100) / 100
}

/**
 * Net Margin % = Net Cash Surplus / Revenue × 100
 * True bottom-line health indicator.
 */
export function calculateNetMarginPercent(netCashSurplus: number, revenue: number): number {
  if (revenue <= 0) return 0
  return Math.round((netCashSurplus / revenue) * 100 * 100) / 100
}

/**
 * Debt Service Coverage Ratio (DSCR)
 * DSCR = Net Operating Income / Total Debt Service
 *
 * DSCR > 1.0 means the business generates enough cash to cover its debt payments.
 * DSCR > 1.25 is considered healthy.
 * DSCR < 1.0 means the business cannot cover its debt payments from operations.
 */
export function calculateDSCR(
  netOperatingIncome: number,
  annualDebtService: number
): number {
  if (annualDebtService <= 0) return 0
  return Math.round((netOperatingIncome / annualDebtService) * 100) / 100
}

/**
 * Break-even Point (in months)
 * Months to recover initial investment from net monthly surplus.
 */
export function calculateBreakEvenMonths(
  totalInvestment: number,
  monthlyNetSurplus: number
): number {
  if (monthlyNetSurplus <= 0) return Infinity
  return Math.ceil(totalInvestment / monthlyNetSurplus)
}

/**
 * Working Capital Calculation (Operating Cycle Method)
 * Working Capital = (Average Daily Operating Expenses × Operating Cycle in Days)
 */
export function calculateWorkingCapital(
  monthlyOperatingExpenses: number,
  operatingCycleDays: number = 90
): number {
  const dailyExpenses = monthlyOperatingExpenses / 30
  return Math.round(dailyExpenses * operatingCycleDays)
}

/**
 * Generate quarterly repayment schedule for a loan scheme.
 *
 * Critical: Shows the ACTUAL EMI that will hit after moratorium — not a
 * deferred, easy-to-ignore abstraction.
 */
export function generateRepaymentSchedule(
  loanAmount: number,
  scheme: LoanScheme,
  startYear: number = new Date().getFullYear()
): RepaymentPeriod[] {
  const schedule: RepaymentPeriod[] = []
  const r = scheme.interestRate / 100 / 12 // monthly rate

  let outstandingBalance = loanAmount
  const monthlyPayment = scheme.moratoriumMonths > 0
    ? calculatePostMoratoriumEMI(
        loanAmount,
        scheme.interestRate,
        scheme.tenureYears,
        scheme.moratoriumMonths
      )
    : calculateEMI(
        loanAmount,
        scheme.interestRate,
        scheme.tenureYears
      )
  const quarterlyPayment = monthlyPayment * 3

  const totalQuarters = scheme.tenureYears * 4
  const moratoriumQuarters = Math.ceil(scheme.moratoriumMonths / 3)

  for (let q = 1; q <= totalQuarters; q++) {
    const quarterLabel = `Q${((q - 1) % 4) + 1}-${startYear + Math.floor((q - 1) / 4)}`

    if (q <= moratoriumQuarters) {
      // Moratorium quarter: interest accrues but no payment
      const interestAccrued = outstandingBalance * r * 3
      outstandingBalance += interestAccrued

      schedule.push({
        period: q,
        quarter: quarterLabel,
        principal: 0,
        interest: Math.round(interestAccrued),
        totalPayment: 0,
        outstandingBalance: Math.round(outstandingBalance),
        isMoratorium: true,
      })
    } else {
      // Regular quarter
      const isLastQuarter = q === totalQuarters
      const interestPayment = Math.round(outstandingBalance * r * 3)
      const principalPayment = isLastQuarter
        ? Math.round(outstandingBalance)
        : Math.round(quarterlyPayment - interestPayment)

      outstandingBalance -= principalPayment

      schedule.push({
        period: q,
        quarter: quarterLabel,
        principal: Math.max(0, principalPayment),
        interest: interestPayment,
        totalPayment: isLastQuarter
          ? principalPayment + interestPayment
          : Math.round(quarterlyPayment),
        outstandingBalance: Math.max(0, Math.round(outstandingBalance)),
        isMoratorium: false,
      })
    }
  }

  return schedule
}

/**
 * Full financial calculation combining all deterministic formulas.
 * This is the single entry point for Module 2's financial engine.
 */
export function computeFullFinancials(
  marginCapital: number,
  scheme: LoanScheme,
  monthlyRevenue: number = 0,
  monthlyCOGS: number = 0,
  monthlyOpEx: number = 0,
  startYear: number = new Date().getFullYear()
): FinancialCalculation {
  // Core leverage calculation
  const projectCost = calculateProjectCost(marginCapital)
  const loanAmount = calculateLoanAmount(projectCost, scheme.maxLoanPercentage / 100)

  // EMI calculations
  const emi = calculateEMI(loanAmount, scheme.interestRate, scheme.tenureYears)
  const totalInterest = calculateTotalInterest(loanAmount, scheme.interestRate, scheme.tenureYears)
  const totalPayment = loanAmount + totalInterest

  // Post-moratorium EMI (the real number that hits after moratorium ends)
  const postMoratoriumEMI = calculatePostMoratoriumEMI(
    loanAmount,
    scheme.interestRate,
    scheme.tenureYears,
    scheme.moratoriumMonths
  )

  // Risk buffer (the most important number)
  const riskBuffer = calculateRiskBuffer(postMoratoriumEMI)

  // Cash surplus calculations
  const netCashSurplus = calculateNetCashSurplus(
    monthlyRevenue,
    monthlyCOGS,
    monthlyOpEx,
    0 // before EMI
  )
  const netCashSurplusAfterEMI = calculateNetCashSurplus(
    monthlyRevenue,
    monthlyCOGS,
    monthlyOpEx,
    postMoratoriumEMI
  )

  // DSCR (annual basis)
  const annualNetOperatingIncome = (monthlyRevenue - monthlyCOGS - monthlyOpEx) * 12
  const annualDebtService = postMoratoriumEMI * 12
  const dscr = calculateDSCR(annualNetOperatingIncome, annualDebtService)

  // Break-even
  const totalInvestment = marginCapital + totalInterest
  const breakEvenMonths = calculateBreakEvenMonths(
    totalInvestment,
    Math.max(0, netCashSurplusAfterEMI)
  )

  // Repayment schedule
  const repaymentSchedule = generateRepaymentSchedule(loanAmount, scheme, startYear)

  return {
    marginCapital,
    projectCost,
    loanAmount,
    loanPercentage: scheme.maxLoanPercentage,
    emi,
    totalInterest,
    totalPayment,
    postMoratoriumEMI,
    riskBuffer,
    netCashSurplus,
    netCashSurplusAfterEMI,
    dscr,
    breakEvenMonths,
    recommendedScheme: scheme,
    repaymentSchedule,
  }
}
