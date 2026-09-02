import type { ClientEventHandlerMap, EmittedEvents, Listener, MatrixClient } from 'matrix-js-sdk'

import { HttpApiEvent } from 'matrix-js-sdk'
import { RoomEvent } from 'matrix-js-sdk'
import { ClientEvent, MatrixEventEvent, RoomMemberEvent, RoomStateEvent } from 'matrix-js-sdk'

type ValidEvents = EmittedEvents | RoomMemberEvent
type EmitterListener<T extends ValidEvents = ValidEvents> = Listener<ValidEvents, ClientEventHandlerMap, T>

const syncHook = createEventHook<Parameters<EmitterListener<ClientEvent.Sync>>>()
const decryptedHook = createEventHook<Parameters<EmitterListener<MatrixEventEvent.Decrypted>>>()
const roomEvent = createEventHook<Parameters<EmitterListener<ClientEvent.Room | ClientEvent.DeleteRoom>>>()
const roomStateEvent = createEventHook<Parameters<EmitterListener<RoomStateEvent.Update>>>()
const roomMembershipEvent = createEventHook<Parameters<EmitterListener<RoomMemberEvent.Membership>>>()
const eventHook = createEventHook<Parameters<EmitterListener<ClientEvent.Event>>>()
const userProfileHook = createEventHook<Parameters<EmitterListener<ClientEvent.UserProfileUpdate>>>()
const accountDataHook = createEventHook<Parameters<EmitterListener<ClientEvent.Event>>>()
const roomMyMembership = createEventHook<Parameters<EmitterListener<RoomEvent.MyMembership>>>()
const logoutHook = createEventHook<Parameters<EmitterListener<HttpApiEvent.SessionLoggedOut>>>()
const roomTimeline = createEventHook<Parameters<EmitterListener<RoomEvent.Timeline>>>()
const roomTimelineReset = createEventHook<Parameters<EmitterListener<RoomEvent.TimelineReset>>>()
const nameHook = createEventHook<Parameters<EmitterListener<RoomEvent.Name>>>()
const receiptHook = createEventHook<Parameters<EmitterListener<RoomEvent.Receipt>>>()
const roomTagsHook = createEventHook<Parameters<EmitterListener<RoomEvent.Tags>>>()
const roomLocalEchoUpdatedHook = createEventHook<Parameters<EmitterListener<RoomEvent.LocalEchoUpdated>>>()
const roomRedactionHook = createEventHook<Parameters<EmitterListener<RoomEvent.Redaction>>>()
const roomAccountDataHook = createEventHook<Parameters<EmitterListener<RoomEvent.AccountData>>>()
const roomMembersHook = createEventHook<Parameters<EmitterListener<RoomStateEvent.Members>>>()
export const roomMemberTypingHook = createEventHook<Parameters<EmitterListener<RoomMemberEvent.Typing>>>()

export const useMatrixHooks = createSharedComposable(() => {
  const { client } = useMatrixClient()

  watch(
    client,
    (current, prev) => {
      bindListener(ClientEvent.Sync, syncHook.trigger, { current, prev })
      bindListener(ClientEvent.Event, eventHook.trigger, { current, prev })
      bindListener(ClientEvent.Room, roomEvent.trigger, { current, prev })
      bindListener(ClientEvent.DeleteRoom, roomEvent.trigger, { current, prev })
      bindListener(RoomStateEvent.Update, roomStateEvent.trigger, { current, prev })
      bindListener(RoomMemberEvent.Typing, roomMemberTypingHook.trigger, { current, prev })
      bindListener(RoomMemberEvent.Membership, roomMembershipEvent.trigger, { current, prev })
      bindListener(MatrixEventEvent.Decrypted, decryptedHook.trigger, { current, prev })
      bindListener(ClientEvent.UserProfileUpdate, userProfileHook.trigger, { current, prev })
      bindListener(ClientEvent.AccountData, accountDataHook.trigger, { current, prev })
      bindListener(RoomEvent.MyMembership, roomMyMembership.trigger, { current, prev })
      bindListener(HttpApiEvent.SessionLoggedOut, logoutHook.trigger, { current, prev })
      bindListener(RoomEvent.Timeline, roomTimeline.trigger, { current, prev })
      bindListener(RoomEvent.TimelineReset, roomTimelineReset.trigger, { current, prev })
      bindListener(RoomEvent.Name, nameHook.trigger, { current, prev })
      bindListener(RoomEvent.Receipt, receiptHook.trigger, { current, prev })
      bindListener(RoomEvent.Tags, roomTagsHook.trigger, { current, prev })
      bindListener(RoomEvent.LocalEchoUpdated, roomLocalEchoUpdatedHook.trigger, { current, prev })
      bindListener(RoomEvent.Redaction, roomRedactionHook.trigger, { current, prev })
      bindListener(RoomEvent.AccountData, roomAccountDataHook.trigger, { current, prev })
      bindListener(RoomStateEvent.Members, roomMembersHook.trigger, { current, prev })
    },
    { immediate: true },
  )

  return {
    onAccountData: accountDataHook.on,
    onDecrypted: decryptedHook.on,
    onEvent: eventHook.on,
    onLogout: logoutHook.on,
    onRoom: roomEvent.on,
    onRoomAccountData: roomAccountDataHook.on,
    onRoomLocalEchoUpdated: roomLocalEchoUpdatedHook.on,
    onRoomMembers: roomMembersHook.on,
    onRoomMembership: roomMembershipEvent.on,
    onRoomMemberTyping: roomMemberTypingHook.on,
    onRoomMyMembership: roomMyMembership.on,
    onRoomName: nameHook.on,
    onRoomReceipt: receiptHook.on,
    onRoomRedaction: roomRedactionHook.on,
    onRoomState: roomStateEvent.on,
    onRoomTags: roomTagsHook.on,
    onRoomTimeline: roomTimeline.on,
    onRoomTimelineReset: roomTimelineReset.on,
    onSync: syncHook.on,
    onUserProfile: userProfileHook.on,
  }
})

function bindListener<T extends ValidEvents>(
  event: T,
  listener: EmitterListener<T>,
  clients: { current: MatrixClient; prev: MatrixClient | undefined },
) {
  clients.current.on<T>(event, listener)

  if (clients.prev) clients.prev.off<T>(event, listener)
}
