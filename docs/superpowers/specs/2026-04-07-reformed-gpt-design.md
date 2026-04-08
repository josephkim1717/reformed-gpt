# Reformed GPT — Design Spec

**Date:** 2026-04-07  
**Status:** Approved

---

## Overview

A public web-based chatbot that answers questions about theology, Christianity, and faith from a Reformed/conservative perspective, specifically anchored to the Westminster Standards (Westminster Confession of Faith, Larger Catechism, Shorter Catechism).

---

## Audience

All levels — curious seekers, new Christians, and mature believers alike. The bot infers the user's theological familiarity from how they write and adapts its language accordingly: plain for newcomers, technical vocabulary for advanced users. It never condescends.

---

## Theological Stance

- **Confessional anchor:** Westminster Confession of Faith + Westminster Larger and Shorter Catechisms
- **Disputed questions:** On topics where faithful Reformed Christians legitimately disagree (e.g., eschatology, baptism, Sabbath specifics), the bot presents the main Reformed positions fairly with their strongest arguments. It does not declare a winner.
- **Scope:** Engages with any theology, faith, or Christianity question. No topic is off-limits.

---

## Architecture

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Deployment:** Vercel

### Backend
- **API route:** `/api/chat` — a Next.js Route Handler
- **Streaming:** Vercel AI SDK (`@ai-sdk/react`) with streaming-first responses
- **Model:** Claude (claude-sonnet-4-6)

### State
- Conversation history maintained in React state (in-memory, per session)
- No database, no authentication, no persistent user accounts in v1
- Session resets on page refresh

---

## System Prompt Design

The system prompt encodes the following behaviors:

1. **Identity:** "You are a Reformed theologian and pastor, holding to the Westminster Confession of Faith, Larger Catechism, and Shorter Catechism as your doctrinal standards."
2. **Tone:** Warm, pastoral, and intellectually rigorous. Speak as a knowledgeable friend, not a textbook.
3. **Citations (always required):** Every response must cite:
   - Relevant Scripture (Book Chapter:Verse)
   - WCF chapter/section where applicable
   - Westminster Catechism questions where applicable
   - Reformed theologians by name when quoting or referencing them (Calvin, Owen, Turretin, Hodge, Bavinck, etc.)
4. **Audience adaptation:** The system prompt instructs the model to infer the user's theological familiarity from their vocabulary and phrasing, and to adjust explanation depth and terminology accordingly. This is prompt-driven, not code-driven.
5. **Disputed questions:** Present main Reformed positions fairly. Do not pick a winner.
6. **Scope:** Engage with any theology, faith, or Christianity question.

---

## UI Design

**Layout:** Sidebar + Chat, light parchment theme.

### Sidebar (left, fixed width)
- Topic shortcuts: Scripture, Ecclesiology, Soteriology, Christology, Holy Spirit, Last Things
- "New Chat" button at the bottom

### Chat area (right, main content)
- Parchment/cream background (`#f5f0e8`)
- Serif fonts (Georgia) throughout
- Bot messages: warm cream bubble with gold border, labeled "Reformed GPT"
- User messages: slightly darker cream bubble, right-aligned
- Citations rendered inline below response text in muted gold

### Input
- Full-width text input with gold border
- Send button (dark brown background)
- Send button disabled when input is empty

---

## Data Flow

1. User types a message and submits
2. Client sends `POST /api/chat` with full conversation history array
3. Route handler constructs `[system prompt, ...history, new user message]` and calls Claude via Vercel AI SDK
4. Response streams back token-by-token; UI renders text as it arrives
5. On stream completion, assistant message appended to React state
6. No persistence beyond current browser session

---

## Error Handling

- **API errors:** Display inline error in chat ("Something went wrong — please try again"). User can resend.
- **Empty input:** Send button disabled when input is blank.
- **Streaming interruption:** Show partial response that arrived, offer retry.
- **Rate limiting / abuse:** Not handled in v1.

---

## Out of Scope (v1)

- User accounts or saved conversation history
- Rate limiting or abuse detection
- RAG / vector database for citation grounding
- Mobile-native app
- Embeddable widget mode
