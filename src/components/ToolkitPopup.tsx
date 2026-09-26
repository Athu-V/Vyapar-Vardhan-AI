"use client"

import { useCallback, useEffect, useState } from "react"
import { useLanguage } from "@/lib/i18n"
import { t } from "@/lib/i18n/messages"
import type { UiKey } from "@/lib/i18n/messages"

export type ToolkitModule = "home" | "feasibility" | "calculator" | "schemes" | "tracker" | "report"

const MODULES: { id: ToolkitModule; label: string; emoji: string; url?: string }[] = [
  { id: "home", label: "होम (Home)", emoji: "🏠", url: "/" },
  { id: "feasibility", label: "मार्केट रिपोर्ट (Feasibility)", emoji: "📊", url: "/feasibility" },
  { id: "calculator", label: "लोन कैलकुलेटर (Calculator)", emoji: "🧮", url: "/calculator" },
  { id: "tracker", label: "हेल्थ ट्रैकर (Health)", emoji: "💚", url: "/tracker" },
  { id: "report", label: "सरकारी रिपोर्ट (NABARD Report)", emoji: "📄", url: "/report" },
]

function defaultModuleFor(id: ToolkitModule): ToolkitModule {
  return id === "home" ? "home" : id
}

export default function ToolkitPopup({
  open,
  initialModule = "home",
  onClose,
}: {
  open: boolean
  initialModule?: ToolkitModule
  onClose: () => void
}) {
  const { code } = useLanguage()
  const [active, setActive] = useState<ToolkitModule>(defaultModuleFor(initialModule))
  const close = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    if (open) setActive(defaultModuleFor(initialModule))
  }, [open, initialModule])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, close])

  if (!open) return null

  const activeUrl = MODULES.find((m) => m.id === active)?.url

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#6f6f75] p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("popup.title" as UiKey, code)}
    >
      <div className="mx-auto flex h-full max-w-[1500px] flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-[#edf5f8] shadow-[0_25px_60px_rgba(0,0,0,0.22)]">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <span className="text-2xl">🌱</span>
              <span>व्यापार वर्धन AI</span>
              <span className="text-sm font-medium text-muted-foreground">— विस्तृत टूलकिट (Rural Advisory Toolkit)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {MODULES.filter((m) => m.id !== "home").map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActive(m.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                  active === m.id
                    ? "border-slate-200 bg-white text-slate-900 shadow-sm"
                    : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={close}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-100"
            >
              वापस चेहरा पर जाएं (Back to Chat)
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="w-[300px] border-r border-slate-200 bg-white/70 px-4 py-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-xl">🌱</div>
              <div>
                <div className="text-2xl font-bold text-slate-900">ग्राम व्यापार</div>
                <div className="text-sm text-slate-500">Rural Advisory</div>
              </div>
            </div>

            <nav className="space-y-2">
              {MODULES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActive(m.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium transition ${
                    active === m.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-10 space-y-3 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-700"><span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" /> Formulas</div>
              <div className="flex items-center gap-2 text-sm text-slate-700"><span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" /> Rules</div>
              <div className="flex items-center gap-2 text-sm text-slate-700"><span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" /> Narrator</div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 overflow-hidden bg-[#eef5f7] p-0">
            {active === "home" ? (
              <div className="flex h-full flex-col justify-center p-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-[4px] border-fuchsia-200 bg-white text-3xl shadow-sm">✨</div>
                <div className="text-center">
                  <div className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">⚡ Backed by MoSJE</div>
                  <h2 className="text-5xl font-black tracking-tight text-slate-900">
                    Intelligence
                    <br />
                    For Rural Enterprise
                  </h2>
                  <p className="mx-auto mt-6 max-w-3xl text-2xl text-slate-600">
                    We don’t just tell a rural entrepreneur if they’re eligible for a loan — we tell them if they’ll survive it, and keep proving it every month after.
                  </p>
                  <div className="mt-8 flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setActive("calculator")}
                      className="rounded-full bg-slate-900 px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-slate-800"
                    >
                      💰 Calculate Loan & EMI
                    </button>
                    <button
                      type="button"
                      onClick={() => setActive("feasibility")}
                      className="rounded-full border border-slate-200 bg-white px-6 py-4 text-lg font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                    >
                      📊 Check Feasibility
                    </button>
                  </div>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-4">
                  {[
                    { icon: "₹", value: "30 लाख करोड़", label: "Credit Gap" },
                    { icon: "🏭", value: "7.61 करोड़", label: "MSMEs Registered" },
                    { icon: "📊", value: "27%", label: "Financially Literate" },
                    { icon: "📱", value: "24.6%", label: "Rural Women Online" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-[20px] border border-slate-200 bg-white/70 p-6 text-center shadow-sm">
                      <div className="mb-3 text-4xl text-violet-600">{stat.icon}</div>
                      <div className="text-4xl font-bold text-slate-900">{stat.value}</div>
                      <div className="mt-2 text-lg text-slate-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeUrl ? (
              <iframe
                key={activeUrl}
                src={activeUrl}
                title="Rural Business Advisory Platform"
                className="h-full w-full border-0"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-lg text-slate-500">Select a module to open.</div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
