// ============================================================================
// Financial Engine — Deterministic Formula Tests
// ============================================================================
// These tests verify the mathematically exact formulas used in Module 2.
// Run with: npx jest src/lib/engine/financial.test.ts
// ============================================================================

import {
  calculateProjectCost,
  calculateLoanAmount,
  calculateEMI,
  calculateTotalInterest,
  calculatePostMoratoriumEMI,
  calculateRiskBuffer,
  calculateNetCashSurplus,
  calculateGrossMarginPercent,
  calculateNetMarginPercent,
  calculateDSCR,
  calculateBreakEvenMonths,
  calculateWorkingCapital,
  generateRepaymentSchedule,
  computeFullFinancials,
} from "./financial"
import type { LoanScheme } from "../types"

// Sample scheme for tests (mirrors Term Loan Scheme)
const TEST_SCHEME: LoanScheme = {
  id: "test-scheme",
  name: "Test Scheme",
  nameHi: "परीक्षण योजना",
  projectCostMin: 140001,
  projectCostMax: 5000000,
  maxLoanPercentage: 90,
  interestRate: 8.0,
  tenureYears: 7,
  moratoriumMonths: 6,
  repaymentFrequency: "quarterly",
  lastVerified: new Date("2025-06-01"),
  source: "Test",
}

describe("calculateProjectCost", () => {
  it("returns margin / 0.10", () => {
    expect(calculateProjectCost(100000)).toBe(1000000) // ₹100K → ₹10L
    expect(calculateProjectCost(50000)).toBe(500000) // ₹50K → ₹5L
    expect(calculateProjectCost(1000000)).toBe(10000000) // ₹10L → ₹1Cr
  })

  it("returns 0 for non-positive margin", () => {
    expect(calculateProjectCost(0)).toBe(0)
    expect(calculateProjectCost(-100)).toBe(0)
  })
})

describe("calculateLoanAmount", () => {
  it("returns projectCost * loanPercentage", () => {
    expect(calculateLoanAmount(1000000, 0.90)).toBe(900000)
    expect(calculateLoanAmount(500000, 0.85)).toBe(425000)
  })

  it("defaults to 90% if not specified", () => {
    expect(calculateLoanAmount(1000000)).toBe(900000)
  })
})

describe("calculateEMI", () => {
  it("computes standard reducing-balance EMI", () => {
    // ₹10L loan, 8% annual, 7 years
    const emi = calculateEMI(1000000, 8.0, 7)
    // Expected: ~15595 (rounded)
    expect(emi).toBeGreaterThan(15000)
    expect(emi).toBeLessThan(16000)
  })

  it("returns 0 for zero principal", () => {
    expect(calculateEMI(0, 8.0, 7)).toBe(0)
  })

  it("handles zero interest rate (simple division)", () => {
    expect(calculateEMI(1200000, 0, 10)).toBe(10000) // 12L / 120 months
  })

  it("matches known EMI for ₹1L at 8% for 5 years", () => {
    // Standard EMI table value: ~2027.64
    const emi = calculateEMI(100000, 8.0, 5)
    expect(emi).toBe(2028) // rounded
  })
})

describe("calculateTotalInterest", () => {
  it("returns total payment minus principal", () => {
    const principal = 1000000
    const emi = calculateEMI(principal, 8.0, 7)
    const totalPayment = emi * 7 * 12
    const interest = calculateTotalInterest(principal, 8.0, 7)
    expect(interest).toBe(totalPayment - principal)
  })
})

describe("calculatePostMoratoriumEMI", () => {
  it("returns regular EMI when moratorium is 0", () => {
    const regular = calculateEMI(1000000, 8.0, 7)
    const postMoratorium = calculatePostMoratoriumEMI(1000000, 8.0, 7, 0)
    expect(postMoratorium).toBe(regular)
  })

  it("returns higher EMI after 6-month moratorium (interest compounds)", () => {
    const regular = calculateEMI(1000000, 8.0, 7)
    const postMoratorium = calculatePostMoratoriumEMI(1000000, 8.0, 7, 6)
    // Post-moratorium EMI should be higher due to compounding
    expect(postMoratorium).toBeGreaterThan(regular)
    // The difference should be meaningful (more than rounding)
    expect(postMoratorium - regular).toBeGreaterThan(100)
  })

  it("returns 0 when remaining tenure <= 0", () => {
    expect(calculatePostMoratoriumEMI(100000, 8.0, 1, 12)).toBe(0)
  })

  it("matches known value: ₹10L, 8%, 7yr, 6mo moratorium", () => {
    const emi = calculatePostMoratoriumEMI(1000000, 8.0, 7, 6)
    // Expected: 17154 (compounded principal 1040673 over remaining 78 months)
    expect(emi).toBe(17154)
  })

  it("returns 0 for zero principal", () => {
    expect(calculatePostMoratoriumEMI(0, 8.0, 7, 6)).toBe(0)
  })
})

describe("calculateRiskBuffer", () => {
  it("returns 1.5 * postMoratoriumEMI", () => {
    expect(calculateRiskBuffer(15000)).toBe(22500)
    expect(calculateRiskBuffer(10000)).toBe(15000)
  })

  it("returns 0 for non-positive EMI", () => {
    expect(calculateRiskBuffer(0)).toBe(0)
    expect(calculateRiskBuffer(-100)).toBe(0)
  })
})

describe("calculateNetCashSurplus", () => {
  it("returns revenue - cogs - opEx - emi", () => {
    expect(
      calculateNetCashSurplus(100000, 60000, 15000, 20000)
    ).toBe(5000)
  })

  it("can be negative", () => {
    expect(
      calculateNetCashSurplus(50000, 30000, 15000, 20000)
    ).toBe(-15000)
  })
})

describe("calculateGrossMarginPercent", () => {
  it("returns (revenue - cogs) / revenue * 100", () => {
    expect(calculateGrossMarginPercent(100000, 60000)).toBe(40.0)
    expect(calculateGrossMarginPercent(200000, 180000)).toBe(10.0)
  })

  it("returns 0 for zero revenue", () => {
    expect(calculateGrossMarginPercent(0, 0)).toBe(0)
  })
})

describe("calculateNetMarginPercent", () => {
  it("returns netCashSurplus / revenue * 100", () => {
    expect(calculateNetMarginPercent(5000, 100000)).toBe(5.0)
    expect(calculateNetMarginPercent(20000, 100000)).toBe(20.0)
  })

  it("returns 0 for zero revenue", () => {
    expect(calculateNetMarginPercent(0, 0)).toBe(0)
  })
})

describe("calculateDSCR", () => {
  it("returns netOperatingIncome / annualDebtService", () => {
    // ₹100K/month net income, ₹15K/month EMI → annual: 12L / 1.8L = 6.67
    expect(calculateDSCR(1200000, 180000)).toBe(6.67)
  })

  it("returns DSCR of 1.0 when income equals debt service", () => {
    expect(calculateDSCR(100000, 100000)).toBe(1.0)
  })

  it("returns DSCR below 1.0 when income < debt service", () => {
    expect(calculateDSCR(80000, 100000)).toBe(0.8)
  })

  it("returns 0 for zero debt service", () => {
    expect(calculateDSCR(100000, 0)).toBe(0)
  })
})

describe("calculateBreakEvenMonths", () => {
  it("returns ceil(investment / monthlySurplus)", () => {
    expect(calculateBreakEvenMonths(1000000, 50000)).toBe(20) // 10L / 50K = 20
    expect(calculateBreakEvenMonths(500000, 25000)).toBe(20)
  })

  it("returns Infinity for non-positive surplus", () => {
    expect(calculateBreakEvenMonths(1000000, 0)).toBe(Infinity)
    expect(calculateBreakEvenMonths(1000000, -1000)).toBe(Infinity)
  })
})

describe("calculateWorkingCapital", () => {
  it("returns dailyExpenses * operatingCycleDays", () => {
    // ₹30K/month → ₹1K/day × 90 days = ₹90K
    expect(calculateWorkingCapital(30000, 90)).toBe(90000)
  })

  it("uses default 90-day cycle", () => {
    expect(calculateWorkingCapital(30000)).toBe(90000)
  })
})

describe("generateRepaymentSchedule", () => {
  it("produces correct number of quarters", () => {
    const schedule = generateRepaymentSchedule(1000000, TEST_SCHEME, 2026)
    // 7 years × 4 quarters = 28 quarters
    expect(schedule.length).toBe(28)
  })

  it("labels quarters correctly with startYear", () => {
    const schedule = generateRepaymentSchedule(1000000, TEST_SCHEME, 2026)
    expect(schedule[0].quarter).toBe("Q1-2026")
    expect(schedule[3].quarter).toBe("Q4-2026")
    expect(schedule[4].quarter).toBe("Q1-2027")
  })

  it("first quarters are moratorium (no principal payment)", () => {
    const schedule = generateRepaymentSchedule(1000000, TEST_SCHEME, 2026)
    // 6 months moratorium = 2 quarters
    expect(schedule[0].isMoratorium).toBe(true)
    expect(schedule[0].principal).toBe(0)
    expect(schedule[0].totalPayment).toBe(0)
    expect(schedule[1].isMoratorium).toBe(true)
    expect(schedule[2].isMoratorium).toBe(false)
  })

  it("outstanding balance decreases over time", () => {
    const schedule = generateRepaymentSchedule(1000000, TEST_SCHEME, 2026)
    const firstBalance = schedule[2].outstandingBalance
    const lastBalance = schedule[schedule.length - 1].outstandingBalance
    expect(lastBalance).toBeLessThan(firstBalance)
    expect(lastBalance).toBe(0)
  })

  it("uses current year when startYear not provided", () => {
    const schedule = generateRepaymentSchedule(1000000, TEST_SCHEME)
    const currentYear = new Date().getFullYear()
    expect(schedule[0].quarter).toContain(`-${currentYear}`)
  })
})

describe("computeFullFinancials", () => {
  it("returns all required fields", () => {
    const result = computeFullFinancials(100000, TEST_SCHEME, 80000, 50000, 12000)

    expect(result).toHaveProperty("marginCapital")
    expect(result).toHaveProperty("projectCost")
    expect(result).toHaveProperty("loanAmount")
    expect(result).toHaveProperty("emi")
    expect(result).toHaveProperty("totalInterest")
    expect(result).toHaveProperty("totalPayment")
    expect(result).toHaveProperty("postMoratoriumEMI")
    expect(result).toHaveProperty("riskBuffer")
    expect(result).toHaveProperty("netCashSurplus")
    expect(result).toHaveProperty("netCashSurplusAfterEMI")
    expect(result).toHaveProperty("dscr")
    expect(result).toHaveProperty("breakEvenMonths")
    expect(result).toHaveProperty("recommendedScheme")
    expect(result).toHaveProperty("repaymentSchedule")
  })

  it("projectCost = margin / 0.10", () => {
    const result = computeFullFinancials(100000, TEST_SCHEME)
    expect(result.projectCost).toBe(1000000)
  })

  it("loanAmount = 90% of projectCost", () => {
    const result = computeFullFinancials(100000, TEST_SCHEME)
    expect(result.loanAmount).toBe(900000)
  })

  it("riskBuffer = 1.5 * postMoratoriumEMI", () => {
    const result = computeFullFinancials(100000, TEST_SCHEME)
    expect(result.riskBuffer).toBe(calculateRiskBuffer(result.postMoratoriumEMI))
  })

  it("postMoratoriumEMI > regular EMI (with moratorium)", () => {
    const result = computeFullFinancials(100000, TEST_SCHEME)
    const regularEMI = calculateEMI(result.loanAmount, TEST_SCHEME.interestRate, TEST_SCHEME.tenureYears)
    expect(result.postMoratoriumEMI).toBeGreaterThan(regularEMI)
  })

  it("dscr uses annual net operating income / annual debt service", () => {
    const result = computeFullFinancials(100000, TEST_SCHEME, 80000, 50000, 12000)
    const annualNetIncome = (80000 - 50000 - 12000) * 12
    const annualDebtService = result.postMoratoriumEMI * 12
    const expectedDSCR = Math.round((annualNetIncome / annualDebtService) * 100) / 100
    expect(result.dscr).toBe(expectedDSCR)
  })

  it("startYear flows to repayment schedule", () => {
    const result = computeFullFinancials(100000, TEST_SCHEME, 0, 0, 0, 2030)
    expect(result.repaymentSchedule[0].quarter).toBe("Q1-2030")
    expect(result.repaymentSchedule[4].quarter).toBe("Q1-2031")
  })
})