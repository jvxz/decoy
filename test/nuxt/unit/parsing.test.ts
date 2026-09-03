import { describe, expect, it } from 'vitest'

import { parseMembershipEvent } from '../../../app/utils/matrix/events'
import { generateMembershipEvents } from '../utils/matrix/events'

const events = generateMembershipEvents(128)

describe('parsing', () => {
  it('correctly parses membership events', () => {
    const parsed = events.map(parseMembershipEvent)

    const types = parsed.map(e => e.type)

    expect.soft(types).not.toContain('unknown')
  })

  it('correctly parses matrix.to urls', () => {
    expect(parseMatrixToUrl('https://matrix.to/#/!roomid:example.com?via=example.com')).toMatchObject({
      type: 'roomId',
      via: ['example.com'],
    })

    expect(parseMatrixToUrl('https://matrix.to/#/@userid:matrix.org')).toMatchObject({
      type: 'userId',
    })

    expect(parseMatrixToUrl('https://matrix.to/#/#roomalias:matrix.org')).toMatchObject({
      type: 'roomAlias',
    })

    expect(parseMatrixToUrl('https://matrix.to/#/#roomalias:matrix.org/$eventid')).toMatchObject({
      type: 'event',
    })
  })
})
