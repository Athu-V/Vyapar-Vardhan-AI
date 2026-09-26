"use client"

import { useState } from "react"
import type { BusinessCategory, FeasibilityReport } from "@/lib/types"
import { generateFeasibilityReport } from "@/lib/engine/market"
import { narrateFeasibility } from "@/lib/engine/narrator"
import { CATEGORY_NAMES, PER_CAPITA_CONSUMPTION, COMPETITOR_DENSITY } from "@/lib/data/sources"
import { formatINR as formatINRUtil } from "@/lib/ui/utils"
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

const STATES = [
  "UP",
  "Bihar",
  "MP",
  "Maharashtra",
  "Rajasthan",
  "WestBengal",
  "TamilNadu",
  "Karnataka",
  "Gujarat",
  "Odisha",
  "DEFAULT",
]

export default function FeasibilityPage() {
  const { code } = useLanguage()
  const [village, setVillage] = useState("")
  const [block, setBlock] = useState("")
  const [district, setDistrict] = useState("")
  const [state, setState] = useState("UP")
  const [category, setCategory] = useState<BusinessCategory>("retail")
  const [marginCapital, setMarginCapital] = useState(100000)
  const [isExisting, setIsExisting] = useState(true)
  const [singleBuyer, setSingleBuyer] = useState(false)

  const [report, setReport] = useState<FeasibilityReport | null>(null)
  const [showReport, setShowReport] = useState(false)

  const handleGenerate = () => {
    // Input validation
    if (!village.trim() || !block.trim() || !district.trim()) {
      alert("Please fill in village, block, and district.")
      return
    }
    if (marginCapital <= 0) {
      alert("Margin capital must be greater than 0.")
      return
    }

    const input = {
      location: { village, block, district, state },
      category,
      availableMarginCapital: marginCapital,
      isExistingBusiness: isExisting,
    }

    const result = generateFeasibilityReport(input)
    result.marketAnalysis.singleBuyerRisk = singleBuyer
    setReport(result)
    setShowReport(true)
  }

  const formatINR = formatINRUtil

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">{t("feasibility.page.title", code)}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("feasibility.page.sub", code)}
        </p>
      </div>

      {/* Input Form */}
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="font-bold text-lg">{t("feasibility.location.title", code)}</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("feasibility.village", code)}</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., Ramgarh"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("feasibility.block", code)}</label>
            <input
              type="text"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., Sadar"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("feasibility.district", code)}</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., Lucknow"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("feasibility.state", code)}</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s === "DEFAULT" ? "Other / Default" : s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("feasibility.category", code)}</label>
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
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("feasibility.margin", code)}</label>
            <input
              type="number"
              value={marginCapital}
              onChange={(e) => setMarginCapital(Number(e.target.value))}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={isExisting}
              onChange={() => setIsExisting(true)}
            />
            Existing business
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!isExisting}
              onChange={() => setIsExisting(false)}
            />
            New business
          </label>
        </div>

        {/* Single-Buyer Dependency Question (Doc 2, Fact #6) */}
        <div className="p-4 bg-amber-50 rounded-md border border-amber-200">
          <div className="font-medium text-sm text-amber-700">
            🏪 Critical Question: &ldquo;Ek buyer ko bechoge ya
            alag-alag?&rdquo;
          </div>
          <div className="flex gap-4 mt-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!singleBuyer}
                onChange={() => setSingleBuyer(false)}
              />
              Multiple buyers (alag-alag)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={singleBuyer}
                onChange={() => setSingleBuyer(true)}
              />
              Single buyer (ek buyer ko)
            </label>
          </div>
          {singleBuyer && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Single buyer dependency = ~40% lower realized profit.
              Consider connecting with the local Mandi board / alternate buyers.
            </p>
          )}
        </div>

        <button
          onClick={handleGenerate}
          className="w-full sm:w-auto rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t("feasibility.generate", code)}
        </button>
      </div>

      {/* Report Results */}
      {showReport && report && (
        <div className="space-y-6">
          {/* Proxy Data Methodology */}
          <div className="rounded-lg border p-6 bg-blue-50">
            <h3 className="font-bold text-blue-700 mb-2">
              📐 Proxy Data Methodology (Honest & Defensible)
            </h3>
            <div className="text-sm text-blue-600 space-y-1">
              <p>
                <strong>Local Demand Estimate</strong> = Local Population (Census)
                × Per-Capita Consumption Rate (NSSO data)
              </p>
              <p>
                <strong>Supply-Demand Gap</strong> = Local Demand Estimate −
                Existing Local Supply (Livestock Census, Udyam units)
              </p>
              <p className="text-xs text-blue-500 mt-2">
                ℹ️ This is stated openly in the product — it builds credibility
                rather than exposing a gap. There is no live &ldquo;local market
                demand&rdquo; API for rural India.
              </p>
            </div>
          </div>

          {/* Market Analysis */}
          <div className="attribution-deterministic rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-green-600 text-lg">📐</span>
              <h2 className="font-bold text-green-700">
                Market Analysis (Deterministic Proxy Data)
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Estimated Consumer Base:
                  </span>
                  <span className="font-bold">
                    {report.marketAnalysis.estimatedConsumerBase.toLocaleString("en-IN")}{" "}
                    people
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Annual Demand Estimate:
                  </span>
                  <span className="font-bold">
                    {formatINR(report.marketAnalysis.estimatedDemand)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Source: Census 2011 × NSSO 78th Round consumption data for{" "}
                  {CATEGORY_NAMES[category].en}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Current Supply Estimate:
                  </span>
                  <span className="font-bold">
                    {formatINR(report.marketAnalysis.estimatedSupply)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Supply-Demand Gap:
                  </span>
                  <span
                    className={`font-bold ${
                      report.marketAnalysis.demandDeficit
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {report.marketAnalysis.demandDeficit ? "+" : ""}
                    {formatINR(report.marketAnalysis.supplyDemandGap)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Competitor Density:
                  </span>
                  <span className="font-bold">
                    {report.marketAnalysis.competitorDensity} (
                    {COMPETITOR_DENSITY[category].avgPerBlock} avg per block)
                  </span>
                </div>
              </div>
            </div>

            {singleBuyer && (
              <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-200 text-sm">
                <span className="text-red-600 font-bold">
                  ⚠️ SINGLE BUYER DEPENDENCY FLAG:
                </span>
                <p className="text-red-600 mt-1">
                  Single buyer dependency = ~40% lower realized profit.
                  Consider connecting with the local Mandi board / alternate
                  buyers. This flag will be recomputed from actual tracked
                  revenue in Module 3.
                </p>
              </div>
            )}
          </div>

          {/* SWOT */}
          <div className="rounded-lg border p-6">
            <h2 className="font-bold text-lg mb-4">
              📋 SWOT Analysis (Tailored to Your Micro-Budget)
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-md bg-green-50 p-4">
                <h3 className="font-bold text-green-700 text-sm">
                  ✅ Strengths
                </h3>
                <ul className="text-sm mt-2 space-y-1">
                  {report.swot.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md bg-red-50 p-4">
                <h3 className="font-bold text-red-700 text-sm">
                  ❌ Weaknesses
                </h3>
                <ul className="text-sm mt-2 space-y-1">
                  {report.swot.weaknesses.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md bg-blue-50 p-4">
                <h3 className="font-bold text-blue-700 text-sm">
                  🚀 Opportunities
                </h3>
                <ul className="text-sm mt-2 space-y-1">
                  {report.swot.opportunities.map((o, i) => (
                    <li key={i}>• {o}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md bg-amber-50 p-4">
                <h3 className="font-bold text-amber-700 text-sm">
                  ⚠️ Threats
                </h3>
                <ul className="text-sm mt-2 space-y-1">
                  {report.swot.threats.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Viability Score */}
          <div className="rounded-lg border p-6">
            <h2 className="font-bold text-lg mb-3">
              📊 Financial Viability Estimate
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Estimated Monthly Revenue:
                  </span>
                  <span className="font-bold">
                    {formatINR(report.financialViability.estimatedMonthlyRevenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Estimated Monthly Expenses:
                  </span>
                  <span className="font-bold">
                    {formatINR(report.financialViability.estimatedMonthlyExpenses)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Estimated Net Surplus:
                  </span>
                  <span className="font-bold">
                    {formatINR(report.financialViability.estimatedNetSurplus)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div
                  className={`p-6 rounded-lg text-center ${
                    report.financialViability.viabilityScore === "high"
                      ? "bg-green-50 border border-green-200"
                      : report.financialViability.viabilityScore === "moderate"
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="text-4xl mb-2">
                    {report.financialViability.viabilityScore === "high"
                      ? "🟢"
                      : report.financialViability.viabilityScore === "moderate"
                      ? "🟡"
                      : "🔴"}
                  </div>
                  <div className="font-bold text-lg">
                    {report.financialViability.viabilityScore.toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Viability Score
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-lg border p-6">
            <h2 className="font-bold text-lg mb-3">
              💡 Recommendations
            </h2>
            <ul className="space-y-2 text-sm">
              {report.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span>•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Warnings */}
          {report.warnings.length > 0 && (
            <div className="rounded-lg border-2 border-red-200 p-6 bg-red-50">
              <h2 className="font-bold text-lg mb-3 text-red-700">
                ⚠️ Warnings
              </h2>
              <ul className="space-y-2 text-sm">
                {report.warnings.map((w, i) => (
                  <li key={i} className="text-red-600">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* LLM Narrator */}
          <div className="attribution-llm rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-600 text-lg">🗣️</span>
              <h2 className="font-bold text-amber-700">
                LLM Narrator Output (Vernacular)
              </h2>
            </div>
            <div className="bg-white rounded-md p-4 text-sm whitespace-pre-wrap border">
              {narrateFeasibility(report, "hi-en").text}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
