import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db, isFirebaseConfigured } from "./config"
import type {
  BusinessProfile,
  MonthlyEntry,
  HealthReport,
  FinancialCalculation,
  FeasibilityReport,
} from "../types"

// User Profile metadata
export interface UserProfileData {
  uid: string
  displayName?: string | null
  email?: string | null
  phoneNumber?: string | null
  state?: string
  businessType?: string
  createdAt?: unknown
  updatedAt?: unknown
}

// Stored Report structure in Firestore
export interface StoredReportData {
  id: string
  businessId: string
  reportType: "feasibility" | "financial" | "health" | "comprehensive"
  data: Record<string, unknown>
  createdAt: unknown
}

// Chat message structure for cloud persistence
export interface StoredChatMessage {
  id: string
  sender: "user" | "assistant"
  text: string
  timestamp: number
  metadata?: Record<string, unknown>
}

// Helper to convert Firestore timestamp or ISO string to Date
function toDate(val: unknown): Date {
  if (!val) return new Date()
  if (val instanceof Date) return val
  if (typeof val === "object" && val !== null && "toDate" in val) {
    return (val as { toDate: () => Date }).toDate()
  }
  if (typeof val === "string" || typeof val === "number") {
    return new Date(val)
  }
  return new Date()
}

// ============================================================================
// 1. User Profile Management
// ============================================================================

export async function saveUserProfile(
  uid: string,
  profile: Partial<UserProfileData>
): Promise<void> {
  if (!isFirebaseConfigured || !db) return
  try {
    const userRef = doc(db, "users", uid)
    await setDoc(
      userRef,
      {
        ...profile,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.warn("Firestore saveUserProfile error:", error)
  }
}

export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  if (!isFirebaseConfigured || !db) return null
  try {
    const userRef = doc(db, "users", uid)
    const snapshot = await getDoc(userRef)
    if (snapshot.exists()) {
      return snapshot.data() as UserProfileData
    }
    return null
  } catch (error) {
    console.warn("Firestore getUserProfile error:", error)
    return null
  }
}

// ============================================================================
// 2. Business Profile Cloud CRUD
// ============================================================================

export async function saveBusinessProfileToFirestore(
  uid: string,
  profile: BusinessProfile
): Promise<void> {
  if (!isFirebaseConfigured || !db) return
  try {
    const bizRef = doc(db, "users", uid, "businesses", profile.id)
    await setDoc(
      bizRef,
      {
        ...profile,
        createdAt: profile.createdAt ? profile.createdAt.toISOString() : new Date().toISOString(),
        syncedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.warn("Firestore saveBusinessProfile error:", error)
  }
}

export async function getBusinessProfilesFromFirestore(uid: string): Promise<BusinessProfile[]> {
  if (!isFirebaseConfigured || !db) return []
  try {
    const colRef = collection(db, "users", uid, "businesses")
    const snapshot = await getDocs(colRef)
    const profiles: BusinessProfile[] = []
    snapshot.forEach((d) => {
      const data = d.data()
      profiles.push({
        ...data,
        id: d.id,
        createdAt: toDate(data.createdAt),
      } as BusinessProfile)
    })
    return profiles
  } catch (error) {
    console.warn("Firestore getBusinessProfiles error:", error)
    return []
  }
}

export async function deleteBusinessProfileFromFirestore(
  uid: string,
  businessId: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return
  try {
    const bizRef = doc(db, "users", uid, "businesses", businessId)
    await deleteDoc(bizRef)
  } catch (error) {
    console.warn("Firestore deleteBusinessProfile error:", error)
  }
}

// ============================================================================
// 3. Monthly Financial Tracker Entries Cloud CRUD
// ============================================================================

export async function saveMonthlyEntryToFirestore(
  uid: string,
  businessId: string,
  entry: MonthlyEntry
): Promise<void> {
  if (!isFirebaseConfigured || !db) return
  try {
    const entryRef = doc(db, "users", uid, "businesses", businessId, "entries", entry.id)
    await setDoc(
      entryRef,
      {
        ...entry,
        capturedAt: entry.capturedAt ? entry.capturedAt.toISOString() : new Date().toISOString(),
        syncedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.warn("Firestore saveMonthlyEntry error:", error)
  }
}

export async function getMonthlyEntriesFromFirestore(
  uid: string,
  businessId: string
): Promise<MonthlyEntry[]> {
  if (!isFirebaseConfigured || !db) return []
  try {
    const colRef = collection(db, "users", uid, "businesses", businessId, "entries")
    const snapshot = await getDocs(colRef)
    const entries: MonthlyEntry[] = []
    snapshot.forEach((d) => {
      const data = d.data()
      entries.push({
        ...data,
        id: d.id,
        capturedAt: toDate(data.capturedAt),
      } as MonthlyEntry)
    })
    return entries.sort((a, b) => a.month.localeCompare(b.month))
  } catch (error) {
    console.warn("Firestore getMonthlyEntries error:", error)
    return []
  }
}

// ============================================================================
// 4. Feasibility, Health, & Loan Reports Cloud CRUD
// ============================================================================

export async function saveReportToFirestore(
  uid: string,
  report: StoredReportData
): Promise<void> {
  if (!isFirebaseConfigured || !db) return
  try {
    const reportRef = doc(db, "users", uid, "reports", report.id)
    await setDoc(
      reportRef,
      {
        ...report,
        syncedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.warn("Firestore saveReport error:", error)
  }
}

export async function getReportsFromFirestore(
  uid: string,
  businessId?: string
): Promise<StoredReportData[]> {
  if (!isFirebaseConfigured || !db) return []
  try {
    const colRef = collection(db, "users", uid, "reports")
    const snapshot = await getDocs(colRef)
    const reports: StoredReportData[] = []
    snapshot.forEach((d) => {
      const data = d.data() as StoredReportData
      if (!businessId || data.businessId === businessId) {
        reports.push({
          ...data,
          id: d.id,
        })
      }
    })
    return reports
  } catch (error) {
    console.warn("Firestore getReports error:", error)
    return []
  }
}

// ============================================================================
// 5. Advisory Chat History Persistence
// ============================================================================

export async function saveChatSessionToFirestore(
  uid: string,
  sessionId: string,
  messages: StoredChatMessage[]
): Promise<void> {
  if (!isFirebaseConfigured || !db) return
  try {
    const chatRef = doc(db, "users", uid, "chats", sessionId)
    await setDoc(
      chatRef,
      {
        sessionId,
        messages,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.warn("Firestore saveChatSession error:", error)
  }
}

export async function getChatSessionFromFirestore(
  uid: string,
  sessionId: string
): Promise<StoredChatMessage[] | null> {
  if (!isFirebaseConfigured || !db) return null
  try {
    const chatRef = doc(db, "users", uid, "chats", sessionId)
    const snapshot = await getDoc(chatRef)
    if (snapshot.exists()) {
      const data = snapshot.data()
      return (data.messages as StoredChatMessage[]) || []
    }
    return null
  } catch (error) {
    console.warn("Firestore getChatSession error:", error)
    return null
  }
}
