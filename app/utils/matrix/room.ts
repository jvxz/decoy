import type { MatrixClient, MatrixEvent } from 'matrix-js-sdk'
import type { IHierarchyRoom } from 'matrix-js-sdk/lib/@types/spaces'

import { JoinRule } from 'matrix-js-sdk'
import { EventTimeline, EventType, KnownMembership, Room } from 'matrix-js-sdk'

import type { MaybeRoomOrId, MaybeUserOrId } from './types'

import { mxcToHttps } from './mxc-to-https'
import { resolveUserId } from './user'

interface MDirect extends MatrixEvent {
  event: {
    type: 'm.direct'
    content: Record<string, string[]>
  }
}

export interface GetAvatarUrlOpts {
  client: MatrixClient
  room: Room
  useAuthentication?: boolean
  size?: 32 | 96
  mxc?: boolean
}
export interface RoomsWithBatchToken {
  nextBatchToken?: string
  rooms: IHierarchyRoom[]
}

export async function joinRoom(client: MatrixClient, roomId: string, via?: string[], inviteSignUrl?: string) {
  return client.joinRoom(roomId, { inviteSignUrl, viaServers: via && via.length ? via : undefined })
}

export function getRoom(client: MatrixClient, roomId: Room['roomId'], allowedIds?: MaybeReadonlySet<Room['roomId']>) {
  if (!allowedIds) return client.getRoom(roomId)

  if (allowedIds.has(roomId)) return client.getRoom(roomId)

  return undefined
}

export function getDirectRooms(client: MatrixClient) {
  const directsEvent = client.getAccountData(EventType.Direct) as MDirect | undefined
  const directs = directsEvent?.getContent<MDirect['event']['content']>()
  if (!directs) return []

  const structuredDirects: { userId: string; roomId: string }[] = []
  for (const [userId, roomIds] of objectEntries(directs)) {
    roomIds.forEach(roomId => structuredDirects.push({ roomId, userId }))
  }

  return structuredDirects
}

export function getStateEvents(room: Room, eventType: EventType): MatrixEvent[] {
  return room.getLiveTimeline().getState(EventTimeline.FORWARDS)?.getStateEvents(eventType) ?? []
}

export function getRoomAvatarUrl({
  client,
  mxc = false,
  room,
  size = 32,
  useAuthentication = false,
}: GetAvatarUrlOpts): string | undefined {
  const mxcUrl = room.getMxcAvatarUrl()
  return mxcUrl
    ? mxc
      ? mxcUrl
      : (mxcToHttps(mxcUrl, {
          allowDirectLinks: false,
          allowRedirects: true,
          baseUrl: client.getHomeserverUrl(),
          height: size,
          resizeMethod: 'crop',
          useAuthentication,
          width: size,
        }) ?? undefined)
    : undefined
}

export function getDirectRoomAvatarUrl({
  client,
  mxc = false,
  room,
  size = 32,
  useAuthentication = false,
}: GetAvatarUrlOpts): string | undefined {
  const mxcUrl = room.getAvatarFallbackMember()?.getMxcAvatarUrl()

  if (!mxcUrl) return getRoomAvatarUrl({ client, mxc, room, size, useAuthentication })

  return mxc
    ? mxcUrl
    : mxcToHttps(mxcUrl, {
        allowDirectLinks: false,
        allowRedirects: true,
        baseUrl: client.getHomeserverUrl(),
        height: size,
        resizeMethod: 'crop',
        useAuthentication,
        width: size,
      })
}

export async function getSpaceRooms(
  client: MatrixClient,
  space: Room,
  nextBatchToken?: string,
): Promise<RoomsWithBatchToken> {
  if (!space.isSpaceRoom()) {
    return {
      nextBatchToken: undefined,
      rooms: [],
    }
  }

  const spaceState = space.getLiveTimeline().getState(EventTimeline.FORWARDS)
  if (!spaceState) {
    console.warn('No room state found when getting space children')
    return {
      nextBatchToken: undefined,
      rooms: [],
    }
  }

  if (!nextBatchToken) {
    const res = await client.getRoomHierarchy(space.roomId, 50)

    return {
      nextBatchToken: res.next_batch,
      rooms: res.rooms,
    }
  }

  const res = await client.getRoomHierarchy(space.roomId, 50, undefined, false, nextBatchToken)

  return {
    nextBatchToken: res.next_batch,
    rooms: res.rooms,
  }
}

export function getJoinedRooms(client: MatrixClient, space: Room | undefined) {
  const events = space?.getLiveTimeline().getState(EventTimeline.FORWARDS)?.getStateEvents(EventType.SpaceChild)
  if (!events) return []

  const joined: Room[] = []
  for (const event of events) {
    const roomData = client.getRoom(event.getStateKey())
    if (!roomData || roomData.getMyMembership() !== KnownMembership.Join) continue

    joined.push(roomData)
  }

  return joined
}

export function getMember(client: MatrixClient, userId: string | undefined, roomId: string | undefined) {
  if (!roomId || !userId) return

  const room = client.getRoom(roomId)
  if (!room) return

  const member = room.getMember(userId)
  if (!member) return

  const displayName = getRoomMemberDisplayName(room, userId)
  if (!displayName) return

  const avatarUrl = mxcToHttps(member.getMxcAvatarUrl() ?? undefined, {
    allowRedirects: true,
    baseUrl: client.getHomeserverUrl(),
    height: 400,
    resizeMethod: 'scale',
    useAuthentication: true,
    width: 400,
  })

  return {
    ...member,
    avatarUrl,
    displayName,
  }
}

export function getRoomMemberDisplayName(room: Room, userId: string | undefined) {
  if (!userId) return undefined

  const member = room.getMember(userId)

  const name = member?.name

  return name === userId ? undefined : name
}

export async function getRoomEventById(room: Room, client: MatrixClient, eventId: string) {
  const cachedEvent = room.findEventById(eventId)
  if (cachedEvent) return cachedEvent

  const eventData = await client.fetchRoomEvent(room.roomId, eventId)
  const mapper = client.getEventMapper()

  const mapped = mapper(eventData)

  return mapped
}

export function getInviter(room: Room | undefined, myUserId: string | undefined) {
  if (!room || !myUserId) return

  const me = room.getMember(myUserId)
  const memberEvent = me?.events.member
  return memberEvent?.getContent().membership === KnownMembership.Invite ? memberEvent.getSender() : undefined
}

export function getPowerLevelName(powerLevel: number | undefined, ownerIsAdmin = false): PowerLevelName {
  if (isNil(powerLevel)) return 'unknown'

  if (powerLevel < 50) return 'member'

  if (powerLevel < 100) return 'moderator'

  if (powerLevel !== Infinity) return 'admin'

  return ownerIsAdmin ? 'admin' : 'owner'
}

export async function getMutualRooms(client: MatrixClient, otherUser: MaybeUserOrId | undefined, throwOnError = false) {
  try {
    if (!otherUser) return

    const otherUserId = resolveUserId(otherUser)
    return client._unstable_getSharedRooms(otherUserId)
  } catch {
    if (throwOnError) throw new $Error({ message: 'Failed to get mutual rooms', title: 'Unexpected error' })
  }
}

// https://github.com/cinnyapp/cinny/blob/098684973ebb28592158efa43e79741ab27afab9/src/app/utils/room.ts#L96-L100
export function isSpaceChild(event: MatrixEvent) {
  return event.getType() === EventType.SpaceChild && Array.isArray(event.getContent().via)
}

export function isDirectRoom(client: MatrixClient, room: Room) {
  return getDirectRooms(client).some(direct => direct.roomId === room.roomId)
}

export function getRoomParentSpaceIds(room: Room) {
  return getStateEvents(room, EventType.SpaceParent)
    .filter(e => Array.isArray(e.getContent().via))
    .map(e => e.getStateKey())
    .filter((id): id is string => !!id)
}

export function getRoomSpaceId(client: MatrixClient, room: Room) {
  for (const space of client.getRooms()) {
    if (!space.isSpaceRoom()) continue
    for (const e of getStateEvents(space, EventType.SpaceChild)) {
      if (isSpaceChild(e) && e.getStateKey() === room.roomId) return space.roomId
    }
  }
  return undefined
}

export function getRoomTopic(room: Room | undefined) {
  if (!room) return

  const events = getStateEvents(room, EventType.RoomTopic)
  if (events[0]) return events[0].getContent<{ topic?: string }>().topic
}

export function getRoomCreationTs(room: Room | undefined) {
  if (!room) return

  const events = getStateEvents(room, EventType.RoomCreate)
  if (events[0]) return events[0].getTs()
}

export function getRoomMembersTyping(room: Room) {
  const typingMembers = new Set<string>()
  for (const member of room.getMembers()) {
    if (member.typing) typingMembers.add(member.userId)
  }
  return typingMembers
}

export function getInSpaceRoomIds(client: MatrixClient) {
  const ids = new Set<string>()
  for (const room of client.getRooms()) {
    if (!room.isSpaceRoom()) continue
    for (const e of getStateEvents(room, EventType.SpaceChild)) {
      if (isSpaceChild(e) && e.getStateKey()) ids.add(e.getStateKey()!)
    }
  }
  return ids
}

export function resolveRoomId(maybeRoomOrId: MaybeRoomOrId) {
  if (maybeRoomOrId instanceof Room) return maybeRoomOrId.roomId

  return maybeRoomOrId
}

export function resolveRoomName(room: Room): string {
  return room.name ?? room.roomId
}

export function resolveJoinRuleLabel(joinRule: JoinRule) {
  switch (joinRule) {
    case JoinRule.Public:
    case JoinRule.Private:
    case JoinRule.Restricted: {
      return joinRule
    }

    case JoinRule.Knock: {
      return 'knock-only'
    }
    case JoinRule.Invite: {
      return 'invite-only'
    }
  }
}

const ROOM_ID_RE = /^!(?<localpart>[^:]+):(?<server_name>.+)$/
export function parseRoomId(roomId: string) {
  const match = roomId.match(ROOM_ID_RE)
  if (!match) return undefined

  return {
    localpart: match.groups?.localpart,
    serverName: match.groups?.server_name,
  }
}

export function isRoomId(roomId: string) {
  return ROOM_ID_RE.test(roomId)
}

export const isSpace = (room: Room) => room.isSpaceRoom()
export const isDirect = (room: Room, a: RoomAxes) => !isSpace(room) && a.directRoomIds.has(room.roomId)
export const isGroup = (room: Room, a: RoomAxes) => !isSpace(room) && !a.directRoomIds.has(room.roomId)
export const isOrphan = (room: Room, a: RoomAxes) => !a.inSpaceRoomIds.has(room.roomId)
export const isInvite = (room: Room) => room.getMyMembership() === KnownMembership.Invite
export const isEncrypted = (room: Room) => room.hasEncryptionStateEvent()

// https://github.com/cinnyapp/cinny/blob/80fd8863c9a07e89d6a2037e3e196cd8f372a2b1/src/app/utils/room.ts#L67-L73
export const isDirectInvite = (room: Room | undefined, myUserId: string | undefined) => {
  if (!room || !myUserId) return false

  const me = room.getMember(myUserId)
  const memberEvent = me?.events?.member
  const content = memberEvent?.getContent()

  return content?.is_direct === true
}
