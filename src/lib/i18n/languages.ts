export const APP_LANGUAGES = [
  { code: "en", name: "English", native: "English", script: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी", script: "Devanagari" },
  { code: "mr", name: "Marathi", native: "मराठी", script: "Devanagari" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", script: "Gurmukhi" },
  { code: "bn", name: "Bengali", native: "বাংলা", script: "Bengali" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", script: "Gujarati" },
  { code: "ta", name: "Tamil", native: "தமிழ்", script: "Tamil" },
  { code: "te", name: "Telugu", native: "తెలుగు", script: "Telugu" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", script: "Malayalam" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", script: "Kannada" },
] as const

export type AppLanguageCode = (typeof APP_LANGUAGES)[number]["code"]
