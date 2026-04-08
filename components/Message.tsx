import type { UIMessage } from 'ai'
import ReactMarkdown from 'react-markdown'

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
          if (part.type === 'text') return (
            <ReactMarkdown
              key={i}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ol: ({ children }) => <ol className="list-decimal list-outside ml-4 space-y-2">{children}</ol>,
                ul: ({ children }) => <ul className="list-disc list-outside ml-4 space-y-2">{children}</ul>,
                li: ({ children }) => <li className="leading-snug">{children}</li>,
                strong: ({ children }) => <strong className="font-bold text-brown">{children}</strong>,
              }}
            >
              {part.text}
            </ReactMarkdown>
          )
          return null
        })}
      </div>
    </div>
  )
}
