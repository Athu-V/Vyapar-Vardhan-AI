"use client"

import { useState } from "react"
import type { BusinessCategory, LoanScheme } from "@/lib/types"
import {
  LOAN_SCHEMES,
  getEligibleSchemes,
  formatSchemeForDisplay,
} from "@/lib/rules/schemes"
import { calculateProjectCost } from "@/lib/engine/financial"
import { CATEGORY_NAMES } from "@/lib/data/sources"
import { formatINR } from "@/lib/ui/utils"
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

export default function SchemeComparisonPage() {
  const { code } = useLanguage()
  const [marginCapital, setMarginCapital] = useState(100000)
  const [category, setCategory] = useState<BusinessCategory>("retail")
  const [showAll, setShowAll] = useState(false)

  const projectCost = calculateProjectCost(marginCapital)
  const eligibleSchemes = getEligibleSchemes(projectCost)

  const displaySchemes: LoanScheme[] = showAll ? LOAN_SCHEMES : eligibleSchemes

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">{t("nav.schemes", code)}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Compare every government scheme you qualify for. The auto-selected
          scheme (best fit) is highlighted. All numbers are from official
          government sources with last-verified dates.
        </p>
      </div>

      {/* Input */}
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="font-bold text-lg">📋 Your Details</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Available Margin Capital (₹)
            </label>
            <input
              type="number"
              value={marginCapital}
              onChange={(e) => setMarginCapital(Number(e.target.value))}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., 100000"
            />
            <p className="text-xs text-muted-foreground">
              Your own contribution (10% of project cost)
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Category</label>
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
            <button
              onClick={() => setShowAll(!showAll)}
              className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                showAll
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              }`}
            >
              {showAll
                ? "👁️ Showing All Schemes (click to filter)"
                : "👁️ Show All Schemes for Comparison"}
            </button>
          </div>
        </div>

        {/* Computed project cost */}
        <div className="p-3 bg-green-50 rounded-md border border-green-200 text-sm">
          <span className="font-bold">Project Cost: </span>
          {formatINR(projectCost)} = ₹
          {marginCapital.toLocaleString("en-IN")} ÷ 10%
        </div>
      </div>

      {/* Results */}
      {displaySchemes.length > 0 ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-lg border p-4 bg-muted/30 text-sm">
            <div className="font-medium">
              {displaySchemes.length} scheme
              {displaySchemes.length !== 1 ? "s" : ""} available
            </div>
            <p className="text-muted-foreground mt-1">
              {eligibleSchemes.length === displaySchemes.length
                ? "All shown schemes match your project cost. The first one is auto-selected."
                : `${eligibleSchemes.length} scheme${
                    eligibleSchemes.length !== 1 ? "s" : ""
                  } match your project cost directly. Showing all ${displaySchemes.length} for comparison.`}
            </p>
          </div>

          {/* Scheme cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {displaySchemes.map((scheme, idx) => {
              const display = formatSchemeForDisplay(scheme)
              const isAutoSelected = idx === 0 && idx < eligibleSchemes.length
              const isMatch =
                scheme.projectCostMin <= projectCost &&
                scheme.projectCostMax >= projectCost

              return (
                <div
                  key={scheme.id}
                  className={`rounded-lg border-2 p-6 transition-all ${
                    isAutoSelected
                      ? "border-green-400 bg-green-50 shadow-md"
                      : isMatch
                      ? "border-blue-300 bg-blue-50"
                      : "border-muted bg-white"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{display.title}</h3>
                      <h3 className="font-bold text-lg text-blue-600">
                        {display.titleHi}
                      </h3>
                      {isAutoSelected && (
                        <span className="inline-block mt-2 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          ✅ Auto-selected (best fit)
                        </span>
                      )}
                      {isMatch && !isAutoSelected && (
                        <span className="inline-block mt-2 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          ✓ Eligible
                        </span>
                      )}
                      {!isMatch && (
                        <span className="inline-block mt-2 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          — Not in range for your cost
                        </span>
                      )}
                    </div>
                    <span className="text-2xl">
                      {idx === 0 && isAutoSelected
                        ? "🥇"
                        : idx === 1
                        ? "🥈"
                        : idx === 2
                        ? "🥉"
                        : "📋"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm mb-4">
                    {display.details.map((d, i) => (
                      <div
                        key={i}
                        className="flex justify-between border-b pb-1"
                      >
                        <span className="text-muted-foreground">
                          {d.split(":")[0]}
                        </span>
                        <span className="font-medium">
                          {d.split(":").slice(1).join(":").trim()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Source */}
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    📄 Source: {display.source}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    🕐 Last verified: {display.lastVerified}
                  </div>

                  {/* Eligibility note */}
                  {isMatch && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md text-xs text-blue-600">
                      {scheme.id === "pm-svanidhi" && (
                        <div>
                          <span className="font-medium">Note:</span> Street
                          vendors only (sheltered/accommodation-based). Interest
                          subsidy for timely repayment.
                        </div>
                      )}
                      {scheme.id === "stand-up-india" && (
                        <div>
                          <span className="font-medium">Note:</span> SC/ST or
                          women founder required. Greenfield enterprise only.
                          ₹10L–₹1Cr range.
                        </div>
                      )}
                      {scheme.id === "pmegp" && (
                        <div>
                          <span className="font-medium">Note:</span> Margin:{" "}
                          {category === "small-manufacturing" ||
                          category === "agri-processing"
                            ? "25%"
                            : "10%"}
                          . Implementing agency: KVIC, State DIC, or bank.
                          ₹10L–₹50L range.
                        </div>
                      )}
                      {scheme.id === "mudra-shishu" && (
                        <div>
                          <span className="font-medium">Note:</span> 100% loan
                          coverage. No moratorium. Suitable for micro-enterprises
                          starting out.
                        </div>
                      )}
                      {scheme.id === "micro-finance" && (
                        <div>
                          <span className="font-medium">Note:</span> 6.5%
                          concessional rate. 3-month moratorium. Shortest tenure
                          (3 years).
                        </div>
                      )}
                      {scheme.id === "term-loan" && (
                        <div>
                          <span className="font-medium">Note:</span> 6-month
                          moratorium. Longest tenure (7 years). Lowest monthly
                          EMI among long-term options.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Recommendation */}
          {eligibleSchemes.length > 0 && (
            <div className="rounded-lg border p-6 bg-green-50">
              <h2 className="font-bold text-lg mb-3">
                💡 Recommendation
              </h2>
              <div className="text-sm space-y-2">
                <p>
                  <strong>Auto-selected: {eligibleSchemes[0].name}</strong> —
                  because it matches your project cost of{" "}
                  {formatINR(projectCost)} and offers the best combination of
                  interest rate, tenure, and loan coverage for your situation.
                </p>
                {eligibleSchemes.length > 1 && (
                  <p>
                    You also qualify for {eligibleSchemes.length - 1} other
                    scheme
                    {eligibleSchemes.length - 1 !== 1 ? "s" : ""}. Compare them
                    above — some may offer better terms depending on your
                    specific situation (SC/ST status, women entrepreneur, street
                    vendor, etc.).
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  ℹ️ Final eligibility depends on additional factors not captured
                  here (age, category, gender, SC/ST status, new-vs-existing
                  enterprise). Consult your bank or the scheme&apos;s official
                  portal for definitive eligibility.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border p-6 bg-amber-50 text-center">
          <div className="text-3xl mb-2">💰</div>
          <h2 className="font-bold">
            No schemes match your project cost
          </h2>
          <p className="text-muted-foreground mt-1">
            Project cost {formatINR(projectCost)} is outside all scheme ranges.
            Please consult a manual advisor or consider adjusting your project
            scale.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Try showing all schemes to see the full range available.
          </p>
        </div>
      )}
    </div>
  )
}
