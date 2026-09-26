"use client"

import { useState } from "react"
import type {
  BusinessCategory,
  FinancialCalculation,
  LoanScheme,
} from "@/lib/types"
import { computeFullFinancials } from "@/lib/engine/financial"
import { formatINR as formatINRUtil } from "@/lib/ui/utils"
import { autoSelectScheme, formatSchemeForDisplay } from "@/lib/rules/schemes"
import { narrateFinancials } from "@/lib/engine/narrator"
import { CATEGORY_NAMES } from "@/lib/data/sources"
import SchemeComparisonLink from "./SchemeComparisonLink"
import { useLanguage, t } from "@/lib/i18n"

const CATEGORIES: BusinessCategory[] = [
  "dairy",
  "retail",
  "tailoring",
  "agri-processing",
  "small-manufacturing",
  "services",
  "trading",
  "other",
]

export default function CalculatorPage() {
  const { code } = useLanguage()
  // Onboarding form state
  const [marginCapital, setMarginCapital] = useState<number>(100000)
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0)
  const [monthlyCOGS, setMonthlyCOGS] = useState<number>(0)
  const [monthlyOpEx, setMonthlyOpEx] = useState<number>(0)
  const [category, setCategory] = useState<BusinessCategory>("retail")
  const [isExisting, setIsExisting] = useState<boolean>(true)
  const [showResults, setShowResults] = useState(false)

  // Computed results
  const [calc, setCalc] = useState<FinancialCalculation | null>(null)
  const [scheme, setScheme] = useState<LoanScheme | null>(null)

  const handleCalculate = () => {
    // Input validation
    if (marginCapital <= 0) {
      alert("Margin capital must be greater than 0.")
      return
    }
    if (monthlyCOGS > monthlyRevenue && monthlyRevenue > 0) {
      alert("COGS cannot exceed revenue — please check your numbers.")
      return
    }
    if (monthlyOpEx < 0) {
      alert("Operating expenses cannot be negative.")
      return
    }

    // Step 1: Deterministic — compute project cost
    const projectCost = marginCapital / 0.10

    // Step 2: Rules engine — auto-select scheme
    const selectedScheme = autoSelectScheme(projectCost)

    if (!selectedScheme) {
      alert("Project cost out of scheme range. Please consult a manual advisor.")
      return
    }

    // Step 3: Deterministic — full financial computation
    const financials = computeFullFinancials(
      marginCapital,
      selectedScheme,
      monthlyRevenue,
      monthlyCOGS,
      monthlyOpEx
    )

    setCalc(financials)
    setScheme(selectedScheme)
    setShowResults(true)
  }

  const formatINR = formatINRUtil

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">{t("calculator.page.title", code)}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("calculator.page.sub", code)}
        </p>
      </div>

      {/* Three-Way Attribution Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Deterministic Formula</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Rules Engine</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>LLM Narrator</span>
        </div>
      </div>

      {/* Onboarding Form */}
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="font-bold text-lg">{t("calculator.onboarding.title", code)}</h2>
        <p className="text-sm text-muted-foreground">
          {t("calculator.onboarding.sub", code)}
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Margin Capital */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("calculator.margin", code)}
            </label>
            <input
              type="number"
              value={marginCapital}
              onChange={(e) => setMarginCapital(Number(e.target.value))}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., 100000"
            />
            <p className="text-xs text-muted-foreground">
              How much of your own money can you put in? (10% of project cost)
            </p>
          </div>

          {/* Business Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("calculator.category", code)}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BusinessCategory)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_NAMES[cat].hi} ({CATEGORY_NAMES[cat].en})
                </option>
              ))}
            </select>
          </div>

          {/* Existing/New Business */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("calculator.status", code)}</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={isExisting}
                  onChange={() => setIsExisting(true)}
                />
                {t("calculator.existing", code)}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={!isExisting}
                  onChange={() => setIsExisting(false)}
                />
                {t("calculator.new", code)}
              </label>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("calculator.revenue", code)}
            </label>
            <input
              type="number"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., 50000"
            />
          </div>

          {/* Monthly COGS */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("calculator.cogs", code)}
            </label>
            <input
              type="number"
              value={monthlyCOGS}
              onChange={(e) => setMonthlyCOGS(Number(e.target.value))}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., 30000"
            />
          </div>

          {/* Monthly OpEx */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("calculator.opex", code)}
            </label>
            <input
              type="number"
              value={monthlyOpEx}
              onChange={(e) => setMonthlyOpEx(Number(e.target.value))}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., 10000"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full sm:w-auto rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t("calculator.calculate", code)}
        </button>
      </div>

      {/* Results */}
      {showResults && calc && scheme && (
        <div className="space-y-6">
          {/* Step 1: Deterministic Calculation */}
          <div className="attribution-deterministic rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-green-600 text-lg">📐</span>
              <h2 className="font-bold text-green-700">
                {t("calculator.step1.title", code)}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margin Capital:</span>
                  <span className="font-bold">{formatINR(calc.marginCapital)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ÷ 10% margin rate =
                  </span>
                  <span />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project Cost:</span>
                  <span className="font-bold text-lg">
                    {formatINR(calc.projectCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    × {calc.loanPercentage}% loan =
                  </span>
                  <span />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loan Amount:</span>
                  <span className="font-bold text-lg text-primary">
                    {formatINR(calc.loanAmount)}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly EMI:</span>
                  <span className="font-bold">{formatINR(calc.emi)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Interest:</span>
                  <span className="font-bold">{formatINR(calc.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Payment:</span>
                  <span className="font-bold">{formatINR(calc.totalPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DSCR:</span>
                  <span className="font-bold">{calc.dscr}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Rules Engine — Scheme Selection */}
          <div className="attribution-rules rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-600 text-lg">⚖️</span>
              <h2 className="font-bold text-blue-700">
                {t("calculator.step2.title", code)}
              </h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  IF Project Cost ≤ ₹1.40 Lakh:
                </span>
                <span className={scheme.id === "micro-finance" ? "font-bold text-blue-600" : ""}>
                  Micro Finance Scheme
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  ELSE IF ₹1.40L &lt; Project Cost ≤ ₹50L:
                </span>
                <span className={scheme.id === "term-loan" ? "font-bold text-blue-600" : ""}>
                  Term Loan Scheme
                </span>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <div className="font-bold text-blue-700">
                  → Matched: {scheme.name} ({scheme.nameHi})
                </div>
                <div className="text-blue-600 text-xs mt-1">
                  Because project cost ₹{(calc.projectCost / 100000).toFixed(2)}L
                  falls in the ₹{(scheme.projectCostMin / 100000).toFixed(2)}L–
                  ₹{(scheme.projectCostMax / 100000).toFixed(2)}L range.
                </div>
                {(() => {
                  const display = formatSchemeForDisplay(scheme)
                  return (
                    <div className="mt-2 text-xs space-y-1">
                      {display.details.map((d, i) => (
                        <div key={i}>• {d}</div>
                      ))}
                      <div className="text-muted-foreground mt-2">
                        📄 Source: {display.source} | Last verified:{" "}
                        {display.lastVerified}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* THE SILENT MORATORIUM KILLER */}
          <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-red-600 text-lg">⚠️</span>
              <h2 className="font-bold text-red-700">
                {t("calculator.moratorium.title", code)}
              </h2>
            </div>
            <p className="text-sm text-red-600 mb-3">
              Interest <strong>continues compounding</strong> during the
              moratorium. &ldquo;6 months free&rdquo; ≠ 6 months break.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-md border">
                <div className="text-xs text-muted-foreground">
                  What people think:
                </div>
                <div className="text-lg font-bold text-green-600">
                  &ldquo;EMI starts after {scheme.moratoriumMonths} months&rdquo;
                </div>
              </div>
              <div className="p-3 bg-white rounded-md border-2 border-red-300">
                <div className="text-xs text-muted-foreground">
                  What actually happens:
                </div>
                <div className="text-lg font-bold text-red-600">
                  Post-moratorium EMI: {formatINR(calc.postMoratoriumEMI)}/month
                </div>
                <div className="text-xs text-red-500 mt-1">
                  {(calc.postMoratoriumEMI - calc.emi) > 0
                    ? `${formatINR(calc.postMoratoriumEMI - calc.emi)} MORE than regular EMI`
                    : "Same as regular EMI"}
                </div>
              </div>
            </div>
          </div>

          {/* RISK BUFFER */}
          <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-orange-600 text-lg">🛡️</span>
              <h2 className="font-bold text-orange-700">
                {t("calculator.risk.title", code)}
              </h2>
            </div>
            <p className="text-sm text-orange-600 mb-3">
              Minimum monthly profit required to safely absorb a bad month AND
              still service the EMI. Answers &ldquo;should I actually take this
              loan&rdquo; — not just &ldquo;can I take this loan.&rdquo;
            </p>
            <div className="p-4 bg-white rounded-md border">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {formatINR(calc.riskBuffer)}/month
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  = 1.5 × Post-Moratorium EMI ({formatINR(calc.postMoratoriumEMI)} ×
                  1.5)
                </div>
              </div>
              {monthlyRevenue > 0 && (
                <div className="mt-4 text-sm">
                  <div className="flex justify-between">
                    <span>Your declared net surplus:</span>
                    <span className="font-bold">
                      {formatINR(calc.netCashSurplus)}/month
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Risk Buffer requirement:</span>
                    <span className="font-bold">
                      {formatINR(calc.riskBuffer)}/month
                    </span>
                  </div>
                  <div className="mt-2 p-2 rounded-md text-center font-bold">
                    {calc.netCashSurplus >= calc.riskBuffer ? (
                      <span className="text-green-700 bg-green-50 w-full block rounded p-2">
                        ✅ Your surplus covers the Risk Buffer — you can
                        survive a bad month.
                      </span>
                    ) : calc.netCashSurplus > 0 ? (
                      <span className="text-orange-700 bg-orange-50 w-full block rounded p-2">
                        ⚠️ Your surplus is below the Risk Buffer — one bad
                        month could push you into EMI default.
                      </span>
                    ) : (
                      <span className="text-red-700 bg-red-50 w-full block rounded p-2">
                        ❌ Your business has a negative cash surplus — do NOT
                        take this loan without restructuring.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* NET CASH SURPLUS */}
          <div className="rounded-lg border p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💰</span>
              <h2 className="font-bold">
                {t("calculator.surplus.title", code)}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span>{formatINR(monthlyRevenue)}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">− COGS:</span>
                  <span>{formatINR(monthlyCOGS)}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">− Operating Expenses:</span>
                  <span>{formatINR(monthlyOpEx)}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">− EMI (post-moratorium):</span>
                  <span>{formatINR(calc.postMoratoriumEMI)}/month</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>= Net Cash Surplus:</span>
                  <span
                    className={
                      calc.netCashSurplusAfterEMI >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formatINR(calc.netCashSurplusAfterEMI)}/month
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div
                  className={`p-6 rounded-lg text-center ${
                    calc.netCashSurplusAfterEMI > 0
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="text-4xl mb-2">
                    {calc.netCashSurplusAfterEMI > 0 ? "✅" : "❌"}
                  </div>
                  <div className="font-bold">
                    {calc.netCashSurplusAfterEMI > 0
                      ? "Business is viable as structured"
                      : "Business NOT viable — restructure before taking loan"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REPAYMENT SCHEDULE */}
          <div className="rounded-lg border p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📅</span>
              <h2 className="font-bold">Quarterly Repayment Schedule</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">Period</th>
                    <th className="py-2 pr-4">Quarter</th>
                    <th className="py-2 pr-4">Principal</th>
                    <th className="py-2 pr-4">Interest</th>
                    <th className="py-2 pr-4">Payment</th>
                    <th className="py-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.repaymentSchedule.slice(0, 12).map((period) => (
                    <tr
                      key={period.period}
                      className={`border-b ${
                        period.isMoratorium
                          ? "bg-amber-50"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <td className="py-2 pr-4">
                        {period.isMoratorium ? "🔒" : ""} {period.period}
                      </td>
                      <td className="py-2 pr-4">{period.quarter}</td>
                      <td className="py-2 pr-4">
                        {period.isMoratorium
                          ? "—"
                          : formatINR(period.principal)}
                      </td>
                      <td className="py-2 pr-4">
                        {period.isMoratorium
                          ? `+${formatINR(period.interest)}`
                          : formatINR(period.interest)}
                      </td>
                      <td className="py-2 pr-4 font-bold">
                        {period.isMoratorium ? "MORATORIUM" : formatINR(period.totalPayment)}
                      </td>
                      <td className="py-2">{formatINR(period.outstandingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {calc.repaymentSchedule.length > 12 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Showing first 12 quarters of {calc.repaymentSchedule.length} total.
                </p>
              )}
            </div>
          </div>

          {/* Scheme Comparison Link */}
          <SchemeComparisonLink projectCost={calc.projectCost} />

          {/* LLM Narrator Output */}
          <div className="attribution-llm rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-600 text-lg">🗣️</span>
              <h2 className="font-bold text-amber-700">
                LLM Narrator Output (Vernacular)
              </h2>
            </div>
            <p className="text-xs text-amber-600 mb-3">
              ℹ️ This is the LLM translating deterministic numbers into plain
              language. No numbers were invented — only read from the calculator.
            </p>
            <div className="bg-white rounded-md p-4 text-sm whitespace-pre-wrap border">
              {narrateFinancials(calc, "hi-en").text}
            </div>
            <details className="mt-3">
              <summary className="text-xs text-muted-foreground cursor-pointer">
                🎤 Voice script (for TTS)
              </summary>
              <div className="mt-2 bg-amber-50 rounded-md p-3 text-sm italic">
                {narrateFinancials(calc, "hi-en").voiceScript}
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  )
}
