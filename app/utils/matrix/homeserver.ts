import type { ClientConfig, ILoginFlowsResponse, LoginFlow } from 'matrix-js-sdk'

import { AutoDiscovery, AutoDiscoveryAction, createClient } from 'matrix-js-sdk'

export async function getHomeserverConfig(homeserver: string) {
  return AutoDiscovery.findClientConfig(withoutProtocol(homeserver))
}

export function isHomeserverValid(config: ClientConfig) {
  const { state } = config['m.homeserver']
  return state !== AutoDiscoveryAction.FAIL_ERROR && state !== AutoDiscoveryAction.FAIL_PROMPT
}

export async function getLoginFlows(homeserver: string) {
  const config = await getHomeserverConfig(homeserver)

  const isValid = isHomeserverValid(config)
  if (!isValid) return throwErr()

  const client = createClient({ baseUrl: config['m.homeserver'].base_url ?? homeserver })

  const [loginFlowsError, loginFlows] = await attemptAsync<ILoginFlowsResponse, Error>(() => client.loginFlows())
  if (loginFlowsError) {
    if (loginFlowsError instanceof TypeError && loginFlowsError.message.includes('URL')) return throwErr()
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

    if (homeserverConfig['m.homeserver'].state !== AutoDiscoveryAction.SUCCESS)
      throw homeserverConfig['m.homeserver']?.error

    return homeserverConfig['m.homeserver'].base_url ?? baseUrl
  } catch (error) {
    throw parseError(error, { fallbackMessage: 'Failed to resolve base URL' }).message
  }
}

export function normalizeHomeserverUrl(input: string) {
  if (hasProtocol(input, { acceptRelative: false })) return input
  return withHttps(input)
}
