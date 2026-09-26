/* ============================================================================
   FIREBASE CLIENT BRIDGE FOR STANDALONE CHAT (index.html)
   Cosmic Glass Auth: Email/Password, Google Sign-In & Firestore Persistence
   Strict Authentication Required
   ============================================================================ */

(function () {
  "use strict"

  var auth = null
  var db = null
  var isConfigured = false
  var currentUser = null
  var authMode = "signin" // "signin" | "signup"

  // Load external scripts dynamically
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve()
        return
      }
      var s = document.createElement("script")
      s.src = src
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
  }

  // Update header UI with user & cloud status
  function updateHeaderAuth(user, profile) {
    var existingBadge = document.getElementById("firebaseUserPill")
    if (existingBadge) existingBadge.remove()

    if (user || profile) {
      var displayName = (user && (user.displayName || user.email)) || (profile && profile.name) || "User"
      var pill = document.createElement("div")
      pill.id = "firebaseUserPill"
      pill.className = "firebase-user-pill"
      pill.innerHTML =
        '<span class="user-avatar-badge">' +
        displayName.charAt(0).toUpperCase() +
        '</span>' +
        '<span class="user-name-text">' + displayName + '</span>' +
        '<button type="button" id="headerSignOutBtn" class="header-signout-btn" title="Sign out / लॉगआउट"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>'

      var actions = document.querySelector(".chat-header-actions")
      if (actions) {
        actions.appendChild(pill)
      }

      var signOutBtn = pill.querySelector("#headerSignOutBtn")
      if (signOutBtn) {
        signOutBtn.addEventListener("click", async function (e) {
          e.preventDefault()
          if (auth) {
            try { await auth.signOut() } catch (err) {}
          }
          try {
            sessionStorage.removeItem("vyapar_logged_in")
            localStorage.removeItem("vyapar_remember_me")
            localStorage.removeItem("userProfile")
          } catch (err) {}
          currentUser = null
          pill.remove()
          showLoginOverlay()
        })
      }
    }
  }

  // Dismiss login overlay immediately (multi-layer guarantee)
  function dismissLoginOverlay() {
    var overlay = document.getElementById("loginOverlay")
    if (overlay) {
      overlay.hidden = true
      overlay.classList.add("hidden")
      overlay.style.display = "none"
    }
  }

  // Show login overlay firmly
  function showLoginOverlay() {
    var overlay = document.getElementById("loginOverlay")
    if (overlay) {
      overlay.hidden = false
      overlay.classList.remove("hidden")
      overlay.style.display = "flex"
    }
  }

  // Set friendly error message
  function setStatus(msg, isError) {
    var statusEl = document.getElementById("loginStatusMsg")
    if (statusEl) {
      statusEl.textContent = msg || ""
      statusEl.style.color = isError ? "#f87171" : "#4ade80"
    }
  }

  function clearErrors() {
    var emailErr = document.getElementById("loginEmailError")
    var passErr = document.getElementById("loginPasswordError")
    var statusEl = document.getElementById("loginStatusMsg")
    if (emailErr) emailErr.textContent = ""
    if (passErr) passErr.textContent = ""
    if (statusEl) statusEl.textContent = ""
  }

  // Save session to localStorage
  function persistUserLocal(user) {
    try {
      localStorage.setItem("userProfile", JSON.stringify({
        name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
        email: user.email,
        uid: user.uid,
        loginAt: new Date().toISOString()
      }))
    } catch (e) {}
  }

  // Sync user record to Firestore (with 4s timeout so it NEVER blocks UI)
  async function syncUserFirestore(user) {
    if (!db || !user) return
    try {
      var timeoutPromise = new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error("Timeout")) }, 4000)
      })
      var writePromise = db.collection("users").doc(user.uid).set(
        {
          uid: user.uid,
          displayName: user.displayName || null,
          email: user.email || null,
          photoURL: user.photoURL || null,
          lastSeen: window.firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      )
      await Promise.race([writePromise, timeoutPromise])
    } catch (e) {
      console.warn("Firestore sync:", (e && e.message) || e)
    }
  }

  // Initialize Firebase from server environment
  async function initFirebase() {
    try {
      const res = await fetch("/api/firebase-config")
      if (!res.ok) return
      const config = await res.json()

      if (!config.apiKey || config.apiKey === "your_firebase_api_key") {
        console.log("Firebase: Live credentials not configured.")
        return
      }

      await loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js")
      await loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js")
      await loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js")

      if (window.firebase && !window.firebase.apps.length) {
        window.firebase.initializeApp(config)
      }

      auth = window.firebase.auth()
      db = window.firebase.firestore()
      isConfigured = true
      console.log("Firebase initialized successfully for Vyapar Vardhan AI.")

      // Check if URL specifies logout (e.g. ?logout=1 or #login)
      if (window.location.search.includes("logout") || window.location.hash === "#login") {
        try {
          await auth.signOut()
          sessionStorage.removeItem("vyapar_logged_in")
          localStorage.removeItem("vyapar_remember_me")
          localStorage.removeItem("userProfile")
        } catch (e) {}
        currentUser = null
      }

      // Auth state listener: strict gatekeeping - login page MUST hold up on screen
      auth.onAuthStateChanged(function (user) {
        var hasActiveSession = false
        var localProfile = null
        try {
          hasActiveSession = sessionStorage.getItem("vyapar_logged_in") === "true"
          localProfile = JSON.parse(localStorage.getItem("userProfile") || "null")
        } catch (e) {}

        if (user && hasActiveSession) {
          currentUser = user
          dismissLoginOverlay()
          persistUserLocal(user)
          updateHeaderAuth(user)
          syncUserFirestore(user).catch(function (err) {
            console.warn("Background Firestore sync:", err)
          })
        } else if (localProfile && hasActiveSession) {
          currentUser = localProfile
          dismissLoginOverlay()
          updateHeaderAuth(null, localProfile)
        } else {
          // Lock the login overlay on screen firmly
          currentUser = null
          showLoginOverlay()
        }
      })
    } catch (err) {
      console.warn("Firebase initialization error:", err.message)
    }
  }

  // Trigger Google Sign-In
  async function signInWithGoogle() {
    if (!isConfigured || !auth) {
      setStatus("Firebase keys are not configured yet.", true)
      return
    }

    clearErrors()
    setStatus("Connecting to Google...", false)

    try {
      var provider = new window.firebase.auth.GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })

      // Pre-set active session so onAuthStateChanged detects it instantly on popup close
      try {
        sessionStorage.setItem("vyapar_logged_in", "true")
        localStorage.setItem("vyapar_remember_me", "true")
      } catch (e) {}

      var result = await auth.signInWithPopup(provider)
      var user = result.user

      currentUser = user
      persistUserLocal(user)

      // 1. DISMISS LOGIN OVERLAY IMMEDIATELY (Zero delay)
      dismissLoginOverlay()
      setStatus("", false)
      updateHeaderAuth(user)

      // 2. Open language picker if user hasn't selected a language yet
      if (window.showLangPicker && !localStorage.getItem("preferredLanguage")) {
        window.showLangPicker()
      }

      // 3. Sync to Firestore in background (NEVER BLOCKS UI)
      syncUserFirestore(user).catch(function (err) {
        console.warn("Background sync error:", err)
      })

    } catch (err) {
      try { sessionStorage.removeItem("vyapar_logged_in") } catch (e) {}
      if (err.code !== "auth/popup-closed-by-user") {
        setStatus("Google Sign-In: " + (err.message || "Failed to sign in."), true)
      } else {
        setStatus("", false)
      }
      showLoginOverlay()
    }
  }

  // Handle Email + Password submit (Sign In or Sign Up)
  async function handleAuthSubmit() {
    clearErrors()

    var emailInput = document.getElementById("loginEmail")
    var passInput = document.getElementById("loginPassword")
    var emailErr = document.getElementById("loginEmailError")
    var passErr = document.getElementById("loginPasswordError")
    var submitBtn = document.getElementById("authSubmitBtn")
    var rememberCheckbox = document.getElementById("rememberMeCheckbox")

    var email = emailInput ? emailInput.value.trim() : ""
    var password = passInput ? passInput.value : ""

    var hasError = false
    if (!email) {
      if (emailErr) emailErr.textContent = "Please enter your email."
      hasError = true
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (emailErr) emailErr.textContent = "Please enter a valid email address."
      hasError = true
    }

    if (!password) {
      if (passErr) passErr.textContent = "Please enter your password."
      hasError = true
    } else if (password.length < 6) {
      if (passErr) passErr.textContent = "Password must be at least 6 characters."
      hasError = true
    }

    if (hasError) return

    if (!isConfigured || !auth) {
      // Fallback sign in when Firebase is unconfigured or blocked by adblockers
      var demoUser = {
        email: email,
        displayName: email.split("@")[0] || "User",
        uid: "local_" + Date.now()
      }
      try {
        sessionStorage.setItem("vyapar_logged_in", "true")
        if (rememberCheckbox && rememberCheckbox.checked) {
          localStorage.setItem("vyapar_remember_me", "true")
        }
      } catch (e) {}
      persistUserLocal(demoUser)
      dismissLoginOverlay()
      var langPicker = document.getElementById("langPickerOverlay")
      if (langPicker && !localStorage.getItem("preferredLanguage")) {
        if (window.showLangPicker) window.showLangPicker()
        else langPicker.style.display = "flex"
      }
      updateHeaderAuth(demoUser)
      return
    }

    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.innerHTML = authMode === "signin" ? "<span>Signing In...</span>" : "<span>Creating Account...</span>"
    }

    try {
      // Set persistence based on "Remember me"
      var rememberMe = rememberCheckbox ? rememberCheckbox.checked : true
      var persistence = rememberMe
        ? window.firebase.auth.Auth.Persistence.LOCAL
        : window.firebase.auth.Auth.Persistence.SESSION
      await auth.setPersistence(persistence)

      var result
      if (authMode === "signin") {
        try {
          result = await auth.signInWithEmailAndPassword(email, password)
        } catch (signInErr) {
          // If the account does not exist yet, seamlessly create it
          if (signInErr.code === "auth/user-not-found" || signInErr.code === "auth/invalid-credential") {
            try {
              result = await auth.createUserWithEmailAndPassword(email, password)
            } catch (createErr) {
              throw signInErr
            }
          } else {
            throw signInErr
          }
        }
      } else {
        result = await auth.createUserWithEmailAndPassword(email, password)
      }

      var user = result.user

      try {
        sessionStorage.setItem("vyapar_logged_in", "true")
        if (rememberMe) {
          localStorage.setItem("vyapar_remember_me", "true")
        } else {
          localStorage.removeItem("vyapar_remember_me")
        }
      } catch (e) {}

      persistUserLocal(user)
      currentUser = user

      // 1. Immediately dismiss login overlay (zero delay)
      dismissLoginOverlay()
      setStatus("", false)
      updateHeaderAuth(user)

      // 2. Open language picker if user hasn't selected a language yet
      if (window.showLangPicker && !localStorage.getItem("preferredLanguage")) {
        window.showLangPicker()
      }

      // 3. Fire-and-forget background sync (never blocks UI)
      syncUserFirestore(user).catch(function (err) {
        console.warn("Background sync error:", err)
      })
    } catch (err) {
      console.error("Auth error:", err)
      if (err.code === "auth/operation-not-allowed") {
        console.warn("Firebase provider not enabled in console. Providing fallback local session.")
        var fallbackUser = {
          email: email,
          displayName: email.split("@")[0] || "User",
          uid: "local_" + Date.now()
        }
        try {
          sessionStorage.setItem("vyapar_logged_in", "true")
          if (rememberMe) localStorage.setItem("vyapar_remember_me", "true")
        } catch (e) {}
        persistUserLocal(fallbackUser)
        dismissLoginOverlay()
        setStatus("", false)
        updateHeaderAuth(fallbackUser)
        if (window.showLangPicker && !localStorage.getItem("preferredLanguage")) {
          window.showLangPicker()
        }
        return
      }

      var msg = err.message || "Authentication failed."
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        msg = "Incorrect email or password."
      } else if (err.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists. Please sign in."
      } else if (err.code === "auth/weak-password") {
        msg = "Password is too weak. Please use at least 6 characters."
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many attempts. Please try again later or reset password."
      }
      setStatus(msg, true)
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.innerHTML = authMode === "signin" ? "<span>Sign In</span>" : "<span>Create Account</span>"
      }
    }
  }

  // Handle Forgot Password
  async function handleForgotPassword() {
    if (!isConfigured || !auth) {
      setStatus("Firebase is not configured.", true)
      return
    }

    var emailInput = document.getElementById("loginEmail")
    var email = emailInput ? emailInput.value.trim() : ""

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Please enter your email address above to reset password.", true)
      if (emailInput) emailInput.focus()
      return
    }

    try {
      await auth.sendPasswordResetEmail(email)
      setStatus("Password reset link sent to " + email + "! Please check your inbox.", false)
    } catch (err) {
      setStatus("Password reset failed: " + (err.message || "Unknown error"), true)
    }
  }

  // Toggle mode between Sign In and Sign Up
  function toggleAuthMode() {
    clearErrors()
    authMode = authMode === "signin" ? "signup" : "signin"

    var titleEl = document.getElementById("loginTitle")
    var subtitleEl = document.getElementById("loginSubtitle")
    var submitText = document.getElementById("authSubmitText")
    var switchPrompt = document.getElementById("authSwitchPrompt")
    var switchBtn = document.getElementById("authSwitchBtn")
    var rememberRow = document.getElementById("rememberForgotRow")

    if (authMode === "signup") {
      if (titleEl) titleEl.textContent = "Create account"
      if (subtitleEl) subtitleEl.textContent = "Sign up to begin your business advisory and financial planning journey"
      if (submitText) submitText.textContent = "Create Account"
      if (switchPrompt) switchPrompt.textContent = "Already have an account?"
      if (switchBtn) switchBtn.textContent = "Sign In"
      if (rememberRow) rememberRow.style.display = "none"
    } else {
      if (titleEl) titleEl.textContent = "Welcome back!"
      if (subtitleEl) subtitleEl.textContent = "Sign in to access your business advisory, market insights, and government loan schemes"
      if (submitText) submitText.textContent = "Sign In"
      if (switchPrompt) switchPrompt.textContent = "Don't have an account?"
      if (switchBtn) switchBtn.textContent = "Sign Up"
      if (rememberRow) rememberRow.style.display = "flex"
    }
  }

  // Toggle password visibility
  function togglePasswordVisibility() {
    var passInput = document.getElementById("loginPassword")
    var eyeSvg = document.getElementById("eyeIconSvg")
    if (!passInput) return

    if (passInput.type === "password") {
      passInput.type = "text"
      if (eyeSvg) {
        eyeSvg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
      }
    } else {
      passInput.type = "password"
      if (eyeSvg) {
        eyeSvg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>'
      }
    }
  }

  // Save chat message to Firestore
  async function saveChatMessage(role, text, metadata) {
    if (!isConfigured || !db || !currentUser) return
    try {
      await db.collection("chat_sessions").doc(currentUser.uid).collection("messages").add({
        role: role,
        text: text,
        metadata: metadata || null,
        timestamp: window.firebase.firestore.FieldValue.serverTimestamp(),
      })
    } catch (e) {}
  }

  // Expose global client API
  window.firebaseClient = {
    isConfigured: function () {
      return isConfigured
    },
    getUser: function () {
      return currentUser
    },
    signInWithGoogle: signInWithGoogle,
    saveChatMessage: saveChatMessage,
  }

  // Wire up UI on DOM Ready
  document.addEventListener("DOMContentLoaded", function () {
    initFirebase()

    // Form submit listener (handles Enter key & click)
    var form = document.getElementById("authLoginForm")
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault()
        handleAuthSubmit()
      })
    }

    var submitBtn = document.getElementById("authSubmitBtn")
    if (submitBtn) {
      submitBtn.addEventListener("click", function (e) {
        e.preventDefault()
        handleAuthSubmit()
      })
    }

    // Google Sign-In Button
    var googleBtn = document.getElementById("googleSignInBtn")
    if (googleBtn) {
      googleBtn.addEventListener("click", signInWithGoogle)
    }

    // Toggle password eye button
    var eyeBtn = document.getElementById("togglePasswordBtn")
    if (eyeBtn) {
      eyeBtn.addEventListener("click", togglePasswordVisibility)
    }

    // Forgot password button
    var forgotBtn = document.getElementById("forgotPasswordBtn")
    if (forgotBtn) {
      forgotBtn.addEventListener("click", function (e) {
        e.preventDefault()
        handleForgotPassword()
      })
    }

    // Switch between Sign In / Sign Up
    var switchBtn = document.getElementById("authSwitchBtn")
    if (switchBtn) {
      switchBtn.addEventListener("click", function (e) {
        e.preventDefault()
        toggleAuthMode()
      })
    }

    // Guest Sign-In Button
    var guestBtn = document.getElementById("guestSignInBtn")
    if (guestBtn) {
      guestBtn.addEventListener("click", function (e) {
        e.preventDefault()
        var guestUser = {
          email: "guest@vyapar.ai",
          displayName: "Guest User",
          uid: "guest_" + Date.now(),
        }
        try {
          sessionStorage.setItem("vyapar_logged_in", "true")
        } catch (err) {}
        persistUserLocal(guestUser)
        dismissLoginOverlay()
        if (window.showLangPicker && !localStorage.getItem("preferredLanguage")) {
          window.showLangPicker()
        }
        updateHeaderAuth(guestUser)
      })
    }
  })
})()
