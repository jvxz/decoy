import type { ClientConfig } from 'matrix-js-sdk'
import { AutoDiscovery } from 'matrix-js-sdk'

export async function validateHomeserver(
  homeserver: string,
  throwError?: true,
): Promise<ClientConfig>
export async function validateHomeserver(
  homeserver: string,
  throwError?: false,
): Promise<ClientConfig | undefined>
export async function validateHomeserver(
  homeserver: string,
  throwError?: boolean,
): Promise<ClientConfig | undefined> {
  try {
    const res = await AutoDiscovery.getRawClientConfig(withoutProtocol(homeserver))
    return AutoDiscovery.fromDiscoveryConfig(res)
  }
  catch (error) {
    if (throwError)
      throw new Error(parseMatrixError(error, { fallbackMessage: 'Invalid homeserver' }))

    return undefined
  }
}
