import type { AppLanguageCode } from "./languages"

export type UiKey =
  | "app.title"
  | "app.description"
  | "nav.aiChat"
  | "nav.feasibility"
  | "nav.calculator"
  | "nav.schemes"
  | "nav.health"
  | "nav.report"
  | "chat.header.title"
  | "chat.header.sub"
  | "chat.header.toolkit"
  | "chat.input.placeholder"
  | "chat.send"
  | "chat.welcome"
  | "chat.category.title"
  | "chat.existing.yes"
  | "chat.existing.new"
  | "chat.existing.response.yes"
  | "chat.existing.response.new"
  | "chat.existing.response.fallback"
  | "chat.margin.prompt"
  | "chat.margin.response"
  | "chat.margin.response.zero"
  | "chat.margin.error"
  | "chat.revenue.prompt"
  | "chat.revenue.response"
  | "chat.revenue.error"
  | "chat.expenses.prompt"
  | "chat.expenses.response"
  | "chat.expenses.error"
  | "chat.summary.title"
  | "chat.summary.revenue"
  | "chat.summary.expenses"
  | "chat.summary.surplus"
  | "chat.summary.margin"
  | "chat.summary.warning"
  | "chat.summary.loan.title"
  | "chat.summary.loan.projectCost"
  | "chat.summary.loan.amount"
  | "chat.summary.loan.emi"
  | "chat.summary.loan.postMoratorium"
  | "chat.summary.loan.buffer"
  | "chat.summary.loan.suffix"
  | "chat.summary.foot"
  | "chat.chip.restart"
  | "chat.chip.openToolkit"
  | "chat.chip.openCalc"
  | "chat.chip.openFeas"
  | "chat.chip.openHealth"
  | "chat.chip.openSchemes"
  | "chat.done.openToolkit"
  | "chat.done.openCalc"
  | "chat.done.openFeas"
  | "chat.done.openSchemes"
  | "chat.done.openHealth"
  | "chat.done.openToolkitFull"
  | "chat.done.generic"
  | "popup.title"
  | "popup.subtitle"
  | "popup.close"
  | "popup.backToChat"
  | "calculator.page.title"
  | "calculator.page.sub"
  | "calculator.onboarding.title"
  | "calculator.onboarding.sub"
  | "calculator.category"
  | "calculator.status"
  | "calculator.existing"
  | "calculator.new"
  | "calculator.margin"
  | "calculator.revenue"
  | "calculator.cogs"
  | "calculator.opex"
  | "calculator.calculate"
  | "calculator.step1.title"
  | "calculator.step2.title"
  | "calculator.moratorium.title"
  | "calculator.risk.title"
  | "calculator.surplus.title"
  | "feasibility.page.title"
  | "feasibility.page.sub"
  | "feasibility.location.title"
  | "feasibility.village"
  | "feasibility.block"
  | "feasibility.district"
  | "feasibility.state"
  | "feasibility.category"
  | "feasibility.margin"
  | "feasibility.generate"
  | "tracker.page.title"
  | "tracker.page.sub"
  | "tracker.entry.title"
  | "tracker.month"
  | "tracker.revenue"
  | "tracker.cogs"
  | "tracker.opex"
  | "tracker.addEntry"
  | "report.page.title"
  | "report.page.sub"
  | "report.business.title"
  | "report.name"
  | "report.generate"

// ─── English UI strings ──────────────────────────────────────────────────────
export const EN: Record<UiKey, string> = {
  "app.title": "Gram Vyapar AI Mitra — Rural Business Advisory Assistant",
  "app.description":
    "AI-driven hyper-local business advisory and financial structuring assistant for rural micro-entrepreneurs",
  "nav.aiChat": "💬 AI Chat",
  "nav.feasibility": "📊 Feasibility",
  "nav.calculator": "💰 Calculator",
  "nav.schemes": "🔄 Schemes",
  "nav.health": "📈 Health",
  "nav.report": "📄 Report",
  "chat.header.title": "Gram Vyapar AI Mitra",
  "chat.header.sub": "Rural Business Advisor • In your language",
  "chat.header.toolkit": "Detailed Toolkit",
  "chat.input.placeholder":
    "Write in your language — e.g. how much loan, or open toolkit…",
  "chat.send": "Send",
  "chat.welcome":
    "Ram-Ram ji! 🙏 I am your **Gram Vyapar AI Mitra** — your online business advisor.\n\nBefore we start, I'd like to ask a few general questions about your business — so I can suggest the right scheme, loan and subsidy.\n\n**First question: Which field is your business in?**",
  "chat.category.title": "Your business",
  "chat.existing.yes": "🏪 Already running (Existing)",
  "chat.existing.new": "🆕 Starting new (New)",
  "chat.existing.response.yes":
    "Great — for an existing business we can do both expansion loan and health check. ✅\n\n**Next question: How much savings / margin can you put in from your side?**\ne.g. 1 lakh, 50 thousand, 3,00,000 (write 0 if none).",
  "chat.existing.response.new":
    "Wonderful — for a new business, government schemes can give great benefits! 🎉\n\n**Next question: How much savings / margin can you put in from your side?**\ne.g. 1 lakh, 50 thousand, 3,00,000 (write 0 if none).",
  "chat.existing.response.fallback":
    "No problem — let's find out.\n\n**How much savings / margin can you put in?** (e.g. 1 lakh, 50 thousand, 3,00,000)",
  "chat.margin.prompt":
    "Your savings: **{amount}** — great, we can estimate project cost and loan eligibility from this. 💰\n\n**Next question: What is your total monthly sales / income (Revenue)?** e.g. 80000, 1 lakh",
  "chat.margin.response":
    "Okay, let's complete the information first.\n\n**Next question: What is your total monthly sales / income (Revenue)?** e.g. 80000, 1 lakh",
  "chat.margin.response.zero":
    "Okay, let's complete the information first.\n\n**Next question: What is your total monthly sales / income (Revenue)?** e.g. 80000, 1 lakh",
  "chat.margin.error":
    "Sorry, I couldn't understand the amount. Please tell me how much savings you can put in — e.g. **50000**, **1 lakh**, or **0**.",
  "chat.revenue.prompt":
    "Monthly sales: **{amount}**. 📈\n\n**Last question: What is the total monthly expense (stock purchase + shop rent/electricity)?** e.g. 50000, 60 thousand",
  "chat.revenue.response":
    "Please enter a number — e.g. **80000**, **1 lakh**, or **1,50,000**.",
  "chat.revenue.error":
    "Please enter a number — e.g. **80000**, **1 lakh**, or **1,50,000**.",
  "chat.expenses.prompt":
    "Monthly expense: **{amount}**.\n\n**Last question: What is the total monthly expense (stock purchase + shop rent/electricity)?** e.g. 50000, 60 thousand",
  "chat.expenses.response":
    "Please enter the monthly expense as a number — e.g. **50000** or **60 thousand**.",
  "chat.expenses.error":
    "Please enter the monthly expense as a number — e.g. **50000** or **60 thousand**.",
  "chat.summary.title": "**📊 Your Business Summary:**\n\n",
  "chat.summary.revenue": "• Monthly income: **{amount}**\n",
  "chat.summary.expenses": "• Monthly expense: **{amount}**\n",
  "chat.summary.surplus": "• Net monthly savings: **{amount}** ({pct}% margin)\n\n",
  "chat.summary.margin": "• Savings: **{amount}**\n\n",
  "chat.summary.warning":
    "⚠️ Right now expenses exceed income — I'd suggest reducing costs first. But don't worry, we can improve this together.\n\n",
  "chat.summary.loan.title": "**💰 Loan Estimate (from your savings):**\n",
  "chat.summary.loan.projectCost": "• Project cost: **{amount}**\n",
  "chat.summary.loan.amount": "• Loan amount: **{amount}** ({scheme})\n",
  "chat.summary.loan.emi": "• Regular EMI: **{amount}/month**\n",
  "chat.summary.loan.postMoratorium":
    "• Real EMI (after moratorium): **{amount}/month** ⚠️\n",
  "chat.summary.loan.buffer": "• Safety buffer needed: **{amount}/month**\n\n",
  "chat.summary.loan.suffix": "",
  "chat.summary.foot":
    "You can open the **Detailed Toolkit** below for full calculations, scheme comparison and health tracking. 👇",
  "chat.chip.restart": "📋 Start Business Analysis",
  "chat.chip.openToolkit": "📑 Open Full Toolkit (Popup)",
  "chat.chip.openCalc": "💰 Open Loan & EMI Calculator",
  "chat.chip.openFeas": "📊 View Market Demand Report",
  "chat.chip.openHealth": "📈 Open Health Tracker",
  "chat.chip.openSchemes": "🔄 View Scheme Comparison",
  "chat.done.openToolkit":
    "Absolutely! I'm opening the full toolkit in a popup for you — you can access calculator, report and health tracker from there. 📑",
  "chat.done.openCalc":
    "Let's open the loan & EMI calculator in a popup. 💰",
  "chat.done.openFeas":
    "Opening the market demand & feasibility report in a popup. 📊",
  "chat.done.openSchemes":
    "Opening all government schemes comparison in a popup. 🔄",
  "chat.done.openHealth":
    "Opening the business health tracker in a popup. 📈",
  "chat.done.openToolkitFull":
    "Opening the full toolkit in a popup — you can select any module from the tabs above. 📑",
  "chat.done.generic":
    "I'm here to help. You can **start your business analysis** from the options below, or open the **full toolkit** in a popup.",
  "popup.title": "Gram Vyapar Sahayak — Detailed Toolkit",
  "popup.subtitle":
    "Financial Calculations, Feasibility & Schemes (Popup)",
  "popup.close": "Close and return to chat",
  "popup.backToChat": "Back to Chat",
  "calculator.page.title": "💰 Module 2 — Smart Financial Calculator",
  "calculator.page.sub":
    "Margin → Project Cost → Loan Eligibility → EMI → Risk Buffer → Net Cash Surplus. The LLM never invents a number — it only reads numbers a calculator produced.",
  "calculator.onboarding.title": "📋 Business Onboarding",
  "calculator.onboarding.sub":
    "4–5 fields, voice-first compatible, under 3 minutes.",
  "calculator.category": "Business Category",
  "calculator.status": "Business Status",
  "calculator.existing": "Existing business",
  "calculator.new": "New business",
  "calculator.margin": "Available Margin Capital (₹)",
  "calculator.revenue": "Monthly Revenue (₹) — optional",
  "calculator.cogs": "Monthly COGS / Raw Material (₹) — optional",
  "calculator.opex": "Monthly Operating Expenses (₹) — optional",
  "calculator.calculate": "Calculate →",
  "calculator.step1.title": "Step 1: Deterministic Calculation",
  "calculator.step2.title": "Step 2: Rules Engine — Scheme Selection",
  "calculator.moratorium.title": "The Silent Moratorium Killer",
  "calculator.risk.title": "Risk Buffer — The Most Important Number",
  "calculator.surplus.title":
    "Net Cash Surplus (Revenue − COGS − OpEx − EMI)",
  "feasibility.page.title":
    "📊 Module 1 — Hyper-Local Business Feasibility Report",
  "feasibility.page.sub":
    "Market reach, opportunity analysis, SWOT, competitor mapping — using Census × NSSO proxy data. No live \"local market demand\" API exists for rural India — this proxy methodology is honest and defensible.",
  "feasibility.location.title": "📍 Location & Business Details",
  "feasibility.village": "Village",
  "feasibility.block": "Block",
  "feasibility.district": "District",
  "feasibility.state": "State",
  "feasibility.category": "Business Category",
  "feasibility.margin": "Margin Capital (₹)",
  "feasibility.generate": "Generate Feasibility Report →",
  "tracker.page.title": "📈 Module 3 — Business Health Tracker",
  "tracker.page.sub":
    "Monthly + quarterly tracking, Thriving/Surviving/At-Risk classification, specific rule-based insights, and live DSCR recomputation from actual data — turning one-time projection into an ongoing, bank-acceptable track record.",
  "tracker.entry.title": "📝 Monthly Revenue Entry",
  "tracker.month": "Month",
  "tracker.revenue": "Revenue (₹)",
  "tracker.cogs": "COGS (₹)",
  "tracker.opex": "OpEx (₹)",
  "tracker.addEntry": "+ Add Monthly Entry",
  "report.page.title": "📄 NABARD Format Report Export",
  "report.page.sub":
    "Generate a bank-acceptable report that mimics the exact format of the NABARD Model Bankable Project Report. Banks trust this format.",
  "report.business.title": "📋 Business Details",
  "report.name": "Business Name",
  "report.generate": "Generate NABARD Report →",
}

// ─── Hindi UI strings ────────────────────────────────────────────────────────
const HI: Record<UiKey, string> = {
  "app.title": "ग्राम व्यापार AI मित्र — ग्रामीण व्यापार सलाहकार",
  "app.description":
    "ग्रामीण सूक्ष्म उद्यमियों के लिए AI-संचालित स्थानीय व्यापार सलाह और वित्तीय संरचना सहायक",
  "nav.aiChat": "💬 AI चैट",
  "nav.feasibility": "📊 व्यवहार्यता",
  "nav.calculator": "💰 कैलकुलेटर",
  "nav.schemes": "🔄 योजनाएँ",
  "nav.health": "📈 स्वास्थ्य",
  "nav.report": "📄 रिपोर्ट",
  "chat.header.title": "ग्राम व्यापार AI मित्र",
  "chat.header.sub": "ग्रामीण व्यापार सलाहकार • आपकी भाषा में",
  "chat.header.toolkit": "विस्तृत टूलकिट",
  "chat.input.placeholder":
    "अपनी भाषा में लिखें — जैसे: लोन कितना मिलेगा, या टूलकिट खोलो…",
  "chat.send": "भेजें",
  "chat.welcome":
    "राम-राम जी! 🙏 मैं आपका **ग्राम व्यापार AI मित्र** हूँ — आपका ऑनलाइन व्यापार सलाहकार।\n\nशुरू करने से पहले आपके व्यवसाय के बारे में कुछ सामान्य सवाल पूछना चाहूँगा — ताकि मैं सही योजना, लोन और सब्सिडी की सलाह दे सकूँ।\n\n**पहला सवाल: आपका व्यवसाय किस क्षेत्र में है?**",
  "chat.category.title": "आपका व्यवसाय",
  "chat.existing.yes": "🏪 पहले से चल रहा है (Existing)",
  "chat.existing.new": "🆕 नया शुरू करना है (New)",
  "chat.existing.response.yes":
    "अच्छा — पहले से चल रहे व्यवसाय के लिए हम विस्तार लोन और हेल्थ चेकअप दोनों कर सकते हैं। ✅\n\n**अगला सवाल: आप अपनी तरफ से कितनी बचत / मार्जिन (Margin) लगा सकते हैं?**\nजैसे: 1 लाख, 50 हजार, 3,00,000 (यदि नहीं है तो 0 लिखें)।",
  "chat.existing.response.new":
    "बहुत बढ़िया — नया व्यवसाय शुरू करने पर सरकारी योजनाओं का अच्छा लाभ मिल सकता है! 🎉\n\n**अगला सवाल: आप अपनी तरफ से कितनी बचत / मार्जिन (Margin) लगा सकते हैं?**\nजैसे: 1 लाख, 50 हजार, 3,00,000 (यदि नहीं है तो 0 लिखें)।",
  "chat.existing.response.fallback":
    "कोई बात नहीं — चलिए जानकारी लेते हैं।\n\n**आप अपनी तरफ से कितनी बचत / मार्जिन लगा सकते हैं?** (जैसे: 1 लाख, 50 हजार, 3,00,000)",
  "chat.margin.prompt":
    "आपकी बचत: **{amount}** — बढ़िया, इससे प्रोजेक्ट लागत और लोन पात्रता का अनुमान निकाल सकते हैं। 💰\n\n**अगला सवाल: महीने में आपकी कुल बिक्री / कमाई (Revenue) कितनी है (या होंगी)?** जैसे: 80000, 1 लाख",
  "chat.margin.response":
    "ठीक है, पहले हम जानकारी पूरी कर लेते हैं।\n\n**अगला सवाल: महीने में आपकी कुल बिक्री / कमाई (Revenue) कितनी है (या होंगी)?** जैसे: 80000, 1 लाख",
  "chat.margin.response.zero":
    "ठीक है, पहले हम जानकारी पूरी कर लेते हैं।\n\n**अगला सवाल: महीने में आपकी कुल बिक्री / कमाई (Revenue) कितनी है (या होंगी)?** जैसे: 80000, 1 लाख",
  "chat.margin.error":
    "माफ़ कीजिए, मैं राशि नहीं समझ पाया। कृपया बताएं कि आप कितनी बचत लगा सकते हैं — जैसे **50000**, **1 लाख**, या **0**।",
  "chat.revenue.prompt":
    "मासिक बिक्री: **{amount}**। 📈\n\n**आखिरी सवाल: महीने का कुल खर्च (माल/स्टॉक खरीद + दुकान का किराया/बिजली) कितना है?** जैसे: 50000, 60 हजार",
  "chat.revenue.response":
    "कृपया संख्या में बताएं — जैसे **80000**, **1 लाख**, या **1,50,000**।",
  "chat.revenue.error":
    "कृपया संख्या में बताएं — जैसे **80000**, **1 लाख**, या **1,50,000**।",
  "chat.expenses.prompt":
    "मासिक खर्च: **{amount}**।\n\n**आखिरी सवाल: महीने का कुल खर्च (माल/स्टॉक खरीद + दुकान का किराया/बिजली) कितना है?** जैसे: 50000, 60 हजार",
  "chat.expenses.response":
    "कृपया मासिक खर्च संख्या में बताएं — जैसे **50000** या **60 हजार**।",
  "chat.expenses.error":
    "कृपया मासिक खर्च संख्या में बताएं — जैसे **50000** या **60 हजार**।",
  "chat.summary.title": "**📊 आपके व्यवसाय का सारांश:**\n\n",
  "chat.summary.revenue": "• मासिक कमाई: **{amount}**\n",
  "chat.summary.expenses": "• मासिक खर्च: **{amount}**\n",
  "chat.summary.surplus":
    "• शुद्ध मासिक बचत: **{amount}** ({pct}% मार्जिन)\n\n",
  "chat.summary.margin": "• बचत: **{amount}**\n\n",
  "chat.summary.warning":
    "⚠️ अभी खर्च कमाई से ज़्यादा है — पहले लागत घटाने की सलाह दूँगा। लेकिन घबराइए नहीं, हम साथ मिलकर इसे सुधार सकते हैं।\n\n",
  "chat.summary.loan.title": "**💰 लोन का अनुमान (आपकी बचत से):**\n",
  "chat.summary.loan.projectCost": "• प्रोजेक्ट लागत: **{amount}**\n",
  "chat.summary.loan.amount": "• लोन राशि: **{amount}** ({scheme})\n",
  "chat.summary.loan.emi": "• नियमित EMI: **{amount}/महीना**\n",
  "chat.summary.loan.postMoratorium":
    "• असली EMI (मोरेटोरियम के बाद): **{amount}/महीना** ⚠️\n",
  "chat.summary.loan.buffer":
    "• सुरक्षा बफर चाहिए: **{amount}/महीना**\n\n",
  "chat.summary.loan.suffix": "",
  "chat.summary.foot":
    "इन आंकड़ों की पूरी गणना, योजना तुलना और हेल्थ ट्रैकिंग के लिए नीचे से **विस्तृत टूलकिट** पॉपअप में खोल सकते हैं। 👇",
  "chat.chip.restart": "📋 व्यवसाय विश्लेषण शुरू करें",
  "chat.chip.openToolkit": "📑 पूरा टूलकिट खोलें (Popup)",
  "chat.chip.openCalc": "💰 लोन & EMI कैलकुलेटर खोलें",
  "chat.chip.openFeas": "📊 बाज़ार मांग रिपोर्ट देखें",
  "chat.chip.openHealth": "📈 हेल्थ ट्रैकर खोलें",
  "chat.chip.openSchemes": "🔄 योजना तुलना देखें",
  "chat.done.openToolkit":
    "बिल्कुल! आपकी मदद के लिए पूरा टूलकिट पॉपअप में खोल रहा हूँ — वहीं से कैलकुलेटर, रिपोर्ट व हेल्थ ट्रैकर खोल सकते हैं। 📑",
  "chat.done.openCalc":
    "चलिए लोन व ईएमआई कैलकुलेटर पॉपअप में खोलते हैं। 💰",
  "chat.done.openFeas":
    "बाज़ार मांग व व्यवहार्यता रिपोर्ट पॉपअप में खोल रहा हूँ। 📊",
  "chat.done.openSchemes":
    "सभी सरकारी योजनाओं की तुलना पॉपअप में खोल रहा हूँ। 🔄",
  "chat.done.openHealth":
    "बिजनेस हेल्थ ट्रैकर पॉपअप में खोल रहा हूँ। 📈",
  "chat.done.openToolkitFull":
    "पूरा टूलकिट पॉपअप में खोल रहा हूँ — आप ऊपर टैब से कोई भी मॉड्यूल चुन सकते हैं। 📑",
  "chat.done.generic":
    "मैं आपकी मदद के लिए यहाँ हूँ। आप चाहें तो नीचे दिए विकल्पों से **अपना व्यवसाय विश्लेषण शुरू** कर सकते हैं, या **पूरा टूलकिट** पॉपअप में खोल सकते हैं।",
  "popup.title": "ग्राम व्यापार सहायक — विस्तृत टूलकिट",
  "popup.subtitle": "वित्तीय गणना, व्यवहार्यता और योजनाएँ (पॉपअप)",
  "popup.close": "बंद करें और चैट पर लौटें",
  "popup.backToChat": "वापस चैट पर",
  "calculator.page.title": "💰 मॉड्यूल 2 — स्मार्ट वित्तीय कैलकुलेटर",
  "calculator.page.sub":
    "मार्जिन → प्रोजेक्ट लागत → लोन पात्रता → EMI → जोखिम बफर → शुद्ध नकद अधिशेष। LLM कभी संख्या नहीं बनाता — यह केवल कैलकुलेटर द्वारा उत्पादित संख्याएँ पढ़ता है।",
  "calculator.onboarding.title": "📋 व्यवसाय ऑनबोर्डिंग",
  "calculator.onboarding.sub":
    "4–5 फ़ील्ड, वॉइस-फ़र्स्ट संगत, 3 मिनट से कम।",
  "calculator.category": "व्यवसाय श्रेणी",
  "calculator.status": "व्यवसाय स्थिति",
  "calculator.existing": "पहले से चल रहा व्यवसाय",
  "calculator.new": "नया व्यवसाय",
  "calculator.margin": "उपलब्ध मार्जिन पूंजी (₹)",
  "calculator.revenue": "मासिक राजस्व (₹) — वैकल्पिक",
  "calculator.cogs": "मासिक COGS / कच्चा माल (₹) — वैकल्पिक",
  "calculator.opex": "मासिक परिचालन व्यय (₹) — वैकल्पिक",
  "calculator.calculate": "गणना करें →",
  "calculator.step1.title": "चरण 1: निर्धारित गणना",
  "calculator.step2.title": "चरण 2: नियम इंजन — योजना चयन",
  "calculator.moratorium.title": "मौन मोरेटोरियम किलर",
  "calculator.risk.title": "जोखिम बफर — सबसे महत्वपूर्ण संख्या",
  "calculator.surplus.title":
    "शुद्ध नकद अधिशेष (राजस्व − COGS − OpEx − EMI)",
  "feasibility.page.title":
    "📊 मॉड्यूल 1 — स्थानीय व्यवसाय व्यवहार्यता रिपोर्ट",
  "feasibility.page.sub":
    "बाज़ार पहुंच, अवसर विश्लेषण, SWOT, प्रतिस्पर्धी मैपिंग — जनगणना × NSSO प्रॉक्सी डेटा का उपयोग करके। ग्रामीण भारत के लिए कोई लाइव \"स्थानीय बाज़ार मांग\" API मौजूद नहीं है — यह प्रॉक्सी पद्धति ईमानदार और सुरक्षित है।",
  "feasibility.location.title": "📍 स्थान और व्यवसाय विवरण",
  "feasibility.village": "गाँव",
  "feasibility.block": "ब्लॉक",
  "feasibility.district": "जिला",
  "feasibility.state": "राज्य",
  "feasibility.category": "व्यवसाय श्रेणी",
  "feasibility.margin": "मार्जिन पूंजी (₹)",
  "feasibility.generate": "व्यवहार्यता रिपोर्ट बनाएं →",
  "tracker.page.title": "📈 मॉड्यूल 3 — व्यवसाय स्वास्थ्य ट्रैकर",
  "tracker.page.sub":
    "मासिक + तिमाही ट्रैकिंग, समृद्ध/टिके/जोखिम वर्गीकरण, विशिष्ट नियम-आधारित अंतर्दृष्टि, और वास्तविक डेटा से लाइव DSCR पुनर्गणना — एक-बार की परियोजना को चल रहे, बैंक-स्वीकार्य ट्रैक रिकॉर्ड में बदलना।",
  "tracker.entry.title": "📝 मासिक राजस्व प्रविष्टि",
  "tracker.month": "महीना",
  "tracker.revenue": "राजस्व (₹)",
  "tracker.cogs": "COGS (₹)",
  "tracker.opex": "OpEx (₹)",
  "tracker.addEntry": "+ मासिक प्रविष्टि जोड़ें",
  "report.page.title": "📄 NABARD प्रारूप रिपोर्ट निर्यात",
  "report.page.sub":
    "NABARD मॉडल बैंकेबल प्रोजेक्ट रिपोर्ट के सटीक प्रारूप की नकल करने वाली बैंक-स्वीकार्य रिपोर्ट बनाएं। बैंक इस प्रारूप पर भरोसा करते हैं।",
  "report.business.title": "📋 व्यवसाय विवरण",
  "report.name": "व्यवसाय का नाम",
  "report.generate": "NABARD रिपोर्ट बनाएं →",
}

// ─── Language → message map ──────────────────────────────────────────────────
const LANG_MESSAGES: Partial<Record<AppLanguageCode, Record<UiKey, string>>> = {
  en: EN,
  hi: HI,
}

// Financial term names in local scripts for Indian languages.
// English stays as the plain English term.
export const FINANCIAL_TERMS: Record<
  Exclude<AppLanguageCode, "en">,
  Record<string, string>
> = {
  hi: {
    profit: "मुनाफा",
    loss: "नुकसान",
    total: "कुल",
    balance: "बैलेंस",
    interest: "ब्याज",
    amount: "राशि",
    rate: "दर",
    tax: "कर",
    fee: "शुल्क",
    income: "आय",
    expense: "खर्च",
    savings: "बचत",
    investment: "निवेश",
    revenue: "राजस्व",
    cost: "लागत",
    margin: "मार्जिन",
    emi: "EMI",
    surplus: "अधिशेष",
    buffer: "बफर",
    dscr: "DSCR",
    projectCost: "प्रोजनल लागत",
    loan: "लोन",
    monthly: "माहवार",
    annual: "वार्षिक",
    report: "रिपोर्ट",
    health: "स्वास्थ्य",
    viability: "व्यवहार्यता",
    demand: "मांग",
    supply: "पूर्ति",
    gap: "अंतर",
    risk: "जोखिम",
  },
  mr: {
    profit: "नफा",
    loss: "नुकसान",
    total: "एकूण",
    balance: "बैलेंस",
    interest: "व्याज",
    amount: "रक्कम",
    rate: "दर",
    tax: "कर",
    fee: "शुल्क",
    income: "उधारी",
    expense: "खर्च",
    savings: "जतन",
    investment: "गुंतवणूक",
    revenue: "मजूरी",
    cost: "खर्च",
    margin: "मार्जिन",
    emi: "EMI",
    surplus: "अधिशेष",
    buffer: "बफर",
    dscr: "DSCR",
    projectCost: "प्रकल्प खर्च",
    loan: "कर्ज",
    monthly: "तिमाही",
    annual: "वार्षिक",
    report: "अहवाल",
    health: "आरोग्य",
    viability: "अनुकूलता",
    demand: "माग",
    supply: "पुरवठा",
    gap: "तफावत",
    risk: "जोखीम",
  },
  pa: {
    profit: "ਲਾਭ",
    loss: "ਨੁਕਸਾਨ",
    total: "ਕੁਲ",
    balance: "ਬੈਲੈਂਸ",
    interest: "ਬਿਆਜ",
    amount: "ਰਕਮ",
    rate: "ਦਰ",
    tax: "ਕਰ",
    fee: "ਫੀ",
    income: "ਆਮਦਨੀ",
    expense: "ਖਰਚ",
    savings: "ਬਚਤ",
    investment: "ਨਿਵੇਸ਼",
    revenue: "ਰਿਜ਼ਨ",
    cost: "ਖ਼ਰਚ",
    margin: "ਮਾਰਜਿਨ",
    emi: "EMI",
    surplus: "ਮੋਤਾ",
    buffer: "ਬਫਰ",
    dscr: "DSCR",
    projectCost: "ਪ੍ਰੋਜੈਕਟ ਖਰਚ",
    loan: "ਲੋਨ",
    monthly: "ਮਹੀਨਾਵਾਰੀ",
    annual: "ਸਾਲਾਨਾ",
    report: "ਰਿਪੋਰਟ",
    health: "ਸਿਹਤ",
    viability: "ਸੰਭਾਵਨਾ",
    demand: "ਮੰਗ",
    supply: "ਸਪਲਾਈ",
    gap: "ਗੈਪ",
    risk: "ਖ਼ਤਰਾ",
  },
  bn: {
    profit: "লাভ",
    loss: "ক্ষতি",
    total: "মোট",
    balance: "ব্যালেন্স",
    interest: "সুদ",
    amount: "পরিমাণ",
    rate: "হার",
    tax: "কর",
    fee: "ফি",
    income: "আয়",
    expense: "ব্যয়",
    savings: "সঞ্চয়",
    investment: "বিনিয়োগ",
    revenue: "রাজস্ব",
    cost: "ব্যয়",
    margin: "মার্জিন",
    emi: "EMI",
    surplus: "অধিকৃত",
    buffer: "বাফার",
    dscr: "DSCR",
    projectCost: "প্রজেক্ট খরচ",
    loan: "ঋণ",
    monthly: "মাসিক",
    annual: "বার্ষিক",
    report: "রিপোর্ট",
    health: "স্বাস্থ্য",
    viability: "বেঁচে থাকার ক্ষমতা",
    demand: "মাংগ",
    supply: "যোগান",
    gap: "ফাঁক",
    risk: "ঝুঁকি",
  },
  ta: {
    profit: "லாபம்",
    loss: "நஷ்டம்",
    total: "மொத்தம்",
    balance: "வணிக நிலை",
    interest: "வட்டி",
    amount: "தொகை",
    rate: "விகிதம்",
    tax: "வரி",
    fee: "கட்டணம்",
    income: "வருமானம்",
    expense: "செலவு",
    savings: "சேமிப்பு",
    investment: "முதலீடு",
    revenue: "வருமானம்",
    cost: "செலவு",
    margin: "மார்ஜின்",
    emi: "EMI",
    surplus: "மீதி",
    buffer: "பஃபர்",
    dscr: "DSCR",
    projectCost: "திட்ட செலவு",
    loan: "கடன்",
    monthly: "மாதாந்திர",
    annual: "வார்ஷிக",
    report: "அறிக்கை",
    health: "சுகாதாரம்",
    viability: "வாழ்வதற்கான திறன்",
    demand: "தேவை",
    supply: "விநியோகம்",
    gap: "இடைவெளி",
    risk: "அபாயம்",
  },
  te: {
    profit: "లాబ్",
    loss: "నష్టం",
    total: "మొత్తం",
    balance: "సంతులనం",
    interest: "వడ్డీ",
    amount: "మొత్తం",
    rate: "రేటు",
    tax: "పన్ను",
    fee: "రుసుము",
    income: "ఆదాయం",
    expense: "ఖర్చు",
    savings: "ఆదా",
    investment: "పెట్టుబడి",
    revenue: "రెవిన్యూ",
    cost: "ఖర్చు",
    margin: "మార్జిన్",
    emi: "EMI",
    surplus: "అదనం",
    buffer: "బఫర్",
    dscr: "DSCR",
    projectCost: "ప్రాజెక్ట్ ఖర్చు",
    loan: "రుణ",
    monthly: "నెలవారీ",
    annual: "సంవత్సర",
    report: "రిపోర్ట్",
    health: "ఆరోగ్యం",
    viability: "అస్తిత్వం",
    demand: "డిమాండ్",
    supply: "సప్లై",
    gap: "గ్యాప్",
    risk: "ప్రమాదం",
  },
  gu: {
    profit: "નફો",
    loss: "નુકસાન",
    total: "કુલ",
    balance: "સંતુલન",
    interest: "વ્યાજ",
    amount: "રકમ",
    rate: "દર",
    tax: "કર",
    fee: "ફી",
    income: "આવક",
    expense: "ખર્ચ",
    savings: "બચત",
    investment: "રોકાણ",
    revenue: "રેવેન્યુ",
    cost: "ખર્ચ",
    margin: "માર્જિન",
    emi: "EMI",
    surplus: "વધારો",
    buffer: "બફર",
    dscr: "DSCR",
    projectCost: "પ્રોજેક્ટ ખર્ચ",
    loan: "લોન",
    monthly: "માસિક",
    annual: "વાર્ષિક",
    report: "રિપોર્ટ",
    health: "સ્વાસ્થ્ય",
    viability: "સંભાવના",
    demand: "ડિમાંડ",
    supply: "સપ્લાય",
    gap: "ગેપ",
    risk: "જોખમ",
  },
  ml: {
    profit: "ലാഭം",
    loss: "നഷ്ടം",
    total: "ആകെ",
    balance: "ബാലൻസ്",
    interest: "പലിശ",
    amount: "തുക",
    rate: "നിരക്ക്",
    tax: "നികുതി",
    fee: "ഫീസ്",
    income: "വരുമാനം",
    expense: "ചെലവ്",
    savings: "സമ്പത്ത്",
    investment: "നിക്ഷേപം",
    revenue: "വരുമാനം",
    cost: "ചെലവ്",
    margin: "മാർജിൻ",
    emi: "EMI",
    surplus: "അധികം",
    buffer: "ബഫർ",
    dscr: "DSCR",
    projectCost: "പ്രോജക്ട് ചെലവ്",
    loan: "വായ്പ",
    monthly: "മാസികം",
    annual: "വാർഷികം",
    report: "റിപ്പോർട്ട്",
    health: "ആരോഗ്യം",
    viability: "അസ്തിത്വം",
    demand: "ഡിമാൻഡ്",
    supply: "സപ്ളൈ",
    gap: "ഗാപ്പ്",
    risk: "അപകടസാധ്യത",
  },
  kn: {
    profit: "ಲಾಭ",
    loss: "ನಷ್ಟ",
    total: "ಒಟ್ಟು",
    balance: "ಸಂತುಲನ",
    interest: "ಬಡ್ಡಿ",
    amount: "ಮೊತ್ತ",
    rate: "ದರ",
    tax: "ತೆರಿಗೆ",
    fee: "ಸುಂದರ",
    income: "ಆದಾಯ",
    expense: "ಖರ್ಚು",
    savings: "ಉಳಿತಾಯ",
    investment: "ಹೂಡಿಕೆ",
    revenue: "ರವಾನೆ",
    cost: "ಖರ್ಚು",
    margin: "ಮಾರ್ಜಿನ್",
    emi: "EMI",
    surplus: "ಮೀಸಲಾತಿ",
    buffer: "ಬಫರ್",
    dscr: "DSCR",
    projectCost: "ಯೋಜನೆ ವೆಚ್ಚ",
    loan: "ಸಾಲ",
    monthly: "ಮಾಸಿಕ",
    annual: "ವಾರ್ಷಿಕ",
    report: "ವರದಿ",
    health: "ಆರೋಗ್ಯ",
    viability: "ಅಸ್ತಿತ್ವ",
    demand: "ಡಿಮಾಂಡ್",
    supply: "ಸಪ್ಲೈ",
    gap: "ಅಂತರ",
    risk: "ಅಪಾಯ",
  },
}

/**
 * Resolve a UI key to the correct string for the given language.
 * Falls back to English for missing keys or unknown languages.
 */
export function t(key: UiKey, code: AppLanguageCode): string {
  const langMap = LANG_MESSAGES[code]
  return langMap?.[key] ?? EN[key] ?? key
}

/**
 * Render a financial term for the given language.
 * - English: plain English term.
 * - Indian languages: local word + English in brackets.
 */
export function fin(
  termKey: string,
  code: AppLanguageCode,
  overrideOrFallback?: string
): string {
  if (code === "en") return termKey
  const localMap = FINANCIAL_TERMS[code]
  let localWord: string

  if (overrideOrFallback && overrideOrFallback !== termKey) {
    localWord = overrideOrFallback
  } else {
    localWord =
      localMap?.[termKey] ??
      localMap?.[termKey.toLowerCase()] ??
      overrideOrFallback ??
      termKey
  }

  return `${localWord} (${termKey})`
}
