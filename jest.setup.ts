import '@testing-library/jest-dom'

// Polyfill Request and Response for jsdom environment
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    public method: string
    public url: string
    public body?: string

    constructor(url: string, options?: { method?: string; body?: string }) {
      this.url = url
      this.method = options?.method || 'GET'
      this.body = options?.body
    }

    async json() {
      return JSON.parse(this.body || '{}')
    }
  } as any
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(public body: unknown) {}
    async text() {
      return String(this.body)
    }
  } as any
}
