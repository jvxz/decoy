import type { Room } from 'matrix-js-sdk'
import type { ShjLanguage } from 'rangi'

import type { MatrixAvatarProps } from '~/components/matrix/avatar.vue'

export interface GlobalDialogMap {
  invite: { room: string }
  leave: {
    room: Room
  }
  avatar: Pick<MatrixAvatarProps, 'user' | 'room' | 'src'> & { label: string }
  codeViewer: {
    code: string
    lang?: ShjLanguage | (string & {})
  }
  deleteMessage: {
    roomId: string
    eventId: string
  }
}
export type GlobalDialog = keyof GlobalDialogMap

type GlobalDialogState = Prettify<
  {
    [K in GlobalDialog]: {
      name: K
    } & GlobalDialogMap[K]
  }[GlobalDialog]
>

export const useGlobalDialog = createGlobalState(() => {
  const open = ref(false)
  const state = shallowRef<GlobalDialogState>()
  const dialogKey = ref(0)

  const openDialog = <T extends GlobalDialog>(name: T, payload: GlobalDialogMap[T]) => {
    state.value = { name, ...payload } as GlobalDialogState
    dialogKey.value++
    open.value = true
  }

  return { dialogKey, open, openDialog, state }
})
