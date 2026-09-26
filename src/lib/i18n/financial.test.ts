import { describe, expect, it } from "@jest/globals"
import { fin as financial } from "./index"
import type { AppLanguageCode } from "./languages"

describe("financial()", () => {
  it("returns English term unchanged for en", () => {
    expect(financial("profit", "en", "मुनाफा")).toBe("profit")
  })

  it("returns local word + English in brackets for Hindi", () => {
    expect(financial("profit", "hi", "मुनाफा")).toBe("मुनाफा (profit)")
  })

  it("returns local word + English in brackets for Marathi", () => {
    expect(financial("loss", "mr", "नुकसान")).toBe("नुकसान (loss)")
  })

  it("uses the provided local word exactly, only appending brackets for non-English", () => {
    const code: AppLanguageCode = "bn"
    expect(financial("total", code, "মোট")).toBe("মোট (total)")
  })
})
