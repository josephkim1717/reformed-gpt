import { POST } from '@/app/api/chat/route'

const mockToUIMessageStreamResponse = jest.fn().mockReturnValue(new Response('ok'))
const mockStreamText = jest.fn().mockReturnValue({
  toUIMessageStreamResponse: mockToUIMessageStreamResponse,
})

jest.mock('ai', () => ({
  streamText: (...args: unknown[]) => mockStreamText(...args),
}))

describe('POST /api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStreamText.mockReturnValue({ toUIMessageStreamResponse: mockToUIMessageStreamResponse })
    mockToUIMessageStreamResponse.mockReturnValue(new Response('ok'))
  })

  it('returns a Response', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', parts: [{ type: 'text', text: 'What is grace?' }] }] }),
    })
    const response = await POST(req)
    expect(response).toBeInstanceOf(Response)
  })

  it('calls streamText with the system prompt', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', parts: [{ type: 'text', text: 'Hello' }] }] }),
    })
    await POST(req)
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('Westminster Confession of Faith'),
      })
    )
  })

  it('passes conversation history to streamText', async () => {
    const messages = [
      { role: 'user', parts: [{ type: 'text', text: 'What is grace?' }] },
      { role: 'assistant', parts: [{ type: 'text', text: 'Grace is...' }] },
    ]
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    })
    await POST(req)
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({ messages })
    )
  })
})
