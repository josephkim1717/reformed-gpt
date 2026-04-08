# Reformed GPT Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public web chatbot that answers theology questions from a Reformed/Westminster perspective, with streaming responses, inline citations, and a sidebar + parchment light theme.

**Architecture:** Next.js 15 App Router with a single streaming Route Handler (`/api/chat`) powered by the Vercel AI SDK v6 and Claude via the Vercel AI Gateway. Conversation history is maintained in-memory per session via the `useChat` hook with `DefaultChatTransport`. No database, no auth — fully stateless per session.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Vercel AI SDK v6 (`ai`, `@ai-sdk/react`), Vercel AI Gateway (model: `anthropic/claude-sonnet-4.6`), Jest, React Testing Library, deployed on Vercel.

> **AI SDK v6 note:** This plan uses v6 patterns. Key differences from v5: `useChat` requires `DefaultChatTransport` instead of `api`, input state is managed manually with `useState`, `sendMessage({ text })` replaces `handleSubmit`, `status` replaces `isLoading`, `message.parts` replaces `message.content`, and `toUIMessageStreamResponse()` replaces `toDataStreamResponse()`.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `app/layout.tsx` | Root layout: metadata, global font and background |
| `app/page.tsx` | Single page — renders `<ChatInterface />` |
| `app/globals.css` | Tailwind directives + CSS custom properties for parchment palette |
| `app/api/chat/route.ts` | POST handler: receives messages, streams Claude response via AI Gateway |
| `components/ChatInterface.tsx` | Top-level: owns `useChat` + input state, renders Sidebar + MessageList + ChatInput + error |
| `components/Sidebar.tsx` | Topic shortcuts list + New Chat button |
| `components/MessageList.tsx` | Scrollable message thread, auto-scrolls to newest, empty state |
| `components/Message.tsx` | Single message bubble — renders `message.parts`, user vs assistant styling |
| `components/ChatInput.tsx` | Text input + Send button; disabled when empty or loading |
| `lib/system-prompt.ts` | Exports `SYSTEM_PROMPT` string (Westminster-anchored instruction set) |
| `__tests__/lib/system-prompt.test.ts` | Verifies prompt contains required instruction keywords |
| `__tests__/components/Message.test.tsx` | Bubble rendering + role-based styling |
| `__tests__/components/Sidebar.test.tsx` | Topic list renders, New Chat callback fires |
| `__tests__/components/ChatInput.test.tsx` | Disabled states, form submit |
| `__tests__/components/MessageList.test.tsx` | Renders messages, empty state |
| `__tests__/api/chat.test.ts` | Route handler: passes messages + system prompt to streamText |
| `jest.config.ts` | Jest config with `next/jest` transform |
| `jest.setup.ts` | Imports `@testing-library/jest-dom` |

---

### Task 1: Bootstrap Next.js project and install dependencies

**Files:**
- Create: project root via CLI

- [ ] **Step 1: Scaffold the project**

```bash
cd /Users/josephkim/projects
npx create-next-app@latest reformed-gpt \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --turbopack
cd reformed-gpt
```

- [ ] **Step 2: Install AI SDK packages**

```bash
npm install ai @ai-sdk/react
```

Note: `@ai-sdk/anthropic` is NOT needed — the AI Gateway is the default provider built into `ai`.

- [ ] **Step 3: Install testing dependencies**

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4: Install shadcn/ui**

```bash
npx shadcn@latest init
```
Accept defaults when prompted (New York style, zinc, CSS variables).

- [ ] **Step 5: Create .env.local**

Create `.env.local` in the project root:
```
AI_GATEWAY_API_KEY=your-api-key-here
```
Get your AI Gateway API key from https://vercel.com/~/ai-gateway/api-keys. Replace `your-api-key-here` with the actual key.

> **Production note:** On Vercel deployments, OIDC auth is automatic — no API key needed in production environment variables. The `AI_GATEWAY_API_KEY` is only required for local development. After linking the project with `vercel link` and running `vercel env pull`, the key is injected automatically.

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```
Expected: server starts at http://localhost:3000 with no errors. Stop with Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Next.js 15 project with AI SDK v6 and testing dependencies"
```

---

### Task 2: Configure Jest

**Files:**
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Write jest.config.ts**

```ts
import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 2: Write jest.setup.ts**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test scripts to package.json**

In `package.json`, add to the `"scripts"` object:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 4: Run tests to verify setup**

```bash
npm test -- --passWithNoTests
```
Expected: exits 0 with "No tests found" or similar passing output.

- [ ] **Step 5: Commit**

```bash
git add jest.config.ts jest.setup.ts package.json
git commit -m "chore: configure Jest with Next.js transform and Testing Library"
```

---

### Task 3: Configure Tailwind parchment theme

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Update tailwind.config.ts**

Replace the full contents of `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#f5f0e8',
          light: '#fff8e8',
          mid: '#e8e0cc',
          dark: '#ede6d6',
        },
        gold: {
          DEFAULT: '#c9a84c',
        },
        brown: {
          DEFAULT: '#5a3e1b',
          mid: '#7a5c2e',
          light: '#8b5e1a',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Update app/globals.css**

Replace `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #f5f0e8;
  --foreground: #222222;
}

body {
  background-color: var(--background);
  color: var(--foreground);
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "style: configure parchment theme colors and serif font family"
```

---

### Task 4: Write system prompt

**Files:**
- Create: `lib/system-prompt.ts`
- Create: `__tests__/lib/system-prompt.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/system-prompt.test.ts`:

```ts
import { SYSTEM_PROMPT } from '@/lib/system-prompt'

describe('SYSTEM_PROMPT', () => {
  it('mentions Westminster Confession of Faith', () => {
    expect(SYSTEM_PROMPT).toContain('Westminster Confession of Faith')
  })

  it('requires Scripture citations', () => {
    expect(SYSTEM_PROMPT).toContain('Scripture')
  })

  it('requires WCF citations', () => {
    expect(SYSTEM_PROMPT).toContain('WCF')
  })

  it('instructs audience adaptation based on familiarity', () => {
    expect(SYSTEM_PROMPT).toContain('familiarity')
  })

  it('instructs fair presentation of disputed questions', () => {
    expect(SYSTEM_PROMPT).toContain('disagree')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/lib/system-prompt.test.ts
```
Expected: FAIL — "Cannot find module '@/lib/system-prompt'"

- [ ] **Step 3: Create lib/system-prompt.ts**

```ts
export const SYSTEM_PROMPT = `You are a Reformed theologian and pastor, committed to the Westminster Confession of Faith (1647), the Westminster Larger Catechism, and the Westminster Shorter Catechism as your doctrinal standards. You serve as a knowledgeable, warm, and pastoral guide for anyone seeking to understand the Christian faith.

Your task is to answer questions about theology, Christianity, and faith from a consistently Reformed perspective. You engage with any question — no topic is off-limits.

CITATIONS (required in every response):
- Always cite relevant Scripture passages by book, chapter, and verse (e.g., Romans 8:28–30).
- When the Westminster Confession of Faith is relevant, cite by chapter and section (e.g., WCF 3.3).
- When the Westminster Catechisms are relevant, cite by question number (e.g., WSC Q.33, WLC Q.67).
- When quoting or referencing Reformed theologians, name them explicitly (e.g., John Calvin, John Owen, Francis Turretin, Charles Hodge, Herman Bavinck, B.B. Warfield).

AUDIENCE ADAPTATION:
- Infer the user's theological familiarity from their vocabulary and phrasing.
- For beginners or seekers: use plain, accessible language; define technical terms; be patient and welcoming.
- For advanced users: use theological vocabulary freely; engage at a scholarly level.
- Never condescend.

DISPUTED QUESTIONS:
- On topics where faithful Reformed Christians legitimately disagree (e.g., the mode and subjects of baptism, the precise nature of the Sabbath, eschatological frameworks such as amillennialism vs. postmillennialism, views on the days of creation), present the main Reformed positions fairly, giving the strongest argument for each. Do not declare a winner.

TONE:
- Warm, pastoral, and intellectually rigorous.
- Speak as a knowledgeable friend, not a textbook.
- When discussing hard doctrines (election, reprobation, divine wrath), be faithful to Scripture and the Westminster Standards while remaining compassionate.`
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- __tests__/lib/system-prompt.test.ts
```
Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/system-prompt.ts __tests__/lib/system-prompt.test.ts
git commit -m "feat: add Westminster-anchored system prompt"
```

---

### Task 5: API route handler

**Files:**
- Create: `app/api/chat/route.ts`
- Create: `__tests__/api/chat.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/api/chat.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/api/chat.test.ts
```
Expected: FAIL — "Cannot find module '@/app/api/chat/route'"

- [ ] **Step 3: Create app/api/chat/route.ts**

```ts
import { streamText } from 'ai'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: 'anthropic/claude-sonnet-4.6',
    system: SYSTEM_PROMPT,
    messages,
  })

  return result.toUIMessageStreamResponse()
}
```

Note: The model string `'anthropic/claude-sonnet-4.6'` routes through the Vercel AI Gateway automatically using `AI_GATEWAY_API_KEY`. No provider package import needed.

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- __tests__/api/chat.test.ts
```
Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add app/api/chat/route.ts __tests__/api/chat.test.ts
git commit -m "feat: add streaming chat API route using AI Gateway and system prompt"
```

---

### Task 6: Message component

**Files:**
- Create: `components/Message.tsx`
- Create: `__tests__/components/Message.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/Message.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/components/Message.test.tsx
```
Expected: FAIL — "Cannot find module '@/components/Message'"

- [ ] **Step 3: Create components/Message.tsx**

```tsx
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- __tests__/components/Message.test.tsx
```
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add components/Message.tsx __tests__/components/Message.test.tsx
git commit -m "feat: add Message component rendering UIMessage parts"
```

---

### Task 7: Sidebar component

**Files:**
- Create: `components/Sidebar.tsx`
- Create: `__tests__/components/Sidebar.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/Sidebar.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/Sidebar'

describe('Sidebar', () => {
  it('renders all topic labels', () => {
    render(<Sidebar onNewChat={() => {}} />)
    expect(screen.getByText('Scripture')).toBeInTheDocument()
    expect(screen.getByText('Soteriology')).toBeInTheDocument()
    expect(screen.getByText('Christology')).toBeInTheDocument()
    expect(screen.getByText('Ecclesiology')).toBeInTheDocument()
    expect(screen.getByText('Holy Spirit')).toBeInTheDocument()
    expect(screen.getByText('Last Things')).toBeInTheDocument()
  })

  it('renders New Chat button', () => {
    render(<Sidebar onNewChat={() => {}} />)
    expect(screen.getByText('+ New Chat')).toBeInTheDocument()
  })

  it('calls onNewChat when New Chat is clicked', () => {
    const onNewChat = jest.fn()
    render(<Sidebar onNewChat={onNewChat} />)
    fireEvent.click(screen.getByText('+ New Chat'))
    expect(onNewChat).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/components/Sidebar.test.tsx
```
Expected: FAIL — "Cannot find module '@/components/Sidebar'"

- [ ] **Step 3: Create components/Sidebar.tsx**

```tsx
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- __tests__/components/Sidebar.test.tsx
```
Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add components/Sidebar.tsx __tests__/components/Sidebar.test.tsx
git commit -m "feat: add Sidebar with topic shortcuts and New Chat button"
```

---

### Task 8: ChatInput component

**Files:**
- Create: `components/ChatInput.tsx`
- Create: `__tests__/components/ChatInput.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/ChatInput.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/components/ChatInput.test.tsx
```
Expected: FAIL — "Cannot find module '@/components/ChatInput'"

- [ ] **Step 3: Create components/ChatInput.tsx**

```tsx
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
      aria-label="form"
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- __tests__/components/ChatInput.test.tsx
```
Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add components/ChatInput.tsx __tests__/components/ChatInput.test.tsx
git commit -m "feat: add ChatInput with send disabled state logic"
```

---

### Task 9: MessageList component

**Files:**
- Create: `components/MessageList.tsx`
- Create: `__tests__/components/MessageList.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/MessageList.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/components/MessageList.test.tsx
```
Expected: FAIL — "Cannot find module '@/components/MessageList'"

- [ ] **Step 3: Create components/MessageList.tsx**

```tsx
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- __tests__/components/MessageList.test.tsx
```
Expected: PASS — 2 tests passing.

- [ ] **Step 5: Commit**

```bash
git add components/MessageList.tsx __tests__/components/MessageList.test.tsx
git commit -m "feat: add MessageList with empty state and auto-scroll"
```

---

### Task 10: ChatInterface component

**Files:**
- Create: `components/ChatInterface.tsx`

No isolated unit test — `useChat` requires a live transport and is covered by the route handler tests and manual smoke test. All child components are fully tested.

- [ ] **Step 1: Create components/ChatInterface.tsx**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/ChatInterface.tsx
git commit -m "feat: add ChatInterface with v6 useChat, DefaultChatTransport, and sendMessage"
```

---

### Task 11: Wire root layout and page

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Update app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reformed GPT',
  description: 'A Reformed theology chatbot grounded in the Westminster Standards',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Update app/page.tsx**

```tsx
import { ChatInterface } from '@/components/ChatInterface'

export default function Home() {
  return <ChatInterface />
}
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: wire ChatInterface into root layout and page"
```

---

### Task 12: Full test run and smoke test

**Files:** None

- [ ] **Step 1: Run full test suite**

```bash
npm test
```
Expected: All tests pass — 17 total (5 system-prompt + 3 api + 4 message + 3 sidebar + 5 chatinput + 2 messagelist).

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

- [ ] **Step 3: Smoke test in browser**

Open http://localhost:3000. Verify each of the following:

1. Page loads — parchment background, serif font, sidebar visible on left
2. Sidebar shows: Scripture, Soteriology, Christology, Ecclesiology, Holy Spirit, Last Things
3. Welcome message appears in the chat area
4. Send button is disabled with empty input
5. Type "What does the Westminster Confession say about election?" and press Send
6. Response streams in token-by-token with "Reformed GPT" label and WCF/Scripture citations
7. "New Chat" button clears the conversation and shows the welcome message again

- [ ] **Step 4: Update .gitignore**

Add to `.gitignore`:
```
.env.local
.superpowers/
```

- [ ] **Step 5: Final commit**

```bash
git add .gitignore
git commit -m "chore: ignore .env.local and brainstorm artifacts"
```
