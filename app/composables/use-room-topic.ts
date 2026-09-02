export const useRoomTopic = (roomOrId: MaybeRefOrGetter<MaybeRoomOrId | undefined>) =>
  useRoomComputed(roomOrId, getRoomTopic)
