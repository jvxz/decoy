import type { MatrixEvent, RoomMember } from 'matrix-js-sdk'

import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { User } from 'matrix-js-sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockMatrixHooks } from '../utils/matrix/client'
import { DEFAULT_MOCK_NAMES, generateFakeHomeserver } from '../utils/matrix/credentials'

const CURRENT_USER = DEFAULT_MOCK_NAMES[0]!

const { matrixHooks, useCurrentRoom, useMatrixClient, useMatrixHooks, useRoomHooks, useSelf } = vi.hoisted(() => {
  return {
    matrixHooks: mockMatrixHooks,
    useCurrentRoom: vi.fn(() => shallowRef()),
    useMatrixClient: vi.fn(() => ({ client: shallowRef({}) })),
    useMatrixHooks: vi.fn(mockMatrixHooks),
    useRoomHooks: vi.fn(),
    useSelf: vi.fn(() => ({ self: shallowRef() })),
  }
})

mockNuxtImport('useCurrentRoom', () => useCurrentRoom)
mockNuxtImport('useMatrixClient', () => useMatrixClient)
mockNuxtImport('useMatrixHooks', () => useMatrixHooks)
mockNuxtImport('useRoomHooks', () => useRoomHooks)
mockNuxtImport('useSelf', () => useSelf)

let currentMockRoom: MockRoom
let typingHandler: ((event: MatrixEvent, member: RoomMember) => void) | undefined

const mockTypingEvent = (userIds: string[] | undefined) =>
  ({ getContent: () => (userIds ? { user_ids: userIds } : {}) }) as unknown as MatrixEvent

const emitTyping = (userIds: string[] | undefined) => typingHandler?.(mockTypingEvent(userIds), {} as RoomMember)

describe('typing indicator', () => {
  let roomSeq = 0

  beforeEach(() => {
    currentMockRoom = createMockRoom({ id: `typing-${roomSeq++}` })
    typingHandler = undefined

    useRoomHooks.mockImplementation((_room: unknown, params: { onRoomMemberTyping?: typeof typingHandler }) => {
      if (params?.onRoomMemberTyping) typingHandler = params.onRoomMemberTyping
    })

    useMatrixClient.mockReturnValue({
      client: shallowRef({
        getHomeserverUrl: () => generateFakeHomeserver(),
        getRoom: (id: string) => (currentMockRoom.room.roomId === id ? currentMockRoom.room : undefined),
        getSafeUserId: () => CURRENT_USER,
        getUser: (id: string) => new User(id),
        getUserId: () => CURRENT_USER,
      }),
    })

    useMatrixHooks.mockReturnValue(matrixHooks())
    useSelf.mockReturnValue({ self: shallowRef({ userId: CURRENT_USER }) })
    useCurrentRoom.mockReturnValue(shallowRef(currentMockRoom.room))
  })

  const setupComposable = async () => {
    let setup!: ReturnType<typeof useRoomMembersTyping.provide>
    const Harness = defineComponent({
      setup: () => {
        setup = useRoomMembersTyping.provide(() => currentMockRoom.room)
        return () => null
      },
    })
    await mountSuspended(Harness)
    return setup
  }

  it('captures user_ids from a typing event', async () => {
    const realMembersTyping = DEFAULT_MOCK_NAMES.slice(1, 3)

    const setup = await setupComposable()
    emitTyping(realMembersTyping)
    await nextTick()

    expect([...setup.typingMembers.value].toSorted()).toEqual(realMembersTyping.toSorted())
    expect(setup.areMembersTyping.value).toBe(true)
  })

  it('does not display current user in typing indicator list', async () => {
    const realMembersTyping = DEFAULT_MOCK_NAMES.slice(0, 3)

    const setup = await setupComposable()

    emitTyping(realMembersTyping)
    await nextTick()

    expect([...setup.typingMembers.value]).not.toContain(CURRENT_USER)
    expect(setup.typingMembers.value.size).toBe(2)
  })

  it('displays typing members from the initial room load', async () => {
    const realMembersTyping = DEFAULT_MOCK_NAMES.slice(1, 2)
    realMembersTyping.forEach(m => currentMockRoom.setMemberTyping(m, true))

    currentMockRoom.setMemberTyping(DEFAULT_MOCK_NAMES[2]!, false)

    const setup = await setupComposable()

    expect([...setup.typingMembers.value].toSorted()).toEqual(realMembersTyping.toSorted())
  })
})
