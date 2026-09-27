/* ============================================================================
   CHAT.JS - Meta AI Multilingual Conversational Engine & Toolkit Bridge
   Supports Hindi, Marathi, Hinglish, English with Voice Input (Mic) & P&L Diagnosis
   ============================================================================ */

(function () {
  "use strict"

  // Current State
  var currentLang = "hi"
  var isRecognizing = false
  var recognition = null
  var chatHistory = []

  // Conversational P&L Discovery State Machine
  var chatState = {
    mode: "idle", // 'idle' | 'pnl_rev' | 'pnl_cogs' | 'pnl_opex' | 'pnl_debt' | 'startup_cost'
    data: {
      revenue: 0,
      cogs: 0,
      opex: 0,
      debt: 0,
      category: "retail",
      margin: 0
    }
  }

  // Multilingual Strings & Templates
  var I18N = {
    hi: {
      speechCode: "hi-IN",
      langName: "हिंदी",
      appTitle: "व्यापार वर्धन AI",
      statusOnline: "ऑनलाइन सहायक",
      openToolkit: "विस्तृत टूलकिट",
      openToolkitShort: "टूलकिट",
      inputPlaceholder: "अपनी भाषा में बोलें या व्यापार का सवाल पूछें...",
      listening: "सुन रहे हैं... बोलिए",
      welcomeGreeting: "राम-राम जी! मैं आपका **व्यापार वर्धन AI** हूँ।",
      welcomeDesc: "मुझसे अपनी भाषा में बोलकर या लिखकर पूछें: नया व्यवसाय शुरू करना हो, सरकारी लोन व 35% सब्सिडी जाननी हो, या अपनी दुकान का नफा-नुकसान (Profit & Loss) सुधारना हो।",
      chipsLabel: "तुरंत पूछने के लिए चुनें:",
      changeLang: "भाषा बदलें",
      chips: [
        { id: "pnl", text: "दुकान का मुनाफ़ा-नुकसान (Profit & Loss) जांचें", highlight: true },
        { id: "kirana", text: "किराना दुकान के लिए लोन (Loan)" },
        { id: "dairy", text: "10 गायों की डेयरी फार्मिंग (Dairy Farm)" },
        { id: "tractor", text: "ट्रैक्टर व कृषि उपकरण सब्सिडी (Subsidy)" },
        { id: "tailoring", text: "सिलाई केंद्र / महिला स्वयं सहायता समूह (SHG)" },
        { id: "mudra", text: "मुद्रा योजना व Stand-Up लोन (Loan)" }
      ],
      pnlPrompts: {
        askRev: "नमस्ते! चलिए आपकी दुकान या व्यवसाय की वित्तीय सेहत (Financial Health) जांचते हैं।\n\nपहला सवाल: **महीने में आपकी कुल कितनी बिक्री या गल्ला (Revenue) होता है?** (जैसे: ₹40,000 या ₹80,000)",
        askCogs: "बढ़िया! अब बताइए कि **सामान या कच्चा माल (Raw Material) खरीदने - थोक मंडी (Wholesale Market) से - में महीने का लगभग कितना पैसा लग जाता है?**",
        askOpex: "ठीक है। अब यह बताइए कि **दुकान का किराया (Rent), बिजली बिल, या गाड़ी भाड़ा/कर्मचारी में महीने का कितना खर्च होता है?**",
        askDebt: "आखिरी बात: **क्या किसी बैंक, स्वयं सहायता समूह (SHG) या साहूकार की कोई पुरानी मासिक किश्त (EMI) चल रही है?** (अगर नहीं है तो 0 लिखें)",
      },
      pnlCardTitle: "मासिक मुनाफ़ा-नुकसान (P&L रिपोर्ट)",
      lblRevenue: "कुल बिक्री (Revenue)",
      lblExpense: "कुल खर्च व लागत (Expenses)",
      lblProfit: "शुद्ध मासिक बचत (Net Profit)",
      lblMargin: "मुनाफ़ा मार्जिन (Profit Margin)",
      lblBuffer: "सुरक्षा कवच (Risk Buffer)",
      statusThriving: "उत्तम स्वास्थ्य (Thriving)",
      statusSurviving: "सामान्य स्थिति (Surviving)",
      statusAtRisk: "ध्यान देने योग्य (At Risk)",
      openCalcBtn: "विस्तृत ईएमआई कैलकुलेटर खोलें",
      openFeasBtn: "बाज़ार मांग रिपोर्ट देखें",
      openHealthBtn: "पूरा हेल्थ ट्रैकर खोलें",
      openFullBtn: "पूरा टूलकिट खोलें",
      langChanged: "भाषा बदलकर **हिंदी** कर दी गई है। अब आप हिंदी में बोलकर या लिखकर सवाल पूछ सकते हैं।"
    },
    mr: {
      speechCode: "mr-IN",
      langName: "मराठी",
      appTitle: "व्यापार वर्धन AI",
      statusOnline: "ऑनलाइन मार्गदर्शक",
      openToolkit: "संपूर्ण टूलकिट",
      openToolkitShort: "टूलकिट",
      inputPlaceholder: "आपल्या भाषेत बोला किंवा व्यवसायाबद्दल विचारा...",
      listening: "ऐकत आहे... बोला",
      welcomeGreeting: "नमस्कार! मी आपला **व्यापार वर्धन AI** आहे.",
      welcomeDesc: "नवीन व्यवसाय शुरू करणे, सरकारी सबसिडी व मुद्रा कर्ज मिळवणे, किंवा दुकानाचा नफा-तोटा तपासून कमाई कशी वाढवायची हे आपल्या मातृभाषेत जाणून घ्या.",
      chipsLabel: "त्वरित माहितीसाठी निवडा:",
      changeLang: "भाषा बदला",
      chips: [
        { id: "pnl", text: "दुकानाचा नफा-तोटा (Profit & Loss) तपासा", highlight: true },
        { id: "kirana", text: "किराणा दुकानासाठी कर्ज (Loan)" },
        { id: "dairy", text: "१० गाईंचा डेअरी प्रकल्प (Dairy Farm)" },
        { id: "tractor", text: "ट्रॅक्टर व कृषी अवजारे सबसिडी (Subsidy)" },
        { id: "tailoring", text: "शिलाई केंद्र / महिला बचत गट (SHG)" },
        { id: "mudra", text: "मुद्रा योजना व सरकारी कर्ज (Loan)" }
      ],
      pnlPrompts: {
        askRev: "नमस्कार! चला आपल्या व्यवसायाची आर्थिक तपासणी (Financial Health) करूया.\n\nपहिला प्रश्न: **महिन्याला आपल्या दुकानातून अंदाजे एकूण किती विक्री किंवा गल्ला (Revenue) होतो?** (उदा. ₹50,000 किंवा ₹1,00,000)",
        askCogs: "छान! आता सांगा की **माल किंवा कच्चा माल (Raw Material) खरेदी करण्यासाठी - घाऊक बाजारातून (Wholesale Market) - महिन्यात अंदाजे किती खर्च (Cost) होतो?**",
        askOpex: "बरोबर. आता सांगा की **दुकानाचे भाडे (Rent), लाईट बिल किंवा वाहतूक खर्च (Transport) महिन्याला किती होतो?**",
        askDebt: "शेवटचा प्रश्न: **कोणत्याही बँकेचा, सावकाराचा किंवा बचत गटाचा (SHG) जुना हप्ता (EMI) चालू आहे का?** (नसल्यास 0 लिहा)"
      },
      pnlCardTitle: "आपला मासिक नफा-तोटा (P&L अहवाल)",
      lblRevenue: "एकूण विक्री (Revenue)",
      lblExpense: "एकूण खर्च व खरेदी (Expenses)",
      lblProfit: "निव्वळ मासिक नफा (Net Profit)",
      lblMargin: "नफ्याचे प्रमाण (Profit Margin)",
      lblBuffer: "सुरक्षा कवच (Risk Buffer)",
      statusThriving: "उत्तम नफा (Thriving)",
      statusSurviving: "मध्यम स्थिती (Surviving)",
      statusAtRisk: "धोकादायक स्थिती (At Risk)",
      openCalcBtn: "कर्ज व हप्ता कॅल्क्युलेटर उघडा",
      openFeasBtn: "बाजार मागणी अहवाल पहा",
      openHealthBtn: "व्यवसाय आरोग्य ट्रॅकर उघडा",
      openFullBtn: "संपूर्ण टूलकिट उघडा",
      langChanged: "भाषा **मराठी** मध्ये बदलली आहे. आता आपण मराठीत बोलून किंवा लिहून विचारू शकता."
    },
    en: {
      speechCode: "en-IN",
      langName: "English",
      appTitle: "Vyapar Vardhan AI",
      statusOnline: "Rural AI Advisor",
      openToolkit: "Full Advisory Toolkit",
      openToolkitShort: "Toolkit",
      inputPlaceholder: "Speak or type your enterprise query...",
      listening: "Listening... Speak clearly",
      welcomeGreeting: "Welcome! I am your **Vyapar Vardhan AI**.",
      welcomeDesc: "Empowering rural micro-entrepreneurs with simple vernacular insights on enterprise feasibility, subsidized credit, and profit optimization.",
      chipsLabel: "Popular Inquiries:",
      chips: [
        { id: "pnl", text: "Check Enterprise Profit & Loss", highlight: true },
        { id: "kirana", text: "Grocery / Kirana Store Loan" },
        { id: "dairy", text: "Dairy Farming & Subsidy" },
        { id: "tractor", text: "Tractor & Farm Equipment" },
        { id: "tailoring", text: "Tailoring & Women SHG" },
        { id: "mudra", text: "MUDRA & Stand-Up India Scheme" }
      ],
      pnlPrompts: {
        askRev: "Let's assess your business profitability.\n\nFirst: **What is your approximate monthly sales / revenue?** (e.g., ₹50,000)",
        askCogs: "Got it. **How much do you spend on inventory / raw materials per month?**",
        askOpex: "Understood. **What are your monthly operating expenses (rent, utilities, transport)?**",
        askDebt: "Lastly: **Do you have any existing monthly loan or informal debt EMI?** (Enter 0 if none)"
      },
      pnlCardTitle: "Monthly Profit & Loss Card",
      lblRevenue: "Monthly Revenue",
      lblExpense: "COGS & Operating Expenses",
      lblProfit: "Net Monthly Surplus",
      lblMargin: "Net Margin",
      lblBuffer: "Risk Buffer",
      statusThriving: "Healthy & Thriving",
      statusSurviving: "Marginally Surviving",
      statusAtRisk: "High Risk / Deficit",
      openCalcBtn: "Open Financial Calculator",
      openFeasBtn: "Open Market Feasibility",
      openHealthBtn: "Open Health Tracker",
      openFullBtn: "Open Full Advisory Portal",
      changeLang: "Change Language",
      langChanged: "Language set to **English**. You can now speak or type your business inquiries."
    }
  }

  // --- Helper: Format Rupee ---
  function fmtINR(val) {
    if (typeof Engine !== "undefined" && Engine.fmtINR) {
      return Engine.fmtINR(val)
    }
    return "₹" + Number(val).toLocaleString("en-IN")
  }

  // --- Helper: Extract Number from Text ---
  function parseRupees(text) {
    if (!text) return null
    var clean = text.toLowerCase().replace(/,/g, "")
    // Match Lakh / L
    var lakhMatch = clean.match(/([\d.]+)\s*(?:lakh|lakhs|lac|lacs|लाख)/i)
    if (lakhMatch) return Math.round(parseFloat(lakhMatch[1]) * 100000)
    // Match K / Hazaar
    var kMatch = clean.match(/([\d.]+)\s*(?:k|hazar|hazaar|हजार)/i)
    if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000)
    // Match raw digits
    var numMatch = clean.match(/\d+/)
    if (numMatch) return parseInt(numMatch[0], 10)
    return null
  }

  // --- Helper: Resolve the chat backend endpoint ---
  // When the page is served over http(s) we call the same origin, so it works
  // on any port or host (localhost:3000, 127.0.0.1:3000, LAN IP, Live Server).
  // Opening index.html straight from disk (file://) falls back to the local server.
  function chatApiEndpoint() {
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      return "/api/chat"
    }
    return "http://localhost:3000/api/chat"
  }

  // --- Helper: Turn a failed chat request into an actionable on-screen hint ---
  function buildChatErrorHint(error) {
    var reason = error && error.message ? error.message : String(error)
    var code = error && error.code ? error.code : ""

    if (code === "quota") {
      if (currentLang === "hi")
        return "आज की मुफ़्त Gemini सीमा (free tier quota) पूरी हो गई है। मुफ़्त सीमा रोज़ रात 12 बजे (Pacific time) रीसेट होती है - कृपया बाद में फिर कोशिश करें, या दूसरा मॉडल चुनें।"
      if (currentLang === "mr")
        return "आजची मोफत Gemini मर्यादा (free tier quota) संपली आहे. मोफत मर्यादा दररोज रात्री १२ वाजता (Pacific time) रीसेट होते - कृपया नंतर पुन्हा प्रयत्न करा, किंवा दुसरे मॉडेल निवडा."
      return "The free Gemini quota for today is used up. Free daily quotas reset at midnight Pacific time - try again later, or configure another GEMINI_MODEL / GEMINI_FALLBACK_MODELS in .env."
    }

    if (code === "auth") {
      if (currentLang === "hi")
        return "AI सेवा की कुंजी अस्वीकार हो गई - .env में GEMINI_API_KEY अपडेट करें।"
      if (currentLang === "mr")
        return "AI सेवेची की नाकारली गेली - .env मध्ये GEMINI_API_KEY अद्ययावत करा."
      return "The AI provider rejected the API key - update GEMINI_API_KEY in .env."
    }

    if (code === "config") {
      if (currentLang === "hi")
        return "कोई भी AI सेवा कॉन्फ़िगर नहीं है। .env में मुफ़्त GEMINI_API_KEY जोड़ें, या लोकल मॉडल (Ollama) चलाएँ।"
      if (currentLang === "mr")
        return "कोणतीही AI सेवा कॉन्फिगर केलेली नाही. .env मध्ये मोफत GEMINI_API_KEY जोडा, किंवा स्थानिक मॉडेल (Ollama) चालवा."
      return "No AI provider is configured. Add a free GEMINI_API_KEY (or SAMBANOVA_API_KEY) to .env, or run a local Ollama model."
    }

    if (code === "unreachable") {
      if (currentLang === "hi")
        return "किसी भी AI सेवा तक नहीं पहुँच पाए - इंटरनेट कनेक्शन जाँचें, या लोकल मॉडल (Ollama) शुरू करें।"
      if (currentLang === "mr")
        return "कोणत्याही AI सेवेपर्यंत पोहोचता आले नाही - इंटरनेट कनेक्शन तपासा, किंवा स्थानिक मॉडेल (Ollama) सुरू करा."
      return "No AI provider could be reached - check the internet connection, or start a local Ollama model."
    }

    var unreachable = /failed to fetch|networkerror|load failed|network request failed/i.test(reason)

    if (unreachable) {
      if (currentLang === "hi") return "सलाहकार सर्वर से संपर्क नहीं हो पाया। टर्मिनल में `npm run dev` चलाएँ (http://localhost:3000)।"
      if (currentLang === "mr") return "सल्लागार सर्व्हरशी संपर्क झाला नाही. टर्मिनलमध्ये `npm run dev` चालवा (http://localhost:3000)."
      return "Could not reach the advisory server. Start it with `npm run dev` (http://localhost:3000)."
    }

    var prefix = currentLang === "hi"
      ? "सर्वर त्रुटि: "
      : currentLang === "mr"
      ? "सर्व्हर त्रुटी: "
      : "Server error: "
    return prefix + reason
  }

  // --- Speech Recognition Setup ---
  function initSpeechRecognition() {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.")
      return
    }

    recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = function () {
      isRecognizing = true
      updateMicUI(true)
    }

    recognition.onresult = function (event) {
      var transcript = event.results[0][0].transcript
      var inputField = document.getElementById("chatInput")
      if (inputField) {
        inputField.value = transcript
        // Automatically send after a brief delay
        setTimeout(function () {
          handleSendMessage()
        }, 400)
      }
    }

    recognition.onerror = function (e) {
      // Some browsers lack Marathi recognition - retry once with Hindi (same script)
      if ((e.error === "language-not-supported" || e.error === "language-unsupported") && !recognition._langFallbackTried) {
        recognition._langFallbackTried = true
        recognition.lang = currentLang === "en" ? "en-IN" : "hi-IN"
        try { recognition.start(); return } catch (err) {}
      }
      console.error("Speech recognition error:", e)
      stopListening()
    }

    recognition.onend = function () {
      stopListening()
    }
  }

  function startListening() {
    if (!recognition) {
      alert("आपके ब्राउज़र में आवाज़ पहचानने की सुविधा उपलब्ध नहीं है। कृपया टाइप करें।")
      return
    }
    try {
      recognition._langFallbackTried = false
      recognition.lang = I18N[currentLang].speechCode
      recognition.start()
    } catch (e) {
      console.error(e)
    }
  }

  function stopListening() {
    isRecognizing = false
    if (recognition) {
      try { recognition.stop() } catch (e) {}
    }
    updateMicUI(false)
  }

  function updateMicUI(active) {
    var micBtn = document.getElementById("micBtn")
    var voiceBanner = document.getElementById("voiceStatusBar")
    if (micBtn) {
      if (active) micBtn.classList.add("recording")
      else micBtn.classList.remove("recording")
    }
    if (voiceBanner) {
      if (active) voiceBanner.classList.remove("hidden")
      else voiceBanner.classList.add("hidden")
    }
  }
  // --- Append Message to UI ---
  function appendMessage(sender, text, htmlExtra, isHtml) {
    var messagesContainer = document.getElementById("chatMessages")
    if (!messagesContainer) return

    var row = document.createElement("div")
    row.className = "msg-row " + sender

    if (sender === "bot") {
      var avatar = document.createElement("div")
      avatar.className = "bot-avatar"
      // Main brand mark - sapling growing in two cupped hands.
      // Sized by CSS (.bot-avatar svg) so it always fills the avatar circle.
      var svgLogo = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">' +
        '<path d="M96 178 C70 182 38 168 22 146 C16 132 26 118 40 124 C56 130 64 140 74 148 C82 154 90 158 96 159 Z" fill="#a9745b"/>' +
        '<path d="M104 178 C130 182 162 168 178 146 C184 132 174 118 160 124 C144 130 136 140 126 148 C118 154 110 158 104 159 Z" fill="#eeb98d"/>' +
        '<path d="M58 154 C66 128 84 116 100 116 C116 116 134 128 142 154 C122 166 78 166 58 154 Z" fill="#7c4a2d"/>' +
        '<circle cx="78" cy="146" r="3" fill="#5b3421"/>' +
        '<circle cx="96" cy="156" r="3" fill="#5b3421"/>' +
        '<circle cx="110" cy="144" r="3" fill="#5b3421"/>' +
        '<path d="M100 132 C100 118 100 102 100 82" fill="none" stroke="#689f38" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M100 94 C98 76 86 54 56 50 C54 82 76 98 100 94 Z" fill="#9ccc65"/>' +
        '<path d="M100 88 C102 70 118 44 148 40 C150 74 130 90 100 88 Z" fill="#7cb342"/>' +
      '</svg>';
      avatar.innerHTML = '<div class="bot-avatar-inner">' + svgLogo + '</div>'
      row.appendChild(avatar)
    }

    var bubble = document.createElement("div")
    bubble.className = "msg-bubble"

    if (sender === "bot") {
      var header = document.createElement("div")
      header.className = "msg-header"
      header.innerHTML = '<span>' + I18N[currentLang].appTitle + '</span>'
      bubble.appendChild(header)
    }

    var textDiv = document.createElement("div")
    textDiv.className = "msg-text"

    if (isHtml) {
      textDiv.innerHTML = text
    } else {
      // Basic formatting (linebreaks, bold)
      var formatted = text
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br/>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      textDiv.innerHTML = "<p>" + formatted + "</p>"
    }
    bubble.appendChild(textDiv)

    if (htmlExtra) {
      var extraDiv = document.createElement("div")
      extraDiv.innerHTML = htmlExtra
      bubble.appendChild(extraDiv)
    }

    row.appendChild(bubble)
    messagesContainer.appendChild(row)
    scrollThreadToBottom(messagesContainer)
  }

  // Scroll the newest message fully into view.
  // CSS scroll-behavior:smooth would animate this, and a second reply arriving
  // mid-animation would settle short - leaving the bottom of the newest bot
  // bubble cut off. Force an instant jump instead.
  function scrollThreadToBottom(container) {
    if (!container) return
    var prevBehavior = container.style.scrollBehavior
    container.style.scrollBehavior = "auto"
    container.scrollTop = container.scrollHeight
    container.style.scrollBehavior = prevBehavior || ""
  }

  // --- Generate Profit & Loss Diagnostic Card & Profit Booster Advice ---
  function evaluateAndRenderPnL(rev, cogs, opex, debt) {
    var t = I18N[currentLang]
    var totalExpense = cogs + opex + debt
    var surplus = rev - totalExpense
    var grossMargin = rev > 0 ? Math.round(((rev - cogs) / rev) * 100) : 0
    var netMargin = rev > 0 ? Math.round((surplus / rev) * 100) : 0

    // Safety buffer: approx 1.5x of monthly debt or 10% of revenue
    var riskBuffer = debt > 0 ? Math.round(debt * 1.5) : Math.round(rev * 0.10)
    var isBufferMet = surplus >= riskBuffer

    var healthStatus = "surviving"
    var badgeClass = "surviving"
    var badgeText = t.statusSurviving

    if (netMargin >= 20 && isBufferMet) {
      healthStatus = "thriving"
      badgeClass = "thriving"
      badgeText = t.statusThriving
    } else if (netMargin < 5 || surplus <= 0 || !isBufferMet) {
      healthStatus = "at-risk"
      badgeClass = "at-risk"
      badgeText = t.statusAtRisk
    }

    // High Impact Practical Advice for Rural Entrepreneurs
    var adviceList = []

    if (currentLang === "hi") {
      if (cogs / rev > 0.65) {
        adviceList.push('<i class="fa-solid fa-cart-shopping"></i> <strong>थोक खरीद में बचत:</strong> आपका 65%+ पैसा माल खरीदने में जा रहा है। गांव के 3-4 साथी दुकानदारों के साथ समूह (Group Buying) बनाकर सीधे थोक मंडी या डिस्ट्रीब्यूटर से ऑर्डर करें - इससे खरीद लागत में <strong>8% से 12% की सीधी बचत</strong> होगी।')
      }
      if (grossMargin < 20) {
        adviceList.push('<i class="fa-solid fa-box-open"></i> <strong>ज्यादा मुनाफे वाले उत्पाद जोड़ें:</strong> साधारण सामानों पर मार्जिन कम होता है। दुकान में पैकेटबंद नमकीन, मसाले, डेयरी उत्पाद, या स्टेशनरी जैसे उत्पाद शामिल करें जहां <strong>25% से 35% तक मुनाफा</strong> मिलता है।')
      }
      if (debt > 0) {
        adviceList.push('<i class="fa-solid fa-building-columns"></i> <strong>सस्ते सरकारी लोन में ट्रांसफर:</strong> अगर यह कर्ज स्थानीय साहूकार का है (जिसमें 24% से 36% ब्याज लगता है), तो इसे तुरंत <strong>6.5% Stand-Up India या MUDRA लोन</strong> में ट्रांसफर करें। इससे आपकी जेब में हर महीने अतिरिक्त ₹2,000 से ₹5,000 बचेंगे।')
      }
      adviceList.push('<i class="fa-solid fa-shield-halved"></i> <strong>सुरक्षा कवच (Risk Buffer):</strong> हर महीने मुनाफे में से कम से कम <strong>' + fmtINR(riskBuffer) + '</strong> एक अलग बचत खाते में रखें ताकि बरसात या त्योहार के धीमे सीजन में भी दुकान आराम से चलती रहे।')
      adviceList.push('<i class="fa-solid fa-chart-line"></i> <strong>व्यापार की कुल कीमत बढ़ाना:</strong> पक्के बिल और नियमित बैंक लेनदेन से आपकी क्रेडिट रेटिंग सुधरेगी और आप भविष्य में बिना किसी गारंटी के ₹5 से ₹10 लाख का व्यापार विस्तार लोन ले सकेंगे।')
    } else if (currentLang === "mr") {
      if (cogs / rev > 0.65) {
        adviceList.push('<i class="fa-solid fa-cart-shopping"></i> <strong>घाऊक खरेदीतून बचत:</strong> तुमचा 65%+ खर्च माल खरेदीत जातो. 3-4 दुकानदारांनी एकत्र येऊन थेट घाऊक बाजारपेठेतून खरेदी केल्यास <strong>8% ते 12% बचत</strong> होईल.')
      }
      if (grossMargin < 20) {
        adviceList.push('<i class="fa-solid fa-box-open"></i> <strong>जास्त नफ्याची उत्पादने जोडा:</strong> किराण्यासोबत पॅकबंद मसाले, दुग्धजन्य पदार्थ, स्टेशनरी विका ज्यावर <strong>25% ते 35% पर्यंत नफा</strong> मिळतो.')
      }
      if (debt > 0) {
        adviceList.push('<i class="fa-solid fa-building-columns"></i> <strong>कमी व्याजाचे सरकारी कर्ज:</strong> सावकाराचे महागडे कर्ज (24-36% व्याज) बंद करून <strong>6.5% Stand-Up India किंवा मुद्रा कर्जात</strong> बदला, ज्यामुळे दरमहा ₹2,000 ते ₹5,000 ची बचत होईल.')
      }
      adviceList.push('<i class="fa-solid fa-shield-halved"></i> <strong>आणीबाणी सुरक्षा कवच:</strong> मंदीच्या दिवसांसाठी दरमहा <strong>' + fmtINR(riskBuffer) + '</strong> वेगळे ठेवा.')
    } else {
      if (cogs / rev > 0.65) {
        adviceList.push('<i class="fa-solid fa-cart-shopping"></i> <strong>Group Purchasing Savings:</strong> Raw material/stock accounts for over 65% of revenue. Consolidate orders with fellow local merchants to unlock <strong>8-12% wholesale discounts</strong>.')
      }
      if (grossMargin < 20) {
        adviceList.push('<i class="fa-solid fa-box-open"></i> <strong>High-Margin Product Mix:</strong> Shift focus towards value-added items (packaged foods, spices, local dairy, essentials) offering <strong>25-35% profit margins</strong>.')
      }
      if (debt > 0) {
        adviceList.push('<i class="fa-solid fa-building-columns"></i> <strong>Refinance Informal Debt:</strong> Replace high-interest moneylender debt (24-36%) with <strong>6.5%-8% MoSJE / Stand-Up India schemes</strong> to save ₹2,000-₹5,000 monthly.')
      }
      adviceList.push('<i class="fa-solid fa-shield-halved"></i> <strong>Emergency Risk Buffer:</strong> Maintain at least <strong>' + fmtINR(riskBuffer) + '</strong> in reserve to insulate against seasonal volatility.')
      adviceList.push('<i class="fa-solid fa-chart-line"></i> <strong>Building Enterprise Worth:</strong> Maintaining formal cash records qualifies you for up to ₹10 Lakh collateral-free expansion credit.')
    }

    // Build the visual card HTML
    var cardHtml = 
      '<div class="munafa-card">' +
        '<div class="munafa-header">' +
          '<div class="munafa-title"><i class="fa-solid fa-chart-pie"></i> ' + t.pnlCardTitle + '</div>' +
          '<span class="munafa-badge ' + badgeClass + '">' + badgeText + '</span>' +
        '</div>' +
        '<div class="munafa-grid">' +
          '<div class="munafa-item">' +
            '<div class="munafa-lbl">' + t.lblRevenue + '</div>' +
            '<div class="munafa-val inflow">' + fmtINR(rev) + '</div>' +
          '</div>' +
          '<div class="munafa-item">' +
            '<div class="munafa-lbl">' + t.lblExpense + '</div>' +
            '<div class="munafa-val outflow">' + fmtINR(totalExpense) + '</div>' +
          '</div>' +
          '<div class="munafa-item">' +
            '<div class="munafa-lbl">' + t.lblProfit + '</div>' +
            '<div class="munafa-val profit">' + fmtINR(surplus) + ' (' + netMargin + '%)</div>' +
          '</div>' +
          '<div class="munafa-item">' +
            '<div class="munafa-lbl">' + t.lblBuffer + '</div>' +
            '<div class="munafa-val buffer">' + fmtINR(riskBuffer) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="munafa-tips">' +
          '<div class="munafa-tips-title"><i class="fa-solid fa-lightbulb"></i> <strong>मुनाफा व नेटवर्थ बढ़ाने के ठोस उपाय (Action Plan):</strong></div>' +
          '<ul style="margin-left: 18px; margin-top: 6px; line-height: 1.6;">' +
            adviceList.map(function(adv) { return '<li>' + adv + '</li>' }).join('') +
          '</ul>' +
        '</div>' +
      '</div>'

    var actionsHtml = 
      '<div class="msg-actions">' +
        '<button class="action-pill green" onclick="window.openToolkitModal(\'tracker\')"><i class="fa-solid fa-heart-pulse"></i> ' + t.openHealthBtn + '</button>' +
        '<button class="action-pill" onclick="window.openToolkitModal(\'calculator\')"><i class="fa-solid fa-calculator"></i> ' + t.openCalcBtn + '</button>' +
        '<button class="action-pill" onclick="window.openToolkitModal(\'home\')"><i class="fa-solid fa-layer-group"></i> ' + t.openFullBtn + '</button>' +
      '</div>'

    var mainBotText = currentLang === "hi"
      ? "मैंने आपके व्यवसाय का पूरा हिसाब-किताब जांच लिया है। आपके पास महीने के अंत में लगभग **" + fmtINR(surplus) + "** की शुद्ध बचत हो रही है (" + netMargin + "% शुद्ध मुनाफा)।\n\nनीचे दिए गए सुझावों को अपनाकर आप अपने मुनाफे को 30% से 50% तक बढ़ा सकते हैं!"
      : currentLang === "mr"
      ? "मी आपल्या व्यवसायाचा संपूर्ण हिशोब तपासला आहे. आपल्याकडे महिन्याला अंदाजे **" + fmtINR(surplus) + "** चा निव्वळ नफा उरतो (" + netMargin + "% नफा).\n\nखालील उपायांचा वापर करून आपण आपला नफा 30% ते 50% वाढवू शकता!"
      : "I have calculated your complete monthly Profit & Loss. Your net in-hand profit is **" + fmtINR(surplus) + "** (" + netMargin + "% net margin).\n\nFollow the actionable recommendations below to expand your profit and enterprise value!"

    appendMessage("bot", mainBotText, cardHtml + actionsHtml, false)
    chatState.mode = "idle"
  }

  // --- Response Generator for General & Startup Inquiries ---
  async function generateBotReply(userText) {
    var t = I18N[currentLang]
    var lower = userText.toLowerCase()

    // 1. Check if we are in the middle of a P&L extraction flow
    if (chatState.mode === "pnl_rev") {
      var rev = parseRupees(userText)
      if (rev && rev > 0) {
        chatState.data.revenue = rev
        chatState.mode = "pnl_cogs"
        appendMessage("bot", t.pnlPrompts.askCogs)
        return
      }
    } else if (chatState.mode === "pnl_cogs") {
      var cogs = parseRupees(userText)
      if (cogs !== null) {
        chatState.data.cogs = cogs
        chatState.mode = "pnl_opex"
        appendMessage("bot", t.pnlPrompts.askOpex)
        return
      }
    } else if (chatState.mode === "pnl_opex") {
      var opex = parseRupees(userText)
      if (opex !== null) {
        chatState.data.opex = opex
        chatState.mode = "pnl_debt"
        appendMessage("bot", t.pnlPrompts.askDebt)
        return
      }
    } else if (chatState.mode === "pnl_debt") {
      var debt = parseRupees(userText)
      chatState.data.debt = debt !== null ? debt : 0
      evaluateAndRenderPnL(chatState.data.revenue, chatState.data.cogs, chatState.data.opex, chatState.data.debt)
      return
    }

    // 2. Direct P&L trigger keywords
    if (lower.includes("मुनाफा") || lower.includes("profit") || lower.includes("नफा") || lower.includes("loss") || lower.includes("नुकसान") || lower.includes("खर्च") || lower.includes("बचत") || lower.includes("pnl")) {
      // Check if user already provided revenue and expenses in the same prompt
      var numbers = (userText.match(/\d+/g) || []).map(Number)
      if (numbers.length >= 2) {
        var r = numbers[0] >= 1000 ? numbers[0] : numbers[0] * 1000
        var c = numbers[1] >= 1000 ? numbers[1] : numbers[1] * 1000
        var o = numbers.length > 2 ? (numbers[2] >= 1000 ? numbers[2] : numbers[2] * 1000) : Math.round(r * 0.1)
        evaluateAndRenderPnL(r, c, o, 0)
        return
      }

      chatState.mode = "pnl_rev"
      appendMessage("bot", t.pnlPrompts.askRev)
      return
    }

    // 3. Call Gemini API for conversational responses
    try {
        const response = await fetch(chatApiEndpoint(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: userText,
                lang: currentLang,
                history: chatHistory
            })
        });

        const data = await response.json().catch(function () { return {} });

        if (!response.ok) {
            // Surface the real reason (bad/missing API key, quota, model error…)
            var apiError = new Error(data.detail || data.error || ("HTTP " + response.status))
            apiError.code = data.code
            throw apiError
        }
        
        chatHistory.push({ role: "user", text: userText });
        chatHistory.push({ role: "bot", text: data.reply });

        // Keep history manageable
        if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

        // Convert Markdown bold to HTML for simple display
        let replyHtml = data.reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Handle newlines
        replyHtml = replyHtml.replace(/\n/g, '<br>');

        appendMessage("bot", replyHtml, null, false);

    } catch (error) {
        console.error("Error calling chat API:", error);
        
        // Default friendly conversational response (fallback)
        var fallbackMsg = currentLang === "hi"
          ? "माफ़ कीजिए, मुझे अभी नेटवर्क समस्या हो रही है। आप मुझसे सीधे पूछ सकते हैं कि:\n\n" +
            "• अपनी दुकान का नफा-नुकसान कैसे जांचें?\n" +
            "• या फिर ऊपर दिए गए बटन से पूरा विस्तृत टूलकिट खोलकर देख सकते हैं!"
          : currentLang === "mr"
          ? "क्षमस्व, मला आता नेटवर्क समस्या येत आहे. आपण मला विचारू शकता:\n\n" +
            "• दुकानाचा नफा कसा वाढवायचा?\n" +
            "• किंवा वरील बटणावर क्लिक करून संपूर्ण टूलकिट पाहू शकता!"
          : "Sorry, I'm experiencing network issues. You can ask me to:\n\n" +
            "• Check and optimize your monthly profit & loss.\n" +
            "• Or tap 'Open Full Toolkit' above to explore the complete advisory portal!";

        // Append the real reason, so a setup problem (server down, bad API key,
        // quota) is visible instead of hiding behind the generic message.
        fallbackMsg += "\n\nNotice: " + buildChatErrorHint(error)

        var fallbackActions = 
          '<div class="msg-actions">' +
            '<button class="action-pill highlight" onclick="window.startPnLFlow()"><i class="fa-solid fa-chart-pie"></i> ' + t.chips[0].text + '</button>' +
            '<button class="action-pill" onclick="window.openToolkitModal(\'home\')"><i class="fa-solid fa-layer-group"></i> ' + t.openFullBtn + '</button>' +
          '</div>';

        appendMessage("bot", fallbackMsg, fallbackActions, false);
    }
  }


  // --- Send Message Handler ---
  function handleSendMessage() {
    var inputField = document.getElementById("chatInput")
    if (!inputField) return
    var text = inputField.value.trim()
    if (!text) return

    inputField.value = ""
    appendMessage("user", text, null, false)

    // Show bot thinking briefly for realistic conversational feel
    setTimeout(function () {
      generateBotReply(text)
    }, 450)
  }

  // --- Language Picker Modal ---
  function showLangPicker() {
    var overlay = document.getElementById("langPickerOverlay")
    if (!overlay) return
    overlay.removeAttribute("hidden")
    overlay.hidden = false
    overlay.classList.remove("hidden", "fade-out")
    overlay.style.display = "flex"

    var changeBtn = document.getElementById("changeLangBtn")
    if (changeBtn) changeBtn.setAttribute("aria-expanded", "true")

    setTimeout(function () {
      var firstBtn = overlay.querySelector(".lang-pick-btn")
      if (firstBtn) firstBtn.focus()
    }, 60)
  }

  window.showLangPicker = showLangPicker

  var isHidingLangPicker = false
  function hideLangPicker(lang) {
    var overlay = document.getElementById("langPickerOverlay")
    if (!overlay) return
    if (isHidingLangPicker) return
    isHidingLangPicker = true
    overlay.classList.add("fade-out")

    var changeBtn = document.getElementById("changeLangBtn")
    if (changeBtn) changeBtn.setAttribute("aria-expanded", "false")

    setTimeout(function () {
      overlay.style.display = "none"
      overlay.hidden = true
      overlay.setAttribute("hidden", "")
      overlay.classList.remove("fade-out")
      isHidingLangPicker = false
      if (lang && I18N[lang]) {
        setLanguage(lang)
      }
    }, 200)
  }
  window.hideLangPicker = hideLangPicker

  // --- Language Switching ---
  function setLanguage(lang) {
    if (!lang || !I18N[lang]) return
    // Guard against redundant/glitching rapid re-execution
    if (currentLang === lang && document.documentElement.lang === lang) return
    currentLang = lang

    // Persist selection
    try { localStorage.setItem("preferredLanguage", lang) } catch (e) {}

    // Update document language attribute for accessibility
    document.documentElement.lang = lang === "mr" ? "mr" :
      lang === "en" ? "en" : "hi"

    var t = I18N[lang]

    // Update page title
    document.title = t.appTitle + " - Rural Business Advisory Assistant"

    // Update placeholders and titles
    var inputField = document.getElementById("chatInput")
    if (inputField) inputField.placeholder = t.inputPlaceholder

    var headerTitle = document.getElementById("headerAppTitle")
    if (headerTitle) headerTitle.textContent = t.appTitle

    var statusLbl = document.getElementById("headerStatusText")
    if (statusLbl) statusLbl.textContent = t.statusOnline

    var toolkitBtnText = document.getElementById("toolkitBtnLabel")
    if (toolkitBtnText) {
      if (window.innerWidth <= 768 && t.openToolkitShort) {
        toolkitBtnText.textContent = t.openToolkitShort
      } else {
        toolkitBtnText.textContent = t.openToolkit
      }
    }

    var chipsLabel = document.getElementById("quickChipsLabel")
    if (chipsLabel) chipsLabel.innerHTML = '<i class="fa-solid fa-bolt" aria-hidden="true"></i> <span>' + t.chipsLabel + '</span>'

    var changeLangBtn = document.getElementById("changeLangBtn")
    if (changeLangBtn) changeLangBtn.innerHTML = '<i class="fa-solid fa-globe" aria-hidden="true"></i> <span>' + t.changeLang + '</span>'

    // Update active class on header language switcher buttons
    document.querySelectorAll(".lang-switcher .lang-btn").forEach(function (btn) {
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active")
        btn.setAttribute("aria-pressed", "true")
      } else {
        btn.classList.remove("active")
        btn.setAttribute("aria-pressed", "false")
      }
    })

    // Update welcome card text
    var welcomeTitle = document.getElementById("welcomeTitle")
    if (welcomeTitle) welcomeTitle.textContent = t.welcomeGreeting.replace(/\*\*/g, "")

    var welcomeDesc = document.getElementById("welcomeDesc")
    if (welcomeDesc) welcomeDesc.textContent = t.welcomeDesc

    // Re-render Quick Chips
    renderQuickChips()

    // Sync language with popup iframe directly without triggering ping-pong loops
    try {
      var iframe = document.getElementById("toolkitIframe")
      if (iframe && iframe.contentWindow) {
        if (typeof iframe.contentWindow.setAppLanguage === "function") {
          iframe.contentWindow.setAppLanguage(lang, false)
        } else {
          iframe.contentWindow.postMessage({ action: "setLanguage", lang: lang }, "*")
        }
      }
    } catch (e) {}

    // Announce language change in chat (only if there are already messages)
    var messagesContainer = document.getElementById("chatMessages")
    var hasMsgs = messagesContainer && messagesContainer.querySelectorAll(".msg-row").length > 0
    if (hasMsgs) {
      appendMessage("bot", t.langChanged, null, false)
    }
  }

  // --- Render Quick Chips ---
  function renderQuickChips() {
    var container = document.getElementById("quickChipsGrid")
    if (!container) return
    container.innerHTML = ""

    var iconMap = {
      pnl: "fa-chart-line",
      kirana: "fa-store",
      dairy: "fa-cow",
      tractor: "fa-tractor",
      tailoring: "fa-scissors",
      mudra: "fa-hand-holding-dollar"
    }

    var chips = I18N[currentLang].chips
    chips.forEach(function (chip) {
      var btn = document.createElement("button")
      btn.className = "chip-btn" + (chip.highlight ? " highlight" : "")
      var icon = iconMap[chip.id] || "fa-arrow-right"
      btn.innerHTML = '<i class="fa-solid ' + icon + '" aria-hidden="true"></i> <span>' + chip.text + '</span>'
      btn.addEventListener("click", function () {
        if (chip.id === "pnl") {
          window.startPnLFlow()
        } else {
          var inputField = document.getElementById("chatInput")
          if (inputField) {
            inputField.value = chip.text.trim()
            handleSendMessage()
          }
        }
      })
      container.appendChild(btn)
    })
  }

  // --- P&L Flow Starter ---
  window.startPnLFlow = function () {
    chatState.mode = "pnl_rev"
    chatState.data = { revenue: 0, cogs: 0, opex: 0, debt: 0, category: "retail", margin: 0 }
    appendMessage("bot", I18N[currentLang].pnlPrompts.askRev)
  }

  // --- Full Toolkit Modal Controls ---
  window.openToolkitModal = function (moduleName) {
    var modal = document.getElementById("toolkitModal")
    var iframe = document.getElementById("toolkitIframe")
    if (!modal || !iframe) return

    modal.classList.add("active")
    modal.removeAttribute("hidden")
    document.body.style.overflow = "hidden"

    var targetModule = moduleName || "home"

    // Sync active state on navigation buttons
    document.querySelectorAll(".modal-nav-btn").forEach(function (btn) {
      if (btn.dataset.module === targetModule) btn.classList.add("active")
      else btn.classList.remove("active")
    })

    try {
      if (iframe.contentWindow) {
        if (typeof iframe.contentWindow.setAppLanguage === "function") {
          iframe.contentWindow.setAppLanguage(currentLang, false)
        }
        if (typeof iframe.contentWindow.switchModule === "function") {
          iframe.contentWindow.switchModule(targetModule)
        }
      }
    } catch (e) {}

    // Only set src if not already pointed to app.html
    if (!iframe.src || iframe.src.indexOf("app.html") === -1) {
      iframe.src = "app.html?lang=" + encodeURIComponent(currentLang) + "#" + encodeURIComponent(targetModule)
    }
  }

  window.closeToolkitModal = function () {
    var modal = document.getElementById("toolkitModal")
    if (!modal) return
    modal.classList.remove("active")
    modal.setAttribute("hidden", "")
    document.body.style.overflow = ""
  }

  // --- Init on DOM Ready ---
  document.addEventListener("DOMContentLoaded", function () {
    initSpeechRecognition()

    // Send button click
    var sendBtn = document.getElementById("sendBtn")
    if (sendBtn) {
      sendBtn.addEventListener("click", handleSendMessage)
    }

    // Input Enter Key
    var chatInput = document.getElementById("chatInput")
    if (chatInput) {
      chatInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault()
          handleSendMessage()
        }
      })
    }

    // Mic button
    var micBtn = document.getElementById("micBtn")
    if (micBtn) {
      micBtn.addEventListener("click", function () {
        if (isRecognizing) stopListening()
        else startListening()
      })
    }

    // Change Language button (opens language modal)
    var changeLangBtn = document.getElementById("changeLangBtn")
    if (changeLangBtn) {
      changeLangBtn.addEventListener("click", function () {
        showLangPicker()
      })
    }

    // Close Language Picker button
    var closeLangPickerBtn = document.getElementById("closeLangPickerBtn")
    if (closeLangPickerBtn) {
      closeLangPickerBtn.addEventListener("click", function () {
        hideLangPicker(null)
      })
    }

    // Modal background click for language picker
    var langPickerOverlay = document.getElementById("langPickerOverlay")
    if (langPickerOverlay) {
      langPickerOverlay.addEventListener("click", function (e) {
        if (e.target === this) hideLangPicker(null)
      })
    }

    // Language picker grid buttons
    document.querySelectorAll(".lang-pick-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = this.getAttribute("data-lang")
        if (lang) hideLangPicker(lang)
      })
    })

    // Header 1-Click Language Switcher buttons
    document.querySelectorAll(".lang-switcher .lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = this.getAttribute("data-lang")
        if (lang) setLanguage(lang)
      })
    })

    // Header Open Toolkit Button
    var headerToolkitBtn = document.getElementById("headerToolkitBtn")
    if (headerToolkitBtn) {
      headerToolkitBtn.addEventListener("click", function () {
        window.openToolkitModal("home")
      })
    }

    // Modal Close Button
    var closeToolkitBtn = document.getElementById("closeToolkitBtn")
    if (closeToolkitBtn) {
      closeToolkitBtn.addEventListener("click", window.closeToolkitModal)
    }

    // Modal Background Click
    var toolkitModal = document.getElementById("toolkitModal")
    if (toolkitModal) {
      toolkitModal.addEventListener("click", function (e) {
        if (e.target === this) window.closeToolkitModal()
      })
    }

    // Modal Nav Buttons
    document.querySelectorAll(".modal-nav-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".modal-nav-btn").forEach(function (b) { b.classList.remove("active") })
        this.classList.add("active")
        var mod = this.dataset.module
        var iframe = document.getElementById("toolkitIframe")
        if (iframe && iframe.contentWindow && iframe.contentWindow.switchModule) {
          iframe.contentWindow.switchModule(mod)
        }
      })
    })

    // Escape Key closes modals
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        hideLangPicker(null)
        window.closeToolkitModal()
      }
    })

    // Listen for messages from toolkit iframe
    window.addEventListener("message", function (e) {
      if (!e.data) return
      if (e.data === "closeToolkit") {
        window.closeToolkitModal()
      } else if (e.data.action === "langChangedInApp" && e.data.lang) {
        if (e.data.lang !== currentLang) {
          setLanguage(e.data.lang)
        }
      }
    })

    // --- Language Picker: check localStorage first ---
    var savedLang = null
    try { savedLang = localStorage.getItem("preferredLanguage") } catch (e) {}

    if (savedLang && I18N[savedLang]) {
      setLanguage(savedLang)
      renderQuickChips()
    } else {
      setLanguage("hi")
      renderQuickChips()
    }
  })
})()



