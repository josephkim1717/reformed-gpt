import type { UIMessage } from 'ai'

interface MessageProps {
  message: UIMessage
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}>
      {!isUser && (
        <span className="text-brown font-serif font-bold text-sm">Reformed GPT</span>
      )}
      <div
        className={`
          max-w-[85%] rounded-lg px-4 py-3 font-serif text-sm leading-relaxed
          ${isUser
            ? 'bg-parchment-mid text-stone-800'
            : 'bg-parchment-light border border-gold/30 text-stone-700'
          }
        `}
      >
        {message.parts.map((part, i) => {
          if (part.type === 'text') return <span key={i}>{part.text}</span>
          return null
        })}
      </div>
    </div>
  )
}
