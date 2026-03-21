import { AutoDiscovery } from 'matrix-js-sdk'

export async function getClientConfig(homeserver: string) {
  const res = await AutoDiscovery.findClientConfig(withoutProtocol(homeserver))

  if (res['m.homeserver']?.error)
    throw new Error(parseMatrixError(res['m.homeserver']?.error, { fallbackMessage: 'Invalid homeserver' }))

  if (res['m.homeserver']?.base_url)
    return res

  throw new Error('Unexpected error')
}
