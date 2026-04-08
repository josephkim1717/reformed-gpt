const TOPICS = [
  { label: 'Scripture', emoji: '📖' },
  { label: 'Soteriology', emoji: '🙏' },
  { label: 'Christology', emoji: '✝️' },
  { label: 'Ecclesiology', emoji: '⛪' },
  { label: 'Holy Spirit', emoji: '🕊️' },
  { label: 'Last Things', emoji: '⚖️' },
]

interface SidebarProps {
  onNewChat: () => void
}

export function Sidebar({ onNewChat }: SidebarProps) {
  return (
    <aside className="w-40 bg-parchment-dark border-r border-gold/30 flex flex-col py-4 px-3 gap-1 shrink-0">
      <span className="font-serif font-bold text-brown text-sm mb-2">Topics</span>
      {TOPICS.map(({ label, emoji }) => (
        <button
          key={label}
          className="text-left text-brown-mid font-serif text-xs px-2 py-1.5 rounded hover:bg-parchment transition-colors"
        >
          {emoji} {label}
        </button>
      ))}
      <div className="mt-auto pt-3 border-t border-gold/30">
        <button
          onClick={onNewChat}
          className="text-brown-light font-serif text-xs hover:text-brown transition-colors"
        >
          + New Chat
        </button>
      </div>
    </aside>
  )
}
