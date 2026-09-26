"use client"

import { useEffect } from "react"
import { APP_LANGUAGES, type AppLanguageCode } from "./languages"

const STORAGE_KEY = "rba-app-language"

function getStoredLanguage(): AppLanguageCode | null {
  if (typeof window === "undefined") return null
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  return APP_LANGUAGES.find((l) => l.code === stored)?.code ?? null
}

function setStoredLanguage(code: AppLanguageCode) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, code)
}

export default function LanguagePickerPopup({
  onChoose,
  onDismiss,
}: {
  onChoose: (code: AppLanguageCode) => void
  onDismiss: () => void
}) {
  useEffect(() => {
    if (getStoredLanguage()) {
      onDismiss()
    }
  }, [onDismiss])

  const handleSelect = (code: AppLanguageCode) => {
    setStoredLanguage(code)
    onChoose(code)
    onDismiss()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(78,84,144,0.38),_rgba(18,22,53,0.82))] p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choose your language"
    >
      <div className="w-full max-w-[760px] rounded-[30px] border border-white/20 bg-[#f5f5f5] p-6 shadow-[0_25px_70px_rgba(7,10,30,0.5)] sm:p-8">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_20%,_#7ef9b0,_#2ac06f_55%,_#149f69)] shadow-[0_0_28px_rgba(39,207,130,0.6)]">
          <span className="text-4xl">🌱</span>
        </div>

        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          व्यापार वर्धन AI
        </h2>

        <p className="mt-4 text-center text-[22px] font-medium text-slate-700">
          Choose your language / अपनी भाषा चुनें
        </p>
        <p className="mt-1 text-center text-[18px] font-medium text-slate-500">
          आपली भाषा निवडा
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleSelect("hi")}
            className="rounded-[18px] border border-slate-200 bg-[#eef2f4] px-5 py-6 text-center transition hover:bg-slate-100"
          >
            <div className="text-[40px] font-bold leading-none text-slate-800">हिंदी</div>
            <div className="mt-2 text-sm tracking-[0.22em] text-slate-500">HINDI</div>
          </button>

          <button
            type="button"
            onClick={() => handleSelect("mr")}
            className="rounded-[18px] border border-slate-200 bg-[#eef2f4] px-5 py-6 text-center transition hover:bg-slate-100"
          >
            <div className="text-[40px] font-bold leading-none text-slate-800">मराठी</div>
            <div className="mt-2 text-sm tracking-[0.2em] text-slate-500">MARATHI</div>
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleSelect("en")}
          className="mt-4 flex w-full items-center justify-center rounded-[18px] border border-slate-200 bg-[#eef2f4] px-5 py-6 text-center transition hover:bg-slate-100"
        >
          <div>
            <div className="text-[44px] font-bold tracking-tight text-slate-800">English</div>
            <div className="mt-2 text-sm tracking-[0.3em] text-slate-500">ENGLISH</div>
          </div>
        </button>
      </div>
    </div>
  )
}
