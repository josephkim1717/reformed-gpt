'use client'

import { useEffect, useRef } from 'react'
import type { UIMessage } from 'ai'
import { Message } from './Message'

interface MessageListProps {
  messages: UIMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-serif text-brown-mid text-sm text-center max-w-sm leading-relaxed">
          Welcome. I&apos;m here to help you explore the Christian faith from a Reformed perspective,
          grounded in the Westminster Standards. What would you like to discuss?
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 pb-2">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
