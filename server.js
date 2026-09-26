const http = require("http")
const fs = require("fs")
const path = require("path")

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
}

const CHATBOT_CONFIG = require("./chatbot-config.js")
const { generateReply, describeProviders, warmProviders } = require("./ai-providers")
const crypto = require("crypto")

// --- Minimal .env support (no extra dependency) ------------------------------
// Reads KEY=VALUE lines from .env in the project root. Anything already set in
// the real environment wins, so inline overrides keep working too.
function loadEnvFile() {
  const envPath = path.join(__dirname, ".env")
  if (!fs.existsSync(envPath)) return
  try {
    fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) return
      const eq = trimmed.indexOf("=")
      if (eq === -1) return
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = value
    })
  } catch (err) {
    console.warn("Could not read .env:", err.message)
  }
}
loadEnvFile()

// Read after .env is loaded so PORT can be configured there too
const PORT = process.env.PORT || 3000

// Turn an AI failure into a short, actionable reason for the chat UI - never the
// raw multi-KB provider blob. ai-providers.js already classifies failures and
// supplies a `.code` plus a human-readable `.detail`.
function describeChatError(error) {
  const code = (error && error.code) || ""
  const detail = (error && (error.detail || error.message)) || String(error)

  if (code === "quota" || code === "auth" || code === "config" || code === "unreachable") {
    return { code: code, detail: detail.slice(0, 400) }
  }

  if (code === "request" || code === "model" || code === "busy") {
    return { code: "server", detail: detail.slice(0, 400) }
  }

  // Anything thrown outside the provider layer: sniff the message instead.
  const message = error && error.message ? error.message : String(error)
  if (/RESOURCE_EXHAUSTED|quota|rate limit|429/i.test(message)) {
    return {
      code: "quota",
      detail:
        "Free-tier AI quota is used up for every configured provider. Daily free quotas reset at midnight Pacific time; add another provider (SambaNova / local Ollama) or enable billing.",
    }
  }
  if (/API key not valid|API_KEY_INVALID|PERMISSION_DENIED|401|403/i.test(message)) {
    return { code: "auth", detail: "The AI provider rejected the API key - check .env." }
  }

  return { code: "server", detail: message.slice(0, 400) }
}

const server = http.createServer(async (req, res) => {
  // Simple in-memory session store (sufficient for demo/dev). Keys are
  // session tokens mapping to { username, createdAt, lastSeen, usage }.
  // NOTE: This is not persistent and will be reset when the server restarts.
  if (typeof global.__sessions === "undefined") global.__sessions = new Map()
  const SESSIONS = global.__sessions
  const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "session"
  const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 24 * 60 * 60 * 1000) // 24h

  function parseCookies(header) {
    const out = {}
    if (!header) return out
    header.split(";")
      .map((c) => c.split("=").map((s) => s && s.trim()))
      .forEach(([k, v]) => {
        if (k) out[k] = v || ""
      })
    return out
  }

  function makeSession(username) {
    const token = (crypto.randomUUID && crypto.randomUUID()) || crypto.randomBytes(16).toString("hex")
    const now = Date.now()
    const entry = { username: username || "", createdAt: now, lastSeen: now, usage: 0 }
    SESSIONS.set(token, entry)
    return { token, entry }
  }

  function touchSession(token) {
    const entry = SESSIONS.get(token)
    if (!entry) return null
    entry.lastSeen = Date.now()
    return entry
  }

  function clearExpiredSessions() {
    const now = Date.now()
    for (const [token, entry] of SESSIONS.entries()) {
      if (now - (entry.lastSeen || entry.createdAt || 0) > SESSION_TTL_MS) SESSIONS.delete(token)
    }
  }

  // Periodically clear stale sessions (runs in the request handler so it
  // only executes while the server is active - fine for a small demo app).
  if (!global.__sessionCleanupScheduled) {
    setInterval(clearExpiredSessions, 60 * 60 * 1000)
    global.__sessionCleanupScheduled = true
  }
  let reqPath = decodeURIComponent(req.url.split("?")[0].split("#")[0])

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    })
    res.end()
    return
  }

  if (req.method === "POST" && reqPath === "/api/login") {
    let body = ""
    req.on("data", chunk => { body += chunk })
    req.on("end", () => {
      try {
        const data = JSON.parse(body)
        const username = (data.username || "").trim() || "user"
        const password = data.password || ""

        // If an AUTH_PASSWORD is set in .env, require it. Otherwise allow.
        const required = String(process.env.AUTH_PASSWORD || "").trim()
        if (required && required.length && password !== required) {
          res.writeHead(401, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" })
          res.end(JSON.stringify({ error: "Invalid credentials" }))
          return
        }

        const { token } = makeSession(username)
        // Set cookie (HttpOnly so client JS cannot read it). Keep it simple.
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Set-Cookie": `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly`,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        })
        res.end(JSON.stringify({ ok: true }))
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" })
        res.end(JSON.stringify({ error: "Bad request" }))
      }
    })
    return
  }

  if (req.method === "GET" && reqPath === "/api/firebase-config") {

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    })
    res.end(
      JSON.stringify({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
      })
    )
    return
  }

  if (req.method === "POST" && reqPath === "/api/logout") {

    const cookies = parseCookies(req.headers.cookie || "")
    const token = cookies[SESSION_COOKIE_NAME]
    if (token) SESSIONS.delete(token)
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": `${SESSION_COOKIE_NAME}=deleted; Path=/; HttpOnly; Max-Age=0`,
      "Access-Control-Allow-Origin": "*",
    })
    res.end(JSON.stringify({ ok: true }))
    return
  }

  if (req.method === "GET" && reqPath === "/api/me") {
    const cookies = parseCookies(req.headers.cookie || "")
    const token = cookies[SESSION_COOKIE_NAME]
    const entry = token ? SESSIONS.get(token) : null
    if (!entry) {
      res.writeHead(401, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" })
      res.end(JSON.stringify({ authenticated: false }))
      return
    }
    touchSession(token)
    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" })
    res.end(JSON.stringify({ authenticated: true, username: entry.username, usage: entry.usage }))
    return
  }
  
  if (req.method === "POST" && reqPath === "/api/chat") {
    let body = ""
    req.on("data", chunk => {
      body += chunk.toString()
    })
    req.on("end", async () => {
      try {
        const data = JSON.parse(body)
        const userMessage = data.message
        const lang = data.lang || "hi" // Language context
        const history = data.history || []

        // ai-providers.js walks the chain (Gemini → SambaNova → local Ollama)
        // and returns the first provider that still has quota left.
        const result = await generateReply({
          systemPrompt: CHATBOT_CONFIG.systemPrompt,
          history: history,
          message: userMessage,
          lang: lang,
        })

        res.writeHead(200, { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        })
        res.end(
          JSON.stringify({
            reply: result.reply,
            provider: result.provider,
            model: result.model,
          })
        )
      } catch (error) {
        const info = describeChatError(error)
        const raw = error && error.message ? error.message : String(error)
        console.error("AI reply failed:", raw)
        res.writeHead(500, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        // `code` lets the chat show a friendly, actionable message
        res.end(
          JSON.stringify({
            error: "Failed to generate reply",
            code: info.code,
            detail: info.detail,
          })
        )
      }
    })
    return
  }

  if (req.method === "GET" && reqPath === "/api/health") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    })
    res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }))
    return
  }

  if (reqPath === "/" || reqPath === "") reqPath = "/index.html"

  // Strip leading slashes to prevent absolute root resolution on Linux/Render
  const safeRelative = reqPath.replace(/^[/\\]+/, "")
  const segments = safeRelative.split(/[/\\]/).filter(Boolean)
  const isHidden = segments.some((seg) => seg.startsWith("."))
  const filePath = path.resolve(__dirname, safeRelative)

  // Block access outside __dirname (directory traversal)
  if (!filePath.startsWith(path.resolve(__dirname))) {
    res.writeHead(403, { "Content-Type": "text/plain" })
    res.end("403 Forbidden")
    return
  }

  // Block sensitive server files from being downloaded
  const baseName = path.basename(filePath).toLowerCase()
  const sensitiveFiles = [
    ".env",
    ".env.example",
    ".env.local",
    "server.js",
    "ai-providers.js",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "tsconfig.tsbuildinfo",
    "jest.config.js",
    "postcss.config.js",
    "tailwind.config.ts",
  ]
  if (
    isHidden ||
    sensitiveFiles.includes(baseName) ||
    filePath.includes(`${path.sep}src${path.sep}`) ||
    filePath.includes(`${path.sep}node_modules${path.sep}`)
  ) {
    res.writeHead(404, { "Content-Type": "text/plain" })
    res.end("404 Not Found")
    return
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" })
      res.end("404 Not Found")
      return
    }
    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || "application/octet-stream"
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    })
    fs.createReadStream(filePath).pipe(res)
  })
})

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vyapar Vardhan AI server running at http://localhost:${PORT}/`)
  describeProviders()
    .then((chain) => {
      if (!chain.length) {
        console.warn(
          "No AI provider is configured - chat replies will use the offline fallback message."
        )
        return
      }
      console.log("AI provider chain (the first one with quota left answers):")
      chain.forEach((entry) => {
        console.log(
          `  • ${entry.provider}: ${entry.models.join(", ") || "(no models)"}`
        )
      })
    })
    .catch((err) => console.warn("Could not inspect AI providers:", err.message))
  // Warm the local Ollama model (if configured) so that the first fallback
  // to a local model doesn't produce a long startup delay for users.
  // warmProviders().catch(() => {})
})
