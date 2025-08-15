import * as o from "oauth4webapi"
import { InvalidCheck } from "../../../../errors.js"

// NOTE: We use the default JWT methods here because they encrypt/decrypt the payload, not just sign it.
import { decode, encode } from "../../../../jwt.js"

import type {
  CookiesOptions,
  InternalOptions,
  RequestInternal,
  User,
} from "../../../../types.js"
import type { Cookie } from "../../../utils/cookie.js"
import type { WebAuthnProviderType } from "../../../../providers/webauthn.js"

interface CookiePayload {
  value: string
}

const COOKIE_TTL = 60 * 15 // 15 minutes

/** 返回带有 JWT 加密负载的 cookie。 */
async function sealCookie(
  name: keyof CookiesOptions,
  payload: string,
  options: InternalOptions<"oauth" | "oidc" | WebAuthnProviderType>
): Promise<Cookie> {
  const { cookies, logger } = options
  const cookie = cookies[name]
  const expires = new Date()
  expires.setTime(expires.getTime() + COOKIE_TTL * 1000)

  logger.debug(`CREATE_${name.toUpperCase()}`, {
    name: cookie.name,
    payload,
    COOKIE_TTL,
    expires,
  })

  const encoded = await encode({
    ...options.jwt,
    maxAge: COOKIE_TTL,
    token: { value: payload } satisfies CookiePayload,
    salt: cookie.name,
  })
  const cookieOptions = { ...cookie.options, expires }
  return { name: cookie.name, value: encoded, options: cookieOptions }
}

async function parseCookie(
  name: keyof CookiesOptions,
  value: string | undefined,
  options: InternalOptions
): Promise<string> {
  try {
    const { logger, cookies, jwt } = options
    logger.debug(`PARSE_${name.toUpperCase()}`, { cookie: value })

    if (!value) throw new InvalidCheck(`${name} cookie was missing`)
    const parsed = await decode<CookiePayload>({
      ...jwt,
      token: value,
      salt: cookies[name].name,
    })
    if (parsed?.value) return parsed.value
    throw new Error("Invalid cookie")
  } catch (error) {
    throw new InvalidCheck(`${name} value could not be parsed`, {
      cause: error,
    })
  }
}

function clearCookie(
  name: keyof CookiesOptions,
  options: InternalOptions,
  resCookies: Cookie[]
) {
  const { logger, cookies } = options
  const cookie = cookies[name]
  logger.debug(`CLEAR_${name.toUpperCase()}`, { cookie })
  resCookies.push({
    name: cookie.name,
    value: "",
    options: { ...cookies[name].options, maxAge: 0 },
  })
}

function useCookie(
  check: "state" | "pkce" | "nonce",
  name: keyof CookiesOptions
) {
  return async function (
    cookies: RequestInternal["cookies"],
    resCookies: Cookie[],
    options: InternalOptions<"oidc">
  ) {
    const { provider, logger } = options
    if (!provider?.checks?.includes(check)) return
    const cookieValue = cookies?.[options.cookies[name].name]
    logger.debug(`USE_${name.toUpperCase()}`, { value: cookieValue })
    const parsed = await parseCookie(name, cookieValue, options)
    clearCookie(name, options, resCookies)
    return parsed
  }
}

/**
 * @see https://www.rfc-editor.org/rfc/rfc7636
 * @see https://danielfett.de/2020/05/16/pkce-vs-nonce-equivalent-or-not/#pkce
 */
export const pkce = {
  /** 创建 PKCE 代码挑战和验证器对。验证器存储在 cookie 中。 */
  async create(options: InternalOptions<"oauth">) {
    const code_verifier = o.generateRandomCodeVerifier()
    const value = await o.calculatePKCECodeChallenge(code_verifier)
    const cookie = await sealCookie("pkceCodeVerifier", code_verifier, options)
    return { cookie, value }
  },
  /**
   * 如果提供者配置为使用 PKCE，则返回 code_verifier，
   * 并在之后清除容器 cookie。
   * 如果 code_verifier 缺失或无效，则抛出错误。
   */
  use: useCookie("pkce", "pkceCodeVerifier"),
}

interface EncodedState {
  origin?: string
  random: string
}

const STATE_MAX_AGE = 60 * 15 // 15 minutes in seconds
const encodedStateSalt = "encodedState"

/**
 * @see https://www.rfc-editor.org/rfc/rfc6749#section-10.12
 * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.1
 */
export const state = {
  /** 创建一个带有可选编码体的状态 cookie。 */
  async create(options: InternalOptions<"oauth">, origin?: string) {
    const { provider } = options
    if (!provider.checks.includes("state")) {
      if (origin) {
        throw new InvalidCheck(
          "State data was provided but the provider is not configured to use state"
        )
      }
      return
    }

    // IDEA: Allow the user to pass data to be stored in the state
    const payload = {
      origin,
      random: o.generateRandomState(),
    } satisfies EncodedState
    const value = await encode({
      secret: options.jwt.secret,
      token: payload,
      salt: encodedStateSalt,
      maxAge: STATE_MAX_AGE,
    })
    const cookie = await sealCookie("state", value, options)

    return { cookie, value }
  },
  /**
   * 如果提供者配置为使用状态，则返回状态，
   * 并在之后清除容器 cookie。
   * 如果状态缺失或无效，则抛出错误。
   */
  use: useCookie("state", "state"),
  /** 解码状态。如果无法解码，则抛出错误。 */
  async decode(state: string, options: InternalOptions) {
    try {
      options.logger.debug("DECODE_STATE", { state })
      const payload = await decode<EncodedState>({
        secret: options.jwt.secret,
        token: state,
        salt: encodedStateSalt,
      })
      if (payload) return payload
      throw new Error("Invalid state")
    } catch (error) {
      throw new InvalidCheck("State could not be decoded", { cause: error })
    }
  },
}

export const nonce = {
  async create(options: InternalOptions<"oidc">) {
    if (!options.provider.checks.includes("nonce")) return
    const value = o.generateRandomNonce()
    const cookie = await sealCookie("nonce", value, options)
    return { cookie, value }
  },
  /**
   * 如果提供者配置为使用 nonce，则返回 nonce，
   * 并在之后清除容器 cookie。
   * 如果 nonce 缺失或无效，则抛出错误。
   * @see https://openid.net/specs/openid-connect-core-1_0.html#NonceNotes
   * @see https://danielfett.de/2020/05/16/pkce-vs-nonce-equivalent-or-not/#nonce
   */
  use: useCookie("nonce", "nonce"),
}

const WEBAUTHN_CHALLENGE_MAX_AGE = 60 * 15 // 15 minutes in seconds

interface WebAuthnChallengePayload {
  challenge: string
  registerData?: User
}

const webauthnChallengeSalt = "encodedWebauthnChallenge"
export const webauthnChallenge = {
  async create(
    options: InternalOptions<WebAuthnProviderType>,
    challenge: string,
    registerData?: User
  ) {
    return {
      cookie: await sealCookie(
        "webauthnChallenge",
        await encode({
          secret: options.jwt.secret,
          token: { challenge, registerData } satisfies WebAuthnChallengePayload,
          salt: webauthnChallengeSalt,
          maxAge: WEBAUTHN_CHALLENGE_MAX_AGE,
        }),
        options
      ),
    }
  },
  /** 如果存在，则返回 WebAuthn 挑战。 */
  async use(
    options: InternalOptions<WebAuthnProviderType>,
    cookies: RequestInternal["cookies"],
    resCookies: Cookie[]
  ): Promise<WebAuthnChallengePayload> {
    const cookieValue = cookies?.[options.cookies.webauthnChallenge.name]

    const parsed = await parseCookie("webauthnChallenge", cookieValue, options)

    const payload = await decode<WebAuthnChallengePayload>({
      secret: options.jwt.secret,
      token: parsed,
      salt: webauthnChallengeSalt,
    })

    // Clear the WebAuthn challenge cookie after use
    clearCookie("webauthnChallenge", options, resCookies)

    if (!payload) throw new InvalidCheck("WebAuthn challenge was missing")

    return payload
  },
}
