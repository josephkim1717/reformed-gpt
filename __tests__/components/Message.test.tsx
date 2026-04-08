import { render, screen } from '@testing-library/react'
import { Message } from '@/components/Message'
import type { UIMessage } from 'ai'

const userMessage = {
  id: '1',
  role: 'user' as const,
  parts: [{ type: 'text' as const, text: 'What is election?' }],
} as UIMessage

const assistantMessage = {
  id: '2',
  role: 'assistant' as const,
  parts: [{ type: 'text' as const, text: 'Election is the sovereign choice of God... [WCF 3.3]' }],
} as UIMessage

describe('Message', () => {
  it('renders user message content from parts', () => {
    render(<Message message={userMessage} />)
    expect(screen.getByText('What is election?')).toBeInTheDocument()
  })

  it('renders assistant message content from parts', () => {
    render(<Message message={assistantMessage} />)
    expect(screen.getByText(/Election is the sovereign/)).toBeInTheDocument()
  })

  it('shows "Reformed GPT" label for assistant messages', () => {
    render(<Message message={assistantMessage} />)
    expect(screen.getByText('Reformed GPT')).toBeInTheDocument()
  })

  it('does not show "Reformed GPT" label for user messages', () => {
    render(<Message message={userMessage} />)
    expect(screen.queryByText('Reformed GPT')).not.toBeInTheDocument()
  })
})
