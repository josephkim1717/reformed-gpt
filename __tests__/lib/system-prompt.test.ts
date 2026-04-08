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
