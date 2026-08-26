import type { Room } from 'matrix-js-sdk'

import { findKey } from 'es-toolkit/map'
import { KnownMembership, SyncState } from 'matrix-js-sdk'

export const useInvites = createGlobalState(() => {
  const { dismiss: dismissNoti, notificationsMap, notify } = useNotifications()
  const { self } = useSelf()
  const { onSync } = useMatrixHooks()

  const dismissedInviteNotis = useScopedLocalStorage('dismissedInviteNotis', new Set())
  const invitesMap = shallowRef(new Map<string, Room>())

  const settlingRoomIds = new Set<string>()

  onSync(state => {
    if (state !== SyncState.Syncing || settlingRoomIds.size === 0) return
    settlingRoomIds.clear()
  })

  function handleMembershipUpdate(room: Room, membership: string) {
    if (membership === KnownMembership.Invite) {
      if (settlingRoomIds.has(room.roomId)) return

      const inviteId = createInviteId(room)
      const alreadyDismissed = dismissedInviteNotis.value.has(inviteId)
      const alreadyNotified = notificationsMap.value.has(inviteId)

      if (!alreadyDismissed && !alreadyNotified) {
        notify('invite', { id: inviteId, payload: { roomId: room.roomId } })
      }

      invitesMap.value.set(inviteId, room)
    } else {
      const inviteId = findKey(invitesMap.value, r => r.roomId === room.roomId)

      settlingRoomIds.add(room.roomId)

      if (!inviteId) return

      dismissNoti(inviteId)
      dismissedInviteNotis.value.delete(inviteId)
      invitesMap.value.delete(inviteId)
    }

    triggerRef(invitesMap)
  }

  function handleNotiDismiss(roomId: string) {
    dismissNoti(roomId)

    dismissedInviteNotis.value.add(roomId)
    triggerRef(dismissedInviteNotis)
  }

  function createInviteId(room: Room) {
    const inviterId = getInviter(room, self.value?.userId)
    assert(inviterId, '`inviterId` was nullish when creating invite ID')

    return `${room.roomId}:${inviterId}`
  }

  const invitesSet = computed(() => new Set(invitesMap.value.values()))
  const inviteIdsSet = computed(() => new Set(invitesSet.value.values().map(r => r.roomId)))

  return {
    handleMembershipUpdate,
    handleNotiDismiss,
    inviteIds: inviteIdsSet,
    invites: invitesSet,
  }
})
