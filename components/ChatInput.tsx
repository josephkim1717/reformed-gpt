interface ChatInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const isDisabled = isLoading || !value.trim()

  return (
    <form
      role="form"
      onSubmit={onSubmit}
      className="flex gap-2 border-t border-gold/30 pt-4 mt-2 shrink-0"
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Ask a theological question..."
        disabled={isLoading}
        className="flex-1 bg-white border border-gold/40 rounded-md px-3 py-2 font-serif text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
      />
      <button
        type="submit"
        disabled={isDisabled}
        className="bg-brown text-parchment-light font-serif text-sm px-4 py-2 rounded-md hover:bg-brown/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </form>
  )
}
