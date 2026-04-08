import { render, screen, fireEvent } from '@testing-library/react'
import { ChatInput } from '@/components/ChatInput'

describe('ChatInput', () => {
  it('renders the input field', () => {
    render(<ChatInput value="" onChange={() => {}} onSubmit={() => {}} isLoading={false} />)
    expect(screen.getByPlaceholderText('Ask a theological question...')).toBeInTheDocument()
  })

  it('send button is disabled when input is empty', () => {
    render(<ChatInput value="" onChange={() => {}} onSubmit={() => {}} isLoading={false} />)
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled()
  })

  it('send button is enabled when input has text', () => {
    render(<ChatInput value="What is grace?" onChange={() => {}} onSubmit={() => {}} isLoading={false} />)
    expect(screen.getByRole('button', { name: /send/i })).not.toBeDisabled()
  })

  it('send button is disabled when isLoading is true', () => {
    render(<ChatInput value="Hello" onChange={() => {}} onSubmit={() => {}} isLoading={true} />)
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled()
  })

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = jest.fn((e: React.FormEvent) => e.preventDefault())
    render(<ChatInput value="Hello" onChange={() => {}} onSubmit={onSubmit} isLoading={false} />)
    fireEvent.submit(screen.getByRole('form'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
