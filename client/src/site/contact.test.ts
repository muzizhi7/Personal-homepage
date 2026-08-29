import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('./Contact.tsx', import.meta.url), 'utf8')
const chipsStart = source.indexOf('<div className="flex flex-wrap items-center justify-center gap-4">')
const chipsEnd = source.indexOf('</div>', chipsStart)
const chips = source.slice(chipsStart, chipsEnd)

test('does not render the email address as a duplicate contact chip', () => {
  assert.doesNotMatch(chips, /ContactChip icon="mail"/)
  assert.match(source, /<SiteButton href=\{c\.cta\.href\}/)
})
