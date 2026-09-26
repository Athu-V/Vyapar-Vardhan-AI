"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase"
import { useLanguage } from "@/lib/i18n"
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth"

export default function SignInPage() {
  const router = useRouter()
  const { code } = useLanguage()
  const isHindi = code === "hi"
  const {
    user,
    loading: authLoading,
    isConfigured,
    signInWithEmail,
    signInWithGoogle,
    setupRecaptcha,
    sendPhoneOtp,
    resetPassword,
  } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone")
  
  // Phone auth state
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

  // Email auth state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [resetSent, setResetSent] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  // Status & loading
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      router.push("/")
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string }
      if (e.code === "auth/popup-closed-by-user") {
        setError(null)
      } else {
        setError(e.message || "Google Sign-In failed.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError(isHindi ? "कृपया ईमेल और पासवर्ड दर्ज करें।" : "Please enter email and password.")
      return
    }

    setError(null)
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      router.push("/")
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === "auth/invalid-credential" || e.code === "auth/user-not-found" || e.code === "auth/wrong-password") {
        setError(isHindi ? "ईमेल या पासवर्ड गलत है।" : "Invalid email or password.")
      } else {
        setError(e.message || "Failed to sign in.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Standardize phone number for India (+91)
    let cleaned = phoneNumber.replace(/[^0-9+]/g, "")
    if (!cleaned.startsWith("+")) {
      if (cleaned.length === 10) cleaned = `+91${cleaned}`
      else if (cleaned.startsWith("91") && cleaned.length === 12) cleaned = `+${cleaned}`
      else cleaned = `+91${cleaned}`
    }

    if (cleaned.length < 12) {
      setError(isHindi ? "कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit mobile number.")
      return
    }

    setLoading(true)
    try {
      const appVerifier = setupRecaptcha("recaptcha-container")
      recaptchaVerifierRef.current = appVerifier
      const confirmation = await sendPhoneOtp(cleaned, appVerifier)
      setConfirmationResult(confirmation)
      setOtpSent(true)
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      console.error("Phone OTP Error:", e)
      if (e.code === "auth/invalid-phone-number") {
        setError(isHindi ? "अमान्य फ़ोन नंबर प्रारूप।" : "Invalid phone number format.")
      } else if (e.code === "auth/quota-exceeded") {
        setError(isHindi ? "एसएमएस कोटा समाप्त हो गया है।" : "SMS quota exceeded.")
      } else {
        setError(e.message || (isHindi ? "OTP भेजने में विफल।" : "Failed to send OTP."))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmationResult || !otp || otp.length < 6) {
      setError(isHindi ? "कृपया 6 अंकों का OTP दर्ज करें।" : "Please enter 6-digit OTP.")
      return
    }

    setError(null)
    setLoading(true)
    try {
      await confirmationResult.confirm(otp)
      router.push("/")
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === "auth/invalid-verification-code") {
        setError(isHindi ? "गलत OTP कोड दर्ज किया गया।" : "Incorrect OTP entered.")
      } else {
        setError(e.message || (isHindi ? "सत्यापन विफल हुआ।" : "Verification failed."))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError(isHindi ? "कृपया पासवर्ड रीसेट के लिए अपना ईमेल दर्ज करें।" : "Please enter your email to reset password.")
      return
    }
    try {
      await resetPassword(email)
      setResetSent(true)
      setError(null)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e.message || "Failed to send password reset email.")
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
            {isHindi ? "अपने खाते में साइन इन करें" : "Sign in to your account"}
          </p>
        </div>

        {/* Configuration Notice if API keys are not set */}
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
          onClick={handleGoogleSignIn}
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
          {isHindi ? "Google के साथ साइन इन करें" : "Sign in with Google"}
        </button>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-border" />
          <span className="absolute bg-white px-3 text-xs uppercase text-muted-foreground">
            {isHindi ? "या" : "or"}
          </span>
        </div>

        {/* Method Tabs */}
        <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => { setActiveTab("phone"); setError(null); }}
            className={`rounded-md py-1.5 transition ${
              activeTab === "phone"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📱 {isHindi ? "फ़ोन OTP" : "Phone OTP"}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("email"); setError(null); }}
            className={`rounded-md py-1.5 transition ${
              activeTab === "email"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ✉️ {isHindi ? "ईमेल" : "Email"}
          </button>
        </div>

        {/* Tab 1: Phone OTP Form */}
        {activeTab === "phone" && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                    {isHindi ? "मोबाइल नंबर" : "Mobile Number"}
                  </label>
                  <div className="flex rounded-lg border border-input shadow-sm focus-within:ring-2 focus-within:ring-emerald-500">
                    <span className="flex items-center px-3 text-sm text-muted-foreground bg-slate-50 border-r border-input rounded-l-lg">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      maxLength={12}
                      className="w-full rounded-r-lg px-3 py-2 text-sm outline-none"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isHindi ? "सत्यापन कोड के लिए 10 अंकों का नंबर डालें" : "Enter 10-digit mobile number for OTP"}
                  </p>
                </div>

                <div id="recaptcha-container"></div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  {loading ? (isHindi ? "भेज रहे हैं..." : "Sending...") : (isHindi ? "OTP प्राप्त करें" : "Get OTP")}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                    {isHindi ? "दर्ज करें 6-अंकीय OTP" : "Enter 6-Digit OTP"}
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full tracking-widest text-center text-lg font-mono rounded-lg border border-input px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>{isHindi ? "OTP भेजा गया:" : "Sent to:"} {phoneNumber}</span>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtp(""); setError(null); }}
                      className="text-emerald-600 hover:underline font-medium"
                    >
                      {isHindi ? "नंबर बदलें" : "Change number"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  {loading ? (isHindi ? "सत्यापित हो रहा है..." : "Verifying...") : (isHindi ? "सत्यापित करें और प्रवेश करें" : "Verify & Sign In")}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Email & Password Form */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
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

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  {isHindi ? "पासवर्ड" : "Password"}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(!showForgot)}
                  className="text-xs text-emerald-600 hover:underline font-medium"
                >
                  {isHindi ? "पासवर्ड भूल गए?" : "Forgot password?"}
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {showForgot && (
              <div className="rounded-lg bg-slate-50 p-3 border border-border text-xs">
                <p className="text-muted-foreground mb-2">
                  {isHindi
                    ? "पासवर्ड रीसेट लिंक प्राप्त करने के लिए ऊपर अपना ईमेल दर्ज करें और क्लिक करें:"
                    : "Enter your email above and click below to receive a password reset link:"}
                </p>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  {resetSent
                    ? (isHindi ? "✓ रीसेट लिंक भेजा गया!" : "✓ Reset link sent!")
                    : (isHindi ? "रीसेट लिंक भेजें" : "Send Reset Email")}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {loading ? (isHindi ? "प्रवेश हो रहा है..." : "Signing in...") : (isHindi ? "साइन इन करें" : "Sign In")}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          {isHindi ? "खाता नहीं है?" : "Don't have an account?"}{" "}
          <Link href="/sign-up" className="font-semibold text-emerald-600 hover:underline">
            {isHindi ? "नया खाता बनाएं" : "Create one now"}
          </Link>
        </div>

      </div>
    </div>
  )
}
