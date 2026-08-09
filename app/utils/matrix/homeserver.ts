import type { ClientConfig, IAuthData, ILoginFlowsResponse, LoginFlow, UIAFlow } from 'matrix-js-sdk'

import { AuthType, MatrixError } from 'matrix-js-sdk'
import { AutoDiscovery, AutoDiscoveryAction, createClient } from 'matrix-js-sdk'

export async function getHomeserverConfig(homeserver: string) {
  return AutoDiscovery.findClientConfig(
    hasProtocol(homeserver, { acceptRelative: false }) ? homeserver : withoutProtocol(homeserver),
  )
}

export function isHomeserverValid(config: ClientConfig) {
  const { state } = config['m.homeserver']
  return state !== AutoDiscoveryAction.FAIL_ERROR && state !== AutoDiscoveryAction.FAIL_PROMPT
}

/**
 * @throws RegistrationDisabledError, MatrixError
 */
export async function getRegistrationFlows(homeserver: string) {
  const client = createTempClient(await resolveHomeserverBaseUrl(homeserver))

  const [err] = await attemptAsync(() => client.registerRequest({}))
  if (!(err instanceof MatrixError)) throw err

  if (err.httpStatus === 403) {
    const loginFlows = await getLoginFlows(homeserver)
    if (!loginFlows) throw new RegistrationDisabledError()

    const hasSSO = loginFlows.flows.some(f => f.type === AuthType.Sso)
    if (!hasSSO) throw new RegistrationDisabledError()

    return [{ stages: [AuthType.Sso] }] satisfies UIAFlow[]
  } else if (err.httpStatus !== 401 || !err.data?.flows) throw err

  const data = err.data as IAuthData

  return data.flows
}

export async function getLoginFlows(homeserver: string) {
  const config = await getHomeserverConfig(homeserver)
  const baseUrl = isHomeserverValid(config)
    ? (config['m.homeserver'].base_url ?? homeserver)
    : normalizeHomeserverUrl(homeserver)

  const client = createClient({ baseUrl })

  const [loginFlowsError, loginFlows] = await attemptAsync<ILoginFlowsResponse, Error>(() => client.loginFlows())
  if (loginFlowsError) {
    if (loginFlowsError instanceof TypeError && loginFlowsError.message.includes('URL')) throw throwErr()
    throw loginFlowsError
  }

  return loginFlows

  function throwErr() {
    throw new $Error({
      code: ErrorCode.InvalidUrl,
      message:
        'Failed to make login request with provided homeserver URL. Please ensure it is correct and no typos were made.',
      title: 'Failed to fetch',
    })
  }
}

export function getAuthFlow(loginFlows: LoginFlow[], targetFlows: string[]) {
  return loginFlows.find(f => targetFlows.includes(f.type))
}

export function getPwFlow(loginFlows: LoginFlow[]) {
  return getAuthFlow(loginFlows, ['m.login.password'])
}

export function getSSOFlow(loginFlows: LoginFlow[]) {
  return getAuthFlow(loginFlows, ['m.login.sso', 'm.login.cas'])
}

export async function resolveHomeserverBaseUrl(baseUrl: string): Promise<string> {
  try {
    const homeserverConfig = await getHomeserverConfig(baseUrl)

    if (homeserverConfig['m.homeserver'].state !== AutoDiscoveryAction.SUCCESS) return normalizeHomeserverUrl(baseUrl)

    return homeserverConfig['m.homeserver'].base_url ?? baseUrl
  } catch (error) {
    throw parseError(error, { fallbackMessage: 'Failed to resolve base URL' }).message
  }
}

export function normalizeHomeserverUrl(input: string) {
  if (hasProtocol(input, { acceptRelative: false })) return input
  return withHttps(input)
}
