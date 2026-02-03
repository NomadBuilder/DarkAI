'use client'

import { useState } from 'react'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Ask a question (site sources only).',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const suggestedQuestions = [
    'What is Bill 60 and why does it matter?',
    'What does Bill 5 change for species protection?',
    'Where can I find the sources for the Greenbelt issue?',
    'What protests are listed right now?',
  ]
  const hasUserMessage = messages.some((msg) => msg.role === 'user')

  const sendMessage = async (override?: string) => {
    const trimmed = (override ?? input).trim()
    if (!trimmed || loading) return

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })
      const data = await res.json()
      const reply = data?.answer || 'Sorry — I could not generate a response.'
      setMessages([...nextMessages, { role: 'assistant', content: reply }])
    } catch {
      setMessages([
        ...nextMessages,
        { role: 'assistant', content: 'Sorry — something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-widget fixed bottom-5 right-5 z-[90]">
      {isOpen ? (
        <div className="w-[320px] sm:w-[360px] rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <img src="/shield-icon.png" alt="" className="h-5 w-5" />
              <div className="leading-tight">
                <span className="text-sm font-light block">Assistant</span>
                <span className="text-[11px] text-slate-300">Answers from site sources only.</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-lg leading-none"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div className="max-h-[320px] overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={`rounded-xl px-3 py-2 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-50 text-blue-900 self-end'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="rounded-xl px-3 py-2 bg-slate-100 text-slate-500">Thinking…</div>
            )}
          </div>
          <div className="border-t border-slate-200 px-3 py-2 space-y-2">
            {!hasUserMessage && (
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                    className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    disabled={loading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage()
              }}
              placeholder="Ask about Protect Ontario…"
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading}
              className="px-3 py-2 text-sm rounded-lg bg-[#2E4A6B] text-white hover:bg-[#243d56] disabled:opacity-60"
            >
              Send
            </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-[#2E4A6B] text-white px-4 py-3 shadow-lg hover:bg-[#243d56] transition-colors flex items-center gap-2"
        >
          <img src="/shield-icon.png" alt="" className="h-4 w-4" />
          Assistant
        </button>
      )}
    </div>
  )
}
