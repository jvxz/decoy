import type { IContent, IEvent, Room } from 'matrix-js-sdk'
import type { RoomMemberEventContent } from 'matrix-js-sdk/lib/types'

import { EventType, KnownMembership, MatrixEvent, RelationType } from 'matrix-js-sdk'

export type FilterMatrixEventPredicate = EventType | string | ((event: MatrixEvent) => boolean)

export function filterMatrixEvents(
  events: MatrixEvent[],
  predicate: FilterMatrixEventPredicate | FilterMatrixEventPredicate[],
  exclude = true,
) {
  const predicates = Array.isArray(predicate) ? predicate : [predicate]

  const matchesAny = (event: MatrixEvent) =>
    predicates.some(p => (typeof p === 'function' ? p(event) : event.getType() === p))

  return events.filter(event => matchesAny(event) !== exclude)
}

export function isEditEvent(event: MatrixEvent) {
  return event.isRelation(RelationType.Replace)
}

export function checkReplyEvent(event: MatrixEvent) {
  return event.replyEventId !== undefined
}

export function getEventContent(event: MatrixEvent | undefined): IContent {
  if (!event) return { body: 'Could not load event content' }

  const content = event.isEncrypted() ? event.getClearContent() : event.getContent()

  if (event.isEncrypted() && content?.msgtype === 'm.bad.encrypted') return { body: 'Unable to decrypt message' }

  if (!content) return { body: 'Could not load event content' }

  return content
}

export function getEventChildren(room: Room, event: MaybeEventOrId) {
  if (!room) return

  const eventId = resolveEventId(event)
  if (!eventId) return

  return room.relations.getAllChildEventsForEvent(eventId)
}

export function getEventRelations(room: Room, event: MaybeEventOrId, relationType: RelationType, eventType: EventType) {
  const eventId = resolveEventId(event)
  if (!eventId) return

  const tl = room.getUnfilteredTimelineSet()

  return tl.relations.getChildEventsForEvent(eventId, relationType, eventType)
}

export type EventReactions = Map<string, Set<MatrixEvent>>
export function getEventReactions(room: Room, event: MaybeEventOrId): EventReactions | undefined {
  const reactions = getEventRelations(room, event, RelationType.Annotation, EventType.Reaction)
  const annotations = reactions?.getSortedAnnotationsByKey()
  if (!annotations) return

  const filteredAnnotations: EventReactions = new Map()
  for (const [reaction, events] of annotations) {
    if (!events.size || typeof reaction !== 'string') continue

    const dedupedMemberEvents = new Map<string, MatrixEvent>() // userId → most recent event
    for (const event of events) {
      if (event.isRedacted()) continue

      const sender = event.getSender()
      if (!sender) continue

      const storedEvent = dedupedMemberEvents.get(sender)
      const storedTs = storedEvent?.getTs()
      if (isUndefined(storedTs)) dedupedMemberEvents.set(sender, event)
      else {
        if (event.getTs() > storedTs) dedupedMemberEvents.set(sender, event)
      }
    }

    if (dedupedMemberEvents.size) filteredAnnotations.set(reaction, new Set(dedupedMemberEvents.values()))
  }

  return filteredAnnotations
}

export function isUserReacting(
  room: Room,
  event: MatrixEvent,
  user: MaybeUserOrId,
  targetReaction: string,
): MatrixEvent | undefined {
  const userId = resolveUserId(user)

  const reactions = getEventReactions(room, event)
  if (!reactions) return

  const annotation = reactions.get(targetReaction)
  if (!annotation) return

  let userReactionEvent: MatrixEvent | undefined
  annotation.forEach(event => {
    if (event.getSender() === userId) userReactionEvent = event
  })

  return userReactionEvent
}

export const isBadEncrypted = (event: MatrixEvent) => event.getContent().msgtype === 'm.bad.encrypted'

export function canDecryptEvent(event: MatrixEvent | Partial<IEvent> | undefined) {
  if (!event) return false

  if (event instanceof MatrixEvent) return event.shouldAttemptDecryption()

  const matrixEvent = new MatrixEvent(event)

  return matrixEvent.shouldAttemptDecryption()
}

type MembershipEventContent = Prettify<
  | MembershipEventBan
  | MembershipEventInvite
  | MembershipEventKnock
  | MembershipEventDisplayName
  | MembershipEventUnban
  | MembershipEventKick
  | MembershipEventUnknown
  | MembershipEventAvatar
  | MembershipEventLeave
  | MembershipEventJoin
>

interface MembershipEventBan {
  type: 'ban'
  data: {
    bannedId: string
    bannedName: string
    bannerId: string
    bannerName: string
  }
}

interface MembershipEventUnban {
  type: 'unban'
  data: {
    unbannedId: string
    unbannedName: string
    unbannerId: string
    unbannerName: string
  }
}

interface MembershipEventKick {
  type: 'kick'
  data: {
    kickedId: string
    kickedName: string
    kickerId: string
    kickerName: string
  }
}

interface MembershipEventDisplayName {
  type: 'displayName'
  data:
    | {
        type: 'changed'
        to: string
        from: string | undefined
        id: string
      }
    | {
        type: 'removed'
        from: string
        id: string
        name: string
      }
}

interface MembershipEventAvatar {
  type: 'avatar'
  data:
    | {
        type: 'changed'
        to: string
        from: string | undefined
        id: string
        name: string
      }
    | {
        type: 'removed'
        from: string
        id: string
        name: string
      }
}

interface MembershipEventLeave {
  type: 'leave'
  data: {
    id: string
    name: string
  }
}

interface MembershipEventJoin {
  type: 'join'
  data: {
    id: string
    name: string
  }
}

interface MembershipEventInvite {
  type: 'invite'
  data: {
    invitedId: string
    invitedName: string
    inviterId: string
    inviterName: string
  }
}

interface MembershipEventKnock {
  type: 'knock'
  data: {
    id: string
    name: string
  }
}

interface MembershipEventUnknown {
  type: 'unknown'
}

export function parseMembershipEvent(event: MatrixEvent): MembershipEventContent {
  const content = event.getContent<RoomMemberEventContent>()
  const prev = event.getPrevContent() as RoomMemberEventContent | undefined

  const sender = event.getSender()
  const subject = event.getStateKey()

  if (!sender || !subject) {
    return {
      type: 'unknown',
    }
  }

  const subjectName = content.displayname ?? getDisplayNameFallback(subject)
  const senderName = getDisplayNameFallback(sender)

  const membership = content.membership
  const prevMembership = prev?.membership

  // membership state transitions take precedence over profile changes
  if (membership !== prevMembership) {
    // ban
    if (membership === KnownMembership.Ban) {
      return {
        data: {
          bannedId: subject,
          bannedName: subjectName,
          bannerId: sender,
          bannerName: senderName,
        },
        type: 'ban',
      }
    }

    // unban (ban -> leave)
    if (membership === KnownMembership.Leave && prevMembership === KnownMembership.Ban) {
      return {
        data: {
          unbannedId: subject,
          unbannedName: subjectName,
          unbannerId: sender,
          unbannerName: senderName,
        },
        type: 'unban',
      }
    }

    // kick (leave where sender !== subject, & not an unban)
    if (membership === KnownMembership.Leave && sender !== subject) {
      return {
        data: {
          kickedId: subject,
          kickedName: subjectName,
          kickerId: sender,
          kickerName: senderName,
        },
        type: 'kick',
      }
    }

    // join
    if (membership === KnownMembership.Join) {
      return {
        data: {
          id: subject,
          name: subjectName,
        },
        type: 'join',
      }
    }

    // leave
    if (membership === KnownMembership.Leave) {
      return {
        data: {
          id: subject,
          name: subjectName,
        },
        type: 'leave',
      }
    }

    // invite
    if (membership === KnownMembership.Invite) {
      return {
        data: {
          invitedId: subject,
          invitedName: subjectName,
          inviterId: sender,
          inviterName: senderName,
        },
        type: 'invite',
      }
    }

    // knock
    if (membership === KnownMembership.Knock) {
      return {
        data: {
          id: sender,
          name: senderName,
        },
        type: 'knock',
      }
    }
  }

  // profile changes (membership stayed the same)
  if (content.displayname !== prev?.displayname) {
    if (!content.displayname && prev?.displayname) {
      return {
        data: {
          from: prev.displayname,
          id: subject,
          name: subjectName,
          type: 'removed',
        },
        type: 'displayName',
      }
    }

    // display name was added or changed from one value to another
    return {
      data: {
        from: prev?.displayname,
        id: subject,
        to: content.displayname!,
        type: 'changed',
      },
      type: 'displayName',
    }
  }

  // avatar
  if (prev?.avatar_url !== content.avatar_url) {
    if (!content.avatar_url && prev?.avatar_url) {
      return {
        data: {
          from: prev.avatar_url,
          id: subject,
          name: subjectName,
          type: 'removed',
        },
        type: 'avatar',
      }
    }

    // avatar was added or changed from one URL to another

    return {
      data: {
        from: prev?.avatar_url,
        id: subject,
        name: subjectName,
        to: content.avatar_url!,
        type: 'changed',
      },
      type: 'avatar',
    }
  }

  return {
    type: 'unknown',
  }
}

// https://github.com/cinnyapp/cinny/blob/098684973ebb28592158efa43e79741ab27afab9/src/app/utils/room.ts#L330-L334
const REPLY_BODY_REG = /^> <.+?> .+\n(>.*\n)*\n/m
export function trimReplyFromBody(body: string): string {
  const match = body.match(REPLY_BODY_REG)
  if (!match) return body

  return body.slice(match[0].length)
}

const REPLY_PREVIEW_BODY_REG = /^(?:```[^\r\n]*\r?\n)?([^\r\n]+)/
export function formatReplyPreviewBody(body: string | undefined) {
  return body?.match(REPLY_PREVIEW_BODY_REG)?.[1] ?? body
}

export function resolveEventId(eventOrId: MaybeEventOrId) {
  return eventOrId instanceof MatrixEvent ? eventOrId.getId() : eventOrId
}
