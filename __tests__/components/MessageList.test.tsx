import { render, screen } from '@testing-library/react'
import { MessageList } from '@/components/MessageList'
import type { UIMessage } from 'ai'

const messages = [
  {
    id: '1',
    role: 'user' as const,
    parts: [{ type: 'text' as const, text: 'What is justification?' }],
  },
  {
    id: '2',
    role: 'assistant' as const,
    parts: [{ type: 'text' as const, text: 'Justification is an act of God... [WSC Q.33]' }],
  },
] as UIMessage[]

describe('MessageList', () => {
  it('renders all messages', () => {
    render(<MessageList messages={messages} />)
    expect(screen.getByText('What is justification?')).toBeInTheDocument()
    expect(screen.getByText(/Justification is an act/)).toBeInTheDocument()
  })

  it('renders welcome message when no messages', () => {
    render(<MessageList messages={[]} />)
    expect(screen.getByText(/Welcome/)).toBeInTheDocument()
  })
})
