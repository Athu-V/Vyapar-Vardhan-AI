"use client"

import { useEffect, useState } from "react"
import ChatAssistant from "@/components/ChatAssistant"
import { LanguagePickerPopup, useLanguage } from "@/lib/i18n"

/**
 * Homepage = the Meta-AI style conversational assistant.
 *
 * The chatbot greets the user and asks normal questions about their
 * business first. The main white toolkit screens open only as a popup,
 * when the user asks for further / detailed assistance.
 */
export default function Home() {
  const { code, setCode } = useLanguage()
  const [showPicker, setShowPicker] = useState(false)

  // Show the language picker once if the user has not chosen a language yet.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("rba-app-language")
      if (!stored) {
        setShowPicker(true)
      } else {
        // Apply any previously chosen language immediately.
        setCode(stored as Parameters<typeof setCode>[0])
      }
    } catch {
      setShowPicker(false)
    }
  }, [setCode])

  if (!showPicker) {
    return <ChatAssistant />
  }

  return (
    <>
      <ChatAssistant />
      <LanguagePickerPopup
        onChoose={(chosen) => {
          setCode(chosen)
          setShowPicker(false)
        }}
        onDismiss={() => setShowPicker(false)}
      />
    </>
  )
}
