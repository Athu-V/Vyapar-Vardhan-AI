/* ============================================================================
   ENGINE.JS - Deterministic Financial Engine + Rules Engine + Narrator
   The LLM never invents a number: it only reads numbers a calculator produced.
   ============================================================================ */

const Engine = (function () {
  "use strict"

  // --- Data Sources (Census × NSSO proxy data) ---
  const PER_CAPITA_CONSUMPTION = {
    dairy: 3200,
    retail: 18000,
    tailoring: 2400,
    "agri-processing": 5600,
    "small-manufacturing": 8000,
    services: 4200,
    trading: 12000,
    other: 6000,
  }

  const POPULATION = {
    UP: { block: 180000, village: 2500 },
    Bihar: { block: 150000, village: 2200 },
    MP: { block: 160000, village: 2000 },
    Maharashtra: { block: 140000, village: 1800 },
    Rajasthan: { block: 170000, village: 2100 },
    WestBengal: { block: 190000, village: 2800 },
    TamilNadu: { block: 130000, village: 1600 },
    Karnataka: { block: 145000, village: 1900 },
    Gujarat: { block: 155000, village: 2000 },
    Odisha: { block: 135000, village: 1700 },
    DEFAULT: { block: 155000, village: 2100 },
  }

  const COMPETITORS = {
    dairy: { perBlock: 12, density: "low" },
    retail: { perBlock: 45, density: "high" },
    tailoring: { perBlock: 20, density: "moderate" },
    "agri-processing": { perBlock: 8, density: "low" },
    "small-manufacturing": { perBlock: 15, density: "moderate" },
    services: { perBlock: 30, density: "moderate" },
    trading: { perBlock: 55, density: "high" },
    other: { perBlock: 20, density: "moderate" },
  }

  const AVG_REVENUE_PER_COMPETITOR = {
    dairy: 360000,
    retail: 480000,
    tailoring: 240000,
    "agri-processing": 600000,
    "small-manufacturing": 720000,
    services: 300000,
    trading: 540000,
    other: 360000,
  }

  const CATEGORY_NAMES = {
    dairy: { en: "Dairy & Allied", hi: "डेयरी (Dairy)" },
    retail: { en: "Retail Shop", hi: "खुदरा (Retail)" },
    tailoring: { en: "Tailoring", hi: "सिलाई (Tailoring)" },
    "agri-processing": { en: "Agri-Processing", hi: "कृषि प्रसंस्करण (Agri-Processing)" },
    "small-manufacturing": { en: "Manufacturing", hi: "लघु उद्योग (Small Manufacturing)" },
    services: { en: "Services", hi: "सेवाएं (Services)" },
    trading: { en: "Trading", hi: "व्यापार (Trading)" },
    other: { en: "Other", hi: "अन्य (Other)" },
  }

  // --- Loan Schemes ---
  const SCHEMES = [
    {
      id: "micro-finance",
      name: "Micro Finance Scheme",
      nameHi: "माइक्रो फाइनेंस योजना (Micro Finance Scheme)",
      min: 0,
      max: 140000,
      loanPct: 90,
      rate: 6.5,
      tenure: 3,
      moratorium: 3,
      source: "MoSJE - Stand-Up India Guidelines",
      lastVerified: "15 January 2025",
    },
    {
      id: "term-loan",
      name: "Term Loan Scheme",
      nameHi: "टर्म लोन योजना (Term Loan Scheme)",
      min: 140001,
      max: 5000000,
      loanPct: 90,
      rate: 8.0,
      tenure: 7,
      moratorium: 6,
      source: "MoSJE - Stand-Up India Guidelines",
      lastVerified: "15 January 2025",
    },
  ]

  // --- Deterministic Formulas ---

  function fmtINR(n) {
    if (n >= 10000000) return "\u20B9" + (n / 10000000).toFixed(2) + " Cr"
    if (n >= 100000) return "\u20B9" + (n / 100000).toFixed(2) + " L"
    if (n >= 1000) return "\u20B9" + (n / 1000).toFixed(1) + "K"
    return "\u20B9" + n.toLocaleString("en-IN")
  }

  function calcProjectCost(margin) {
    return margin / 0.10
  }

  function calcLoanAmount(projectCost, pct) {
    return projectCost * (pct / 100)
  }

  function calcEMI(principal, annualRate, years) {
    if (principal <= 0) return 0
    var r = annualRate / 100 / 12
    var n = years * 12
    if (r === 0) return Math.round(principal / n)
    var f = Math.pow(1 + r, n)
    return Math.round((principal * r * f) / (f - 1))
  }

  function calcPostMoratoriumEMI(principal, annualRate, years, moratoriumMonths) {
    if (principal <= 0 || moratoriumMonths === 0) return calcEMI(principal, annualRate, years)
    var r = annualRate / 100 / 12
    var compounded = principal * Math.pow(1 + r, moratoriumMonths)
    var remaining = years * 12 - moratoriumMonths
    if (remaining <= 0 || r === 0) return 0
    var f = Math.pow(1 + r, remaining)
    return Math.round((compounded * r * f) / (f - 1))
  }

  function calcRiskBuffer(postMoratoriumEMI) {
    return Math.round(postMoratoriumEMI * 1.5)
  }

  function calcNetCashSurplus(rev, cogs, opex, emi) {
    return rev - cogs - opex - emi
  }

  function calcGrossMargin(rev, cogs) {
    if (rev <= 0) return 0
    return Math.round(((rev - cogs) / rev) * 100 * 100) / 100
  }

  function calcNetMargin(surplus, rev) {
    if (rev <= 0) return 0
    return Math.round((surplus / rev) * 100 * 100) / 100
  }

  function calcDSCR(netIncome, annualDebt) {
    if (annualDebt <= 0) return 0
    return Math.round((netIncome / annualDebt) * 100) / 100
  }

  function calcBreakEven(investment, monthlySurplus) {
    if (monthlySurplus <= 0) return Infinity
    return Math.ceil(investment / monthlySurplus)
  }

  // --- Rules Engine ---

  function selectScheme(projectCost) {
    for (var i = 0; i < SCHEMES.length; i++) {
      if (projectCost >= SCHEMES[i].min && projectCost <= SCHEMES[i].max) {
        return SCHEMES[i]
      }
    }
    return null
  }

  function classifyHealth(netMargin, riskBufferMet, dscr) {
    if (netMargin >= 20 && riskBufferMet && dscr >= 1.25) return "thriving"
    if (netMargin < 5 || dscr < 1.0 || !riskBufferMet) return "at-risk"
    return "surviving"
  }

  // --- Market Analysis (Proxy Data) ---

  function estimateConsumerBase(state) {
    var data = POPULATION[state] || POPULATION.DEFAULT
    return Math.round(data.block * 0.65)
  }

  function estimateDemand(consumerBase, category) {
    return Math.round(consumerBase * (PER_CAPITA_CONSUMPTION[category] || 6000))
  }

  function estimateSupply(category) {
    var comp = COMPETITORS[category] || COMPETITORS.other
    var avgRev = AVG_REVENUE_PER_COMPETITOR[category] || 360000
    return comp.perBlock * avgRev
  }

  // --- Full Financial Calculation ---

  function computeFinancials(margin, revenue, cogs, opex) {
    var projectCost = calcProjectCost(margin)
    var scheme = selectScheme(projectCost)
    if (!scheme) return null

    var loanAmount = calcLoanAmount(projectCost, scheme.loanPct)
    var emi = calcEMI(loanAmount, scheme.rate, scheme.tenure)
    var postMorEMI = calcPostMoratoriumEMI(loanAmount, scheme.rate, scheme.tenure, scheme.moratorium)
    var riskBuffer = calcRiskBuffer(postMorEMI)
    var netSurplus = calcNetCashSurplus(revenue, cogs, opex, 0)
    var netSurplusAfterEMI = calcNetCashSurplus(revenue, cogs, opex, postMorEMI)
    var annualNetIncome = (revenue - cogs - opex) * 12
    var annualDebt = postMorEMI * 12
    var dscr = calcDSCR(annualNetIncome, annualDebt)
    var totalInterest = emi * scheme.tenure * 12 - loanAmount
    var breakEven = calcBreakEven(margin + totalInterest, Math.max(0, netSurplusAfterEMI))

    return {
      margin: margin,
      projectCost: projectCost,
      scheme: scheme,
      loanAmount: loanAmount,
      emi: emi,
      postMorEMI: postMorEMI,
      riskBuffer: riskBuffer,
      netSurplus: netSurplus,
      netSurplusAfterEMI: netSurplusAfterEMI,
      dscr: dscr,
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(loanAmount + totalInterest),
      breakEven: breakEven,
      revenue: revenue,
      cogs: cogs,
      opex: opex,
    }
  }

  // --- Repayment Schedule ---

  function generateSchedule(calc) {
    var s = calc.scheme
    var r = s.rate / 100 / 12
    var quarterly = calc.emi * 3
    var balance = calc.loanAmount
    var totalQ = s.tenure * 4
    var moratQ = Math.ceil(s.moratorium / 3)
    var schedule = []

    for (var q = 1; q <= totalQ; q++) {
      var qLabel = "Q" + (((q - 1) % 4) + 1) + "-" + (2026 + Math.floor((q - 1) / 4))

      if (q <= moratQ) {
        var intAcc = balance * r * 3
        balance += intAcc
        schedule.push({
          period: q, quarter: qLabel, principal: 0,
          interest: Math.round(intAcc), payment: 0,
          balance: Math.round(balance), moratorium: true,
        })
      } else {
        var intPay = Math.round(balance * r * 3)
        var princPay = Math.round(quarterly - intPay)
        balance -= princPay
        schedule.push({
          period: q, quarter: qLabel, principal: Math.max(0, princPay),
          interest: intPay, payment: Math.round(quarterly),
          balance: Math.max(0, Math.round(balance)), moratorium: false,
        })
      }
    }
    return schedule
  }

  // --- Feasibility Report ---

  function computeFeasibility(state, category, margin, singleBuyer) {
    var consumers = estimateConsumerBase(state)
    var demand = estimateDemand(consumers, category)
    var supply = estimateSupply(category)
    var gap = demand - supply
    var comp = COMPETITORS[category] || COMPETITORS.other
    var cat = CATEGORY_NAMES[category] || CATEGORY_NAMES.other

    return {
      consumers: consumers,
      demand: demand,
      supply: supply,
      gap: gap,
      demandDeficit: gap > 0,
      density: comp.density,
      competitors: comp.perBlock,
      category: cat,
      singleBuyer: singleBuyer,
      viabilityScore: gap > 0 && comp.density === "low" ? "high"
        : gap <= 0 && comp.density === "high" ? "low" : "moderate",
    }
  }

  // --- Health Report ---

  function computeHealth(entries, calc) {
    if (entries.length < 3) return null

    // Q1 = first 3 months, Q2 = next 3 months
    var q1Entries = entries.slice(0, 3)
    var q2Entries = entries.slice(3, 6)
    if (q2Entries.length < 3) q2Entries = entries.slice(0, 3) // fallback

    function aggregate(arr) {
      var rev = arr.reduce(function (s, e) { return s + e.revenue }, 0)
      var cogs = arr.reduce(function (s, e) { return s + e.cogs }, 0)
      var opex = arr.reduce(function (s, e) { return s + e.opex }, 0)
      var emi = arr.reduce(function (s, e) { return s + (calc ? calc.postMorEMI : 14000) }, 0)
      var surplus = rev - cogs - opex - emi
      var grossMargin = calcGrossMargin(rev, cogs)
      var netMargin = calcNetMargin(surplus, rev)
      var dscr = calcDSCR((rev - cogs - opex) * 4, emi * 4)
      var riskBuf = calcRiskBuffer(emi / 3)
      var riskMet = netMargin >= (riskBuf / rev) * 100 * 3
      var health = classifyHealth(netMargin, riskMet, dscr)
      return { rev: rev, cogs: cogs, opex: opex, emi: emi, surplus: surplus, grossMargin: grossMargin, netMargin: netMargin, dscr: dscr, health: health, riskMet: riskMet }
    }

    var q1 = aggregate(q1Entries)
    var q2 = aggregate(q2Entries)

    // Trend
    var marginDiff = q2.netMargin - q1.netMargin
    var trend = marginDiff > 3 ? "improving" : marginDiff < -3 ? "declining" : "stable"

    // Single buyer check
    var totalRev = entries.reduce(function (s, e) { return s + e.revenue }, 0)
    var totalSingle = entries.reduce(function (s, e) { return s + (e.revenue * 0.7) }, 0) // simulate
    var singleBuyerFlag = totalRev > 0 && (totalSingle / totalRev) > 0.6

    // Insights
    var insights = []

    if (q1.rev > 0 && q2.cogs > q1.cogs) {
      var cogsGrowth = ((q2.cogs - q1.cogs) / q1.cogs) * 100
      var revGrowth = ((q2.rev - q1.rev) / q1.rev) * 100
      if (cogsGrowth > revGrowth) {
        insights.push({
          type: "warning", metric: "COGS",
          msg: "Raw material cost increased by " + cogsGrowth.toFixed(1) + "% while revenue grew only " + revGrowth.toFixed(1) + "%. Check your supplier prices.",
          hi: "कच्चे माल की लागत " + cogsGrowth.toFixed(1) + "% बढ़ गई जबकि राजस्व केवल " + revGrowth.toFixed(1) + "% बढ़ा। सप्लायर कीमत चेक करें।",
        })
      }
    }

    if (q1.opex > 0) {
      var expGrowth = ((q2.opex - q1.opex) / q1.opex) * 100
      var revGrowth2 = q1.rev > 0 ? ((q2.rev - q1.rev) / q1.rev) * 100 : 0
      if (revGrowth2 < 2 && expGrowth > 10) {
        insights.push({
          type: "alert", metric: "OpEx",
          msg: "Revenue is flat but operating expenses rose " + expGrowth.toFixed(1) + "%.",
          hi: "राजस्व स्थिर है लेकिन परिचालन खर्च " + expGrowth.toFixed(1) + "% बढ़ गया।",
        })
      }
    }

    if (q2.surplus > 0 && !q2.riskMet) {
      insights.push({
        type: "warning", metric: "Risk Buffer",
        msg: "Net cash surplus is positive but below the Risk Buffer threshold. One bad month could push you into EMI default.",
        hi: "शुद्ध नकदी अधिशेष सकारात्मक है लेकिन जोखिम बफर सीमा से कम है।",
      })
    }

    if (q2.dscr < 1.0) {
      insights.push({
        type: "alert", metric: "DSCR",
        msg: "DSCR is " + q2.dscr.toFixed(2) + " - below 1.0 means business income cannot cover EMI payments.",
        hi: "DSCR " + q2.dscr.toFixed(2) + " है - 1.0 से नीचे का मतलब व्यापारिक आय EMI को कवर नहीं कर सकती।",
      })
    }

    if (q2.health === "thriving") {
      insights.push({
        type: "positive", metric: "Health",
        msg: "Business is thriving - net margin of " + q2.netMargin.toFixed(1) + "% clears the Risk Buffer. Consider reinvestment.",
        hi: "व्यवसाय अच्छा कर रहा है - " + q2.netMargin.toFixed(1) + "% शुद्ध मार्जिन। पुनर्निवेश पर विचार करें।",
      })
    }

    if (q2.health === "at-risk") {
      insights.push({
        type: "recommendation", metric: "Health",
        msg: "Business is at risk. Actions: (1) Renegotiate supplier prices, (2) Reduce OpEx, (3) Consider working-capital scheme, (4) Diversify buyers.",
        hi: "व्यवसाय जोखिम में है। तत्काल कार्रवाई: (1) सप्लायर कीमत, (2) खर्च कम करें, (3) वर्किंग-कैपिटल स्कीम, (4) खरीदार विविधता।",
      })
    }

    return {
      q1: q1, q2: q2, trend: trend, insights: insights,
      singleBuyerFlag: singleBuyerFlag,
    }
  }

  // --- Narrator (Vernacular) ---

  function narrateFinancials(calc) {
    return (
      "**Deterministic Calculation:**\n" +
      "• Project Cost: " + fmtINR(calc.projectCost) + " (" + calc.margin.toLocaleString("en-IN") + " ÷ 10%)\n" +
      "• Loan Eligibility: " + fmtINR(calc.loanAmount) + " (" + calc.scheme.loanPct + "% of project cost)\n" +
      "• Monthly EMI: " + fmtINR(calc.emi) + "\n\n" +
      "**Post-Moratorium Reality:**\n" +
      "• After " + calc.scheme.moratorium + " months moratorium, actual EMI: " + fmtINR(calc.postMorEMI) + "/month\n" +
      "• Interest compounds during moratorium - \"6 months free\" ≠ break\n\n" +
      "**Risk Buffer (Reserve Calculation):**\n" +
      "• Minimum monthly profit for safety: " + fmtINR(calc.riskBuffer) + "/month\n" +
      "• If business cannot consistently earn this, the loan is high risk.\n\n" +
      "**Net Cash Position:**\n" +
      "• Revenue - COGS - OpEx - EMI = " + fmtINR(calc.netSurplusAfterEMI) + "/month\n" +
      (calc.netSurplusAfterEMI < 0
        ? "[ALERT] NEGATIVE - business not viable as structured!"
        : "[PASS] Positive - business can sustain the EMI.") +
      "\n\n**DSCR: " + calc.dscr + "** " +
      (calc.dscr >= 1.25 ? "(Healthy)" : calc.dscr >= 1.0 ? "(Tight)" : "(Below 1: cannot cover EMI)")
    )
  }

  function narrateFeasibility(f) {
    return (
      "**Market Analysis (Census × NSSO):**\n" +
      "• Consumer base (5-10 km): " + f.consumers.toLocaleString("en-IN") + " people\n" +
      "• Annual demand: " + fmtINR(f.demand) + "\n" +
      "• Current supply: " + fmtINR(f.supply) + "\n" +
      "• Gap: " + (f.demandDeficit ? "+ " : "- ") + fmtINR(Math.abs(f.gap)) + "\n" +
      "• Viability: " + f.viabilityScore.toUpperCase() + "\n\n" +
      (f.singleBuyer
        ? "[RISK] SINGLE BUYER DEPENDENCY: ~40% lower profit. Diversify buyers.\n\n"
        : "") +
      f.category.hi + " के लिए " + f.consumers.toLocaleString("en-IN") + " संभावित उपभोक्ता हैं। " +
      (f.demandDeficit
        ? "मांग अधिक है: नए व्यवसाय के लिए अच्छा अवसर है।"
        : "आपूर्ति अधिक है: प्रतिस्पर्धा तीव्र रहेगी।")
    )
  }

  function narrateHealth(h) {
    var label = { thriving: "[THRIVING]", surviving: "[SURVIVING]", "at-risk": "[AT RISK]" }
    var q = h.q2

    return (
      "**Business Health: " + label[h.q2.health] + "**\n\n" +
      "Q2 Numbers Summary:\n" +
      "• Revenue: " + fmtINR(q.rev) + " | COGS: " + fmtINR(q.cogs) + "\n" +
      "• OpEx: " + fmtINR(q.opex) + " | EMI: " + fmtINR(q.emi) + "\n" +
      "• Net Surplus: " + fmtINR(q.surplus) + "\n" +
      "• Gross Margin: " + q.grossMargin + "% | Net Margin: " + q.netMargin + "%\n" +
      "• DSCR: " + q.dscr + "\n\n" +
      h.insights.map(function (i) {
        return (i.type === "alert" ? "[ALERT]" : i.type === "warning" ? "[NOTICE]" : "[OK]") + " " + i.msg
      }).join("\n\n") +
      "\n\nTrend: " + h.trend
    )
  }

  // --- Public API ---
  return {
    fmtINR: fmtINR,
    CATEGORY_NAMES: CATEGORY_NAMES,
    SCHEMES: SCHEMES,
    calcProjectCost: calcProjectCost,
    calcEMI: calcEMI,
    calcPostMoratoriumEMI: calcPostMoratoriumEMI,
    calcRiskBuffer: calcRiskBuffer,
    calcGrossMargin: calcGrossMargin,
    calcNetMargin: calcNetMargin,
    calcDSCR: calcDSCR,
    selectScheme: selectScheme,
    computeFinancials: computeFinancials,
    generateSchedule: generateSchedule,
    computeFeasibility: computeFeasibility,
    computeHealth: computeHealth,
    narrateFinancials: narrateFinancials,
    narrateFeasibility: narrateFeasibility,
    narrateHealth: narrateHealth,
  }
})()

if (typeof module !== "undefined" && module.exports) {
  module.exports = Engine
}

