'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Sidebar } from './Sidebar'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

export function ChatInterface() {
  const [input, setInput] = useState('')

  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  function handleNewChat() {
    setMessages([])
  }

  return (
    <div className="flex h-screen bg-parchment">
      <Sidebar onNewChat={handleNewChat} />
      <main className="flex flex-col flex-1 p-6 overflow-hidden">
        <MessageList messages={messages} />
        {error && (
          <p className="font-serif text-sm text-red-700 text-center py-2 shrink-0">
            Something went wrong — please try again.
          </p>
        )}
        <ChatInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </main>
    </div>
  )
}
