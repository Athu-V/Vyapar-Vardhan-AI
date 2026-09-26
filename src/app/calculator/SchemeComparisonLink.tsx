"use client"

import Link from "next/link"

export default function SchemeComparisonLink({ projectCost }: { projectCost: number }) {
  return (
    <div className="mt-6 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold">🔄 Scheme Comparison</h3>
          <p className="text-sm text-muted-foreground">
            See every government scheme you qualify for — side by side.
          </p>
        </div>
        <Link
          href="/calculator/schemes"
          className="rounded-md bg-secondary px-4 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          Compare Schemes →
        </Link>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Project cost: ₹{projectCost.toLocaleString("en-IN")} → see all matching schemes with rates, tenures, and eligibility notes.
      </p>
    </div>
  )
}
