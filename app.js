/* ============================================================================
   APP.JS - Module switching, form handling, multilingual popup engine
   Directly assumes Hindi by default without asking, with bilingual English in brackets ()
   across the report, feasibility, calculator, tracker, and navigation.
   ============================================================================ */

(function () {
  "use strict"

  // Default directly to Hindi without asking!
  var currentAppLang = "hi"

  var POPUP_I18N = {
    hi: {
      brandSub: "ग्रामीण उद्यमी सहायक (Rural Advisory)",
      navHome: "होम (Home)",
      navFeas: "मार्केट रिपोर्ट (Feasibility)",
      navCalc: "लोन कैलकुलेटर (Calculator)",
      navTrack: "बिजनेस हेल्थ (Health Tracker)",
      navRep: "सरकारी रिपोर्ट (NABARD Report)",
      navChat: "AI मित्र चैट (AI Mitra Chat)",
      badgeFormulas: "सटीक फॉर्मूला (Formulas)",
      badgeRules: "सरकारी नियम (Rules)",
      badgeNarrator: "AI व्याख्याकार (Narrator)",
      homeBacked: "MoSJE • NABARD • PMEGP • MUDRA Guidelines",
      homeHl1: "ग्रामीण उद्यम के लिए (For Rural Enterprise)",
      homeHl2: "आधुनिक इंटेलिजेंस (Modern Intelligence)",
      homeSubhead: "हम केवल यह नहीं बताते कि आप लोन के पात्र हैं या नहीं: हम यह सुनिश्चित करते हैं कि आपका व्यवसाय चले, और हर महीने मुनाफे में रहे। (We verify loan eligibility and ensure ongoing monthly profitability.)",
      homeCalcBtn: "लोन व ईएमआई निकालें (Calculate Loan & EMI)",
      homeFeasBtn: "बाज़ार मांग जांचें (Check Feasibility)",
      homeStatGap: "क्रेडिट गैप (Credit Gap)",
      homeStatMsme: "पंजीकृत एमएसएमई (MSMEs Registered)",
      homeStatFinLit: "वित्तीय साक्षरता (Financially Literate)",
      homeStatWomen: "ग्रामीण महिलाएं ऑनलाइन (Rural Women Online)",
      archTitle: "विश्वसनीय त्रि-स्तरीय प्रणाली (Three-Way Architecture)",
      archSubtitle: "प्रत्येक परिणाम अपने स्रोत को स्पष्ट रूप से दर्शाता है - पारदर्शी और भरोसेमंद (Transparent and defensible outputs).",
      archCard1T: "सटीक फॉर्मूले (Deterministic Formulas)",
      archCard1D: "EMI, DSCR, ब्रेक-इवन (Break-Even), रिस्क बफर (Risk Buffer), शुद्ध मासिक बचत (Net Cash Surplus) - वित्तीय रूप से सटीक, कोई अनुमान नहीं।",
      archCard2T: "सरकारी नियम (Rules Engine)",
      archCard2D: "योजना पात्रता (Scheme Eligibility), ऑटो-रूटिंग (Auto-Routing), स्वास्थ्य वर्गीकरण (Health Classification) - आधिकारिक सरकारी नियमों के अनुसार।",
      archCard3T: "AI व्याख्याकार (Vernacular Narrator)",
      archCard3D: "आपकी मातृभाषा में आसान समझाइश। कभी कोई झूठा आंकड़ा नहीं बनाता - केवल कैलकुलेटर का परिणाम बताता है।",
      feasTitle: "बाज़ार मांग व व्यवहार्यता रिपोर्ट (Market Feasibility Report)",
      feasDesc: "Census × NSSO प्रॉक्सी डेटा आधारित सटीक स्थानीय बाज़ार मांग विश्लेषण। (Proxy-data market demand estimation using Census × NSSO).",
      feasFormTitle: "स्थान व व्यवसाय विवरण (Location & Business Details)",
      lblFVillage: "गांव (Village)",
      lblFBlock: "प्रखंड / ब्लॉक (Block)",
      lblFDistrict: "जिला (District)",
      lblFState: "राज्य (State)",
      lblFCategory: "व्यवसाय श्रेणी (Business Category)",
      lblFMargin: "आपकी अपनी बचत राशि (Margin Capital - ₹)",
      feasBuyerQ: "महत्वपूर्ण जांच: क्या आप सिर्फ 1 बड़े खरीदार को माल बेचेंगे या अलग-अलग ग्राहकों को? (Single Buyer Dependency Check)",
      optFBuyerMulti: "अलग-अलग कई ग्राहक (Multiple Buyers - Safe)",
      optFBuyerSingle: "सिर्फ 1 बड़ा खरीदार (Single Buyer - Risky)",
      btnFeasGenerate: "व्यवहार्यता रिपोर्ट तैयार करें (Generate Feasibility Report)",
      calcTitle: "लोन व वित्तीय कैलकुलेटर (Loan & Financial Calculator)",
      calcDesc: "मार्जिन राशि → प्रोजेक्ट लागत → लोन → EMI → रिस्क बफर → शुद्ध मासिक बचत (Margin → Project Cost → Loan → EMI → Risk Buffer → Net Cash Surplus)",
      calcFormTitle: "व्यवसाय की जानकारी दर्ज करें (Business Details Onboarding)",
      lblCMargin: "आपकी अपनी बचत / मार्जिन राशि (Margin Capital - ₹)",
      lblCCat: "व्यवसाय श्रेणी (Business Category)",
      lblCRev: "अपेक्षित मासिक बिक्री / कमाई (Expected Monthly Revenue - ₹)",
      lblCCogs: "मासिक माल / स्टॉक खरीद लागत (Raw Material Cost / COGS - ₹)",
      lblCOpex: "मासिक दुकान व परिचालन खर्च (Operating Expenses / OpEx - ₹)",
      btnCalcSubmit: "वित्तीय गणना करें (Calculate Financials)",
      trackTitle: "बिजनेस हेल्थ ट्रैकर (Business Health Tracker)",
      trackDesc: "मासिक प्रविष्टि → तिमाही विश्लेषण → सुरक्षित / सामान्य / जोखिम में स्थिति। (Monthly logging → Quarterly aggregation → Health classification).",
      trackPassTitle: "आसान प्रविष्टि सुविधा (Passive Data Capture)",
      trackPassDesc: "व्हाट्सएप या वॉयस कॉल के जरिए भी जानकारी जोड़ी जा सकती है। यदि एक दिन छूट भी जाए तो ट्रैकर काम करता रहेगा।",
      trackFormTitle: "मासिक कमाई व खर्च प्रविष्टि (Monthly Revenue & Expense Entry)",
      lblTMonth: "महीना (Month)",
      lblTRev: "बिक्री / कमाई (Revenue - ₹)",
      lblTCogs: "माल खरीद लागत (COGS - ₹)",
      lblTOpex: "दुकान खर्च (OpEx - ₹)",
      btnTAdd: "+ प्रविष्टि जोड़ें (+ Add Entry)",
      btnTRep: "हेल्थ रिपोर्ट निकालें (Generate Health Report)",
      trackTblTitle: "मासिक दर्ज प्रविष्टियां (Monthly Logged Entries)",
      trackQtrTitle: "तिमाही तुलनात्मक विश्लेषण (Quarterly Comparison Analysis)",
      trackDscrBadge: "कर्ज चुकाने की वास्तविक क्षमता (Live DSCR Recomputation)",
      trackInsTitle: "स्वचालित वित्तीय सलाह (Automated Financial Insights)",
      trackInsDesc: "प्रत्येक सुझाव सीधे आपके वास्तविक आंकड़ों पर आधारित है।",
      trackBankTitle: "बैंक स्वीकृत रिपोर्ट प्रारूप (Bank-Acceptable Output)",
      trackBankDesc: "नाबार्ड मॉडल बैंकेबल प्रोजेक्ट रिपोर्ट प्रारूप में उपलब्ध।",
      btnTPrint: "नाबार्ड प्रारूप में प्रिंट करें (Print as NABARD Format)",
      repTitle: "नाबार्ड / MoSJE रिपोर्ट एक्सपोर्ट (NABARD & MoSJE Report Export)",
      repDesc: "बैंक लोन स्वीकृति हेतु आधिकारिक मॉडल बैंकेबल प्रोजेक्ट रिपोर्ट। (Bank-acceptable report matching Model Bankable Project Report format).",
      repFormTitle: "व्यवसाय विवरण (Business Details Onboarding)",
      lblRName: "व्यवसाय / इकाई का नाम (Business / Unit Name)",
      lblRVillage: "गांव (Village)",
      lblRBlock: "प्रखंड / ब्लॉक (Block)",
      lblRDistrict: "जिला (District)",
      lblRMargin: "मार्जिन राशि (Promoter Margin Capital - ₹)",
      lblRRev: "मासिक बिक्री (Monthly Revenue - ₹)",
      lblRCogs: "मासिक माल खरीद लागत (Raw Material Cost / COGS - ₹)",
      lblROpex: "मासिक दुकान खर्च (Operating Expenses / OpEx - ₹)",
      btnRSubmit: "आधिकारिक रिपोर्ट तैयार करें (Generate Official Report)",
      btnRPrint: "प्रिंट / पीडीएफ सेव करें (Print / Save as PDF)"
    },
    mr: {
      brandSub: "ग्रामीण उद्यमी सहाय्यक (Rural Advisory)",
      navHome: "मुख्यपृष्ठ (Home)",
      navFeas: "बाजार अहवाल (Feasibility)",
      navCalc: "कर्ज कॅल्क्युलेटर (Calculator)",
      navTrack: "व्यवसाय आरोग्य (Health Tracker)",
      navRep: "शासकीय अहवाल (NABARD Report)",
      navChat: "AI मित्र चॅट (AI Mitra Chat)",
      badgeFormulas: "अचूक सूत्रे (Formulas)",
      badgeRules: "शासकीय नियम (Rules)",
      badgeNarrator: "AI मार्गदर्शक (Narrator)",
      homeBacked: "MoSJE • NABARD • PMEGP • MUDRA मार्गदर्शक तत्त्वे",
      homeHl1: "ग्रामीण उद्योगांसाठी (For Rural Enterprise)",
      homeHl2: "आधुनिक बुद्धिमत्ता (Modern Intelligence)",
      homeSubhead: "आम्ही केवळ तुम्ही कर्जासाठी पात्र आहात की नाही हे सांगत नाही: तर तुमचा व्यवसाय टिकून दरमहा नफा देईल याची खात्री करतो.",
      homeCalcBtn: "कर्ज व हप्ता काढा (Calculate Loan & EMI)",
      homeFeasBtn: "बाजारपेठ तपासा (Check Feasibility)",
      homeStatGap: "कर्ज तूट (Credit Gap)",
      homeStatMsme: "नोंदणीकृत उद्योग (MSMEs Registered)",
      homeStatFinLit: "आर्थिक साक्षरता (Financially Literate)",
      homeStatWomen: "ग्रामीण महिला ऑनलाइन (Rural Women Online)",
      archTitle: "विश्वासार्ह त्रिस्तरीय प्रणाली (Three-Way Architecture)",
      archSubtitle: "प्रत्येक निष्कर्ष अचूक माहितीवर आधारित - पारदर्शक आणि खात्रीशीर.",
      archCard1T: "अचूक सूत्रे (Deterministic Formulas)",
      archCard1D: "EMI, DSCR, ब्रेक-इव्हन (Break-Even), रिस्क बफर (Risk Buffer), निव्वळ नफा (Net Cash Surplus) - गणितावर आधारित बिनचूक.",
      archCard2T: "शासकीय नियम (Rules Engine)",
      archCard2D: "योजनांची पात्रता आणि अधिकृत शासकीय मार्गदर्शक तत्त्वे.",
      archCard3T: "AI मार्गदर्शक (Vernacular Narrator)",
      archCard3D: "आपल्या भाषेत सोप्या शब्दांत मार्गदर्शन. कधीही चुकीचा अंदाज नाही.",
      feasTitle: "बाजारपेठ मागणी व व्यवहार्यता अहवाल (Market Feasibility Report)",
      feasDesc: "Census × NSSO माहितीवर आधारित अचूक स्थानिक विश्लेषण.",
      feasFormTitle: "स्थान व व्यवसाय तपशील (Location & Business Details)",
      lblFVillage: "गाव (Village)",
      lblFBlock: "तालुका / ब्लॉक (Block)",
      lblFDistrict: "जिल्हा (District)",
      lblFState: "राज्य (State)",
      lblFCategory: "व्यवसाय प्रकार (Business Category)",
      lblFMargin: "स्वतःचे भांडवल (Margin Capital - ₹)",
      feasBuyerQ: "महत्त्वाचा प्रश्न: फक्त 1 मोठ्या खरेदीदारावर अवलंबून आहात की अनेक ग्राहक आहेत? (Single Buyer Dependency Check)",
      optFBuyerMulti: "अनेक ग्राहक (Multiple Buyers - Safe)",
      optFBuyerSingle: "फक्त 1 खरेदीदार (Single Buyer - Risky)",
      btnFeasGenerate: "व्यवहार्यता अहवाल तयार करा (Generate Report)",
      calcTitle: "कर्ज व वित्तीय कॅल्क्युलेटर (Financial Calculator)",
      calcDesc: "भांडवल → प्रकल्प खर्च → कर्ज → हप्ता → सुरक्षा निधी → निव्वळ नफा (Margin → Cost → Loan → EMI → Buffer → Surplus)",
      calcFormTitle: "व्यवसायाची माहिती नोंदवा (Business Details Onboarding)",
      lblCMargin: "स्वतःचे भांडवल (Margin Capital - ₹)",
      lblCCat: "व्यवसाय प्रकार (Business Category)",
      lblCRev: "अपेक्षित मासिक विक्री (Monthly Revenue - ₹)",
      lblCCogs: "कच्चा माल खरेदी खर्च (Raw Material Cost / COGS - ₹)",
      lblCOpex: "दुकानाचे इतर मासिक खर्च (Operating Expenses / OpEx - ₹)",
      btnCalcSubmit: "आर्थिक हिशोब करा (Calculate Financials)",
      trackTitle: "व्यवसाय आरोग्य ट्रॅकर (Business Health Tracker)",
      trackDesc: "मासिक नोंद → त्रैमासिक विश्लेषण → उत्तम / मध्यम / धोक्यात स्थिती.",
      trackPassTitle: "सुलभ नोंदणी सुविधा (Passive Data Capture)",
      trackPassDesc: "व्हॉट्सॲप किंवा फोनवरूनही माहिती जोडता येते.",
      trackFormTitle: "मासिक विक्री व खर्च नोंदवा (Monthly Revenue & Expense Entry)",
      lblTMonth: "महिना (Month)",
      lblTRev: "विक्री / कमाई (Revenue - ₹)",
      lblTCogs: "माल खरेदी (COGS - ₹)",
      lblTOpex: "दुकान खर्च (OpEx - ₹)",
      btnTAdd: "+ नोंद जोडा (+ Add Entry)",
      btnTRep: "आरोग्य अहवाल तयार करा (Generate Health Report)",
      trackTblTitle: "मासिक नोंदी (Monthly Logged Entries)",
      trackQtrTitle: "त्रैमासिक तुलनात्मक विश्लेषण (Quarterly Comparison Analysis)",
      trackDscrBadge: "कर्ज फेडण्याची क्षमता (Live DSCR Recomputation)",
      trackInsTitle: "स्वयंचलित आर्थिक सल्ला (Automated Financial Insights)",
      trackInsDesc: "प्रत्येक शिफारस आपल्या प्रत्यक्ष नोंदींवर आधारित आहे.",
      trackBankTitle: "बँक-मान्य अहवाल स्वरूप (Bank-Acceptable Output)",
      trackBankDesc: "नाबार्ड मॉडेल बँक-प्रकल्प अहवाल स्वरूपानुसार उपलब्ध.",
      btnTPrint: "नाबार्ड स्वरूपात प्रिंट करा (Print as NABARD Format)",
      repTitle: "नाबार्ड / MoSJE अहवाल एक्सपोर्ट (NABARD & MoSJE Report Export)",
      repDesc: "बँक कर्ज मंजुरीसाठी अधिकृत मॉडेल अहवाल.",
      repFormTitle: "व्यवसायाचा तपशील (Business Details)",
      lblRName: "व्यवसाय / युनिट नाव (Business / Unit Name)",
      lblRVillage: "गाव (Village)",
      lblRBlock: "तालुका / ब्लॉक (Block)",
      lblRDistrict: "जिल्हा (District)",
      lblRMargin: "स्वतःचे भांडवल (Margin Capital - ₹)",
      lblRRev: "मासिक विक्री (Monthly Revenue - ₹)",
      lblRCogs: "माल खरेदी खर्च (Raw Material Cost / COGS - ₹)",
      lblROpex: "दुकान खर्च (Operating Expenses / OpEx - ₹)",
      btnRSubmit: "अहवाल तयार करा (Generate Report)",
      btnRPrint: "प्रिंट / PDF जतन करा (Print / Save as PDF)"
    },
    en: {
      brandSub: "Rural Advisory",
      navHome: "Home",
      navFeas: "Feasibility Report",
      navCalc: "Loan Calculator",
      navTrack: "Health Tracker",
      navRep: "NABARD Report",
      navChat: "AI Mitra Chat",
      badgeFormulas: "Formulas",
      badgeRules: "Rules",
      badgeNarrator: "Narrator",
      homeBacked: "MoSJE • NABARD • PMEGP • MUDRA Guidelines",
      homeHl1: "Intelligence",
      homeHl2: "For Rural Enterprise",
      homeSubhead: "We do not just tell a rural entrepreneur if they are eligible for a loan: we tell them if they will survive it, and keep proving it every month after.",
      homeCalcBtn: "Calculate Loan & EMI",
      homeFeasBtn: "Check Feasibility",
      homeStatGap: "Credit Gap",
      homeStatMsme: "MSMEs Registered",
      homeStatFinLit: "Financially Literate",
      homeStatWomen: "Rural Women Online",
      archTitle: "Three-Way Architecture",
      archSubtitle: "Every output clearly labels its source: transparent and defensible.",
      archCard1T: "Deterministic Formulas",
      archCard1D: "EMI, DSCR, break-even, Risk Buffer, Net Cash Surplus - financially exact, no approximation.",
      archCard2T: "Rules Engine",
      archCard2D: "Scheme eligibility, auto-routing, health classification - legally precise.",
      archCard3T: "LLM Narrator",
      archCard3D: "Explains results in plain vernacular language. Never invents a number: only reads calculator output.",
      feasTitle: "Feasibility Report",
      feasDesc: "Proxy-data market analysis using Census × NSSO - honest and defensible.",
      feasFormTitle: "Location & Business Details",
      lblFVillage: "Village",
      lblFBlock: "Block",
      lblFDistrict: "District",
      lblFState: "State",
      lblFCategory: "Business Category",
      lblFMargin: "Margin Capital (₹)",
      feasBuyerQ: "Critical: Selling to single buyer or multiple buyers?",
      optFBuyerMulti: "Multiple buyers (Safe)",
      optFBuyerSingle: "Single buyer (Risky)",
      btnFeasGenerate: "Generate Feasibility Report",
      calcTitle: "Financial Calculator",
      calcDesc: "Margin → Project Cost → Loan → EMI → Risk Buffer → Net Cash Surplus",
      calcFormTitle: "Business Details Onboarding",
      lblCMargin: "Margin Capital (₹)",
      lblCCat: "Business Category",
      lblCRev: "Monthly Revenue (₹)",
      lblCCogs: "Monthly COGS (₹)",
      lblCOpex: "Monthly OpEx (₹)",
      btnCalcSubmit: "Calculate Financials",
      trackTitle: "Business Health Tracker",
      trackDesc: "Monthly tracking → quarterly aggregation → Thriving/Surviving/At Risk verdict.",
      trackPassTitle: "Passive Data Capture",
      trackPassDesc: "WhatsApp nudge → IVR call. Missing a day does not break the tracker.",
      trackFormTitle: "Monthly Revenue Entry",
      lblTMonth: "Month",
      lblTRev: "Revenue (₹)",
      lblTCogs: "COGS (₹)",
      lblTOpex: "OpEx (₹)",
      btnTAdd: "+ Add Entry",
      btnTRep: "Generate Health Report",
      trackTblTitle: "Monthly Logged Entries",
      trackQtrTitle: "Quarterly Comparison Analysis",
      trackDscrBadge: "Live DSCR Recomputation",
      trackInsTitle: "Automated Financial Insights",
      trackInsDesc: "Actionable recommendations derived strictly from verified operating metrics.",
      trackBankTitle: "Bank-Acceptable Output",
      trackBankDesc: "Exportable in standardized NABARD Model Bankable Project Report format.",
      btnTPrint: "Print as NABARD Format",
      repTitle: "NABARD Report Export",
      repDesc: "Bank-acceptable report matching Model Bankable Project Report format.",
      repFormTitle: "Business Details",
      lblRName: "Business / Unit Name",
      lblRVillage: "Village",
      lblRBlock: "Block",
      lblRDistrict: "District",
      lblRMargin: "Margin Capital (₹)",
      lblRRev: "Monthly Revenue (₹)",
      lblRCogs: "Monthly COGS (₹)",
      lblROpex: "Monthly OpEx (₹)",
      btnRSubmit: "Generate Official Report",
      btnRPrint: "Print / Save as PDF"
    }
  }

  function setElementText(id, text) {
    var el = document.getElementById(id)
    if (el && text !== undefined) el.textContent = text
  }

  function applyLanguageToDOM(lang) {
    var dict = POPUP_I18N[lang] || POPUP_I18N.hi

    setElementText("txt-brand-sub", dict.brandSub)
    setElementText("nav-home", dict.navHome)
    setElementText("nav-feasibility", dict.navFeas)
    setElementText("nav-calculator", dict.navCalc)
    setElementText("nav-tracker", dict.navTrack)
    setElementText("nav-report", dict.navRep)
    setElementText("nav-chat", dict.navChat)

    setElementText("txt-badge-formulas", dict.badgeFormulas)
    setElementText("txt-badge-rules", dict.badgeRules)
    setElementText("txt-badge-narrator", dict.badgeNarrator)

    setElementText("txt-home-backed", dict.homeBacked)
    setElementText("txt-home-hl1", dict.homeHl1)
    setElementText("txt-home-hl2", dict.homeHl2)
    setElementText("txt-home-subhead", dict.homeSubhead)
    setElementText("txt-home-calcbtn", dict.homeCalcBtn)
    setElementText("txt-home-feasbtn", dict.homeFeasBtn)

    setElementText("txt-stat-creditgap", dict.homeStatGap)
    setElementText("txt-stat-msme", dict.homeStatMsme)
    setElementText("txt-stat-finlit", dict.homeStatFinLit)
    setElementText("txt-stat-women", dict.homeStatWomen)

    setElementText("txt-arch-title", dict.archTitle)
    setElementText("txt-arch-subtitle", dict.archSubtitle)
    setElementText("txt-arch-card1-t", dict.archCard1T)
    setElementText("txt-arch-card1-d", dict.archCard1D)
    setElementText("txt-arch-card2-t", dict.archCard2T)
    setElementText("txt-arch-card2-d", dict.archCard2D)
    setElementText("txt-arch-card3-t", dict.archCard3T)
    setElementText("txt-arch-card3-d", dict.archCard3D)

    setElementText("txt-feas-title", dict.feasTitle)
    setElementText("txt-feas-desc", dict.feasDesc)
    setElementText("txt-feas-form-title", dict.feasFormTitle)
    setElementText("lbl-f-village", dict.lblFVillage)
    setElementText("lbl-f-block", dict.lblFBlock)
    setElementText("lbl-f-district", dict.lblFDistrict)
    setElementText("lbl-f-state", dict.lblFState)
    setElementText("lbl-f-category", dict.lblFCategory)
    setElementText("lbl-f-margin", dict.lblFMargin)
    setElementText("txt-feas-buyer-q", dict.feasBuyerQ)
    setElementText("opt-f-buyer-multi", dict.optFBuyerMulti)
    setElementText("opt-f-buyer-single", dict.optFBuyerSingle)
    setElementText("btn-feas-generate", dict.btnFeasGenerate)

    setElementText("txt-calc-title", dict.calcTitle)
    setElementText("txt-calc-desc", dict.calcDesc)
    setElementText("txt-calc-form-title", dict.calcFormTitle)
    setElementText("lbl-c-margin", dict.lblCMargin)
    setElementText("lbl-c-cat", dict.lblCCat)
    setElementText("lbl-c-rev", dict.lblCRev)
    setElementText("lbl-c-cogs", dict.lblCCogs)
    setElementText("lbl-c-opex", dict.lblCOpex)
    setElementText("btn-calc-submit", dict.btnCalcSubmit)

    setElementText("txt-track-title", dict.trackTitle)
    setElementText("txt-track-desc", dict.trackDesc)
    setElementText("txt-track-pass-title", dict.trackPassTitle)
    setElementText("txt-track-pass-desc", dict.trackPassDesc)
    setElementText("txt-track-form-title", dict.trackFormTitle)
    setElementText("lbl-t-month", dict.lblTMonth)
    setElementText("lbl-t-rev", dict.lblTRev)
    setElementText("lbl-t-cogs", dict.lblTCogs)
    setElementText("lbl-t-opex", dict.lblTOpex)
    setElementText("btn-t-add", dict.btnTAdd)
    setElementText("btn-t-rep", dict.btnTRep)
    setElementText("txt-track-tbl-title", dict.trackTblTitle)
    setElementText("txt-track-qtr-title", dict.trackQtrTitle)
    setElementText("txt-track-dscr-badge", dict.trackDscrBadge)
    setElementText("txt-track-ins-title", dict.trackInsTitle)
    setElementText("txt-track-ins-desc", dict.trackInsDesc)
    setElementText("txt-track-bank-title", dict.trackBankTitle)
    setElementText("txt-track-bank-desc", dict.trackBankDesc)
    setElementText("btn-t-print", dict.btnTPrint)

    setElementText("txt-rep-title", dict.repTitle)
    setElementText("txt-rep-desc", dict.repDesc)
    setElementText("txt-rep-form-title", dict.repFormTitle)
    setElementText("lbl-r-name", dict.lblRName)
    setElementText("lbl-r-village", dict.lblRVillage)
    setElementText("lbl-r-block", dict.lblRBlock)
    setElementText("lbl-r-district", dict.lblRDistrict)
    setElementText("lbl-r-margin", dict.lblRMargin)
    setElementText("lbl-r-rev", dict.lblRRev)
    setElementText("lbl-r-cogs", dict.lblRCogs)
    setElementText("lbl-r-opex", dict.lblROpex)
    setElementText("btn-r-submit", dict.btnRSubmit)
    setElementText("btn-r-print", dict.btnRPrint)
  }

  window.setAppLanguage = function (lang, notifyParent) {
    if (!lang || lang === "hinglish") lang = "hi"
    if (!POPUP_I18N[lang]) lang = "hi"
    currentAppLang = lang
    applyLanguageToDOM(lang)

    // Update active class on sidebar language buttons
    document.querySelectorAll(".sidebar-lang-btn").forEach(function (btn) {
      if (btn.getAttribute("data-app-lang") === lang) {
        btn.classList.add("active")
        btn.setAttribute("aria-pressed", "true")
      } else {
        btn.classList.remove("active")
        btn.setAttribute("aria-pressed", "false")
      }
    })

    // Persist language
    try { localStorage.setItem("preferredLanguage", lang) } catch (e) {}

    // Notify parent if inside iframe ONLY when notifyParent is true (explicitly clicked inside app)
    if (notifyParent === true) {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ action: "langChangedInApp", lang: lang }, "*")
        }
      } catch (e) {}
    }
  }

  // Bind sidebar language switcher clicks
  document.querySelectorAll(".sidebar-lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = this.getAttribute("data-app-lang")
      if (lang) window.setAppLanguage(lang, true)
    })
  })

  // --- Module Switching ---
  function switchModule(name) {
    document.querySelectorAll(".module").forEach(function (m) {
      m.classList.remove("active")
    })

    var target = document.getElementById("module-" + name)
    if (target) {
      target.classList.add("active")
      target.style.animation = "none"
      target.offsetHeight // reflow
      target.style.animation = ""
    }

    document.querySelectorAll(".sidebar-link[data-module]").forEach(function (l) {
      l.classList.remove("active")
      if (l.dataset.module === name) l.classList.add("active")
    })

    var main = document.getElementById("mainContent")
    if (main) main.scrollTop = 0
    closeMobileMenu()
  }

  window.switchModule = switchModule

  document.querySelectorAll(".sidebar-link[data-module]").forEach(function (link) {
    link.addEventListener("click", function () {
      switchModule(this.dataset.module)
    })
  })

  // --- Mobile Menu ---
  var burger = document.getElementById("burger")
  var overlay = document.getElementById("overlay")
  var sidebar = document.getElementById("sidebar")

  function openMobileMenu() {
    if (!burger) return
    burger.setAttribute("aria-expanded", "true")
    if (overlay) overlay.hidden = false
    if (sidebar) sidebar.classList.add("open")
    document.body.classList.add("menu-open")
  }

  function closeMobileMenu() {
    if (!burger) return
    burger.setAttribute("aria-expanded", "false")
    if (overlay) overlay.hidden = true
    if (sidebar) sidebar.classList.remove("open")
    document.body.classList.remove("menu-open")
  }

  if (burger) {
    burger.addEventListener("click", function () {
      if (this.getAttribute("aria-expanded") === "true") {
        closeMobileMenu()
      } else {
        openMobileMenu()
      }
    })
  }

  if (overlay) overlay.addEventListener("click", closeMobileMenu)

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMobileMenu()
  })

  // --- Utility ---
  function $(id) { return document.getElementById(id) }
  function val(id) { return Number($(id).value) || 0 }
  function text(id) { return ($(id).value || "").trim() }

  // --- FEASIBILITY MODULE ---
  window.generateFeasibility = function () {
    var state = text("f-state")
    var category = text("f-category")
    var margin = val("f-margin")
    var singleBuyer = document.querySelector('input[name="f-buyer"]:checked').value === "1"

    if (!margin || margin <= 0) {
      alert(currentAppLang === "hi"
        ? "कृपया अपनी बचत (मार्जिन पूँजी) दर्ज करें। (Please enter your margin capital)"
        : currentAppLang === "mr"
        ? "कृपया आपले स्वतःचे भांडवल नोंदवा. (Please enter your margin capital)"
        : "Please enter your margin capital.")
      var mEl = $("f-margin")
      if (mEl) mEl.focus()
      return
    }

    var f = Engine.computeFeasibility(state, category, margin, singleBuyer)
    var isHi = currentAppLang === "hi"
    var isMr = currentAppLang === "mr"

    // Labels with English in brackets ()
    var lConsumers = isHi ? "उपभोक्ता आबादी (Consumer Base)" : isMr ? "ग्राहक लोकसंख्या (Consumer Base)" : "Consumer Base"
    var lDemand = isHi ? "वार्षिक मांग (Annual Demand)" : isMr ? "वार्षिक मागणी (Annual Demand)" : "Annual Demand"
    var lSupply = isHi ? "मौजूदा आपूर्ति (Current Supply)" : isMr ? "सध्याचा पुरवठा (Current Supply)" : "Current Supply"
    var lGap = isHi ? "मांग व आपूर्ति अंतर (Supply-Demand Gap)" : isMr ? "मागणी-पुरवठा तूट (Supply-Demand Gap)" : "Supply-Demand Gap"
    var lComp = isHi ? "ब्लॉक में औसत प्रतिस्पर्धी (Avg Competitors/Block)" : isMr ? "प्रतिस्पर्धी संख्या (Avg Competitors)" : "Avg Competitors/Block"
    var lDensity = isHi ? "प्रतिस्पर्धा घनत्व (Competitor Density)" : isMr ? "स्पर्धेचे प्रमाण (Competitor Density)" : "Competitor Density"

    // Render market stats
    $("f-market-stats").innerHTML =
      '<div class="stats-row">' +
      '<div class="stat-item"><div class="val">' + f.consumers.toLocaleString("en-IN") + '</div><div class="lbl">' + lConsumers + '</div></div>' +
      '<div class="stat-item"><div class="val">' + Engine.fmtINR(f.demand) + '</div><div class="lbl">' + lDemand + '</div></div>' +
      '<div class="stat-item"><div class="val">' + Engine.fmtINR(f.supply) + '</div><div class="lbl">' + lSupply + '</div></div>' +
      '<div class="stat-item"><div class="val" style="color:' + (f.demandDeficit ? '#16a34a' : '#dc2626') + '">' +
      (f.demandDeficit ? '+' : '') + Engine.fmtINR(Math.abs(f.gap)) + '</div><div class="lbl">' + lGap + '</div></div>' +
      '<div class="stat-item"><div class="val">' + f.competitors + '</div><div class="lbl">' + lComp + '</div></div>' +
      '<div class="stat-item"><div class="val">' + f.density + '</div><div class="lbl">' + lDensity + '</div></div>' +
      '</div>'

    // Render SWOT with English in brackets ()
    var strengths = isHi
      ? ["कम शुरुआती पूंजी में शुरुआत (Low Initial Capital) - ₹" + (margin / 100000).toFixed(1) + " लाख मार्जिन", f.category.hi + " स्थानीय ज़रूरत का व्यवसाय है (Local-Need Enterprise)"]
      : isMr
      ? ["कमी भांडवलात सुरुवात (Low Initial Capital) - ₹" + (margin / 100000).toFixed(1) + " लाख", f.category.hi + " स्थानिक गरजेचा व्यवसाय (Local-Need Enterprise)"]
      : ["Low initial investment (₹" + (margin / 100000).toFixed(1) + "L margin)", f.category.en + " is a local-need business"]

    var weaknesses = margin < 50000 ? [isHi ? "सीमित मार्जिन पूंजी (Limited Margin Capital)" : isMr ? "मर्यादित भांडवल (Limited Capital)" : "Very limited margin capital"] : []
    if (f.density === "high") {
      weaknesses.push(isHi ? "ब्लॉक में अधिक प्रतिस्पर्धी मौजूद (High Competitor Density in Block)" : isMr ? "परिसरात जास्त स्पर्धा (High Competition in Block)" : "High competitor density in block")
    }

    var opportunities = []
    if (f.demandDeficit) {
      opportunities.push(isHi ? Engine.fmtINR(f.gap) + " की मांग का अंतर (Supply-Demand Gap) - नए व्यवसाय के लिए बड़ा अवसर (Room for new entrants)" : isMr ? Engine.fmtINR(f.gap) + " ची मागणी तूट - नवीन उद्योगास वाव" : "Supply-demand gap of " + Engine.fmtINR(f.gap) + " - room for new entrants")
    }
    opportunities.push(isHi ? "सरकारी योजनाओं से 6.5% - 8% रियायती ब्याज दर पर लोन (Concessional Credit @ 6.5%-8%)" : isMr ? "शासकीय योजनेतून ६.५% ते ८% व्याजदराने कर्ज (Concessional Credit)" : "Concessional credit at 6.5-8% interest")

    var threats = [
      isHi ? "मौसम व त्यौहार के अनुसार मांग में उतार-चढ़ाव (Seasonal Demand Fluctuations)" : isMr ? "हंगामी मागणीतील चढ-उतार (Seasonal Fluctuations)" : "Seasonal demand fluctuations",
      isHi ? "ग्रामीण इलाकों में कच्चा माल आपूर्ति की समस्या (Rural Supply Chain Bottlenecks)" : isMr ? "कच्च्या मालाच्या पुरवठ्यातील अडचणी (Supply Bottlenecks)" : "Supply chain bottlenecks in rural areas"
    ]
    if (f.singleBuyer) {
      threats.push(isHi ? "सिर्फ 1 खरीदार पर निर्भरता (Single Buyer Dependency) = ~40% कम मुनाफा (Lower Realized Profit)" : isMr ? "एकाच खरेदीदारावर अवलंबून राहिल्यास नफ्यात घट (Single Buyer Dependency)" : "Single buyer dependency = ~40% lower profit")
    }

    var titleSWOT = isHi ? "SWOT विश्लेषण (SWOT Analysis - Strengths, Weaknesses, Opportunities, Threats)" : isMr ? "SWOT विश्लेषण (SWOT Analysis)" : "SWOT Analysis"
    var tStr = isHi ? '<i class="fa-solid fa-circle-check"></i> ताकत (Strengths)' : isMr ? '<i class="fa-solid fa-circle-check"></i> जमेची बाजू (Strengths)' : '<i class="fa-solid fa-circle-check"></i> Strengths'
    var tWk = isHi ? '<i class="fa-solid fa-circle-xmark"></i> कमजोरियां (Weaknesses)' : isMr ? '<i class="fa-solid fa-circle-xmark"></i> त्रुटी (Weaknesses)' : '<i class="fa-solid fa-circle-xmark"></i> Weaknesses'
    var tOp = isHi ? '<i class="fa-solid fa-arrow-trend-up"></i> अवसर (Opportunities)' : isMr ? '<i class="fa-solid fa-arrow-trend-up"></i> संधी (Opportunities)' : '<i class="fa-solid fa-arrow-trend-up"></i> Opportunities'
    var tTh = isHi ? '<i class="fa-solid fa-triangle-exclamation"></i> जोखिम (Threats)' : isMr ? '<i class="fa-solid fa-triangle-exclamation"></i> धोके (Threats)' : '<i class="fa-solid fa-triangle-exclamation"></i> Threats'

    $("f-swot").innerHTML =
      '<h2 class="card-title">' + titleSWOT + '</h2>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
      '<div style="background:rgba(22,163,74,0.06);border:1px solid #bbf7d0;border-radius:14px;padding:16px"><div style="font-size:13px;font-weight:700;color:#15803d;margin-bottom:8px">' + tStr + '</div>' + strengths.map(function(s){return '<div style="font-size:13px;color:#334155;margin-bottom:5px">• ' + s + '</div>'}).join('') + '</div>' +
      '<div style="background:rgba(220,38,38,0.06);border:1px solid #fecaca;border-radius:14px;padding:16px"><div style="font-size:13px;font-weight:700;color:#dc2626;margin-bottom:8px">' + tWk + '</div>' + (weaknesses.length ? weaknesses.map(function(w){return '<div style="font-size:13px;color:#334155;margin-bottom:5px">• ' + w + '</div>'}).join('') : '<div style="font-size:13px;color:#94a3b8">' + (isHi ? "कोई नहीं (None Identified)" : "None identified") + '</div>') + '</div>' +
      '<div style="background:rgba(2,132,199,0.06);border:1px solid #bae6fd;border-radius:14px;padding:16px"><div style="font-size:13px;font-weight:700;color:#0284c7;margin-bottom:8px">' + tOp + '</div>' + opportunities.map(function(o){return '<div style="font-size:13px;color:#334155;margin-bottom:5px">• ' + o + '</div>'}).join('') + '</div>' +
      '<div style="background:rgba(217,119,6,0.06);border:1px solid #fde68a;border-radius:14px;padding:16px"><div style="font-size:13px;font-weight:700;color:#d97706;margin-bottom:8px">' + tTh + '</div>' + threats.map(function(t){return '<div style="font-size:13px;color:#334155;margin-bottom:5px">• ' + t + '</div>'}).join('') + '</div>' +
      '</div>'

    // Viability
    var scoreColor = f.viabilityScore === "high" ? "#16a34a" : f.viabilityScore === "low" ? "#dc2626" : "#d97706"
    var scoreText = f.viabilityScore === "high"
      ? (isHi ? "उच्च संभावना (High Viability)" : isMr ? "उत्तम संधी (High Viability)" : "HIGH")
      : f.viabilityScore === "low"
      ? (isHi ? "कम संभावना (Low Viability)" : isMr ? "कमी शक्यता (Low Viability)" : "LOW")
      : (isHi ? "मध्यम संभावना (Moderate Viability)" : isMr ? "मध्यम (Moderate Viability)" : "MODERATE")

    var tViabilityTitle = isHi ? "सफलता संभावना मूल्यांकन (Viability Assessment)" : isMr ? "व्यवहार्यता मूल्यांकन (Viability Assessment)" : "Viability Assessment"
    $("f-viability").innerHTML =
      '<h2 class="card-title">' + tViabilityTitle + '</h2>' +
      '<div style="text-align:center;padding:22px">' +
      '<div style="margin-bottom:8px"><i class="fa-solid ' + (f.viabilityScore === "high" ? "fa-circle-check" : f.viabilityScore === "low" ? "fa-circle-xmark" : "fa-circle-exclamation") + '" style="font-size:36px;color:' + scoreColor + '"></i></div>' +
      '<div style="font-size:22px;font-weight:800;color:' + scoreColor + '">' + scoreText + '</div>' +
      '<div style="font-size:13px;color:var(--muted);margin-top:4px">' + (isHi ? "व्यवहार्यता स्कोर (Viability Score)" : "Viability Score") + '</div>' +
      '</div>'

    // Warnings
    var warnings = ""
    if (f.singleBuyer) {
      warnings += '<div class="card" style="border-color:#fde68a;background:#fffbeb;margin-bottom:14px"><div class="card-title" style="color:#d97706"><i class="fa-solid fa-triangle-exclamation" style="margin-right:6px"></i>' + (isHi ? "एकल खरीदार जोखिम (Single Buyer Dependency)" : "Single Buyer Dependency") + '</div><p class="card-desc" style="color:#92400e">' + (isHi ? "सिर्फ 1 बड़े खरीदार पर निर्भर रहने से 40% तक कम मुनाफा मिलता है। स्थानीय मंडी या अन्य दुकानदारों को भी माल बेचें। (Single buyer dependency yields ~40% lower realized profit. Connect with local Mandi board / alternate buyers)." : "Single buyer = ~40% lower realized profit. Connect with local Mandi board / alternate buyers.") + '</p></div>'
    }
    if (f.density === "high") {
      warnings += '<div class="card" style="border-color:#fde68a;background:#fffbeb;margin-bottom:14px"><div class="card-title" style="color:#d97706"><i class="fa-solid fa-triangle-exclamation" style="margin-right:6px"></i>' + (isHi ? "उच्च प्रतिस्पर्धा (High Competition)" : "High Competition") + '</div><p class="card-desc" style="color:#92400e">' + (isHi ? "इस ब्लॉक में पहले से कई प्रतिस्पर्धी हैं। बेहतर गुणवत्ता और अलग उत्पाद बेचकर ही बढ़त बनाएं। (High competitor density in block. Success depends on differentiation)." : "Block has significant competitor presence. Success depends on differentiation.") + '</p></div>'
    }
    $("f-warnings").innerHTML = warnings

    // Narrator
    $("f-narrator").textContent = Engine.narrateFeasibility(f)

    $("feasibility-results").classList.remove("hidden")
  }

  // --- CALCULATOR MODULE ---
  window.calculateFinancials = function () {
    var margin = val("c-margin")
    var revenue = val("c-revenue")
    var cogs = val("c-cogs")
    var opex = val("c-opex")

    if (!margin || margin <= 0) {
      alert(currentAppLang === "hi"
        ? "कृपया अपनी बचत (मार्जिन पूँजी) दर्ज करें। (Please enter your margin capital)"
        : currentAppLang === "mr"
        ? "कृपया आपले स्वतःचे भांडवल नोंदवा. (Please enter your margin capital)"
        : "Please enter your margin capital.")
      var mEl = $("c-margin")
      if (mEl) mEl.focus()
      return
    }

    if (!revenue || revenue <= 0) {
      alert(currentAppLang === "hi"
        ? "कृपया अपनी मासिक बिक्री (आय) दर्ज करें। (Please enter your monthly revenue)"
        : currentAppLang === "mr"
        ? "कृपया आपली मासिक कमाई नोंदवा. (Please enter your monthly revenue)"
        : "Please enter your monthly revenue.")
      var rEl = $("c-revenue")
      if (rEl) rEl.focus()
      return
    }

    var calc = Engine.computeFinancials(margin, revenue, cogs, opex)
    if (!calc) {
      alert("प्रोजेक्ट लागत सरकारी योजना सीमा से बाहर है। (Project cost out of scheme range.)")
      return
    }

    var isHi = currentAppLang === "hi"
    var isMr = currentAppLang === "mr"

    // Step 1: Deterministic with English in brackets ()
    $("c-step1").innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">' +
      '<div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px"><span style="color:var(--muted)">' + (isHi ? "आपकी बचत (Promoter Margin):" : isMr ? "स्वतःचे भांडवल (Margin):" : "Margin Capital:") + '</span><span class="font-bold">' + Engine.fmtINR(calc.margin) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px"><span style="color:var(--muted)">÷ 10% =</span><span /></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px"><span style="color:var(--muted)">' + (isHi ? "कुल प्रोजेक्ट लागत (Total Project Cost):" : isMr ? "प्रकल्प खर्च (Project Cost):" : "Project Cost:") + '</span><span class="font-bold" style="font-size:17px">' + Engine.fmtINR(calc.projectCost) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px"><span style="color:var(--muted)">× ' + calc.scheme.loanPct + '% =</span><span /></div>' +
      '<div style="display:flex;justify-content:space-between;font-size:14px"><span style="color:var(--muted)">' + (isHi ? "स्वीकृत बैंक लोन (Bank Loan Eligibility):" : isMr ? "मंजूर कर्ज (Loan Eligibility):" : "Loan Amount:") + '</span><span class="font-bold" style="font-size:17px;color:#0284c7">' + Engine.fmtINR(calc.loanAmount) + '</span></div>' +
      '</div>' +
      '<div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px"><span style="color:var(--muted)">' + (isHi ? "मासिक ईएमआई (Monthly EMI):" : isMr ? "मासिक हप्ता (Monthly EMI):" : "Monthly EMI:") + '</span><span class="font-bold">' + Engine.fmtINR(calc.emi) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px"><span style="color:var(--muted)">' + (isHi ? "कुल ब्याज (Total Interest):" : isMr ? "एकूण व्याज (Total Interest):" : "Total Interest:") + '</span><span class="font-bold">' + Engine.fmtINR(calc.totalInterest) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px"><span style="color:var(--muted)">' + (isHi ? "कुल भुगतान (Total Payment):" : isMr ? "एकूण परतफेड (Total Payment):" : "Total Payment:") + '</span><span class="font-bold">' + Engine.fmtINR(calc.totalPayment) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;font-size:14px"><span style="color:var(--muted)">' + (isHi ? "कर्ज चुकाने की क्षमता (DSCR):" : isMr ? "कर्ज फेड क्षमता (DSCR):" : "DSCR:") + '</span><span class="font-bold" style="color:#16a34a">' + calc.dscr + '</span></div>' +
      '</div></div>'

    // Step 2: Rules with English in brackets ()
    var schemeName = isHi ? calc.scheme.nameHi + " (" + calc.scheme.name + ")" : calc.scheme.name
    $("c-step2").innerHTML =
      '<div style="font-size:14px">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--muted)">' + (isHi ? "यदि प्रोजेक्ट लागत ≤ ₹1.40 लाख (IF Cost ≤ ₹1.40L):" : "IF Project Cost ≤ ₹1.40L:") + '</span><span>' + (isHi ? "माइक्रो फाइनेंस योजना (Micro Finance Scheme)" : "Micro Finance Scheme") + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="color:var(--muted)">' + (isHi ? "अन्यथा ₹1.40 लाख – ₹50 लाख (ELSE IF ₹1.40L–₹50L):" : "ELSE IF ₹1.40L–₹50L:") + '</span><span style="font-weight:700;color:#0284c7">→ ' + (isHi ? "चयनित (Matched): " : "Matched: ") + schemeName + '</span></div>' +
      '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;font-size:13px">' +
      '<div style="color:#0f172a;font-weight:600;margin-bottom:4px">• ' + (isHi ? "ब्याज दर (Interest Rate): " : "Interest: ") + calc.scheme.rate + '% वार्षिक (per annum)</div>' +
      '<div style="color:#0f172a;font-weight:600;margin-bottom:4px">• ' + (isHi ? "लोन अवधि (Repayment Tenure): " : "Tenure: ") + calc.scheme.tenure + ' वर्ष (years)</div>' +
      '<div style="color:#0f172a;font-weight:600;margin-bottom:4px">• ' + (isHi ? "मोरेटोरियम छूट अवधि (Moratorium Holiday): " : "Moratorium: ") + calc.scheme.moratorium + ' महीने (months)</div>' +
      '<div style="color:var(--muted);margin-top:10px;font-size:12px"><i class="fa-regular fa-file-lines" style="margin-right:4px"></i>' + (isHi ? "स्रोत (Source): " : "Source: ") + calc.scheme.source + ' | ' + (isHi ? "सत्यापित (Verified): " : "Verified: ") + calc.scheme.lastVerified + '</div>' +
      '</div></div>'

    // Moratorium Killer with English in brackets ()
    $("c-moratorium").innerHTML =
      '<div class="moratorium-compare">' +
      '<div class="moratorium-box" style="background:#f8fafc"><div class="label">' + (isHi ? "लोग क्या सोचते हैं (What people think):" : "What people think:") + '</div><div class="value" style="font-size:1rem;color:#64748b">"' + calc.scheme.moratorium + (isHi ? ' महीने बाद किश्त शुरू होगी (EMI starts after ' + calc.scheme.moratorium + ' months)"' : ' months holiday"') + '</div></div>' +
      '<div class="moratorium-box" style="background:#fff1f2;border-color:#fecdd3"><div class="label" style="color:#e11d48">' + (isHi ? "असलियत क्या है (What actually happens):" : "What actually happens:") + '</div><div class="value" style="color:#be123c">' + Engine.fmtINR(calc.postMorEMI) + (isHi ? '/महीना (/month)' : '/month') + '</div><div class="sub" style="color:#be123c">' + (calc.postMorEMI - calc.emi > 0 ? Engine.fmtINR(calc.postMorEMI - calc.emi) + (isHi ? " सामान्य EMI से अधिक (More than regular EMI)" : " MORE than regular EMI") : (isHi ? "सामान्य के बराबर (Same as regular)" : "Same as regular")) + '</div></div>' +
      '</div>'

    // Risk Buffer with English in brackets ()
    var riskStatus, riskClass
    if (calc.netSurplus >= calc.riskBuffer) {
      riskStatus = isHi ? "आपकी बचत रिस्क बफर को पूरा करती है - मंदी के महीने में भी व्यापार सुरक्षित रहेगा। (Surplus safely covers the Risk Buffer.)" : "Your surplus covers the Risk Buffer - you can survive a bad month."
      riskClass = "met"
    } else if (calc.netSurplus > 0) {
      riskStatus = isHi ? "बचत रिस्क बफर से कम है - एक खराब महीना भी आपको डिफ़ॉल्ट में धकेल सकता है। (Surplus below Risk Buffer - risk of default in slow months.)" : "Surplus is below Risk Buffer - one bad month could push you into default."
      riskClass = "breached"
    } else {
      riskStatus = isHi ? "नकारात्मक नकदी बचत - इस ढांचे में लोन न लें, पहले खर्च घटाएं। (Negative cash surplus - do NOT take this loan without restructuring.)" : "Negative cash surplus - do NOT take this loan without restructuring."
      riskClass = "critical"
    }

    $("c-riskbuffer").innerHTML =
      '<div class="risk-buffer-display">' +
      '<div class="risk-buffer-value">' + Engine.fmtINR(calc.riskBuffer) + (isHi ? '/महीना (/month)' : '/month') + '</div>' +
      '<div class="risk-buffer-formula">= 1.5 × ' + (isHi ? "पोस्ट-मोरेटोरियम ईएमआई (Post-Moratorium EMI) (" : "Post-Moratorium EMI (") + Engine.fmtINR(calc.postMorEMI) + ' × 1.5)</div>' +
      (revenue > 0 ? '<div class="risk-buffer-verdict ' + riskClass + '">' + riskStatus + '</div>' : '') +
      '</div>'

    // Net Cash Surplus with English in brackets ()
    var surplusColor = calc.netSurplusAfterEMI >= 0 ? "#16a34a" : "#dc2626"
    var tSurplusTitle = isHi ? "शुद्ध मासिक बचत (Net Cash Surplus)" : isMr ? "निव्वळ मासिक नफा (Net Cash Surplus)" : "Net Cash Surplus"
    $("c-surplus").innerHTML =
      '<h2 class="card-title">' + tSurplusTitle + '</h2>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
      '<div style="font-size:14px">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--muted)">' + (isHi ? "मासिक बिक्री (Monthly Revenue):" : "Revenue:") + '</span><span>' + Engine.fmtINR(revenue) + (isHi ? '/माह (/mo)' : '/mo') + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--muted)">' + (isHi ? "− माल खरीद लागत (Raw Material / COGS):" : "− COGS:") + '</span><span>' + Engine.fmtINR(cogs) + (isHi ? '/माह (/mo)' : '/mo') + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--muted)">' + (isHi ? "− दुकान खर्च (Operating Expenses / OpEx):" : "− OpEx:") + '</span><span>' + Engine.fmtINR(opex) + (isHi ? '/माह (/mo)' : '/mo') + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--muted)">' + (isHi ? "− मासिक किश्त (Monthly EMI):" : "− EMI:") + '</span><span>' + Engine.fmtINR(calc.postMorEMI) + (isHi ? '/माह (/mo)' : '/mo') + '</span></div>' +
      '<div style="border-top:1px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between;font-weight:700"><span>' + (isHi ? "= शुद्ध मासिक बचत (Net Cash Surplus):" : "= Net Surplus:") + '</span><span style="color:' + surplusColor + '">' + Engine.fmtINR(calc.netSurplusAfterEMI) + (isHi ? '/माह (/mo)' : '/mo') + '</span></div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;justify-content:center">' +
      '<div style="text-align:center;padding:20px;border-radius:14px;background:' + (calc.netSurplusAfterEMI > 0 ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)') + ';border:1px solid ' + (calc.netSurplusAfterEMI > 0 ? '#bbf7d0' : '#fecaca') + '">' +
      '<div style="margin-bottom:6px"><i class="fa-solid ' + (calc.netSurplusAfterEMI > 0 ? 'fa-circle-check" style="font-size:32px;color:#15803d"' : 'fa-circle-xmark" style="font-size:32px;color:#be123c"') + '></i></div>' +
      '<div style="font-weight:700;font-size:14px;color:' + (calc.netSurplusAfterEMI > 0 ? '#15803d' : '#be123c') + '">' + (calc.netSurplusAfterEMI > 0 ? (isHi ? "व्यवसाय टिकाऊ व व्यवहार्य है (Viable as Structured)" : "Viable as structured") : (isHi ? "व्यवहार्य नहीं - पुनर्गठन करें (NOT Viable - Restructure)" : "NOT viable - restructure")) + '</div>' +
      '</div></div></div>'

    // Repayment Schedule with English in brackets ()
    var schedule = Engine.generateSchedule(calc)
    var rows = schedule.slice(0, 12).map(function (p) {
      return '<tr' + (p.moratorium ? ' class="moratorium-row"' : '') + '>' +
        '<td>' + (p.moratorium ? '<i class="fa-solid fa-lock" style="margin-right:4px"></i>' : '') + p.period + '</td>' +
        '<td>' + p.quarter + '</td>' +
        '<td>' + (p.moratorium ? "-" : Engine.fmtINR(p.principal)) + '</td>' +
        '<td>' + (p.moratorium ? "+" : "") + Engine.fmtINR(p.interest) + '</td>' +
        '<td class="font-bold">' + (p.moratorium ? (isHi ? "छूट अवधि (MORATORIUM)" : "MORATORIUM") : Engine.fmtINR(p.payment)) + '</td>' +
        '<td>' + Engine.fmtINR(p.balance) + '</td>' +
        '</tr>'
    }).join("")

    var thPeriod = isHi ? "अवधि (Period)" : "Period"
    var thQuarter = isHi ? "तिमाही (Quarter)" : "Quarter"
    var thPrincipal = isHi ? "मूलधन (Principal)" : "Principal"
    var thInterest = isHi ? "ब्याज (Interest)" : "Interest"
    var thPayment = isHi ? "किश्त (Payment)" : "Payment"
    var thBalance = isHi ? "शेष लोन (Balance)" : "Balance"

    $("c-schedule").innerHTML =
      '<table><thead><tr><th>' + thPeriod + '</th><th>' + thQuarter + '</th><th>' + thPrincipal + '</th><th>' + thInterest + '</th><th>' + thPayment + '</th><th>' + thBalance + '</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      (schedule.length > 12 ? '<div style="font-size:11px;color:var(--muted);margin-top:8px">' + (isHi ? "कुल " + schedule.length + " में से 12 तिमाहियां प्रदर्शित (Showing 12 of " + schedule.length + " quarters)" : "Showing 12 of " + schedule.length + " quarters") + '</div>' : '')

    // Narrator
    $("c-narrator").textContent = Engine.narrateFinancials(calc)

    $("calc-results").classList.remove("hidden")
  }

  // --- HEALTH TRACKER MODULE ---
  var trackerEntries = []
  try {
    var savedTracker = localStorage.getItem("user_health_entries")
    if (savedTracker) {
      var parsed = JSON.parse(savedTracker)
      // Strictly purge legacy dummy records (e.g. 85000 revenue or 2026-01)
      if (Array.isArray(parsed)) {
        var hasFake = parsed.some(function (item) {
          return item.revenue === 85000 || item.month === "2026-01"
        })
        if (hasFake) {
          localStorage.removeItem("user_health_entries")
          trackerEntries = []
        } else {
          trackerEntries = parsed
        }
      }
    }
  } catch (e) {
    trackerEntries = []
  }

  function renderEntries() {
    var isHi = currentAppLang === "hi"
    var isMr = currentAppLang === "mr"

    if (!trackerEntries || trackerEntries.length === 0) {
      var emptyMsg = isHi
        ? "अभी कोई प्रविष्टि दर्ज नहीं है। ऊपर दिए गए फॉर्म से अपनी वास्तविक मासिक कमाई व खर्च जोड़ें।"
        : isMr
        ? "अद्याप कोणतीही नोंद केलेली नाही. वरील फॉर्ममधून आपली प्रत्यक्ष मासिक कमाई व खर्च जोडा."
        : "No entries recorded yet. Add your actual monthly revenue and expense figures using the form above."
      var emptySub = isHi
        ? "(उदाहरण: ऊपर दिए गए फॉर्म में बिक्री, माल खरीद व दुकान खर्च दर्ज करें)"
        : isMr
        ? "(उदा.: वरील फॉर्ममध्ये विक्री, खरेदी व खर्च नोंदवा)"
        : "(Use the form above with your real enterprise numbers to track health)"
      $("t-entries").innerHTML = '<div style="text-align:center;padding:36px 16px;color:#64748b;font-size:0.9rem">' +
        '<i class="fa-solid fa-file-invoice" style="font-size:2rem;color:#94a3b8;display:block;margin-bottom:10px"></i>' +
        '<div>' + emptyMsg + '</div>' +
        '<div style="font-size:0.78rem;color:#94a3b8;margin-top:6px">' + emptySub + '</div>' +
        '</div>'
      return
    }

    var userMargin = val("c-margin") || val("f-margin") || val("r-margin") || 100000
    var rows = trackerEntries.map(function (e, idx) {
      var entryCalc = Engine.computeFinancials(userMargin, e.revenue, e.cogs, e.opex)
      var emi = entryCalc ? entryCalc.postMorEMI : 0
      var net = e.revenue - e.cogs - e.opex - emi
      return '<tr>' +
        '<td>' + e.month + '</td>' +
        '<td>' + Engine.fmtINR(e.revenue) + '</td>' +
        '<td>' + Engine.fmtINR(e.cogs) + '</td>' +
        '<td>' + Engine.fmtINR(e.opex) + '</td>' +
        '<td class="font-bold" style="color:' + (net >= 0 ? '#16a34a' : '#dc2626') + '">' + Engine.fmtINR(net) + '</td>' +
        '<td><button type="button" onclick="removeTrackerEntry(' + idx + ')" style="background:transparent;border:none;color:#dc2626;cursor:pointer;padding:3px 6px;border-radius:4px" title="हटाएं / Delete"><i class="fa-solid fa-trash-can"></i></button></td>' +
        '</tr>'
    }).join("")
    var thM = isHi ? "महीना (Month)" : "Month"
    var thR = isHi ? "बिक्री (Revenue)" : "Revenue"
    var thC = isHi ? "माल खरीद (COGS)" : "COGS"
    var thO = isHi ? "दुकान खर्च (OpEx)" : "OpEx"
    var thN = isHi ? "शुद्ध बचत (Net Surplus)" : "Net"
    var thA = isHi ? "कार्य (Action)" : "Action"
    $("t-entries").innerHTML = '<table><thead><tr><th>' + thM + '</th><th>' + thR + '</th><th>' + thC + '</th><th>' + thO + '</th><th>' + thN + '</th><th>' + thA + '</th></tr></thead><tbody>' + rows + '</tbody></table>'
  }

  window.removeTrackerEntry = function (idx) {
    if (idx >= 0 && idx < trackerEntries.length) {
      trackerEntries.splice(idx, 1)
      try { localStorage.setItem("user_health_entries", JSON.stringify(trackerEntries)) } catch (e) {}
      renderEntries()
    }
  }

  window.addTrackerEntry = function () {
    var month = text("t-month")
    var revenue = val("t-revenue")
    var cogs = val("t-cogs")
    var opex = val("t-opex")
    if (!month || !revenue) return alert(currentAppLang === "hi" ? "कृपया महीना और बिक्री राशि दर्ज करें (Enter month and revenue)" : "Enter month and revenue")
    trackerEntries.push({ month: month, revenue: revenue, cogs: cogs, opex: opex })
    trackerEntries.sort(function (a, b) { return a.month.localeCompare(b.month) })
    try { localStorage.setItem("user_health_entries", JSON.stringify(trackerEntries)) } catch (e) {}
    renderEntries()
    $("t-revenue").value = ""
    $("t-cogs").value = ""
    $("t-opex").value = ""
  }

  window.generateHealthReport = function () {
    if (!trackerEntries || trackerEntries.length === 0) {
      alert(currentAppLang === "hi"
        ? "विश्लेषण देखने के लिए पहले ऊपर दिए गए फॉर्म से अपनी कम से कम 1 मासिक प्रविष्टि जोड़ें (Please add your monthly revenue and expenses first)"
        : "Please add your monthly revenue and expense entries first using the form above")
      return
    }
    var userMargin = val("c-margin") || val("f-margin") || val("r-margin") || 100000
    var avgRev = trackerEntries.reduce(function (s, e) { return s + e.revenue }, 0) / trackerEntries.length
    var avgCogs = trackerEntries.reduce(function (s, e) { return s + e.cogs }, 0) / trackerEntries.length
    var avgOpex = trackerEntries.reduce(function (s, e) { return s + e.opex }, 0) / trackerEntries.length
    var calc = Engine.computeFinancials(userMargin, avgRev, avgCogs, avgOpex) || Engine.computeFinancials(100000, avgRev, avgCogs, avgOpex)
    var h = Engine.computeHealth(trackerEntries, calc)
    if (!h) return alert(currentAppLang === "hi" ? "त्रैमासिक तुलना के लिए कम से कम 3 महीने का डेटा आवश्यक है (Need at least 3 months of data for quarterly comparison)" : "Need at least 3 months of data for quarterly comparison")

    var isHi = currentAppLang === "hi"
    var label = {
      thriving: isHi ? "उत्तम स्थिति (Thriving)" : "THRIVING",
      surviving: isHi ? "सामान्य स्थिति (Surviving)" : "SURVIVING",
      "at-risk": isHi ? "जोखिम में (At Risk)" : "AT RISK"
    }
    var desc = {
      thriving: isHi ? "मुनाफा मार्जिन रिस्क बफर से अधिक है; व्यापार मजबूत स्थिति में है। (Net margin clears Risk Buffer; flat-to-rising trend)." : "Net margin comfortably clears the Risk Buffer; flat-to-rising trend",
      surviving: isHi ? "बचत सकारात्मक है लेकिन कम है - मंदी के लिए कोई सुरक्षा कवच नहीं। (Positive surplus but thin - no cushion for a bad month)." : "Positive surplus but thin - no cushion for a bad month",
      "at-risk": isHi ? "बचत लगातार घट रही है या नकारात्मक है - तत्काल सुधारात्मक उपाय करें। (Net surplus trending toward zero/negative over 2+ periods)." : "Net surplus trending toward zero/negative over 2+ periods",
    }

    // Verdict
    $("t-verdict").innerHTML =
      '<div class="verdict-card ' + h.q2.health + '" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.04);margin-bottom:16px">' +
      '<div style="margin-bottom:6px"><i class="fa-solid ' + (h.q2.health === 'thriving' ? 'fa-circle-check" style="font-size:36px;color:#16a34a"' : h.q2.health === 'surviving' ? 'fa-circle-exclamation" style="font-size:36px;color:#d97706"' : 'fa-circle-xmark" style="font-size:36px;color:#dc2626"') + '></i></div>' +
      '<div style="font-size:20px;font-weight:800;color:' + (h.q2.health === 'thriving' ? '#16a34a' : h.q2.health === 'surviving' ? '#d97706' : '#dc2626') + '">' + label[h.q2.health] + '</div>' +
      '<div style="font-size:13px;color:#64748b;margin:6px 0 10px">' + desc[h.q2.health] + '</div>' +
      '<div style="font-size:13px;font-weight:600;color:#0f172a">' + (isHi ? "ट्रेंड (Trend): " : "Trend: ") + (h.trend === "improving" ? '<i class="fa-solid fa-arrow-trend-up text-green-600"></i> ' + (isHi ? "सुधार हो रहा है (Improving)" : "Improving") : h.trend === "declining" ? '<i class="fa-solid fa-arrow-trend-down text-rose-600"></i> ' + (isHi ? "गिरावट आ रही है (Declining)" : "Declining") : '<i class="fa-solid fa-arrow-right text-slate-600"></i> ' + (isHi ? "स्थिर (Stable)" : "Stable")) + '</div>' +
      '</div>'

    // Quarterly comparison with English in brackets ()
    function qRow(lbl, q1v, q2v, fmt) {
      fmt = fmt || Engine.fmtINR
      return '<tr><td class="font-bold">' + lbl + '</td><td>' + fmt(q1v) + '</td><td class="font-bold">' + fmt(q2v) + '</td></tr>'
    }
    $("t-quarterly").innerHTML =
      '<table><thead><tr><th>' + (isHi ? "मापदंड (Metric)" : "Metric") + '</th><th>Q1</th><th>Q2</th></tr></thead><tbody>' +
      qRow(isHi ? "बिक्री (Revenue)" : "Revenue", h.q1.rev, h.q2.rev) +
      qRow(isHi ? "माल खरीद लागत (COGS)" : "COGS", h.q1.cogs, h.q2.cogs) +
      qRow(isHi ? "दुकान खर्च (OpEx)" : "OpEx", h.q1.opex, h.q2.opex) +
      qRow(isHi ? "शुद्ध मासिक बचत (Net Surplus)" : "Net Surplus", h.q1.surplus, h.q2.surplus) +
      '<tr><td class="font-bold">' + (isHi ? "सकल मार्जिन (Gross Margin)" : "Gross Margin") + '</td><td>' + h.q1.grossMargin + '%</td><td class="font-bold">' + h.q2.grossMargin + '%</td></tr>' +
      '<tr><td class="font-bold">' + (isHi ? "शुद्ध मार्जिन (Net Margin)" : "Net Margin") + '</td><td>' + h.q1.netMargin + '%</td><td class="font-bold">' + h.q2.netMargin + '%</td></tr>' +
      '<tr><td class="font-bold">DSCR (ऋण सेवा कवरेज)</td><td>' + h.q1.dscr + '</td><td class="font-bold">' + h.q2.dscr + '</td></tr>' +
      '<tr><td class="font-bold">' + (isHi ? "स्वास्थ्य स्थिति (Health Status)" : "Health") + '</td><td><i class="fa-solid ' + (h.q1.health === 'thriving' ? 'fa-circle-check text-green-600' : h.q1.health === 'surviving' ? 'fa-circle-exclamation text-amber-600' : 'fa-circle-xmark text-rose-600') + '"></i> ' + label[h.q1.health] + '</td><td class="font-bold"><i class="fa-solid ' + (h.q2.health === 'thriving' ? 'fa-circle-check text-green-600' : h.q2.health === 'surviving' ? 'fa-circle-exclamation text-amber-600' : 'fa-circle-xmark text-rose-600') + '"></i> ' + label[h.q2.health] + '</td></tr>' +
      '</tbody></table>'

    // Live DSCR
    var riskBuf = Engine.calcRiskBuffer(h.q2.emi / 3)
    var riskStatus = h.q2.surplus / 3 >= riskBuf
      ? (isHi ? "सुरक्षित (Met)" : "Met")
      : h.q2.surplus / 3 > 0
      ? (isHi ? "कम (Breached)" : "Breached")
      : (isHi ? "जोखिम (Critical)" : "Critical")

    $("t-dscr").innerHTML =
      '<div class="stats-row">' +
      '<div class="stat-item"><div class="val">' + h.q2.dscr + '</div><div class="lbl">Live DSCR (ऋण सेवा अनुपात)</div></div>' +
      '<div class="stat-item"><div class="val">' + riskStatus + '</div><div class="lbl">' + (isHi ? "सुरक्षा बफर (Risk Buffer)" : "Risk Buffer") + '</div></div>' +
      '<div class="stat-item"><div class="val">' + (h.singleBuyerFlag ? (isHi ? "हाँ (Yes)" : "Yes") : (isHi ? "नहीं (No)" : "No")) + '</div><div class="lbl">' + (isHi ? "एकल खरीदार (Single Buyer)" : "Single Buyer") + '</div></div>' +
      '</div>'

    // Insights
    $("t-insights").innerHTML = h.insights.map(function (i) {
      var cls = i.type === "alert" ? "alert" : i.type === "warning" ? "warning" : i.type === "positive" ? "positive" : "recommendation"
      var msgText = isHi && i.hi ? i.hi : i.msg
      return '<div class="insight-card ' + cls + '" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;margin-bottom:10px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:4px">' + i.type + ' • ' + i.metric + '</div>' +
        '<div style="font-size:13px;color:#0f172a;line-height:1.5">' + msgText + '</div>' +
        '</div>'
    }).join("")

    // Narrator
    $("t-narrator").textContent = Engine.narrateHealth(h)

    $("health-results").classList.remove("hidden")
  }

  // --- REPORT MODULE (MAINLY THE REPORT PART - COMPLETE BILINGUAL ENGLISH IN BRACKETS) ---
  window.generateNABARDReport = function () {
    var margin = val("r-margin")
    var revenue = val("r-revenue")
    var cogs = val("r-cogs")
    var opex = val("r-opex")

    if (!margin || margin <= 0) {
      alert(currentAppLang === "hi"
        ? "कृपया अपनी बचत (मार्जिन पूँजी) दर्ज करें। (Please enter your margin capital)"
        : currentAppLang === "mr"
        ? "कृपया आपले स्वतःचे भांडवल नोंदवा. (Please enter your margin capital)"
        : "Please enter your margin capital.")
      var mEl = $("r-margin")
      if (mEl) mEl.focus()
      return
    }

    if (!revenue || revenue <= 0) {
      alert(currentAppLang === "hi"
        ? "कृपया अपनी मासिक बिक्री (आय) दर्ज करें। (Please enter your monthly revenue)"
        : currentAppLang === "mr"
        ? "कृपया आपली मासिक कमाई नोंदवा. (Please enter your monthly revenue)"
        : "Please enter your monthly revenue.")
      var rEl = $("r-revenue")
      if (rEl) rEl.focus()
      return
    }

    var isHi = currentAppLang === "hi"
    var isMr = currentAppLang === "mr"

    var name = text("r-name") || (isHi ? "उद्यमी व्यवसाय इकाई (Enterprise Unit)" : isMr ? "उद्योजक व्यवसाय घटक (Enterprise Unit)" : "Enterprise Unit")
    var village = text("r-village") || (isHi ? "स्थानीय ग्राम (Village)" : isMr ? "स्थानिक गाव (Village)" : "Village")
    var block = text("r-block") || (isHi ? "विकासखंड (Block)" : isMr ? "तालुका (Block)" : "Block")
    var district = text("r-district") || (isHi ? "स्थानीय जिला (District)" : isMr ? "स्थानिक जिल्हा (District)" : "District")

    var calc = Engine.computeFinancials(margin, revenue, cogs, opex)
    if (!calc) return alert("प्रोजेक्ट लागत सरकारी योजना सीमा से बाहर है (Project cost out of scheme range)")

    var now = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    var isHi = currentAppLang === "hi"
    var isMr = currentAppLang === "mr"

    $("report-content").innerHTML =
      '<div class="report-header">' +
      '<p style="font-size:11px;font-weight:700;letter-spacing:0.06em;color:var(--muted);margin-bottom:8px">MINISTRY OF SOCIAL JUSTICE AND EMPOWERMENT / NABARD</p>' +
      '<h2>' + (isHi ? "मॉडल बैंकेबल प्रोजेक्ट रिपोर्ट (Model Bankable Project Report)" : isMr ? "मॉडेल बँकबल प्रकल्प अहवाल (Model Bankable Project Report)" : "MODEL BANKABLE PROJECT REPORT") + '</h2>' +
      '<p style="font-size:12px;color:var(--muted)">' + (isHi ? "दिनांक (Date): " : "Date: ") + now + ' | ' + (isHi ? "इकाई का नाम (Enterprise / Unit Name): " : "Unit: ") + name + '</p>' +
      '</div>' +

      '<div class="report-section">' +
      '<h3>1. ' + (isHi ? "व्यवसाय एवं उद्यमी परिचय (1. Enterprise & Entrepreneur Profile)" : isMr ? "१. व्यवसाय व उद्योजक तपशील (1. Enterprise Profile)" : "1. Enterprise Profile") + '</h3>' +
      '<table>' +
      '<tr><td>' + (isHi ? "इकाई का नाम (Enterprise / Unit Name)" : "Business / Enterprise Name") + '</td><td class="font-bold">' + name + '</td></tr>' +
      '<tr><td>' + (isHi ? "स्थान (Location: Village, Block, District)" : "Location (Village, Block, District)") + '</td><td>' + village + ', ' + block + ', ' + district + '</td></tr>' +
      '<tr><td>' + (isHi ? "सरकारी योजना (Government Scheme)" : "Government Scheme") + '</td><td class="font-bold" style="color:#0284c7">' + (isHi ? calc.scheme.nameHi + " (" + calc.scheme.name + ")" : calc.scheme.name) + '</td></tr>' +
      '<tr><td>' + (isHi ? "स्वीकृत ब्याज दर (Concessional Interest Rate)" : "Interest Rate") + '</td><td>' + calc.scheme.rate + '% वार्षिक (per annum)</td></tr>' +
      '<tr><td>' + (isHi ? "दिशा-निर्देश स्रोत (Scheme Guidelines Source)" : "Guidelines Source") + '</td><td>' + calc.scheme.source + '</td></tr>' +
      '</table></div>' +

      '<div class="report-section">' +
      '<h3>2. ' + (isHi ? "वित्तीय संरचना एवं लोन पात्रता (2. Financial Structuring & Loan Eligibility)" : isMr ? "२. वित्तीय संरचना व कर्ज पात्रता (2. Financial Structuring)" : "2. Financial Structuring") + '</h3>' +
      '<table>' +
      '<tr><td>' + (isHi ? "उद्यमी का खुद का मार्जिन (Promoter Margin Capital - 10%)" : "Promoter Margin (10%)") + '</td><td class="font-bold">' + Engine.fmtINR(calc.margin) + '</td></tr>' +
      '<tr><td>' + (isHi ? "कुल प्रोजेक्ट लागत (Total Project Cost)" : "Total Project Cost") + '</td><td class="font-bold" style="font-size:16px">' + Engine.fmtINR(calc.projectCost) + '</td></tr>' +
      '<tr><td>' + (isHi ? "बैंक लोन सहायता (Bank Loan Eligibility - 90%)" : "Bank Loan Eligibility (90%)") + '</td><td class="font-bold" style="font-size:16px;color:#0284c7">' + Engine.fmtINR(calc.loanAmount) + '</td></tr>' +
      '<tr><td>' + (isHi ? "लोन पुनर्भुगतान अवधि (Repayment Tenure)" : "Repayment Tenure") + '</td><td>' + calc.scheme.tenure + ' वर्ष (years)</td></tr>' +
      '<tr><td>' + (isHi ? "मोरेटोरियम छूट अवधि (Moratorium Period)" : "Moratorium Period") + '</td><td>' + calc.scheme.moratorium + ' महीने (months)</td></tr>' +
      '<tr><td>' + (isHi ? "नियमित मासिक किश्त (Standard Monthly EMI)" : "Standard Monthly EMI") + '</td><td class="font-bold">' + Engine.fmtINR(calc.emi) + '</td></tr>' +
      '<tr><td>' + (isHi ? "छूट के बाद वास्तविक किश्त (Post-Moratorium Monthly EMI)" : "Post-Moratorium EMI") + '</td><td class="font-bold" style="color:#d97706">' + Engine.fmtINR(calc.postMorEMI) + '</td></tr>' +
      '<tr><td>' + (isHi ? "मासिक सुरक्षा बफर (Monthly Risk Buffer - Safety Reserve)" : "Monthly Risk Buffer") + '</td><td class="font-bold">' + Engine.fmtINR(calc.riskBuffer) + '</td></tr>' +
      '<tr><td>' + (isHi ? "ऋण सेवा कवरेज अनुपात (Debt Service Coverage Ratio - DSCR)" : "DSCR (Coverage Ratio)") + '</td><td class="font-bold" style="color:#16a34a">' + calc.dscr + '</td></tr>' +
      '</table></div>' +

      '<div class="report-section">' +
      '<h3>3. ' + (isHi ? "मासिक नकदी प्रवाह एवं मुनाफा विश्लेषण (3. Monthly Cash Flow & Profitability Assessment)" : isMr ? "३. मासिक नफा व रोकड प्रवाह (3. Cash Flow Assessment)" : "3. Monthly Cash Flow Assessment") + '</h3>' +
      '<table>' +
      '<tr><td>' + (isHi ? "मासिक बिक्री / राजस्व (Monthly Revenue / Turnover)" : "Monthly Revenue / Turnover") + '</td><td class="font-bold">' + Engine.fmtINR(revenue) + '</td></tr>' +
      '<tr><td>' + (isHi ? "कच्चा माल / स्टॉक खरीद लागत (Raw Material Cost / COGS)" : "Raw Material Cost / COGS") + '</td><td>' + Engine.fmtINR(cogs) + '</td></tr>' +
      '<tr><td>' + (isHi ? "मासिक दुकान व परिचालन खर्च (Operating Expenses / OpEx)" : "Operating Expenses / OpEx") + '</td><td>' + Engine.fmtINR(opex) + '</td></tr>' +
      '<tr><td>' + (isHi ? "मासिक बैंक किश्त (Monthly Loan EMI)" : "Monthly Loan EMI") + '</td><td>' + Engine.fmtINR(calc.postMorEMI) + '</td></tr>' +
      '<tr><td>' + (isHi ? "शुद्ध मासिक बचत (Net Monthly Cash Surplus)" : "Net Monthly Cash Surplus") + '</td><td class="font-bold" style="color:#16a34a;font-size:16px">' + Engine.fmtINR(calc.netSurplusAfterEMI) + '</td></tr>' +
      '<tr><td>' + (isHi ? "सकल मुनाफा मार्जिन (Gross Profit Margin)" : "Gross Profit Margin") + '</td><td>' + Engine.calcGrossMargin(revenue, cogs) + '%</td></tr>' +
      '<tr><td>' + (isHi ? "शुद्ध मुनाफा मार्जिन (Net Profit Margin)" : "Net Profit Margin") + '</td><td class="font-bold">' + Engine.calcNetMargin(calc.netSurplusAfterEMI, revenue) + '%</td></tr>' +
      '</table></div>' +

      '<div class="report-section">' +
      '<h3>4. ' + (isHi ? "अंतिम वित्तीय व्यवहार्यता मूल्यांकन (4. Final Financial Feasibility Verdict)" : isMr ? "४. अंतिम व्यवहार्यता निष्कर्ष (4. Final Feasibility Verdict)" : "4. Final Feasibility Verdict") + '</h3>' +
      '<div style="background:' + (calc.netSurplusAfterEMI > 0 ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)') + ';border:1px solid ' + (calc.netSurplusAfterEMI > 0 ? '#bbf7d0' : '#fecaca') + ';border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px">' +
      '<div style="font-size:28px"><i class="fa-solid ' + (calc.netSurplusAfterEMI > 0 ? 'fa-circle-check" style="color:#15803d"' : 'fa-circle-xmark" style="color:#be123c"') + '></i></div>' +
      '<div>' +
      '<div style="font-size:15px;font-weight:700;color:' + (calc.netSurplusAfterEMI > 0 ? '#15803d' : '#be123c') + '">' +
      (calc.netSurplusAfterEMI > 0 ? (isHi ? "व्यवसाय वित्तीय रूप से व्यवहार्य एवं बैंक लोन हेतु उपयुक्त है (Enterprise is Financially Viable & Bankable)" : "Enterprise is Financially Viable & Bankable") : (isHi ? "व्यवहार्य नहीं - लागत में कमी अथवा अतिरिक्त पूंजी की आवश्यकता (NOT Viable - Restructuring Required)" : "NOT Viable - Restructuring Required")) +
      '</div>' +
      '<div style="font-size:12px;color:#64748b;margin-top:2px">' +
      (calc.netSurplusAfterEMI > 0 ? (isHi ? "व्यवसाय शुद्ध नकदी अधिशेष उत्पन्न कर रहा है और ऋण किश्त चुकाने के बाद भी सकारात्मक मुनाफा प्रदान करता है। (Generates positive cash surplus post debt-service)." : "Generates positive cash surplus post debt-service.") : (isHi ? "नकारात्मक अधिशेष - ऋण लेने से पूर्व परिचालन खर्च घटाएं। (Negative surplus - reduce operating expenses prior to debt funding)." : "Negative surplus - reduce operating expenses prior to debt funding.")) +
      '</div>' +
      '</div>' +
      '</div></div>' +

      '<div class="report-footer">' +
      (isHi ? "ग्रामीण व्यवसाय सलाहकार सहायक द्वारा तैयार (Generated by Rural Business Advisory Assistant) | सभी गणनाएं सटीक गणितीय सूत्रों पर आधारित हैं (All calculations are deterministic formulas) | आधिकारिक सरकारी दिशा-निर्देश (Official MoSJE & NABARD Guidelines)" : "Generated by Rural Business Advisory Assistant | All calculations are deterministic formulas | Official MoSJE & NABARD Guidelines") +
      '</div>'

    $("report-output").classList.remove("hidden")
  }

  // --- Initial URL Param & Hash Check ---
  function initFromUrl() {
    var search = window.location.search
    var hash = window.location.hash.replace("#", "")

    var targetLang = null
    if (search) {
      var match = search.match(/[?&]lang=([^&]+)/)
      if (match && POPUP_I18N[match[1]]) targetLang = match[1]
    }

    if (!targetLang) {
      try {
        var saved = localStorage.getItem("preferredLanguage")
        if (saved && POPUP_I18N[saved]) targetLang = saved
      } catch (e) {}
    }

    if (!targetLang) targetLang = "hi"

    // Initialize without notifying parent (prevents startup ping-pong)
    window.setAppLanguage(targetLang, false)

    if (hash && document.getElementById("module-" + hash)) {
      switchModule(hash)
    }
  }

  window.addEventListener("hashchange", function () {
    var hash = window.location.hash.replace("#", "")
    if (hash && document.getElementById("module-" + hash)) {
      switchModule(hash)
    }
  })

  window.addEventListener("message", function (e) {
    if (!e.data) return
    if (e.data.action === "switchModule") {
      switchModule(e.data.module)
    } else if (e.data.action === "setLanguage") {
      window.setAppLanguage(e.data.lang, false)
    }
  })

  var returnLink = document.getElementById("returnToChatLink")
  if (returnLink) {
    returnLink.addEventListener("click", function (e) {
      if (window.parent && window.parent !== window) {
        e.preventDefault()
        window.parent.postMessage("closeToolkit", "*")
      }
    })
  }

  // Render initial tracker rows
  renderEntries()

  // Initialize from URL / preferredLanguage
  initFromUrl()

  // Stats count up
  function initCountUp() {
    document.querySelectorAll(".stat-val[data-target]").forEach(function (el) {
      var target = parseFloat(el.dataset.target)
      var suffix = el.dataset.suffix || ""
      var decimals = parseInt(el.dataset.decimals, 10) || 0
      var duration = 1500
      var start = performance.now()
      function tick(now) {
        var p = Math.min((now - start) / duration, 1)
        var eased = 1 - Math.pow(1 - p, 3)
        el.textContent = (eased * target).toFixed(decimals) + suffix
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
  }

  var homeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        initCountUp()
        homeObserver.disconnect()
      }
    })
  }, { threshold: 0.25 })

  var homeStats = document.querySelector(".app-stats")
  if (homeStats) homeObserver.observe(homeStats)

})()
