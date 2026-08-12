import { AuthType, EventType } from 'matrix-js-sdk'

import type { ErrorShape } from '../../app/utils/error'
import type { AvatarImageSize } from '../../app/utils/matrix/types'

import { ErrorCode } from '../../app/utils/error'

export const appMeta = {
  description: 'A familiar Matrix client for humans',
  name: 'Magi',
}

export const MATRIX_BASE_URL = 'https://matrix-client.matrix.org'

export const IMG_PLACEHOLDER_URL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

export const DEFAULT_RECENT_REACTIONS = ['😭', '❤️', '🔥', '🥺']
export const REACTABLE_EVENT_TYPES: (EventType | 'm.poll.start' | 'org.matrix.msc3381.poll.start' | (string & {}))[] = [
  EventType.RoomMessage,
  EventType.RoomMessageEncrypted,
  EventType.Sticker,
  'm.poll.start',
  'org.matrix.msc3381.poll.start',
]

export const AVATAR_IMAGE_SIZE_VALUES = {
  full: -1,
  large: 512,
  medium: 256,
  small: 64,
} satisfies Record<AvatarImageSize, number>

export const TYPING_TIMEOUT_MS = 4000

export const ASIDE_DISPLAY_MODES = {
  all: 'All rooms',
  direct: 'Direct rooms',
  loose: 'Loose rooms',
  orphan: 'Orphan rooms',
}

export const MATRIX = {
  AUTH: {
    UIA: {
      SUPPORTED_STAGES: new Set<AuthType | (string & {})>([
        AuthType.Password,
        AuthType.Recaptcha,
        AuthType.Sso,
        AuthType.Email,
      ]),
    },
  },
  MESSAGING: {
    ALLOWED_ATTRS: [
      'href',
      'target',
      'rel',
      'src',
      'width',
      'height',
      'alt',
      'title',
      'class',
      'start',
      'data-mx-color',
      'data-mx-bg-color',
      'data-mx-spoiler',
      'data-mx-maths',
    ],
    ALLOWED_ATTRS_PER_TAG: {
      a: ['target', 'href'],
      code: ['class'],
      div: ['data-mx-maths'],
      img: ['width', 'height', 'alt', 'title', 'src'],
      ol: ['start'],
      span: ['data-mx-bg-color', 'data-mx-color', 'data-mx-spoiler', 'data-mx-maths'],
    },
    ALLOWED_TAGS: [
      'a',
      'code',
      'img',
      'span',
      'ol',
      'div',
      'pre',
      'p',
      'blockquote',
      'ul',
      'li',
      'br',
      'hr',
      'strong',
      'em',
      'b',
      'i',
      'u',
      's',
      'del',
      'sub',
      'sup',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'caption',
      'details',
      'summary',
    ],
  },
  ROOM: {
    INITIAL_STATE: {
      // https://github.com/cinnyapp/cinny/blob/80fd8863c9a07e89d6a2037e3e196cd8f372a2b1/src/app/components/create-room/utils.ts#L81-L87
      ENCRYPTION: {
        content: {
          algorithm: 'm.megolm.v1.aes-sha2',
        },
        state_key: '',
        type: 'm.room.encryption',
      },
    },
  },
} as const

export const GENERIC_ERROR = {
  INVALID_HOMESERVER: {
    code: ErrorCode.InvalidHomeserver,
    message: 'The provided homeserver is invalid. Please ensure the URL provided is correct with no misspellings.',
    title: 'Invalid homeserver',
  },
  UNKNOWN: {
    code: ErrorCode.Unknown,
    message: 'An unexpected error occurred. Please try again later',
    title: 'Unknown error',
  },
} satisfies Record<string, ErrorShape>
