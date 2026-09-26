/* ============================================================================
   AI PROVIDERS — one entry point for every chat backend.

   generateReply() walks this chain and returns the first provider that answers,
   so a quota limit, a bad key or an outage on one provider never takes the
   assistant down:

     1. Google Gemini        @google/genai, GEMINI_API_KEY (free tier)
     2. SambaNova / generic  OpenAI-compatible endpoint, SAMBANOVA_API_KEY
                             or OPENAI_COMPAT_API_KEY + OPENAI_COMPAT_BASE_URL
                             (any OpenAI-compatible service works the same way)
     3. Local Ollama         http://127.0.0.1:11434/v1 — no key, no quota

   The OpenAI-compatible paths use Node's built-in global fetch (Node 18+),
   so this file adds no npm dependencies.

   Errors carry a `.code` ("quota" | "auth" | "model" | "busy" | "unreachable" |
   "request" | "config") plus `.attempts`, so the chat UI can show something
   useful instead of the raw provider blob.
   ============================================================================ */

// GEMINI_API_KEY in .env or environment variables wins.
const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ""
// Free-tier quota is per project AND per model, so the fallbacks matter:
// gemini-3.6-flash allows only ~20 free requests/day, the 2.5 Flash family ~1500.
const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash"
const DEFAULT_GEMINI_FALLBACKS = ["gemini-3.5-flash-lite", "gemini-2.5-flash"]
const DEFAULT_SAMBANOVA_BASE_URL = "https://api.sambanova.ai/v1"
const DEFAULT_SAMBANOVA_MODELS = ["meta-llama/Llama-3.1-70B-Instruct"]
const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434/v1"
const DEFAULT_OLLAMA_MODEL = "gemma3:4b"

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function commaList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function unique(values) {
  return values.filter((value, index) => value && values.indexOf(value) === index)
}

function requestTimeoutMs() {
  const parsed = Number(process.env.AI_REQUEST_TIMEOUT_MS)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 45000
}

// Local models generate far slower than a hosted API (a 4B model on CPU can take
// a minute for a paragraph), so they get their own, longer budget before the
// attempt is abandoned and the failure reported.
function localTimeoutMs() {
  const parsed = Number(process.env.OLLAMA_TIMEOUT_MS)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 180000
}

function abortSignal(ms) {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms)
  }
  return undefined
}

function errorText(error) {
  if (!error) return ""
  const cause = error.cause || {}
  return [error.message, cause.code, cause.message].filter(Boolean).join(" ") || String(error)
}

function aiError(code, detail, attempts) {
  const error = new Error(detail)
  error.code = code
  error.detail = detail
  error.attempts = attempts || []
  return error
}

// Which kind of failure was this? Drives both "should we try the next provider"
// and what the user is told.
function classifyFailure(error) {
  const message = errorText(error)
  const status = String((error && (error.status || error.code)) || "")

  if (status === "429" || /RESOURCE_EXHAUSTED|quota|rate limit|too many requests/i.test(message))
    return "quota"
  if (
    status === "401" ||
    status === "403" ||
    /api key not valid|API_KEY_INVALID|PERMISSION_DENIED|UNAUTHENTICATED|invalid api key|no auth/i.test(
      message
    )
  )
    return "auth"
  if (status === "400" || /INVALID_ARGUMENT|invalid request/i.test(message)) return "request"
  if (status === "404" || /NOT_FOUND|not found|does not exist|unknown model/i.test(message))
    return "model"
  if (status === "503" || /UNAVAILABLE|overloaded|timed out|timeout|aborted/i.test(message))
    return "busy"
  if (/ENOTFOUND|ECONNREFUSED|ECONNRESET|EPIPE|fetch failed|Failed to fetch/i.test(message))
    return "unreachable"
  return "unknown"
}

// When everything failed, report the most actionable reason.
const FAILURE_PRIORITY = ["quota", "auth", "model", "request", "busy", "unreachable", "unknown"]

function worstFailure(kinds) {
  for (const kind of FAILURE_PRIORITY) {
    if (kinds.indexOf(kind) !== -1) return kind
  }
  return "unknown"
}

function failureSummary(code, attempts) {
  const tried = attempts.length ? ` Tried: ${attempts.slice(0, 6).join("; ")}` : ""
  switch (code) {
    case "quota":
      return "Every configured AI provider is currently out of free quota." + tried
    case "auth":
      return "The AI provider rejected the API key." + tried
    case "model":
      return "None of the configured model names are available." + tried
    case "busy":
      return "The AI providers are overloaded or timed out." + tried
    case "unreachable":
      return "No AI provider could be reached." + tried
    default:
      return "The AI provider call failed." + tried
  }
}

// ---------------------------------------------------------------------------
// Provider calls
// ---------------------------------------------------------------------------

let geminiClient = null

function getGeminiClient(apiKey) {
  if (!geminiClient) {
    const { GoogleGenAI } = require("@google/genai")
    geminiClient = new GoogleGenAI({ apiKey })
  }
  return geminiClient
}

async function completeWithGemini({ apiKey, model, systemPrompt, history, message, lang }) {
  const client = getGeminiClient(apiKey)

  const contents = (history || []).map((msg) => ({
    role: msg.role === "bot" ? "model" : "user",
    parts: [{ text: msg.text }],
  }))
  contents.push({
    role: "user",
    parts: [
      {
        text: `${systemPrompt}\n\nUser language preference: ${lang}\n\nUser message: ${message}`,
      },
    ],
  })

  const response = await client.models.generateContent({ model: model, contents: contents })
  return response && response.text ? response.text : ""
}

// Used for SambaNova, any OpenAI-compatible endpoint, and local Ollama.
async function completeWithOpenAI({
  baseURL,
  apiKey,
  model,
  systemPrompt,
  history,
  message,
  timeoutMs,
}) {
  if (typeof fetch !== "function") {
    throw new Error("global fetch is unavailable — Node 18+ is required")
  }

  const url = `${String(baseURL).replace(/\/+$/, "")}/chat/completions`
  const messages = [{ role: "system", content: systemPrompt }]
  for (const msg of history || []) {
    messages.push({ role: msg.role === "bot" ? "assistant" : "user", content: msg.text })
  }
  messages.push({ role: "user", content: message })

  const headers = { "Content-Type": "application/json" }
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ model: model, messages: messages, temperature: 0.7 }),
    signal: abortSignal(timeoutMs || requestTimeoutMs()),
  })

  const raw = await response.text()
  let payload = null
  try {
    payload = JSON.parse(raw)
  } catch (err) {
    payload = null
  }

  if (!response.ok) {
    const apiMessage =
      (payload && payload.error && (payload.error.message || payload.error.code)) ||
      raw.slice(0, 300) ||
      `HTTP ${response.status}`
    const error = new Error(`HTTP ${response.status}: ${apiMessage}`)
    error.status = response.status
    throw error
  }

  const choice = payload && payload.choices && payload.choices[0]
  const text = choice && choice.message && choice.message.content
  return text || ""
}

// Ask an OpenAI-compatible endpoint which models it actually serves, so the
// chain does not depend on hard-coded (and eventually stale) model names.
async function discoverModels({ baseURL, apiKey }) {
  if (typeof fetch !== "function") return []
  try {
    const response = await fetch(`${String(baseURL).replace(/\/+$/, "")}/models`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      signal: abortSignal(6000),
    })
    if (!response.ok) return []
    const payload = await response.json()
    const raw = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.models)
        ? payload.models
        : []
    return unique(
      raw
        .map((item) => item && (item.id || item.name || item.model))
        .filter((id) => typeof id === "string" && id.length > 0)
        .filter((id) => !/embed|whisper|tts|image|rerank|guard|moderation/i.test(id))
    ).slice(0, 20)
  } catch (error) {
    return []
  }
}

// ---------------------------------------------------------------------------
// Provider chain (built once, lazily, so .env is definitely loaded)
// ---------------------------------------------------------------------------

let providersPromise = null

async function buildProviders() {
  const providers = []

  // 1. Google Gemini
  const geminiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || DEFAULT_GEMINI_KEY
  if (geminiKey) {
    const models = unique([
      process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
      ...commaList(
        process.env.GEMINI_FALLBACK_MODELS === undefined
          ? DEFAULT_GEMINI_FALLBACKS.join(",")
          : process.env.GEMINI_FALLBACK_MODELS
      ),
    ])
    providers.push({
      id: "gemini",
      label: "Google Gemini",
      models: models,
      complete: (input) =>
        completeWithGemini({
          apiKey: geminiKey,
          model: input.model,
          systemPrompt: input.systemPrompt,
          history: input.history,
          message: input.message,
          lang: input.lang,
        }),
    })
  }

  // 2. SambaNova (or any OpenAI-compatible endpoint)
  const compatApiKey = process.env.OPENAI_COMPAT_API_KEY || process.env.SAMBANOVA_API_KEY
  let compatBaseURL = process.env.OPENAI_COMPAT_BASE_URL || ""
  if (!compatBaseURL && process.env.SAMBANOVA_API_KEY) {
    compatBaseURL = process.env.SAMBANOVA_BASE_URL || DEFAULT_SAMBANOVA_BASE_URL
  }

  if (compatApiKey && compatBaseURL) {
    let models = commaList(
      process.env.OPENAI_COMPAT_MODELS || process.env.SAMBANOVA_MODELS
    )
    if (!models.length) {
      models = await discoverModels({ baseURL: compatBaseURL, apiKey: compatApiKey })
    }
    if (!models.length && /sambanova/i.test(compatBaseURL)) {
      models = DEFAULT_SAMBANOVA_MODELS.slice()
    }
    if (models.length) {
      providers.push({
        id: "openai-compatible",
        label: /sambanova/i.test(compatBaseURL) ? "SambaNova" : "OpenAI-compatible API",
        models: models,
        complete: (input) =>
          completeWithOpenAI({
            baseURL: compatBaseURL,
            apiKey: compatApiKey,
            model: input.model,
            systemPrompt: input.systemPrompt,
            history: input.history,
            message: input.message,
          }),
      })
    } else {
      console.warn(
        "[ai] An OpenAI-compatible key is set but no models were found — skipping that provider."
      )
    }
  }

  // 3. Local Ollama — free and unlimited, so it is always the last resort.
  //    Not running is normal: the connection is refused instantly and the
  //    attempt is simply skipped. Set OLLAMA_ENABLED=false to remove it.
  const ollamaDisabled = String(process.env.OLLAMA_ENABLED || "").toLowerCase() === "false"
  if (!ollamaDisabled) {
    const ollamaBaseURL = process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL
    let ollamaModels = commaList(process.env.OLLAMA_MODELS || process.env.OLLAMA_MODEL)

    if (!ollamaModels.length) {
      const discovered = await discoverModels({ baseURL: ollamaBaseURL, apiKey: "" })
      ollamaModels = discovered.length ? discovered.slice(0, 3) : [DEFAULT_OLLAMA_MODEL]
    }

    providers.push({
      id: "ollama",
      label: "Local Ollama",
      models: unique(ollamaModels),
      complete: (input) =>
        completeWithOpenAI({            baseURL: ollamaBaseURL,
            apiKey: "",
            timeoutMs: localTimeoutMs(),
            model: input.model,
          systemPrompt: input.systemPrompt,
          history: input.history,
          message: input.message,
        }),
    })
  }

  return providers
}

function getProviders() {
  if (!providersPromise) providersPromise = buildProviders()
  return providersPromise
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Ask the chain for a reply.
 * @returns {Promise<{reply: string, provider: string, model: string}>}
 * @throws {Error} with .code / .detail / .attempts describing what went wrong
 */
async function generateReply({ systemPrompt, history, message, lang }) {
  const providers = await getProviders()

  if (!providers.length) {
    throw aiError(
      "config",
      "No AI provider is configured. Add GEMINI_API_KEY (free) or SAMBANOVA_API_KEY to .env, or run a local model with Ollama."
    )
  }

  const attempts = []
  const failures = []

  for (const provider of providers) {
    for (const model of provider.models) {
      try {
        const text = await provider.complete({
          systemPrompt: systemPrompt,
          history: history,
          message: message,
          lang: lang,
          model: model,
        })

        if (text && text.trim()) {
          return {
            reply: text.trim(),
            provider: provider.label,
            model: model,
          }
        }

        attempts.push(`${provider.label}/${model}: empty reply`)
        failures.push("unknown")
      } catch (error) {
        const kind = classifyFailure(error)
        const text = errorText(error)
        attempts.push(
          `${provider.label}/${model}: ${kind === "unknown" ? text.slice(0, 140) : kind}`
        )
        failures.push(kind)
        console.warn(
          `[ai] ${provider.label} / ${model} failed (${kind}): ${text.slice(0, 160)}`
        )

        if (kind === "request") {
          // The request itself is malformed — every provider would reject it,
          // so stop instead of burning the remaining free quotas.
          throw aiError("request", `The AI request was rejected: ${text}`, attempts)
        }
      }
    }
  }

  const code = worstFailure(failures)
  throw aiError(code, failureSummary(code, attempts), attempts)
}

/** Human-readable view of the configured chain, for startup logging. */
async function describeProviders() {
  const providers = await getProviders()
  return providers.map((provider) => ({
    provider: provider.label,
    models: provider.models,
  }))
}

// Warm a specific provider (useful for local models that need to load into
// memory). We only warm the local Ollama provider because hosted APIs don't
// need it and warming them would consume quota.
async function warmProviders() {
  try {
    const providers = await getProviders()
    const ollama = providers.find((p) => p.id === "ollama")
    if (!ollama) return

    // Use the first model and send a tiny prompt to force model startup.
    const model = ollama.models && ollama.models[0]
    if (!model) return

    // Fire-and-forget but await briefly so any model loading happens now.
    try {
      await ollama.complete({
        systemPrompt: "",
        history: [],
        message: "Hello",
        lang: "en",
        model: model,
      })
      console.log("[ai] Warmed local Ollama model:", model)
    } catch (err) {
      // Don't treat failures here as fatal — Ollama may be offline.
      console.warn("[ai] Could not warm Ollama:", err && err.message ? err.message : String(err))
    }
  } catch (err) {
    console.warn("[ai] warmProviders failed:", err && err.message ? err.message : String(err))
  }
}

module.exports = { generateReply, describeProviders, warmProviders }
