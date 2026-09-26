"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { APP_LANGUAGES, type AppLanguageCode } from "./languages"

const STORAGE_KEY = "rba-app-language"

type LanguageContextValue = {
  code: AppLanguageCode
  setCode: (code: AppLanguageCode) => void
  nativeName: string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const DEFAULT_LANGUAGE: AppLanguageCode = "en"

function getStoredLanguage(): AppLanguageCode {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return DEFAULT_LANGUAGE
  return (APP_LANGUAGES.find((l) => l.code === stored)?.code) ?? DEFAULT_LANGUAGE
}

function setStoredLanguage(code: AppLanguageCode) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, code)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [code, setCodeState] = useState<AppLanguageCode>(DEFAULT_LANGUAGE)
  const [nativeName, setNativeName] = useState<string>("English")

  const setCode = useCallback((next: AppLanguageCode) => {
    setCodeState(next)
    setStoredLanguage(next)
    const found = APP_LANGUAGES.find((l) => l.code === next)
    setNativeName(found?.native ?? next)
  }, [])

  // Hydrate from storage on mount (client only).
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setCode(getStoredLanguage())
    }
  }, [setCode])

  // Keep HTML lang attribute in sync.
  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.lang = code
  }, [code])

  return (
    <LanguageContext.Provider
      value={{ code, setCode, nativeName }}
      children={children}
    />
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider")
  }
  return context
}
