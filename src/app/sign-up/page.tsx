"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase"
import { useLanguage } from "@/lib/i18n"

export default function SignUpPage() {
  const router = useRouter()
  const { code } = useLanguage()
  const isHindi = code === "hi"
  const {
    user,
    loading: authLoading,
    isConfigured,
    signUpWithEmail,
    signInWithGoogle,
  } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignUp = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      router.push("/")
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string }
      if (e.code !== "auth/popup-closed-by-user") {
        setError(e.message || "Google Sign-Up failed.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError(isHindi ? "कृपया अपना नाम दर्ज करें।" : "Please enter your name.")
      return
    }
    if (!email || !password) {
      setError(isHindi ? "कृपया ईमेल और पासवर्ड भरें।" : "Please fill in email and password.")
      return
    }
    if (password.length < 6) {
      setError(isHindi ? "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" : "Password must be at least 6 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError(isHindi ? "पासवर्ड मेल नहीं खाते।" : "Passwords do not match.")
      return
    }

    setError(null)
    setLoading(true)
    try {
      await signUpWithEmail(email, password, name.trim())
      router.push("/")
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === "auth/email-already-in-use") {
        setError(isHindi ? "यह ईमेल पहले से पंजीकृत है। कृपया साइन इन करें।" : "This email is already in use. Please sign in.")
      } else {
        setError(e.message || "Failed to create account.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gradient-to-b from-slate-50 to-emerald-50/20 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-white p-6 sm:p-8 shadow-xl shadow-emerald-900/5">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-2xl text-emerald-700 mb-3 shadow-sm">
            🌾
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isHindi ? "ग्राम व्यापार AI मित्र" : "Rural Advisory Assistant"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isHindi ? "नया उद्यम खाता बनाएं" : "Create your business account"}
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <span className="font-semibold">💡 Developer Note:</span> Firebase keys not configured in <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code>. Update <code className="bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_FIREBASE_API_KEY</code> to enable live Firebase Authentication.
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Google One-Click Login */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-input bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.39 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
            />
          </svg>
          {isHindi ? "Google के साथ साइन अप करें" : "Sign up with Google"}
        </button>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-border" />
          <span className="absolute bg-white px-3 text-xs uppercase text-muted-foreground">
            {isHindi ? "या ईमेल से बनाएं" : "or register with email"}
          </span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
              {isHindi ? "आपका पूरा नाम" : "Full Name"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isHindi ? "उदा. रमेश शर्मा" : "e.g. Ramesh Sharma"}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
              {isHindi ? "ईमेल पता" : "Email Address"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                {isHindi ? "पासवर्ड" : "Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                {isHindi ? "पासवर्ड दोहराएं" : "Confirm"}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 mt-2"
          >
            {loading ? (isHindi ? "खाता बन रहा है..." : "Creating account...") : (isHindi ? "खाता बनाएं" : "Create Account")}
          </button>
        </form>

        {/* Quick Phone link */}
        <div className="mt-4 text-center">
          <Link
            href="/sign-in"
            className="text-xs text-emerald-600 hover:underline font-medium inline-flex items-center gap-1"
          >
            📱 {isHindi ? "फ़ोन नंबर OTP से सीधे साइन इन करें" : "Sign in directly with Phone Number OTP"}
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border pt-4">
          {isHindi ? "पहले से खाता है?" : "Already have an account?"}{" "}
          <Link href="/sign-in" className="font-semibold text-emerald-600 hover:underline">
            {isHindi ? "साइन इन करें" : "Sign in"}
          </Link>
        </div>

      </div>
    </div>
  )
}
