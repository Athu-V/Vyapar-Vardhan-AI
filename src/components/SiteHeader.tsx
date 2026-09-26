"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useLanguage, APP_LANGUAGES, LanguagePickerPopup } from "@/lib/i18n"
import { useAuth } from "@/lib/firebase"
import { t } from "@/lib/i18n/messages"
import type { UiKey } from "@/lib/i18n/messages"

/**
 * Site navigation header.
 *
 * Hidden in two situations:
 *  1. On the homepage ("/") — that page is the full-screen chat assistant.
 *  2. When this page is embedded inside the toolkit popup iframe
 *     (window.self !== window.top) — the popup has its own module tab bar.
 */
export default function SiteHeader() {
  const { code, setCode } = useLanguage()
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [embedded, setEmbedded] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    try {
      setEmbedded(window.self !== window.top)
    } catch {
      setEmbedded(false)
    }
    // Show the language picker on first visit (no stored choice yet).
    try {
      if (!window.localStorage.getItem("rba-app-language")) setShowPicker(true)
    } catch {
      setShowPicker(false)
    }
  }, [])

  // Hide on the chat homepage and inside the toolkit popup iframe.
  if (embedded || pathname === "/") return null

  return (
    <>
      {showPicker && (
        <LanguagePickerPopup
          onChoose={(chosen) => {
            setCode(chosen)
            setShowPicker(false)
          }}
          onDismiss={() => setShowPicker(false)}
        />
      )}
      <header className="no-print sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏪</span>
          <span className="font-bold text-lg">{t("app.title" as UiKey, code)}</span>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Rural Business Advisory
          </span>
        </div>
        <nav className="flex items-center gap-1 sm:gap-4 text-sm">
          <a
            href="/"
            className="rounded-md px-3 py-2 font-medium hover:bg-muted transition-colors"
          >
            {t("nav.aiChat" as UiKey, code)}
          </a>
          <a
            href="/feasibility"
            className="rounded-md px-3 py-2 font-medium hover:bg-muted transition-colors"
          >
            {t("nav.feasibility" as UiKey, code)}
          </a>
          <a
            href="/calculator"
            className="rounded-md px-3 py-2 font-medium hover:bg-muted transition-colors"
          >
            {t("nav.calculator" as UiKey, code)}
          </a>
          <a
            href="/calculator/schemes"
            className="rounded-md px-3 py-2 font-medium hover:bg-muted transition-colors"
          >
            {t("nav.schemes" as UiKey, code)}
          </a>
          <a
            href="/tracker"
            className="rounded-md px-3 py-2 font-medium hover:bg-muted transition-colors"
          >
            {t("nav.health" as UiKey, code)}
          </a>
          <a
            href="/report"
            className="rounded-md px-3 py-2 font-medium hover:bg-muted transition-colors"
          >
            {t("nav.report" as UiKey, code)}
          </a>
        </nav>
        <div className="ml-2 flex items-center gap-1">
          {APP_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setCode(lang.code)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                code === lang.code
                  ? "bg-muted text-foreground"
                  : "hover:bg-muted/60"
              }`}
              title={`${lang.name} (${lang.native})`}
            >
              {lang.native} ({lang.name})
            </button>
          ))}
        </div>

        {/* User Authentication Status */}
        <div className="ml-3 flex items-center border-l border-border pl-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800"
                title={user.displayName || user.email || user.phoneNumber || "User"}
              >
                {user.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : user.email
                  ? user.email.charAt(0).toUpperCase()
                  : "👤"}
              </div>
              <span className="hidden md:inline text-xs font-medium text-foreground max-w-[120px] truncate">
                {user.displayName || user.email || user.phoneNumber}
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700 font-normal border border-emerald-200" title="Cloud Synced with Firebase">
                ☁️ Synced
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-md border border-input px-2 py-1 text-xs font-medium hover:bg-red-50 hover:text-red-700 transition"
              >
                {code === "hi" ? "लॉग आउट" : "Logout"}
              </button>
            </div>
          ) : (
            <a
              href="/sign-in"
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 transition"
            >
              {code === "hi" ? "साइन इन" : "Sign In"}
            </a>
          )}
        </div>
      </div>
    </header>
    </>
  )
}
