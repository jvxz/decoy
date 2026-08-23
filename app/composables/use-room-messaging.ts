import { ContentHelpers } from 'matrix-js-sdk'

export function useRoomMessaging(roomOrId: MaybeRefOrGetter<MaybeRoomOrId | undefined>) {
  const { message } = useRoomActions(roomOrId)

  const sendTextMessage = (body: string, formattedBody: string, mentionedUserIds?: Set<string> | string[]) => {
    // strip wrapping <p> tag created by md lexer
    const unwrappedFormattedBody = formattedBody.replace(P_TAG_RE, '$1')
    const content = ContentHelpers.makeHtmlMessage(body.trimEnd(), unwrappedFormattedBody.trimEnd())

    const mentionedUserIdsArray = Array.isArray(mentionedUserIds)
      ? mentionedUserIds
      : (mentionedUserIds?.values().toArray() ?? [])

    message.mutate({
      ...content,
      'm.mentions': {
        user_ids: mentionedUserIdsArray,
      },
    })
  }

  return {
    sendTextMessage,
  }
}
