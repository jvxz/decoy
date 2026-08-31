export const A_TO_Z_RE = /[a-z]/i
export const ALPHANUMERIC_RE = /^[a-z0-9]+$/
export const WHITESPACE_RE = /\s+/
export const TRAILING_NEWLINE_RE = /\n$/
export const P_TAG_RE = /^<p>(.*)<\/p>$/s

export const EMOJI_RE = /\p{RGI_Emoji}/gv
export const EMOJI_VARIATION_RE = /[\uFE00-\uFE0F]/gu

export const MATRIX_ROOM_ALIAS_RE = /^#[^\0:\uD800-\uDFFF]+:(?:\[[0-9A-F:.]{2,45}\]|[0-9A-Z.-]{1,255})(?::\d{1,5})?$/i
export const ROOM_ID_RE = /^!(?<localpart>[^\s:]+)(?::(?<server_name>\S+))?$/
