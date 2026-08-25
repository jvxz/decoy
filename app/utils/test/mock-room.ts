import type { Membership } from 'matrix-js-sdk'

import { KnownMembership, MatrixEvent, Room, RoomMember } from 'matrix-js-sdk'
import { generateFakeUserId } from '~~/test/nuxt/utils/matrix/credentials'

const DEFAULT_SENDER = '@test:localhost'
const DEFAULT_START_TS = Date.UTC(2026, 0, 1)

export interface MockRoom {
  room: Room
  members: Map<string, RoomMember>
  pushMessage: (opts?: PushMessageOptions) => MatrixEvent
  addMember: (
    userId: string,
    opts?: Partial<{
      membership: KnownMembership
      powerLevel: number
    }>,
  ) => void
  pushReaction: (target: MatrixEvent, key: string, opts?: PushReactionOptions) => MatrixEvent
  redact: (event: MatrixEvent) => void
  setMemberTyping: (userId: string, typing: boolean) => RoomMember
}

interface PushMessageOptions {
  body?: string
  sender?: string
  ts?: number
  eventId?: string
}

interface PushReactionOptions {
  sender?: string
  ts?: number
  eventId?: string
}

interface CreateMockRoomOptions {
  id: string
  seedMessages?: number
  seedMembers?: number
  alias?: string
}

export function createMockRoom(opts: CreateMockRoomOptions): MockRoom {
  const { id, seedMessages = 0, seedMembers = 0, alias } = opts

  const events: MatrixEvent[] = []
  const annotationsByTarget = new Map<string, Map<string, Set<MatrixEvent>>>()
  const members = new Map<string, RoomMember>()

  let nextTs = DEFAULT_START_TS

  const timelineSet = {
    relations: {
      getChildEventsForEvent: (eventId: string, relType: string, eventType: string) => {
        if (relType !== 'm.annotation' || eventType !== 'm.reaction') return
        const byKey = annotationsByTarget.get(eventId)
        if (!byKey) return
        return {
          getSortedAnnotationsByKey: () => byKey,
          off: () => {},
          on: () => {},
        }
      },
    },
  }

  const room = {
    findEventById: (eventId: string) => events.find(e => e.getId() === eventId),
    getCanonicalAlias: () => alias,
    getDirectionalContent: () => {},
    getJoinedMembers: () => members.values().toArray(),
    getLiveTimeline: () => ({
      getEvents: () => events,
      getPaginationToken: () => 'token',
    }),
    getMember: (userId: string) => {
      const member = members.get(userId)
      if (member) return member

      const stub = new RoomMember(id, userId)
      ;(stub as unknown as { membership: string }).membership = KnownMembership.Join
      return stub
    },
    getMembers: () => [...members.values()],
    getUnfilteredTimelineSet: () => timelineSet,
    loadMembersIfNeeded: async () => {},
    membersLoaded: () => true,
    name: `Mock room: ${id}`,
    off: () => {},
    on: () => {},
    roomId: id,
  } as unknown as Room
  Object.setPrototypeOf(room, Room.prototype)

  const pushMessage: MockRoom['pushMessage'] = (msgOpts = {}) => {
    const i = events.length
    const eventId = msgOpts.eventId ?? `$msg-${id}-${i}`
    const ts = msgOpts.ts ?? nextTs++
    const sender = msgOpts.sender ?? DEFAULT_SENDER
    const body = msgOpts.body ?? `Event ${eventId} (${i})`
    const content = { body, msgtype: 'm.text' }

    const event = mkStubEvent({
      content,
      eventId,
      roomId: id,
      sender,
      ts,
      type: 'm.room.message',
    })
    events.push(event)
    return event
  }

  const pushReaction: MockRoom['pushReaction'] = (target, key, rxOpts = {}) => {
    const targetId = target.getId()
    if (!targetId) throw new Error('pushReaction: target event has no id')

    const i = events.length
    const eventId = rxOpts.eventId ?? `$rx-${id}-${i}`
    const ts = rxOpts.ts ?? nextTs++
    const sender = rxOpts.sender ?? DEFAULT_SENDER
    const content = {
      'm.relates_to': { event_id: targetId, key, rel_type: 'm.annotation' },
    }

    const event = mkStubEvent({
      content,
      eventId,
      roomId: id,
      sender,
      ts,
      type: 'm.reaction',
    })

    let byKey = annotationsByTarget.get(targetId)
    if (!byKey) annotationsByTarget.set(targetId, (byKey = new Map()))
    let set = byKey.get(key)
    if (!set) byKey.set(key, (set = new Set()))
    set.add(event)

    events.push(event)
    return event
  }

  const setMemberTyping: MockRoom['setMemberTyping'] = (userId, typing) => {
    let member = members.get(userId)
    if (!member) {
      member = new RoomMember(id, userId)
      members.set(userId, member)
    }
    ;(member as unknown as { typing: boolean }).typing = typing
    return member
  }

  const redact: MockRoom['redact'] = event => {
    ;(event as unknown as { isRedacted: () => boolean }).isRedacted = () => true
  }

  const addMember: MockRoom['addMember'] = (userId, opts = {}) => {
    const { membership, powerLevel } = opts

    const roomMember = new RoomMember(room.roomId, userId)
    roomMember.membership = membership ?? KnownMembership.Join

    roomMember.powerLevel = powerLevel ?? 0

    members.set(userId, roomMember)
  }

  for (let i = 0; i < seedMessages; i++) {
    const eventId = i === 0 ? 'oldest-event' : i === seedMessages - 1 ? 'newest-event' : undefined
    pushMessage({ eventId })
  }

  for (let i = 0; i < seedMembers; i++) {
    addMember(generateFakeUserId())
  }

  return { addMember, members, pushMessage, pushReaction, redact, room, setMemberTyping }
}

interface MkMembershipEventOpts {
  roomId: string
  userId: string
  membership?: Membership
  displayname?: string
  avatarUrl?: string
  ts?: number
  eventId?: string
}

export function mkMembershipEvent(opts: MkMembershipEventOpts): MatrixEvent {
  const { roomId, userId, membership = KnownMembership.Join, displayname, avatarUrl, ts, eventId } = opts

  return mkStubEvent({
    content: {
      membership,
      ...(displayname && { displayname }),
      ...(avatarUrl && { avatar_url: avatarUrl }),
    },
    eventId: eventId ?? `$membership-${userId}-${Date.now()}`,
    roomId,
    sender: userId,
    ts: ts ?? Date.now(),
    type: 'm.room.member',
  })
}

interface StubEventInput {
  eventId: string
  roomId: string
  sender: string
  ts: number
  type: string
  content: Record<string, unknown>
}

function mkStubEvent(input: StubEventInput): MatrixEvent {
  const { content, eventId, roomId, sender, ts, type } = input

  const event: Partial<Record<keyof MatrixEvent, unknown>> = {
    event: { content, type },
    getClearContent: () => content,
    getContent: () => content,
    getId: () => eventId,
    getRoomId: () => roomId,
    getSender: () => sender,
    getTs: () => ts,
    getType: () => type,
    isBeingDecrypted: () => false,
    isDecryptionFailure: () => false,
    isEncrypted: () => false,
    isRedacted: () => false,
    off: () => {},
    on: () => {},
  }

  const stub = event as unknown as MatrixEvent
  Object.setPrototypeOf(stub, MatrixEvent.prototype)
  return stub
}
