import type { AuthDict, IAuthData, IStageStatus, MatrixClient, UIAFlow } from 'matrix-js-sdk'

import { AuthType, MatrixError } from 'matrix-js-sdk'
import { InteractiveAuth } from 'matrix-js-sdk'

type InteractiveAuthOptions<T = unknown> = ConstructorParameters<typeof InteractiveAuth<T>>[0]

export class UIALegacyUnsupportedError extends Error {
  override name = 'UIALegacyUnsupportedError'
}

export class UIACancellationError extends Error {
  override name = 'UIACancellationError'
}

export type UIARequestFn = (auth: AuthDict | null, background: boolean) => any

export type AttemptActionOptions<T extends UIARequestFn> = Partial<
  Pick<InteractiveAuthOptions<Awaited<ReturnType<T>>>, 'stateUpdated' | 'busyChanged' | 'requestEmailToken' | 'inputs'>
> & {
  /**
   * @default true
   */
  openDialog?: boolean
  onChallenge?: (flows: UIAFlow[]) => Promise<IAuthData>
  matrixClient?: MatrixClient
}

export const useInteractiveAuth = createGlobalState(() => {
  const { client } = useMatrixClient()
  const { authMetadata } = useAuthMetadata()

  const dialogOpen = ref(false)
  const isBusy = ref(false)
  const chosenFlow = shallowRef<UIAFlow>()
  const authFlows = shallowRef<UIAFlow[]>()
  const authState = shallowRef<{ nextStage: string; status: IStageStatus }>()
  const authInstance = shallowRef<InteractiveAuth<unknown>>()

  let completed = false
  let promise: Promise<unknown> | undefined
  let flowResult: unknown
  let resolvePromise: (value: unknown) => void
  let rejectPromise: (reason: unknown) => void

  const attemptAction = async <T extends UIARequestFn>(request: T, opts?: AttemptActionOptions<T>) => {
    const { openDialog = true } = opts ?? {}

    const [err, res] = await attemptAsync<Awaited<ReturnType<T>>, MatrixError>(() => request(null, false))
    if (!err) return res

    if (!(err instanceof MatrixError)) throw err

    // if legacy UIA is unsupported
    if (err.httpStatus === 404 && authMetadata.value?.account_management_uri) throw new UIALegacyUnsupportedError()
    if (err.httpStatus !== 401 || !err.data?.flows) throw err

    authFlows.value = err.data.flows
    // automatically select flow if only one is available
    if (err.data.flows.length === 1) chosenFlow.value = err.data.flows[0]

    const auth = new InteractiveAuth<Awaited<ReturnType<T>>>({
      authData: err.data as IAuthData,
      busyChanged: busy => {
        opts?.busyChanged?.(busy)

        isBusy.value = busy
      },
      doRequest: request,
      inputs: opts?.inputs,
      matrixClient: opts?.matrixClient ?? client.value,
      requestEmailToken:
        opts?.requestEmailToken ??
        (() => {
          throw new Error('attemptAction: flow requires an email stage but no requestEmailToken was provided')
        }),
      stateUpdated: (...params) => {
        opts?.stateUpdated?.(...params)
        authState.value = {
          nextStage: params[0],
          status: params[1],
        }
      },
    })

    promise = new Promise((resolve, reject) => {
      resolvePromise = resolve
      rejectPromise = reject
      auth.attemptAuth().then(value => {
        flowResult = value
        completeFlow()
      }, reject)
    })

    if (authState.value?.nextStage === AuthType.Email) await auth.requestEmailToken()

    authInstance.value = markRaw(auth)

    dialogOpen.value = openDialog
    opts?.onChallenge?.(err.data.flows)

    return promise
  }

  function completeFlow() {
    completed = true
    dialogOpen.value = false
    resolvePromise(flowResult)
  }

  const { pause: pauseAuthPoll, resume: resumeAuthPoll } = useIntervalFn(() => authInstance.value?.poll(), 2000, {
    immediate: false,
  })
  watch([authInstance, () => authState.value?.nextStage], ([authInstance, nextStage]) => {
    if (authInstance && nextStage === AuthType.Email) {
      authInstance.poll()
      resumeAuthPoll()
    } else pauseAuthPoll()
  })

  const submitStage = (authDict: AuthDict) => {
    if (!authInstance.value || completed) return
    authInstance.value.submitAuthDict(authDict).catch(rejectPromise)
  }

  whenever(
    () => !dialogOpen.value,
    async () => {
      if (!completed) {
        rejectPromise(new UIACancellationError())
      }
      completed = false
      promise = undefined
      authInstance.value = undefined
      authState.value = undefined
      authFlows.value = undefined
    },
  )

  return {
    attemptAction,
    authFlows,
    authInstance,
    authState,
    chosenFlow,
    dialogOpen,
    isBusy,
    submitStage,
  }
})
