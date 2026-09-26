"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import ToolkitPopup, { type ToolkitModule } from "./ToolkitPopup"
import { autoSelectScheme } from "@/lib/rules/schemes"
import { computeFullFinancials } from "@/lib/engine/financial"
import { formatINR } from "@/lib/ui/utils"
import { LanguagePickerPopup, useLanguage, t, type UiKey } from "@/lib/i18n"
import { useAuth, saveChatSessionToFirestore } from "@/lib/firebase"

/* ============================================================================
   ChatAssistant — Meta-AI-style conversational first interface.
   The chatbot asks normal questions about the user's business first.
   Only when the user asks for further assistance does the main white
   toolkit open — as a popup on top of this chat.
   ============================================================================ */

interface ChatMessage {
  role: "user" | "bot"
  text: string
  chips?: { id: string; label: string }[]
}

interface BizData {
  category: string
  existing: boolean
  margin: number | null
  revenue: number | null
  expenses: number | null
}

// Category definitions — labels are translation keys
const CATEGORIES = [
  { id: "dairy", labelKey: "🥛 डेयरी / दूध (Dairy)" },
  { id: "retail", labelKey: "🌾 किराना दुकान (Retail / Kirana)" },
  { id: "tailoring", labelKey: "🧵 सिलाई / बुटीक (Tailoring)" },
  { id: "agri-processing", labelKey: "🌾 कृषि प्रसंस्करण (Agri-Processing)" },
  { id: "small-manufacturing", labelKey: "⚙️ लघु उद्योग (Manufacturing)" },
  { id: "services", labelKey: "🔧 सेवाएं (Services / Repair)" },
  { id: "trading", labelKey: "📦 व्यापार (Trading)" },
  { id: "other", labelKey: "📋 अन्य (Other)" },
]

// English versions for English mode
const CATEGORY_LABELS_EN: Record<string, string> = {
  dairy: "🥛 Dairy / Milk",
  retail: "🌾 Kirana Store (Retail)",
  tailoring: "🧵 Tailoring / Boutique",
  "agri-processing": "🌾 Agri-Processing",
  "small-manufacturing": "⚙️ Small Manufacturing",
  services: "🔧 Services / Repair",
  trading: "📦 Trading",
  other: "📋 Other",
}

// Hindi versions for Hindi mode
const CATEGORY_LABELS_HI: Record<string, string> = {
  dairy: "🥛 डेयरी / दूध (Dairy)",
  retail: "🌾 किराना दुकान (Retail / Kirana)",
  tailoring: "🧵 सिलाई / बुटीक (Tailoring)",
  "agri-processing": "🌾 कृषि प्रसंस्करण (Agri-Processing)",
  "small-manufacturing": "⚙️ लघु उद्योग (Manufacturing)",
  services: "🔧 सेवाएं (Services / Repair)",
  trading: "📦 व्यापार (Trading)",
  other: "📋 अन्य (Other)",
}

function getCategoryLabel(id: string, lang: string): string {
  if (lang === "en") return CATEGORY_LABELS_EN[id] ?? id
  return CATEGORY_LABELS_HI[id] ?? CATEGORY_LABELS_HI.other
}

function getCategoryChips(lang: string) {
  return CATEGORIES.map((c) => ({
    id: c.id,
    label: getCategoryLabel(c.id, lang),
  }))
}

// Parse "₹50,000", "50 hazar", "1 lakh", "1.5L", "20000" -> number
function parseRupees(text: string): number | null {
  if (!text) return null
  const clean = text.toLowerCase().replace(/,/g, "").replace(/₹/g, "").trim()

  const cr = clean.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|करोड़)/)
  if (cr) return Math.round(parseFloat(cr[1]) * 10000000)

  // lakh / lac / single-letter L
  const lakh = clean.match(
    /(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|लाख|l(?!\\s*[a-z]))/
  )
  if (lakh) return Math.round(parseFloat(lakh[1]) * 100000)

  const thousand = clean.match(
    /(\d+(?:\.\d+)?)\s*(?:k|hazar|hazaar|हज़ार|हजार|thousand)/
  )
  if (thousand) return Math.round(parseFloat(thousand[1]) * 1000)

  const num = clean.match(/\d+(?:\.\d+)?/)
  if (num) return Math.round(parseFloat(num[0]))

  return null
}

// Simple template helper: replace {key} placeholders
function tpl(template: string, vars: Record<string, string | number>): string {
  let result = template
  for (const [k, v] of Object.entries(vars)) {
    result = result.replaceAll(`{${k}}`, String(v))
  }
  return result
}

export default function ChatAssistant() {
  const { code: lang, setCode } = useLanguage()
  const { user, logout } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [stage, setStage] = useState<
    | "welcome"
    | "category"
    | "existing"
    | "margin"
    | "revenue"
    | "expenses"
    | "done"
  >("welcome")

  const [biz, setBiz] = useState<BizData>({
    category: "",
    existing: true,
    margin: null,
    revenue: null,
    expenses: null,
  })

  const [popupOpen, setPopupOpen] = useState(false)
  const [popupModule, setPopupModule] = useState<ToolkitModule>("home")
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const openToolkit = useCallback((module: ToolkitModule = "calculator") => {
    setPopupModule(module)
    setPopupOpen(true)
  }, [])

  const push = useCallback(
    (role: "user" | "bot", text: string, chips?: ChatMessage["chips"]) => {
      setMessages((m) => [...m, { role, text, chips }])
    },
    []
  )

  const botSay = useCallback(
    (
      text: string,
      chips?: ChatMessage["chips"],
      thenStage?: (typeof stage) | null,
      delay = 600
    ) => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        push("bot", text, chips)
        if (thenStage) setStage(thenStage)
      }, delay)
    },
    [push]
  )

  // Auto-scroll to newest message
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isTyping])

  // Welcome message — the very first thing the user sees
  const bootedRef = useRef(false)
  useEffect(() => {
    if (bootedRef.current) return
    bootedRef.current = true
    push("bot", t("chat.welcome", lang), getCategoryChips(lang))
    setStage("category")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-sync advisory chat messages to Cloud Firestore for authenticated users
  useEffect(() => {
    if (!user || messages.length <= 1) return
    const timer = setTimeout(() => {
      saveChatSessionToFirestore(
        user.uid,
        "advisory-current",
        messages.map((m, idx) => ({
          id: `msg-${idx}`,
          sender: m.role === "user" ? "user" : "assistant",
          text: m.text,
          timestamp: Date.now(),
        }))
      ).catch(() => {})
    }, 1500)
    return () => clearTimeout(timer)
  }, [user, messages])


  // -------------------------------------------------------------------------
  // Chat flow handlers
  // -------------------------------------------------------------------------

  const askExisting = (text: string) => {
    const lower = text.toLowerCase()
    const isNew =
      lower.includes("new") ||
      lower.includes("नया") ||
      lower.includes("शुरू") ||
      lower.includes("start")
    const isExisting =
      lower.includes("existing") ||
      lower.includes("पुरान") ||
      lower.includes("चल रह") ||
      lower.includes("already") ||
      lower.includes("है") ||
      lower.includes("चालू")

    // Fallback to chips if unclear — treat as existing for progress.
    setBiz((b) => ({ ...b, existing: isNew ? false : true }))

    const responseKey: UiKey = isNew
      ? "chat.existing.response.new"
      : isExisting
        ? "chat.existing.response.yes"
        : "chat.existing.response.fallback"

    botSay(t(responseKey, lang), undefined, "margin")
  }

  const handleText = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    // Ignore input while the bot is still replying — prevents queued replies
    // from a stale conversation stage (double questions).
    if (isTyping) return

    push("user", text)
    setInput("")

    if (stage === "done") {
      const lower = text.toLowerCase()
      const wantsCalc =
        lower.includes("calculator") ||
        lower.includes("कैलकुलेटर") ||
        lower.includes("emi") ||
        lower.includes("लोन") ||
        lower.includes("कर्ज")
      const wantsReport =
        lower.includes("report") ||
        lower.includes("रिपोर्ट") ||
        lower.includes("market") ||
        lower.includes("बाज़ार") ||
        lower.includes("मांग") ||
        lower.includes("feasib")
      const wantsHealth =
        lower.includes("health") ||
        lower.includes("हेल्थ") ||
        lower.includes("tracker") ||
        lower.includes("ट्रैकर") ||
        lower.includes("स्वास्थ्य")
      const wantsSchemes =
        lower.includes("scheme") ||
        lower.includes("योजना") ||
        lower.includes("schemes")
      const wantsToolkit =
        lower.includes("toolkit") ||
        lower.includes("टूलकिट") ||
        lower.includes("विस्तृत") ||
        lower.includes("popup") ||
        lower.includes("पॉपअप") ||
        lower.includes("खोलो") ||
        lower.includes("पूरा")

      if (wantsToolkit) {
        botSay(t("chat.done.openToolkit", lang), undefined, "done")
        setTimeout(() => openToolkit("calculator"), 800)
        return
      }
      if (wantsCalc) {
        botSay(t("chat.done.openCalc", lang), undefined, "done")
        setTimeout(() => openToolkit("calculator"), 800)
        return
      }
      if (wantsReport) {
        botSay(t("chat.done.openFeas", lang), undefined, "done")
        setTimeout(() => openToolkit("feasibility"), 800)
        return
      }
      if (wantsSchemes) {
        botSay(t("chat.done.openSchemes", lang), undefined, "done")
        setTimeout(() => openToolkit("schemes"), 800)
        return
      }
      if (wantsHealth) {
        botSay(t("chat.done.openHealth", lang), undefined, "done")
        setTimeout(() => openToolkit("tracker"), 800)
        return
      }

      botSay(
        t("chat.done.generic", lang),
        [
          { id: "restart-analysis", label: t("chat.chip.restart", lang) },
          {
            id: "open-toolkit",
            label: t("chat.chip.openToolkit", lang),
          },
        ],
        "done"
      )
      return
    }

    if (stage === "category" || stage === "welcome") {
      const lower = text.toLowerCase()
      let category = "other"
      if (
        lower.includes("dairy") ||
        lower.includes("डेयरी") ||
        lower.includes("दूध") ||
        lower.includes("गाय")
      )
        category = "dairy"
      else if (
        lower.includes("retail") ||
        lower.includes("kirana") ||
        lower.includes("किराना") ||
        lower.includes("दुकान") ||
        lower.includes("grocery") ||
        lower.includes("जनरल स्टोर")
      )
        category = "retail"
      else if (
        lower.includes("tailor") ||
        lower.includes("सिलाई") ||
        lower.includes("बुटीक") ||
        lower.includes("कपड़ा")
      )
        category = "tailoring"
      else if (
        lower.includes("agri") ||
        lower.includes("प्रसंस्करण") ||
        lower.includes("कृषि") ||
        lower.includes("फूड")
      )
        category = "agri-processing"
      else if (
        lower.includes("manufactur") ||
        lower.includes("उद्योग") ||
        lower.includes("फैक्ट्री") ||
        lower.includes("factory")
      )
        category = "small-manufacturing"
      else if (
        lower.includes("service") ||
        lower.includes("सेवा") ||
        lower.includes("रिपेयर") ||
        lower.includes("repair")
      )
        category = "services"
      else if (
        lower.includes("trading") ||
        lower.includes("व्यापार") ||
        lower.includes("थोक")
      )
        category = "trading"

      setBiz((b) => ({ ...b, category }))
      const label = getCategoryLabel(category, lang)

      botSay(
        `${label} — ${lang === "hi" ? "बहुत अच्छा! 👍" : "Great! 👍"}\n\n**${lang === "hi" ? "अगला सवाल: क्या यह व्यवसाय पहले से चल रहा है, या नया शुरू करना है?" : "Next question: Is this business already running, or starting new?"}**`,
        [
          { id: "existing-yes", label: t("chat.existing.yes", lang) },
          { id: "existing-new", label: t("chat.existing.new", lang) },
        ],
        "existing"
      )
      return
    }

    if (stage === "existing") {
      askExisting(text)
      return
    }

    if (stage === "margin") {
      const amt = parseRupees(text)
      if (amt === null) {
        botSay(t("chat.margin.error", lang), undefined, "margin")
        return
      }
      setBiz((b) => ({ ...b, margin: amt }))
      botSay(
        amt > 0
          ? tpl(t("chat.margin.prompt", lang), { amount: formatINR(amt) })
          : t("chat.margin.response.zero", lang),
        undefined,
        "revenue"
      )
      return
    }

    if (stage === "revenue") {
      const amt = parseRupees(text)
      if (amt === null) {
        botSay(t("chat.revenue.response", lang), undefined, "revenue")
        return
      }
      setBiz((b) => ({ ...b, revenue: amt }))
      botSay(
        tpl(t("chat.revenue.prompt", lang), { amount: formatINR(amt) }),
        undefined,
        "expenses"
      )
      return
    }

    if (stage === "expenses") {
      const amt = parseRupees(text)
      if (amt === null) {
        botSay(t("chat.expenses.response", lang), undefined, "expenses")
        return
      }
      const b = { ...biz, expenses: amt }
      setBiz(b)
      finishAnalysis(b)
      return
    }
  }

  // -------------------------------------------------------------------------
  // Analysis result — after questions, offer the toolkit as a popup
  // -------------------------------------------------------------------------

  const finishAnalysis = (b: BizData) => {
    const revenue = b.revenue || 0
    const expenses = b.expenses || 0
    const surplus = revenue - expenses
    const margin = b.margin || 0

    let resultText = t("chat.summary.title", lang)

    // P&L quick read
    const netPct = revenue > 0 ? Math.round((surplus / revenue) * 100) : 0
    resultText +=
      tpl(t("chat.summary.revenue", lang), { amount: formatINR(revenue) }) +
      tpl(t("chat.summary.expenses", lang), { amount: formatINR(expenses) }) +
      tpl(t("chat.summary.surplus", lang), {
        amount: formatINR(Math.max(0, surplus)),
        pct: netPct,
      })

    if (surplus <= 0) {
      resultText += t("chat.summary.warning", lang)
    }

    if (margin > 0) {
      const projectCost = margin / 0.1
      const scheme = autoSelectScheme(projectCost)
      if (scheme) {
        const calc = computeFullFinancials(
          margin,
          scheme,
          revenue,
          Math.round(expenses * 0.8),
          Math.round(expenses * 0.2)
        )
        resultText +=
          t("chat.summary.loan.title", lang) +
          tpl(t("chat.summary.loan.projectCost", lang), {
            amount: formatINR(calc.projectCost),
          }) +
          tpl(t("chat.summary.loan.amount", lang), {
            amount: formatINR(calc.loanAmount),
            scheme: lang === "hi" ? scheme.nameHi : scheme.name,
          }) +
          tpl(t("chat.summary.loan.emi", lang), {
            amount: formatINR(calc.emi),
          }) +
          tpl(t("chat.summary.loan.postMoratorium", lang), {
            amount: formatINR(calc.postMoratoriumEMI),
          }) +
          tpl(t("chat.summary.loan.buffer", lang), {
            amount: formatINR(calc.riskBuffer),
          })
      }
    }

    resultText += t("chat.summary.foot", lang)

    botSay(
      resultText,
      [
        { id: "open-calc", label: t("chat.chip.openCalc", lang) },
        { id: "open-feas", label: t("chat.chip.openFeas", lang) },
        { id: "open-health", label: t("chat.chip.openHealth", lang) },
        { id: "open-schemes", label: t("chat.chip.openSchemes", lang) },
        { id: "open-toolkit", label: t("chat.chip.openToolkit", lang) },
      ],
      "done"
    )
  }

  const handleChip = (id: string, label: string) => {
    if (isTyping) return
    if (id.startsWith("open-")) {
      push("user", label)
      const map: Record<string, ToolkitModule> = {
        "open-calc": "calculator",
        "open-feas": "feasibility",
        "open-health": "tracker",
        "open-schemes": "schemes",
      }
      if (id === "open-toolkit") {
        botSay(t("chat.done.openToolkitFull", lang), undefined, "done", 500)
      } else {
        const doneKey: UiKey =
          id === "open-calc"
            ? "chat.done.openCalc"
            : id === "open-feas"
              ? "chat.done.openFeas"
              : id === "open-health"
                ? "chat.done.openHealth"
                : "chat.done.openSchemes"
        botSay(t(doneKey, lang), undefined, "done", 500)
      }
      const mod =
        id === "open-toolkit" ? "calculator" : map[id] || "calculator"
      setTimeout(() => openToolkit(mod), 900)
      return
    }
    if (id === "restart-analysis") {
      push("user", label)
      setStage("welcome")
      setBiz({
        category: "",
        existing: true,
        margin: null,
        revenue: null,
        expenses: null,
      })
      botSay(
        `${lang === "hi" ? "चलिए फिर से शुरू करते हैं! 🎯" : "Let's start over! 🎯"}\n\n**${lang === "hi" ? "आपका व्यवसाय किस क्षेत्र में है?" : "Which field is your business in?"}**`,
        getCategoryChips(lang),
        "category",
        500
      )
      return
    }
    handleText(label)
  }

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const renderBold = (text: string) => {
    // Very small formatter for **bold** and newlines
    const parts = text.split("**")
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-semibold">
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  return (
    <>
      <div className="flex min-h-dvh flex-col bg-[#eaf3f7] text-slate-800">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-white shadow-md"
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, #8fe6b0, #4ebd74 55%, #1d8f54)",
              }}
            >
              🌱
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2 text-[1.15rem] font-bold text-slate-900">
                <span>Vyapar Vardhan AI</span>
                <span className="inline-block h-2 w-2 rounded-full bg-[#19c25b]" />
              </div>
              <div className="text-xs text-slate-500">Rural AI Advisor</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm text-xs font-medium text-slate-700">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  {user.displayName
                    ? user.displayName.charAt(0).toUpperCase()
                    : user.email
                    ? user.email.charAt(0).toUpperCase()
                    : "👤"}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">
                  {user.displayName || user.email || user.phoneNumber}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700 font-normal border border-emerald-200" title="Cloud Synced with Firebase">
                  ☁️ Synced
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-red-600 hover:text-red-800 transition font-semibold ml-1"
                  title={lang === "hi" ? "लॉग आउट" : "Log out"}
                >
                  {lang === "hi" ? "लॉग आउट" : "Exit"}
                </button>
              </div>
            ) : (
              <a
                href="/sign-in"
                className="rounded-full border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                {lang === "hi" ? "साइन इन" : "Sign In"}
              </a>
            )}

            <button
              type="button"
              onClick={() => setShowLanguagePicker(true)}
              className="rounded-full border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              {lang === "hi" ? "भाषा बदलें" : "Language"}
            </button>
            <button
              type="button"
              onClick={() => openToolkit("home")}
              className="rounded-full bg-[#2f7df6] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-[#2567d6]"
            >
              Full Advisory Toolkit <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase">Popup</span>
            </button>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-[1200px]">
            {messages.length > 0 || isTyping ? (
              <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] rings-1 ring-white/60">
                <div ref={scrollRef} className="max-h-[58vh] space-y-4 overflow-y-auto rounded-[18px] bg-[#f3f8fb] p-4">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-base leading-7 shadow-sm ${
                          message.role === "user"
                            ? "bg-[#2f7df6] text-white"
                            : "bg-white text-slate-700 ring-1 ring-slate-200"
                        }`}
                      >
                        <div className="whitespace-pre-line">{renderBold(message.text)}</div>
                        {message.chips && message.chips.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.chips.map((chip) => (
                              <button
                                key={chip.id}
                                type="button"
                                onClick={() => handleChip(chip.id, chip.label)}
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50"
                              >
                                {chip.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-white px-4 py-3 text-slate-600 ring-1 ring-slate-200 shadow-sm">
                        Typing...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] rings-1 ring-white/60">
                <div className="rounded-[20px] border border-[#cdd8e0] bg-[#edf4f6] p-10 shadow-inner shadow-white/40">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-[#f5d4ff] bg-white text-4xl shadow-[0_0_18px_rgba(220,124,255,0.35)]">
                    ✨
                  </div>

                  <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-[3rem]">
                      Welcome! I am your <span className="font-extrabold">Vyapar Vardhan AI.</span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-600 md:text-[1.4rem]">
                      Empowering rural micro-entrepreneurs with simple vernacular insights on enterprise
                      feasibility, subsidized credit, and profit optimization.
                    </p>
                  </div>

                  <div className="mt-8 text-center">
                    <div className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-700">
                      POPULAR INQUIRIES:
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {[
                        "Check Enterprise Profit & Loss",
                        "Grocery / Kirana Store Loan",
                        "Dairy Farming & Subsidy",
                        "Tractor & Farm Equipment",
                        "Tailoring & Women SHG",
                        "MUDRA & Stand-Up India Scheme",
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleText(chip)}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="border-t border-slate-200 bg-white/80 px-4 pb-5 pt-4">
          <div className="mx-auto flex max-w-[1200px] items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              🎙️
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleText(input)
              }}
              placeholder="Speak or type your enterprise query..."
              className="min-w-0 flex-1 border-0 bg-transparent text-base text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleText(input)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f7df6] text-xl font-semibold text-white shadow-sm transition hover:bg-[#2567d6]"
              aria-label="Send"
            >
              ↑
            </button>
          </div>
        </footer>
      </div>

      {showLanguagePicker && (
        <LanguagePickerPopup
          onChoose={(chosen) => {
            setCode(chosen)
            setShowLanguagePicker(false)
          }}
          onDismiss={() => setShowLanguagePicker(false)}
        />
      )}

      <ToolkitPopup
        open={popupOpen}
        initialModule={popupModule}
        onClose={() => setPopupOpen(false)}
      />
    </>
  )
}
