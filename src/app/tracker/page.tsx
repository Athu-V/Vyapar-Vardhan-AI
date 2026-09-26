"use client"

import { useState, useEffect } from "react"
import type { MonthlyEntry, QuarterlyAggregation, HealthReport, FinancialCalculation, BusinessProfile } from "@/lib/types"
import { aggregateQuarterly, generateHealthReport } from "@/lib/rules/health"
import { computeFullFinancials } from "@/lib/engine/financial"
import { autoSelectScheme } from "@/lib/rules/schemes"
import { narrateHealth } from "@/lib/engine/narrator"
import { formatINR as formatINRUtil } from "@/lib/ui/utils"
import { saveBusinessProfile, saveMonthlyEntry, getMonthlyEntries, closeDatabase, getBusinessProfile } from "@/lib/data/db"
import { useLanguage, t } from "@/lib/i18n"
import { useAuth } from "@/lib/firebase"

// Persistent business profile — in production, create from onboarding
const DEMO_BUSINESS_ID = "demo-business"

function loadDemoBusiness(): BusinessProfile | null {
  const existing = getBusinessProfile(DEMO_BUSINESS_ID)
  if (existing) return existing

  const profile: BusinessProfile = {
    id: DEMO_BUSINESS_ID,
    name: "Demo Business",
    location: { village: "Ramgarh", block: "Sadar", district: "Lucknow", state: "UP" },
    category: "retail",
    isExistingBusiness: true,
    monthlyRevenue: 85000,
    monthlyCOGS: 52000,
    monthlyOperatingExpenses: 12000,
    availableMarginCapital: 100000,
    singleBuyerDependency: false,
    createdAt: new Date("2026-01-01"),
  }
  saveBusinessProfile(profile)
  return profile
}

function loadDemoEntries(): MonthlyEntry[] {
  let entries = getMonthlyEntries(DEMO_BUSINESS_ID)
  if (entries.length === 0) {
    // Seed demo data
    const seedEntries: MonthlyEntry[] = [
      { id: "1", businessId: DEMO_BUSINESS_ID, month: "2026-01", revenue: 85000, cogs: 52000, operatingExpenses: 12000, emiPaid: 14000, emiDue: 14000, singleBuyerRevenue: 60000, capturedVia: "whatsapp", capturedAt: new Date("2026-02-01") },
      { id: "2", businessId: DEMO_BUSINESS_ID, month: "2026-02", revenue: 82000, cogs: 51000, operatingExpenses: 11500, emiPaid: 14000, emiDue: 14000, singleBuyerRevenue: 58000, capturedVia: "whatsapp", capturedAt: new Date("2026-03-01") },
      { id: "3", businessId: DEMO_BUSINESS_ID, month: "2026-03", revenue: 78000, cogs: 50000, operatingExpenses: 11000, emiPaid: 14000, emiDue: 14000, singleBuyerRevenue: 55000, capturedVia: "sms", capturedAt: new Date("2026-04-01") },
      { id: "4", businessId: DEMO_BUSINESS_ID, month: "2026-04", revenue: 75000, cogs: 49000, operatingExpenses: 11000, emiPaid: 14000, emiDue: 14000, singleBuyerRevenue: 54000, capturedVia: "whatsapp", capturedAt: new Date("2026-05-01") },
      { id: "5", businessId: DEMO_BUSINESS_ID, month: "2026-05", revenue: 72000, cogs: 48000, operatingExpenses: 10500, emiPaid: 14000, emiDue: 14000, singleBuyerRevenue: 52000, capturedVia: "whatsapp", capturedAt: new Date("2026-06-01") },
      { id: "6", businessId: DEMO_BUSINESS_ID, month: "2026-06", revenue: 68000, cogs: 47000, operatingExpenses: 10000, emiPaid: 14000, emiDue: 14000, singleBuyerRevenue: 50000, capturedVia: "manual", capturedAt: new Date("2026-07-01") },
    ]
    seedEntries.forEach((entry) => saveMonthlyEntry(entry))
    entries = getMonthlyEntries(DEMO_BUSINESS_ID)

  }
  return entries
}

export default function TrackerPage() {
  const { code } = useLanguage()
  const { user } = useAuth()
  // Lazy-load entries on first render (client-side only)
  const [entries, setEntries] = useState<MonthlyEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const [newRevenue, setNewRevenue] = useState("")
  const [newCOGS, setNewCOGS] = useState("")
  const [newOpEx, setNewOpEx] = useState("")
  const [newMonth, setNewMonth] = useState("2026-07")
  const [showReport, setShowReport] = useState(false)
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null)
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyAggregation[]>([])

  useEffect(() => {
    loadDemoBusiness()
    const loadedEntries = loadDemoEntries()
    setEntries(loadedEntries)
    setLoaded(true)
  }, [])

  // Financial calc for the demo business (₹1L margin, Term Loan Scheme)
  const demoCalc: FinancialCalculation = (() => {
    const scheme = autoSelectScheme(1000000)
    return computeFullFinancials(100000, scheme!)
  })()

  const handleAddEntry = () => {
    if (!newRevenue || !newCOGS || !newOpEx) return

    const revenue = Number(newRevenue)
    const cogs = Number(newCOGS)
    const opEx = Number(newOpEx)

    if (revenue <= 0) {
      alert("Revenue must be greater than 0.")
      return
    }
    if (cogs > revenue) {
      alert("COGS cannot exceed revenue — please check your numbers.")
      return
    }
    if (opEx < 0) {
      alert("Operating expenses cannot be negative.")
      return
    }

    const entry: MonthlyEntry = {
      id: String(Date.now()),
      businessId: DEMO_BUSINESS_ID,
      month: newMonth,
      revenue,
      cogs,
      operatingExpenses: opEx,
      emiPaid: demoCalc.postMoratoriumEMI,
      emiDue: demoCalc.postMoratoriumEMI,
      singleBuyerRevenue: revenue * 0.7, // assume 70% from single buyer
      capturedVia: "manual",
      capturedAt: new Date(),
    }

    saveMonthlyEntry(entry)
    setEntries((prev) => [...prev, entry])
    setNewRevenue("")
    setNewCOGS("")
    setNewOpEx("")
  }

  const handleGenerateReport = () => {
    // Aggregate Q1 and Q2 2026
    const q1 = aggregateQuarterly(entries, "Q1-2026")
    const q2 = aggregateQuarterly(entries, "Q2-2026")

    setQuarterlyData([q1, q2])

    const report = generateHealthReport(
      entries,
      "Q2-2026",
      "Q1-2026",
      demoCalc,
      q1
    )

    setHealthReport(report)
    setShowReport(true)
  }

  const formatINR = formatINRUtil

  const healthEmoji = {
    thriving: "🟢",
    surviving: "🟡",
    "at-risk": "🔴",
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">{t("tracker.page.title", code)}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("tracker.page.sub", code)}
        </p>
      </div>

      {/* Cloud Sync / Guest Status */}
      <div className="rounded-lg border p-4 bg-white shadow-sm">
        {user ? (
          <div className="flex items-center gap-2 text-sm text-emerald-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs">✓</span>
            <span>
              <strong>{code === "hi" ? "क्लाउड बैकअप सक्रिय:" : "Cloud Backup Active:"}</strong>{" "}
              {code === "hi"
                ? `${user.displayName || user.email || user.phoneNumber} के रूप में साइन इन हैं। आपके मासिक रिकॉर्ड आपके खाते से जुड़े हुए हैं।`
                : `Signed in as ${user.displayName || user.email || user.phoneNumber}. Your business tracker data is synced to your account.`}
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/70 p-3 rounded-md border border-amber-200">
            <div className="text-sm text-amber-900">
              <strong>{code === "hi" ? "☁️ अतिथि मोड (Guest Mode):" : "☁️ Guest Mode:"}</strong>{" "}
              {code === "hi"
                ? "आपके आंकड़े अभी केवल इसी ब्राउज़र में सुरक्षित हैं। कभी भी किसी भी डिवाइस से देखने और सिंक करने के लिए साइन इन करें।"
                : "Your tracker numbers are currently stored locally in this browser. Sign in to sync your business health history to your cloud profile."}
            </div>
            <a
              href="/sign-in"
              className="shrink-0 rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              {code === "hi" ? "सिंक करने हेतु साइन इन करें" : "Sign In to Sync"}
            </a>
          </div>
        )}
      </div>

      {/* Passive Data Capture Info */}
      <div className="rounded-lg border p-4 bg-blue-50 text-sm">
        <div className="font-bold text-blue-700">
          📱 Passive Data Capture (Doc 2&apos;s Hard Constraint)
        </div>
        <p className="text-blue-600 mt-1">
          No rural entrepreneur will open an app nightly to log numbers. Data
          capture rides the same passive channel as post-loan monitoring:
        </p>
        <ol className="text-blue-600 mt-2 space-y-1 list-decimal list-inside">
          <li>WhatsApp/SMS nudge: &ldquo;Aaj kitna becha? Reply with just the number.&rdquo;</li>
          <li>Escalation to IVR call if ignored for a few days</li>
          <li>Escalation to a human CSC field agent if still unresponsive</li>
          <li>Missing a day or two must not break the tracker — interpolate or flag the gap</li>
        </ol>
      </div>

      {/* Monthly Data Entry */}
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="font-bold text-lg">
          {t("tracker.entry.title", code)}
        </h2>
        <p className="text-sm text-muted-foreground">
          Simulates the WhatsApp/SMS passive capture — in production, this would
          be a simple &ldquo;Aaj kitna becha?&rdquo; prompt.
        </p>

        <div className="grid sm:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("tracker.month", code)}</label>
            <input
              type="month"
              value={newMonth}
              onChange={(e) => setNewMonth(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("tracker.revenue", code)}</label>
            <input
              type="number"
              value={newRevenue}
              onChange={(e) => setNewRevenue(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., 80000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("tracker.cogs", code)}</label>
            <input
              type="number"
              value={newCOGS}
              onChange={(e) => setNewCOGS(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., 50000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("tracker.opex", code)}</label>
            <input
              type="number"
              value={newOpEx}
              onChange={(e) => setNewOpEx(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., 10000"
            />
          </div>
        </div>
        <button
          onClick={handleAddEntry}
          className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          {t("tracker.addEntry", code)}
        </button>

        {/* Existing entries */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4">Month</th>
                <th className="py-2 pr-4">Revenue</th>
                <th className="py-2 pr-4">COGS</th>
                <th className="py-2 pr-4">OpEx</th>
                <th className="py-2 pr-4">EMI</th>
                <th className="py-2 pr-4">Net</th>
                <th className="py-2">Via</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const net =
                  entry.revenue - entry.cogs - entry.operatingExpenses - entry.emiPaid
                return (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 pr-4">{entry.month}</td>
                    <td className="py-2 pr-4">{formatINR(entry.revenue)}</td>
                    <td className="py-2 pr-4">{formatINR(entry.cogs)}</td>
                    <td className="py-2 pr-4">{formatINR(entry.operatingExpenses)}</td>
                    <td className="py-2 pr-4">{formatINR(entry.emiPaid)}</td>
                    <td
                      className={`py-2 pr-4 font-bold ${
                        net >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatINR(net)}
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {entry.capturedVia}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleGenerateReport}
          className="w-full sm:w-auto rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Generate Health Report →
        </button>
      </div>

      {/* Health Report */}
      {showReport && healthReport && (
        <div className="space-y-6">
          {/* Health Verdict */}
          <div
            className={`rounded-lg border-2 p-6 ${
              healthReport.healthState === "thriving"
                ? "border-green-300 bg-green-50"
                : healthReport.healthState === "surviving"
                ? "border-amber-300 bg-amber-50"
                : "border-red-300 bg-red-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-5xl">
                {healthEmoji[healthReport.healthState]}
              </span>
              <div>
                <h2 className="font-bold text-2xl">
                  {healthReport.healthState.toUpperCase()}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {healthReport.healthState === "thriving"
                    ? "Net margin comfortably clears the Risk Buffer; flat-to-rising trend"
                    : healthReport.healthState === "surviving"
                    ? "Positive net cash surplus but thin — EMI is being paid but no cushion for a bad month"
                    : "Net cash surplus trending toward zero/negative over 2+ consecutive periods"}
                </p>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="font-medium">Trend: </span>
              {healthReport.trend === "improving"
                ? "📈 Improving"
                : healthReport.trend === "declining"
                ? "📉 Declining"
                : "➡️ Stable"}
            </div>
          </div>

          {/* Quarterly Comparison */}
          <div className="rounded-lg border p-6">
            <h2 className="font-bold text-lg mb-4">
              📊 Quarterly Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Metric</th>
                    <th className="py-2 pr-4">Q1-2026</th>
                    <th className="py-2 pr-4">Q2-2026</th>
                    <th className="py-2">Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium">Revenue</td>
                    <td className="py-2 pr-4">
                      {formatINR(healthReport.previousQuarter?.totalRevenue || 0)}
                    </td>
                    <td className="py-2 pr-4">
                      {formatINR(healthReport.currentQuarter.totalRevenue)}
                    </td>
                    <td className="py-2">
                      {healthReport.previousQuarter
                        ? `${(
                            ((healthReport.currentQuarter.totalRevenue -
                              healthReport.previousQuarter.totalRevenue) /
                              healthReport.previousQuarter.totalRevenue) *
                            100
                          ).toFixed(1)}%`
                        : "—"}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium">COGS</td>
                    <td className="py-2 pr-4">
                      {formatINR(healthReport.previousQuarter?.totalCOGS || 0)}
                    </td>
                    <td className="py-2 pr-4">
                      {formatINR(healthReport.currentQuarter.totalCOGS)}
                    </td>
                    <td className="py-2">—</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium">OpEx</td>
                    <td className="py-2 pr-4">
                      {formatINR(healthReport.previousQuarter?.totalOpEx || 0)}
                    </td>
                    <td className="py-2 pr-4">
                      {formatINR(healthReport.currentQuarter.totalOpEx)}
                    </td>
                    <td className="py-2">—</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium">EMI Paid</td>
                    <td className="py-2 pr-4">
                      {formatINR(healthReport.previousQuarter?.totalEMI || 0)}
                    </td>
                    <td className="py-2 pr-4">
                      {formatINR(healthReport.currentQuarter.totalEMI)}
                    </td>
                    <td className="py-2">—</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium">
                      Net Cash Surplus
                    </td>
                    <td className="py-2 pr-4">
                      {formatINR(
                        healthReport.previousQuarter?.netCashSurplus || 0
                      )}
                    </td>
                    <td className="py-2 pr-4 font-bold">
                      {formatINR(healthReport.currentQuarter.netCashSurplus)}
                    </td>
                    <td className="py-2 font-bold">
                      {healthReport.currentQuarter.netCashSurplus >= 0
                        ? "✅"
                        : "❌"}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium">Gross Margin %</td>
                    <td className="py-2 pr-4">
                      {healthReport.previousQuarter?.grossMarginPercent || 0}%
                    </td>
                    <td className="py-2 pr-4">
                      {healthReport.currentQuarter.grossMarginPercent}%
                    </td>
                    <td className="py-2">—</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium">Net Margin %</td>
                    <td className="py-2 pr-4">
                      {healthReport.previousQuarter?.netMarginPercent || 0}%
                    </td>
                    <td className="py-2 pr-4 font-bold">
                      {healthReport.currentQuarter.netMarginPercent}%
                    </td>
                    <td className="py-2">—</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium">DSCR</td>
                    <td className="py-2 pr-4">
                      {healthReport.previousQuarter?.dscr || 0}
                    </td>
                    <td className="py-2 pr-4 font-bold">
                      {healthReport.currentQuarter.dscr}
                    </td>
                    <td className="py-2">
                      {healthReport.currentQuarter.dscr >= 1.25
                        ? "✅ Healthy"
                        : healthReport.currentQuarter.dscr >= 1.0
                        ? "⚠️ Tight"
                        : "❌ Below 1"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Health State</td>
                    <td className="py-2 pr-4">
                      {healthEmoji[
                        healthReport.previousQuarter?.healthState || "surviving"
                      ]}{" "}
                      {(healthReport.previousQuarter?.healthState || "surviving")
                        .toUpperCase()}
                    </td>
                    <td className="py-2 pr-4 font-bold">
                      {healthEmoji[healthReport.currentQuarter.healthState]}{" "}
                      {healthReport.currentQuarter.healthState.toUpperCase()}
                    </td>
                    <td className="py-2">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Live DSCR Recomputation */}
          <div className="attribution-deterministic rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-green-600 text-lg">📐</span>
              <h2 className="font-bold text-green-700">
                Live DSCR Recomputation (From Actual Data)
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Recomputed every quarter using actual tracked numbers, not the
              self-declared estimate given at onboarding. This gives a live,
              evidence-backed answer to &ldquo;can I expand / take another
              loan.&rdquo;
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-white rounded-md border text-center">
                <div className="text-xs text-muted-foreground">
                  Live DSCR (Actual)
                </div>
                <div className="text-2xl font-bold mt-1">
                  {healthReport.dscrLive}
                </div>
              </div>
              <div className="p-3 bg-white rounded-md border text-center">
                <div className="text-xs text-muted-foreground">
                  Risk Buffer Status
                </div>
                <div className="text-2xl font-bold mt-1">
                  {healthReport.riskBufferStatus === "met"
                    ? "✅ Met"
                    : healthReport.riskBufferStatus === "breached"
                    ? "⚠️ Breached"
                    : "❌ Critical"}
                </div>
              </div>
              <div className="p-3 bg-white rounded-md border text-center">
                <div className="text-xs text-muted-foreground">
                  Single Buyer Flag
                </div>
                <div className="text-2xl font-bold mt-1">
                  {healthReport.singleBuyerDependencyFlag
                    ? "⚠️ Yes"
                    : "✅ No"}
                </div>
              </div>
            </div>
          </div>

          {/* Automated Insights */}
          <div className="rounded-lg border p-6">
            <h2 className="font-bold text-lg mb-4">
              🔍 Automated Insights (Specific, Not Generic)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Every insight points to a specific line item, not a vague
              sentiment.
            </p>
            <div className="space-y-3">
              {healthReport.insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-md border-l-4 ${
                    insight.severity === "critical"
                      ? "border-red-500 bg-red-50"
                      : insight.severity === "warning"
                      ? "border-amber-500 bg-amber-50"
                      : "border-green-500 bg-green-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {insight.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • Linked to: {insight.linkedLineItem}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{insight.message}</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    {insight.messageHi}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bank-Acceptable Output */}
          <div className="rounded-lg border p-6 bg-muted/30">
            <h2 className="font-bold text-lg mb-3">
              📄 Bank-Acceptable Output (Doc 2, Fact #8)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              A custom-designed PDF will be dismissed by a bank manager who
              trusts a local clerk&apos;s intuition over an app. The report
              must mimic the exact format of the NABARD Model Bankable Project
              Report.
            </p>
            <div className="p-4 bg-white rounded-md border text-sm">
              <div className="font-bold text-center mb-4">
                NABARD Model Bankable Project Report
              </div>
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span>Business Name:</span>
                  <span>Demo Business</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Quarterly Revenue (Latest):</span>
                  <span>{formatINR(healthReport.currentQuarter.totalRevenue)}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Net Margin:</span>
                  <span>{healthReport.currentQuarter.netMarginPercent}%</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>DSCR (Live):</span>
                  <span>{healthReport.dscrLive}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Health Classification:</span>
                  <span>{healthReport.currentQuarter.healthState.toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Report Generated:</span>
                  <span>
                    {healthReport.generatedAt.toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => window.print()}
                  className="no-print rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  🖨️ Print as NABARD Format
                </button>
              </div>
            </div>
          </div>

          {/* LLM Narrator */}
          <div className="attribution-llm rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-600 text-lg">🗣️</span>
              <h2 className="font-bold text-amber-700">
                LLM Narrator Output (Vernacular)
              </h2>
            </div>
            <div className="bg-white rounded-md p-4 text-sm whitespace-pre-wrap border">
              {narrateHealth(healthReport, "hi-en").text}
            </div>
            <details className="mt-3">
              <summary className="text-xs text-muted-foreground cursor-pointer">
                🎤 Voice script (for TTS)
              </summary>
              <div className="mt-2 bg-amber-50 rounded-md p-3 text-sm italic">
                {narrateHealth(healthReport, "hi-en").voiceScript}
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  )
}
