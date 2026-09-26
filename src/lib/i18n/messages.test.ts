import { describe, expect, it } from "@jest/globals"
import { t, fin } from "./messages"
import type { AppLanguageCode } from "./languages"

describe("t()", () => {
  it("returns English for en", () => {
    expect(t("nav.calculator", "en")).toBe("💰 Calculator")
  })

  it("returns Hindi for hi", () => {
    expect(t("nav.calculator", "hi")).toBe("💰 कैलकुलेटर")
  })

  it("returns English fallback for unsupported code", () => {
    expect(t("nav.calculator", "mr")).toBe("💰 Calculator")
  })
})

describe("fin()", () => {
  it("returns English for en", () => {
    expect(fin("profit", "en", "profit")).toBe("profit")
  })

  it("returns bracketed local+English for Hindi", () => {
    expect(fin("profit", "hi", "profit")).toBe("मुनाफा (profit)")
  })

  it("returns bracketed local+English for Marathi", () => {
    expect(fin("loss", "mr", "loss")).toBe("नुकसान (loss)")
  })

  it("returns bracketed local+English for Bengali", () => {
    expect(fin("total", "bn", "total")).toBe("মোট (total)")
  })

  it("uses englishFallback when term is missing from local map", () => {
    const code: AppLanguageCode = "ta"
    expect(fin("obscureTerm", code, "obscureTerm")).toBe("obscureTerm (obscureTerm)")
  })
})
