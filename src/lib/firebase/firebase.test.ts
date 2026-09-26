import { isFirebaseConfigured, auth, db, storage } from "./config"
import {
  saveBusinessProfile,
  getBusinessProfile,
  saveMonthlyEntry,
  getMonthlyEntries,
  saveReport,
  getReports,
  setActiveUserId,
  getActiveUserId,
} from "../data/db"
import type { BusinessProfile, MonthlyEntry } from "../types"

describe("Firebase Integration", () => {
  it("exports core Firebase instances", () => {
    expect(auth).toBeDefined()
    expect(db).toBeDefined()
    expect(storage).toBeDefined()
    expect(typeof isFirebaseConfigured).toBe("boolean")
  })

  it("handles active user tracking for cloud synchronization", () => {
    expect(getActiveUserId()).toBeNull()
    setActiveUserId("test-user-123")
    expect(getActiveUserId()).toBe("test-user-123")
    setActiveUserId(null)
    expect(getActiveUserId()).toBeNull()
  })

  it("saves and retrieves business profiles with offline-first persistence", () => {
    const profile: BusinessProfile = {
      id: "test-firebase-biz",
      name: "Firebase Dairy Farm",
      location: { village: "Kisanpur", block: "Central", district: "Pune", state: "MH" },
      category: "dairy",
      isExistingBusiness: true,
      monthlyRevenue: 95000,
      monthlyCOGS: 50000,
      monthlyOperatingExpenses: 15000,
      availableMarginCapital: 120000,
      singleBuyerDependency: false,
      createdAt: new Date(),
    }

    saveBusinessProfile(profile)
    const loaded = getBusinessProfile("test-firebase-biz")
    expect(loaded).not.toBeNull()
    expect(loaded?.name).toBe("Firebase Dairy Farm")
  })

  it("saves and retrieves monthly entries with offline-first persistence", () => {
    const entry: MonthlyEntry = {
      id: "entry-fb-1",
      businessId: "test-firebase-biz",
      month: "2026-08",
      revenue: 98000,
      cogs: 52000,
      operatingExpenses: 14000,
      emiPaid: 12000,
      emiDue: 12000,
      singleBuyerRevenue: 60000,
      capturedVia: "manual",
      capturedAt: new Date(),
    }

    saveMonthlyEntry(entry)
    const entries = getMonthlyEntries("test-firebase-biz")
    expect(entries.length).toBeGreaterThanOrEqual(1)
    expect(entries.some((e) => e.id === "entry-fb-1")).toBe(true)
  })

  it("saves and retrieves reports with offline-first persistence", () => {
    const reportId = saveReport("test-firebase-biz", "feasibility", { score: "high", viable: true })
    expect(reportId).toBeDefined()
    const reports = getReports("test-firebase-biz")
    expect(reports.length).toBeGreaterThanOrEqual(1)
  })
})
