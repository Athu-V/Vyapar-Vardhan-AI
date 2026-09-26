"use client"

import { useState } from "react"
import type {
  BusinessProfile,
  FeasibilityReport,
  FinancialCalculation,
  BusinessCategory,
} from "@/lib/types"
import { generateFeasibilityReport } from "@/lib/engine/market"
import { computeFullFinancials } from "@/lib/engine/financial"
import { autoSelectScheme, formatSchemeForDisplay } from "@/lib/rules/schemes"
import { CATEGORY_NAMES } from "@/lib/data/sources"
import { formatINR as formatINRUtil } from "@/lib/ui/utils"
import { useLanguage, t } from "@/lib/i18n"
import { useAuth } from "@/lib/firebase"

export default function ReportPage() {
  const { code } = useLanguage()
  const { user } = useAuth()
  const [generated, setGenerated] = useState(false)
  const [profile, setProfile] = useState<BusinessProfile>({
    id: "report-1",
    name: "",
    location: { village: "", block: "", district: "", state: "UP" },
    category: "retail",
    isExistingBusiness: true,
    monthlyRevenue: 80000,
    monthlyCOGS: 50000,
    monthlyOperatingExpenses: 12000,
    availableMarginCapital: 100000,
    singleBuyerDependency: false,
    createdAt: new Date(),
  })

  const [feasibility, setFeasibility] = useState<FeasibilityReport | null>(null)
  const [financial, setFinancial] = useState<FinancialCalculation | null>(null)

  const handleGenerate = () => {
    // Input validation
    if (!profile.name.trim()) {
      alert("Please enter a business name.")
      return
    }
    if (profile.availableMarginCapital <= 0) {
      alert("Margin capital must be greater than 0.")
      return
    }
    if (profile.monthlyCOGS > profile.monthlyRevenue && profile.monthlyRevenue > 0) {
      alert("COGS cannot exceed revenue.")
      return
    }

    // Generate feasibility report
    const feas = generateFeasibilityReport({
      location: profile.location,
      category: profile.category,
      availableMarginCapital: profile.availableMarginCapital,
      isExistingBusiness: profile.isExistingBusiness,
    })
    setFeasibility(feas)

    // Generate financial calculation
    const projectCost = profile.availableMarginCapital / 0.10
    const scheme = autoSelectScheme(projectCost)
    if (scheme) {
      const calc = computeFullFinancials(
        profile.availableMarginCapital,
        scheme,
        profile.monthlyRevenue,
        profile.monthlyCOGS,
        profile.monthlyOperatingExpenses
      )
      setFinancial(calc)
    }

    setGenerated(true)
  }

  const formatINR = formatINRUtil

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      <div className="no-print">
        <h1 className="text-2xl font-bold">{t("report.page.title", code)}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("report.page.sub", code)}
        </p>
      </div>

      {/* Input Form */}
      {!generated && (
        <div className="rounded-lg border p-6 space-y-4 no-print">
          <h2 className="font-bold text-lg">{t("report.business.title", code)}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("report.name", code)}</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="e.g., Sharma General Store"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Village</label>
              <input
                type="text"
                value={profile.location.village}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    location: { ...profile.location, village: e.target.value },
                  })
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="e.g., Ramgarh"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Block</label>
              <input
                type="text"
                value={profile.location.block}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    location: { ...profile.location, block: e.target.value },
                  })
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="e.g., Sadar"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">District</label>
              <input
                type="text"
                value={profile.location.district}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    location: { ...profile.location, district: e.target.value },
                  })
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="e.g., Lucknow"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <input
                type="text"
                value={profile.location.state}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    location: { ...profile.location, state: e.target.value },
                  })
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Category</label>
              <select
                value={profile.category}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    category: e.target.value as BusinessCategory,
                  })
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                {(
                  Object.keys(CATEGORY_NAMES) as BusinessCategory[]
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_NAMES[cat].hi} ({CATEGORY_NAMES[cat].en})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Margin Capital (₹)
              </label>
              <input
                type="number"
                value={profile.availableMarginCapital}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    availableMarginCapital: Number(e.target.value),
                  })
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Monthly Revenue (₹)
              </label>
              <input
                type="number"
                value={profile.monthlyRevenue}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    monthlyRevenue: Number(e.target.value),
                  })
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Monthly COGS (₹)
              </label>
              <input
                type="number"
                value={profile.monthlyCOGS}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    monthlyCOGS: Number(e.target.value),
                  })
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Monthly OpEx (₹)
              </label>
              <input
                type="number"
                value={profile.monthlyOperatingExpenses}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    monthlyOperatingExpenses: Number(e.target.value),
                  })
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full sm:w-auto rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t("report.generate", code)}
          </button>
        </div>
      )}

      {/* NABARD Format Report */}
      {generated && feasibility && financial && (
        <div className="space-y-0">
          {/* Cloud Sync & Auth Banner */}
          <div className="no-print mb-4 rounded-lg border p-4 shadow-sm bg-white">
            {user ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm text-emerald-800">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs">✓</span>
                  <span>
                    <strong>{code === "hi" ? "क्लाउड सिंक सक्रिय:" : "Cloud Sync Active:"}</strong>{" "}
                    {code === "hi"
                      ? `${user.displayName || user.email || user.phoneNumber} के रूप में साइन इन हैं। यह रिपोर्ट आपके खाते से जुड़ी हुई है।`
                      : `Signed in as ${user.displayName || user.email || user.phoneNumber}. This report is linked to your business account.`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/70 p-3 rounded-md border border-amber-200">
                <div className="text-sm text-amber-900">
                  <strong>{code === "hi" ? "☁️ अतिथि मोड (Guest Mode):" : "☁️ Guest Mode:"}</strong>{" "}
                  {code === "hi"
                    ? "आप इस रिपोर्ट को प्रिंट या डाउनलोड कर सकते हैं। अपने खाते में सहेजने और बाद में देखने के लिए साइन इन करें।"
                    : "You can print or download this report. Sign in to permanently save and sync this project report to your account."}
                </div>
                <a
                  href="/sign-in"
                  className="shrink-0 rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  {code === "hi" ? "सहेजने के लिए साइन इन करें" : "Sign In to Save"}
                </a>
              </div>
            )}
          </div>

          {/* Print button */}
          <div className="no-print mb-4 flex gap-3">
            <button
              onClick={() => window.print()}
              className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              🖨️ Print / Save as PDF
            </button>
            <button
              onClick={() => setGenerated(false)}
              className="rounded-md bg-secondary px-6 py-2.5 text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              ← Edit Details
            </button>
          </div>

          {/* Report Content — NABARD Format */}
          <div className="nabard-report rounded-lg border p-8 bg-white">
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <div className="text-xs text-muted-foreground mb-2">
                MINISTRY OF SOCIAL JUSTICE AND EMPOWERMENT
              </div>
              <h1 className="text-xl font-bold">
                MODEL BANKABLE PROJECT REPORT
              </h1>
              <div className="text-sm text-muted-foreground mt-1">
                Under Stand-Up India / Concessional Credit Scheme for
                Micro-Enterprises
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Generated by: Rural Business Advisory Assistant |{" "}
                {new Date().toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Section 1: Applicant Details */}
            <div className="mb-6">
              <h2 className="text-base font-bold border-b border-black pb-1 mb-3">
                1. APPLICANT / ENTERPRISE DETAILS
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium w-1/3">
                      Name of Enterprise
                    </td>
                    <td className="py-1">{profile.name || "Demo Business"}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      Location (Village/Block/District)
                    </td>
                    <td className="py-1">
                      {profile.location.village || "—"},{" "}
                      {profile.location.block || "—"},{" "}
                      {profile.location.district || "—"},{" "}
                      {profile.location.state}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">Business Category</td>
                    <td className="py-1">
                      {CATEGORY_NAMES[profile.category].hi} (
                      {CATEGORY_NAMES[profile.category].en})
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      New / Existing Enterprise
                    </td>
                    <td className="py-1">
                      {profile.isExistingBusiness ? "Existing" : "New"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 2: Project Financials */}
            <div className="mb-6">
              <h2 className="text-base font-bold border-b border-black pb-1 mb-3">
                2. PROJECT FINANCIALS
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium w-1/3">
                      Applicant&apos;s Margin (10%)
                    </td>
                    <td className="py-1">{formatINR(financial.marginCapital)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      Total Project Cost
                    </td>
                    <td className="py-1 font-bold">
                      {formatINR(financial.projectCost)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      Loan Amount (90%)
                    </td>
                    <td className="py-1 font-bold">
                      {formatINR(financial.loanAmount)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">Interest Rate</td>
                    <td className="py-1">
                      {financial.recommendedScheme.interestRate}% per annum
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">Tenure</td>
                    <td className="py-1">
                      {financial.recommendedScheme.tenureYears} years
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">Moratorium</td>
                    <td className="py-1">
                      {financial.recommendedScheme.moratoriumMonths} months
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">Monthly EMI</td>
                    <td className="py-1">{formatINR(financial.emi)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium text-red-700">
                      Post-Moratorium EMI (Actual)
                    </td>
                    <td className="py-1 font-bold text-red-700">
                      {formatINR(financial.postMoratoriumEMI)}/month
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">Total Interest</td>
                    <td className="py-1">{formatINR(financial.totalInterest)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">Total Payment</td>
                    <td className="py-1">{formatINR(financial.totalPayment)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3: Risk Assessment */}
            <div className="mb-6">
              <h2 className="text-base font-bold border-b border-black pb-1 mb-3">
                3. RISK ASSESSMENT
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium w-1/3">
                      Risk Buffer (Min Monthly Profit for Safety)
                    </td>
                    <td className="py-1 font-bold">
                      {formatINR(financial.riskBuffer)}/month
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      Declared Monthly Net Surplus
                    </td>
                    <td className="py-1">
                      {formatINR(financial.netCashSurplus)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      Risk Buffer Status
                    </td>
                    <td className="py-1 font-bold">
                      {financial.netCashSurplus >= financial.riskBuffer
                        ? "✅ MET — Business can survive a bad month"
                        : financial.netCashSurplus > 0
                        ? "⚠️ BELOW THRESHOLD — Thin margin, no safety cushion"
                        : "❌ BREACHED — Do NOT proceed without restructuring"}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      DSCR (Debt Service Coverage Ratio)
                    </td>
                    <td className="py-1">
                      {financial.dscr}{" "}
                      {financial.dscr >= 1.25
                        ? "(Healthy)"
                        : financial.dscr >= 1.0
                        ? "(Tight)"
                        : "(Below 1 — Cannot cover EMI from operations)"}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      Break-Even Period
                    </td>
                    <td className="py-1">
                      {financial.breakEvenMonths === Infinity
                        ? "Never (negative surplus)"
                        : `${financial.breakEvenMonths} months`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 4: Market Analysis */}
            <div className="mb-6">
              <h2 className="text-base font-bold border-b border-black pb-1 mb-3">
                4. MARKET ANALYSIS (Proxy Data — Census × NSSO)
              </h2>
              <p className="text-xs text-muted-foreground mb-3">
                Methodology: Local Demand = Local Population (Census 2011) ×
                Per-Capita Consumption Rate (NSSO 78th Round). Supply estimated
                from Livestock Census 2019 and Udyam Registration data.
              </p>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium w-1/3">
                      Estimated Consumer Base
                    </td>
                    <td className="py-1">
                      {feasibility.marketAnalysis.estimatedConsumerBase.toLocaleString(
                        "en-IN"
                      )}{" "}
                      people (5-10 km radius)
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      Annual Demand Estimate
                    </td>
                    <td className="py-1">
                      {formatINR(feasibility.marketAnalysis.estimatedDemand)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      Current Supply Estimate
                    </td>
                    <td className="py-1">
                      {formatINR(feasibility.marketAnalysis.estimatedSupply)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      Supply-Demand Gap
                    </td>
                    <td className="py-1 font-bold">
                      {feasibility.marketAnalysis.demandDeficit ? "+" : ""}
                      {formatINR(feasibility.marketAnalysis.supplyDemandGap)}{" "}
                      ({feasibility.marketAnalysis.demandDeficit ? "Demand exceeds supply" : "Supply exceeds demand"})
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      Competitor Density
                    </td>
                    <td className="py-1">
                      {feasibility.marketAnalysis.competitorDensity}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 5: Viability Assessment */}
            <div className="mb-6">
              <h2 className="text-base font-bold border-b border-black pb-1 mb-3">
                5. VIABILITY ASSESSMENT
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium w-1/3">
                      Viability Score
                    </td>
                    <td className="py-1 font-bold">
                      {feasibility.financialViability.viabilityScore.toUpperCase()}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      Estimated Monthly Revenue
                    </td>
                    <td className="py-1">
                      {formatINR(
                        feasibility.financialViability.estimatedMonthlyRevenue
                      )}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      Estimated Monthly Expenses
                    </td>
                    <td className="py-1">
                      {formatINR(
                        feasibility.financialViability.estimatedMonthlyExpenses
                      )}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 pr-4 font-medium">
                      Estimated Net Surplus
                    </td>
                    <td className="py-1">
                      {formatINR(
                        feasibility.financialViability.estimatedNetSurplus
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 6: Scheme Details */}
            <div className="mb-6">
              <h2 className="text-base font-bold border-b border-black pb-1 mb-3">
                6. RECOMMENDED SCHEME
              </h2>
              {(() => {
                const display = formatSchemeForDisplay(
                  financial.recommendedScheme
                )
                return (
                  <div className="text-sm">
                    <div className="font-bold">
                      {display.title} ({display.titleHi})
                    </div>
                    <ul className="mt-2 space-y-1">
                      {display.details.map((d, i) => (
                        <li key={i}>• {d}</li>
                      ))}
                    </ul>
                    <div className="text-xs text-muted-foreground mt-3">
                      📄 Source: {display.source} | Last verified:{" "}
                      {display.lastVerified}
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Section 7: Recommendations & Warnings */}
            <div className="mb-6">
              <h2 className="text-base font-bold border-b border-black pb-1 mb-3">
                7. RECOMMENDATIONS & WARNINGS
              </h2>
              <div className="text-sm space-y-2">
                {feasibility.recommendations.map((r, i) => (
                  <div key={i}>• {r}</div>
                ))}
                {feasibility.warnings.length > 0 && (
                  <div className="mt-3 text-red-700 font-medium">
                    {feasibility.warnings.map((w, i) => (
                      <div key={i}>{w}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-black pt-4 mt-8 text-center text-xs text-muted-foreground">
              <p>
                This report was generated by the Rural Business Advisory
                Assistant.
              </p>
              <p className="mt-1">
                All deterministic calculations are performed by verified
                financial formulas. Scheme details sourced from official
                government guidelines.
              </p>
              <p className="mt-1">
                Report generated on:{" "}
                {new Date().toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
