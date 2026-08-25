export function getMatrixIdType(id: string | undefined): 'user' | 'room' | 'unknown' {
  if (!id) return 'unknown'

  if (isUserId(id)) return 'user'
  if (isRoomId(id)) return 'room'
  return 'unknown'
}

export interface MatrixToUrl {
  type: 'userId' | 'roomId' | 'roomAlias' | 'event' | 'unknown'
  action?: 'join' | 'chat'
  via?: string[]
}
export function parseMatrixToUrl(url: string): MatrixToUrl {
  const unhashed = url.replace('/#/', '/')
  const parsed = parseURL(unhashed)
  const type = parsed.pathname.includes('/!')
    ? 'roomId'
    : parsed.pathname.includes('/@')
      ? 'userId'
      : isRoomAlias(parsed.hash)
        ? 'roomAlias'
        : parsed.hash.includes('/$')
          ? 'event'
          : 'unknown'

  const query = parseQuery(parsed.search || parsed.hash.split('?')[1] || '')
  const via = toArray(query.via ?? [])
  const action = (Array.isArray(query.action) ? query.action[0] : query.action) as 'join' | 'chat' | undefined

  return {
    action,
    type,
    via,
  }
}

export function resolveViaArray(roomId: string, viaServers?: (string | undefined)[] | string) {
  const { serverName } = parseRoomId(roomId) ?? {}
  const via = toArray(viaServers ?? [])
  const res = compact(uniq([...via, ...(serverName ? [serverName] : [])]))
  return res.length ? res : undefined
}
