import { AutoDiscovery, AutoDiscoveryAction } from 'matrix-js-sdk'

export async function resolveBaseUrl(baseUrl: string): Promise<string> {
  try {
    const clientConfig = await AutoDiscovery.findClientConfig(withoutProtocol(baseUrl))
    const { state: clientConfigState } = clientConfig['m.homeserver']

    if (clientConfigState !== AutoDiscoveryAction.SUCCESS)
      throw clientConfig['m.homeserver']?.error

    if (!clientConfig['m.homeserver']?.base_url)
      throw new $Error('No base URL found in client config')

    return clientConfig['m.homeserver'].base_url
  }
  catch (error) {
    throw parseMatrixError(error, { fallbackMessage: 'Failed to resolve base URL' })
  }
}
