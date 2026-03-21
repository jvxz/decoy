import { UAParser } from 'ua-parser-js'

export function createDeviceId(userAgent: string) {
  const { getBrowser, getDevice } = new UAParser(userAgent)
  return `Decoy on ${getBrowser()} (${getDevice()})`
}
