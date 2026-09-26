"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  type UserCredential,
  type ConfirmationResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth"
import { auth, googleProvider, isFirebaseConfigured } from "./config"

interface AuthContextType {
  user: User | null
  loading: boolean
  isConfigured: boolean
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<UserCredential>
  signInWithGoogle: () => Promise<UserCredential>
  setupRecaptcha: (containerId: string) => RecaptchaVerifier
  sendPhoneOtp: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If not in browser or Firebase is not initialized, stop loading
    if (typeof window === "undefined" || !auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser)
        setLoading(false)

        if (currentUser) {
          try {
            // Import dynamically or directly from modules to avoid circular issues
            const { setActiveUserId, syncUserDataFromCloud } = await import("../data/db")
            const { saveUserProfile } = await import("./firestore")
            setActiveUserId(currentUser.uid)
            saveUserProfile(currentUser.uid, {
              displayName: currentUser.displayName,
              email: currentUser.email,
              phoneNumber: currentUser.phoneNumber,
            }).catch(() => {})
            syncUserDataFromCloud(currentUser.uid).catch(() => {})
          } catch (e) {
            console.warn("Auth sync error:", e)
          }
        } else {
          import("../data/db").then(({ setActiveUserId }) => setActiveUserId(null)).catch(() => {})
        }
      },
      (error) => {
        console.warn("Firebase onAuthStateChanged error:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])


  const signInWithEmail = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password)
  }

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName })
      // Update local state copy with display name
      setUser({ ...cred.user, displayName } as User)
    }
    return cred
  }

  const signInWithGoogle = async () => {
    return await signInWithPopup(auth, googleProvider)
  }

  const setupRecaptcha = (containerId: string) => {
    // Check if an instance already exists on window
    if (typeof window !== "undefined") {
      const w = window as unknown as { recaptchaVerifier?: RecaptchaVerifier }
      if (w.recaptchaVerifier) {
        try {
          w.recaptchaVerifier.clear()
        } catch {
          // ignore
        }
      }
      const verifier = new RecaptchaVerifier(auth, containerId, {
        size: "invisible",
      })
      w.recaptchaVerifier = verifier
      return verifier
    }
    throw new Error("Recaptcha can only be set up on the client.")
  }

  const sendPhoneOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        setupRecaptcha,
        sendPhoneOtp,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
