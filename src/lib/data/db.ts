// ============================================================================
// Hybrid Persistence Layer: localStorage + Cloud Firestore Sync
// ============================================================================
// Stores business profiles, monthly tracker entries, and generated reports.
// Uses browser localStorage for zero-latency, offline-first performance,
// and automatically syncs to Firebase Cloud Firestore when user is authenticated.
// ============================================================================

import type {
  BusinessProfile,
  MonthlyEntry,
  HealthReport,
  FinancialCalculation,
} from "../types"

import {
  saveBusinessProfileToFirestore,
  getBusinessProfilesFromFirestore,
  saveMonthlyEntryToFirestore,
  getMonthlyEntriesFromFirestore,
  saveReportToFirestore,
  getReportsFromFirestore,
} from "../firebase/firestore"

// ---------------------------------------------------------------------------
// Active User Context for Background Cloud Sync
// ---------------------------------------------------------------------------

let activeUserId: string | null = null

export function setActiveUserId(uid: string | null): void {
  activeUserId = uid
}

export function getActiveUserId(): string | null {
  return activeUserId
}

// ---------------------------------------------------------------------------
// Internal storage helpers (localStorage with in-memory fallback for SSR/Tests)
// ---------------------------------------------------------------------------

const STORAGE_PREFIX = "rural-advisory:"
const memoryStore = new Map<string, string>()

function key(entity: string, id: string): string {
  return `${STORAGE_PREFIX}${entity}:${id}`
}

function getAll(entity: string): string[] {
  const prefix = `${STORAGE_PREFIX}${entity}:`
  if (typeof window !== "undefined" && window.localStorage) {
    const all = Object.keys(localStorage).filter((k) => k.startsWith(prefix))
    return all.map((k) => k.slice(prefix.length))
  }
  const all = Array.from(memoryStore.keys()).filter((k) => k.startsWith(prefix))
  return all.map((k) => k.slice(prefix.length))
}

function read<T>(entity: string, id: string): T | null {
  try {
    let raw: string | null = null
    if (typeof window !== "undefined" && window.localStorage) {
      raw = localStorage.getItem(key(entity, id))
    } else {
      raw = memoryStore.get(key(entity, id)) ?? null
    }
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write<T>(entity: string, id: string, value: T): void {
  try {
    const serialized = JSON.stringify(value)
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(key(entity, id), serialized)
    } else {
      memoryStore.set(key(entity, id), serialized)
    }
  } catch (e) {
    console.error("Storage write failed:", e)
  }
}


// ---------------------------------------------------------------------------
// Business Profile CRUD (Offline-First + Cloud Dual-Write)
// ---------------------------------------------------------------------------

export function saveBusinessProfile(profile: BusinessProfile, uid?: unknown): void {
  // 1. Write to local storage for zero latency
  write("profiles", profile.id, profile)

  // 2. Dual-write asynchronously to Firebase Cloud Firestore if user is signed in
  const targetUid = typeof uid === "string" ? uid : activeUserId
  if (targetUid) {
    saveBusinessProfileToFirestore(targetUid, profile).catch((err) => {
      console.warn("Cloud sync failed for profile, preserved locally:", err)
    })
  }
}

export function getBusinessProfile(id: string): BusinessProfile | null {
  return read<BusinessProfile>("profiles", id)
}

export function listBusinessProfiles(): BusinessProfile[] {
  return getAll("profiles")
    .map((id) => read<BusinessProfile>("profiles", id))
    .filter((p): p is BusinessProfile => p !== null)
}

// ---------------------------------------------------------------------------
// Monthly Entry CRUD (Offline-First + Cloud Dual-Write)
// ---------------------------------------------------------------------------

export function saveMonthlyEntry(entry: MonthlyEntry, uid?: unknown): void {
  // 1. Write to local storage
  write("entries", entry.id, entry)

  // 2. Dual-write to Firebase Cloud Firestore
  const targetUid = typeof uid === "string" ? uid : activeUserId
  if (targetUid) {
    saveMonthlyEntryToFirestore(targetUid, entry.businessId, entry).catch((err) => {
      console.warn("Cloud sync failed for monthly entry, preserved locally:", err)
    })
  }
}


export function getMonthlyEntries(businessId: string): MonthlyEntry[] {
  const all = getAll("entries")
    .map((id) => read<MonthlyEntry>("entries", id))
    .filter((e): e is MonthlyEntry => e !== null)
  return all.filter((e) => e.businessId === businessId).sort((a, b) => a.month.localeCompare(b.month))
}

// ---------------------------------------------------------------------------
// Report Storage (Offline-First + Cloud Dual-Write)
// ---------------------------------------------------------------------------

export function saveReport(
  businessId: string,
  reportType: "feasibility" | "financial" | "health" | "comprehensive",
  data: Record<string, unknown>,
  id?: string,
  uid?: string
): string {
  const reportId = id || `${businessId}-${reportType}-${Date.now()}`
  const now = new Date().toISOString()
  
  // 1. Write locally
  write("reports", reportId, {
    businessId,
    reportType,
    data,
    generatedAt: now,
  })

  // 2. Write to Cloud Firestore
  const targetUid = uid || activeUserId
  if (targetUid) {
    saveReportToFirestore(targetUid, {
      id: reportId,
      businessId,
      reportType,
      data,
      createdAt: now,
    }).catch((err) => {
      console.warn("Cloud sync failed for report, preserved locally:", err)
    })
  }

  return reportId
}

export function getReports(businessId: string): {
  id: string
  reportType: string
  reportData: Record<string, unknown>
  generatedAt: Date
}[] {
  const all = getAll("reports")
    .map((id) =>
      read<{
        businessId: string
        reportType: string
        data: Record<string, unknown>
        generatedAt: string
      }>("reports", id)
    )
    .filter(
      (r): r is {
        businessId: string
        reportType: string
        data: Record<string, unknown>
        generatedAt: string
      } => r !== null && r.businessId === businessId
    )
  return all.map((r) => ({
    id: r.reportType,
    reportType: r.reportType,
    reportData: r.data,
    generatedAt: new Date(r.generatedAt),
  }))
}

// ---------------------------------------------------------------------------
// Full Cloud Synchronization Bridge
// ---------------------------------------------------------------------------

/**
 * Syncs user data from Firebase Cloud Firestore to local storage.
 * Call this when a user logs in to restore their business profiles and records.
 */
export async function syncUserDataFromCloud(
  uid: string
): Promise<{ profilesCount: number; entriesCount: number; reportsCount: number }> {
  setActiveUserId(uid)
  let profilesCount = 0
  let entriesCount = 0
  let reportsCount = 0

  try {
    // 1. Fetch Cloud Business Profiles
    const cloudProfiles = await getBusinessProfilesFromFirestore(uid)
    for (const profile of cloudProfiles) {
      write("profiles", profile.id, profile)
      profilesCount++

      // 2. Fetch Entries for this business
      const cloudEntries = await getMonthlyEntriesFromFirestore(uid, profile.id)
      for (const entry of cloudEntries) {
        write("entries", entry.id, entry)
        entriesCount++
      }
    }

    // 3. Fetch Cloud Reports
    const cloudReports = await getReportsFromFirestore(uid)
    for (const report of cloudReports) {
      write("reports", report.id, {
        businessId: report.businessId,
        reportType: report.reportType,
        data: report.data,
        generatedAt: typeof report.createdAt === "string" ? report.createdAt : new Date().toISOString(),
      })
      reportsCount++
    }
  } catch (error) {
    console.warn("Error syncing user data from cloud:", error)
  }

  return { profilesCount, entriesCount, reportsCount }
}

// ---------------------------------------------------------------------------
// Health Report generation with persistence
// ---------------------------------------------------------------------------

export function generateAndSaveHealthReport(
  businessId: string,
  entries: MonthlyEntry[],
  currentQuarter: string,
  previousQuarter: string | undefined,
  financialCalc: FinancialCalculation,
  previousQuarterData?: import("../types").QuarterlyAggregation
): HealthReport {
  const reportData = {
    businessId,
    entries: entries.map((e) => ({
      month: e.month,
      revenue: e.revenue,
      cogs: e.cogs,
      operatingExpenses: e.operatingExpenses,
      emiPaid: e.emiPaid,
    })),
    currentQuarter,
    previousQuarter,
    financialCalc: {
      marginCapital: financialCalc.marginCapital,
      projectCost: financialCalc.projectCost,
      loanAmount: financialCalc.loanAmount,
      postMoratoriumEMI: financialCalc.postMoratoriumEMI,
      riskBuffer: financialCalc.riskBuffer,
      dscr: financialCalc.dscr,
    },
  }

  saveReport(businessId, "health", reportData)

  // Return a minimal report — full generation happens in health.ts
  return {
    businessId,
    currentQuarter: {
      quarter: currentQuarter,
      totalRevenue: entries.reduce((s, e) => s + e.revenue, 0),
      totalCOGS: entries.reduce((s, e) => s + e.cogs, 0),
      totalOpEx: entries.reduce((s, e) => s + e.operatingExpenses, 0),
      totalEMI: entries.reduce((s, e) => s + e.emiPaid, 0),
      netCashSurplus: 0,
      grossMarginPercent: 0,
      netMarginPercent: 0,
      dscr: 0,
      healthState: "surviving" as const,
      riskBufferMet: false,
    },
    trend: "stable" as const,
    healthState: "surviving" as const,
    insights: [],
    dscrLive: 0,
    riskBufferStatus: "met" as const,
    singleBuyerDependencyFlag: false,
    generatedAt: new Date(),
  }
}

// ---------------------------------------------------------------------------
// Cleanup — no-op for localStorage
// ---------------------------------------------------------------------------

export function closeDatabase(): void {
  // localStorage doesn't need closing. Kept for API compatibility.
}
