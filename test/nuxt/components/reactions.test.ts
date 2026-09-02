import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { DOMWrapper } from '@vue/test-utils'
import { User } from 'matrix-js-sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RoomEventReactionsViewer, UProfilePopoverRoot } from '#components'

import Reactions from '../fixtures/reactions.vue'
import { mockMatrixHooks } from '../utils/matrix/client.ts'
import { DEFAULT_MOCK_NAMES, generateFakeHomeserver } from '../utils/matrix/credentials.ts'

const { useMatrixClient, useMatrixHooks, useSelf } = vi.hoisted(() => {
  return {
    useMatrixClient: vi.fn(() => ({ client: shallowRef({}) })),
    useMatrixHooks: vi.fn(),
    useSelf: vi.fn(() => ({ self: shallowRef() })),
  }
})

const matrixHooks = mockMatrixHooks
useMatrixHooks.mockImplementation(mockMatrixHooks)

mockNuxtImport('useMatrixClient', () => useMatrixClient)
mockNuxtImport('useMatrixHooks', () => useMatrixHooks)
mockNuxtImport('useSelf', () => useSelf)

const createWrapper = () => {
  return defineComponent({
    setup: () => () => h(UProfilePopoverRoot, null, () => h(RoomEventReactionsViewer)),
  })
}

let currentMockRoom: MockRoom | undefined

const setupState = (skipDefaults: boolean = false) => {
  const mockRoom = createMockRoom({ id: 'reactionsViewer' })
  currentMockRoom = mockRoom

  const viewer = useRoomEventReactionsViewer()

  if (!skipDefaults) {
    const target = mockRoom.pushMessage({ body: 'hello' })
    DEFAULT_RECENT_REACTIONS.forEach((v, k) => {
      for (let i = 0; i < k + 1; i++) {
        mockRoom.pushReaction(target, v, { sender: DEFAULT_MOCK_NAMES[i] })
      }
    })

    viewer.openReactionViewer(mockRoom.room, target)
  }

  return { mockRoom, viewer }
}

const createReactionItemSelector = (reaction: string | undefined) =>
  `[data-slot="reaction-item"][reaction="${reaction}"]`

describe('reactions', () => {
  beforeEach(() => {
    const viewer = useRoomEventReactionsViewer()
    viewer.open.value = false
    viewer.room.value = undefined
    viewer.event.value = undefined

    useMatrixHooks.mockReturnValue(matrixHooks())

    useMatrixClient.mockReturnValue({
      client: shallowRef({
        getHomeserverUrl: () => generateFakeHomeserver(),
        getRoom: (id: string) => (currentMockRoom?.room.roomId === id ? currentMockRoom.room : undefined),
        getSafeUserId: () => DEFAULT_MOCK_NAMES[0]!,
        getUser: (id: string) => new User(id),
        getUserId: () => DEFAULT_MOCK_NAMES[0]!,
        redactEvent: vi.fn(),
        sendEvent: vi.fn(),
      }),
    })

    useSelf.mockReturnValue({
      self: shallowRef(),
    })
  })

  it('displays the dialog with default recent reactions', async () => {
    setupState()
    const Wrapper = createWrapper()
    await mountSuspended(Wrapper)

    // console.log('document.body: ', document.body.outerHTML)

    DEFAULT_RECENT_REACTIONS.forEach(v => {
      const reactionItem = new DOMWrapper(document.querySelector(createReactionItemSelector(v)))
      expect(reactionItem.exists()).toBe(true)
    })
  })

  it('displays the dialog with the first reaction selected by default', async () => {
    setupState()
    const Wrapper = createWrapper()
    await mountSuspended(Wrapper)

    const reaction = DEFAULT_RECENT_REACTIONS[0]

    const reactionItem = new DOMWrapper(document.querySelector(createReactionItemSelector(reaction)))

    expect(reactionItem.attributes()).toHaveProperty('data-state', 'active')
    expect(reactionItem.attributes()).toHaveProperty('reaction', reaction)
  })

  it('displays the correct reaction member list in the dialog', async () => {
    setupState()
    const Wrapper = createWrapper()
    await mountSuspended(Wrapper)

    const reaction = DEFAULT_RECENT_REACTIONS[3]

    const reactionItem = new DOMWrapper(document.querySelector(createReactionItemSelector(reaction)))

    await reactionItem.trigger('mousedown')
    await nextTick()

    expect(reactionItem.attributes()).toHaveProperty('data-state', 'active')
    expect(reactionItem.attributes()).toHaveProperty('reaction', reaction)
  })

  it('displays reaction item under message', async () => {
    const reaction = DEFAULT_RECENT_REACTIONS[0]!

    const component = await mountSuspended(Reactions)

    const mockRoom = createMockRoom({ id: 'reactions' })
    currentMockRoom = mockRoom

    const msgEvent = mockRoom.pushMessage()
    mockRoom.pushReaction(msgEvent, reaction)

    await component.setProps({
      event: msgEvent,
      room: mockRoom.room,
    })

    const item = component.find(createReactionItemSelector(reaction))
    expect(item.exists()).toBe(true)
  })

  it('successfully reacts to message', async () => {
    const reaction = DEFAULT_RECENT_REACTIONS[0]!

    const mockRoom = createMockRoom({ id: 'reactions' })
    currentMockRoom = mockRoom

    const msgEvent = mockRoom.pushMessage()

    useMatrixClient.mockReturnValue({
      client: shallowRef({
        getHomeserverUrl: () => generateFakeHomeserver(),
        getRoom: (id: string) => (id === mockRoom.room.roomId ? mockRoom.room : undefined),
        getSafeUserId: () => DEFAULT_MOCK_NAMES[0]!,
        getUser: (id: string) => new User(id),
        getUserId: () => DEFAULT_MOCK_NAMES[0]!,
        redactEvent: vi.fn(),
        sendEvent: vi.fn(),
      }),
    })

    let setup!: ReturnType<typeof useRoomEventReactions.provide>
    const Harness = defineComponent({
      setup() {
        setup = useRoomEventReactions.provide(
          () => mockRoom.room,
          () => msgEvent,
        )
        return () => h(Reactions, { event: msgEvent, room: mockRoom.room })
      },
    })
    await mountSuspended(Harness)

    setup.reactTo(reaction)

    const { sendEvent } = useMatrixClient().client.value as { sendEvent: () => void }

    await vi.waitFor(() => expect(sendEvent).toHaveBeenCalledTimes(1))

    expect(sendEvent).toHaveBeenCalledWith(
      mockRoom.room.roomId,
      'm.reaction',
      expect.objectContaining({
        'm.relates_to': expect.objectContaining({
          event_id: msgEvent.getId(),
          key: reaction,
          rel_type: 'm.annotation',
        }),
      }),
    )
  })
})
