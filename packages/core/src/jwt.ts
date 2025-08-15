/**
 *
 *
 * 此模块包含用于编码和解码由 Auth.js 签发和使用的 {@link https://authjs.dev/concepts/session-strategies#jwt-session JWT} 的函数和类型。
 *
 * 默认情况下，Auth.js 签发的 JWT 是_加密的_，使用 _A256CBC-HS512_ 算法（{@link https://www.rfc-editor.org/rfc/rfc7518.html#section-5.2.5 JWE}）。
 * 它使用 `AUTH_SECRET` 环境变量或传递的 `secret` 属性来派生合适的加密密钥。
 *
 * :::info 注意
 * Auth.js 的 JWT 旨在由签发它们的同一应用使用。
 * 如果您需要为您的第三方 API 提供 JWT 认证，您应该依赖您的身份提供商。
 * :::
 *
 * ## 安装
 *
 * ```bash npm2yarn
 * npm install @auth/core
 * ```
 *
 * 然后您可以从 `@auth/core/jwt` 导入此子模块。
 *
 * ## 使用
 *
 * :::warning 警告
 * 此模块*将*被重构/更改。我们现在不推荐依赖它。
 * :::
 *
 *
 * ## 资源
 *
 * - [什么是 JWT 会话策略](https://authjs.dev/concepts/session-strategies#jwt-session)
 * - [RFC7519 - JSON Web Token (JWT)](https://www.rfc-editor.org/rfc/rfc7519)
 *
 * @module jwt
 */

import { hkdf } from "@panva/hkdf"
import { EncryptJWT, base64url, calculateJwkThumbprint, jwtDecrypt } from "jose"
import { defaultCookies, SessionStore } from "./lib/utils/cookie.js"
import { Awaitable } from "./types.js"
import type { LoggerInstance } from "./lib/utils/logger.js"
import { MissingSecret } from "./errors.js"
import * as cookie from "./lib/vendored/cookie.js"

const { parse: parseCookie } = cookie
const DEFAULT_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

const now = () => (Date.now() / 1000) | 0

const alg = "dir"
const enc = "A256CBC-HS512"
type Digest = Parameters<typeof calculateJwkThumbprint>[1]

/** 签发一个 JWT。默认情况下，JWT 使用 "A256CBC-HS512" 加密。 */
export async function encode<Payload = JWT>(params: JWTEncodeParams<Payload>) {
  const { token = {}, secret, maxAge = DEFAULT_MAX_AGE, salt } = params
  const secrets = Array.isArray(secret) ? secret : [secret]
  const encryptionSecret = await getDerivedEncryptionKey(enc, secrets[0], salt)

  const thumbprint = await calculateJwkThumbprint(
    { kty: "oct", k: base64url.encode(encryptionSecret) },
    `sha${encryptionSecret.byteLength << 3}` as Digest
  )
  // @ts-expect-error `jose` allows any object as payload.
  return await new EncryptJWT(token)
    .setProtectedHeader({ alg, enc, kid: thumbprint })
    .setIssuedAt()
    .setExpirationTime(now() + maxAge)
    .setJti(crypto.randomUUID())
    .encrypt(encryptionSecret)
}

/** 解码由 Auth.js 签发的 JWT。 */
export async function decode<Payload = JWT>(
  params: JWTDecodeParams
): Promise<Payload | null> {
  const { token, secret, salt } = params
  const secrets = Array.isArray(secret) ? secret : [secret]
  if (!token) return null
  const { payload } = await jwtDecrypt(
    token,
    async ({ kid, enc }) => {
      for (const secret of secrets) {
        const encryptionSecret = await getDerivedEncryptionKey(
          enc,
          secret,
          salt
        )
        if (kid === undefined) return encryptionSecret

        const thumbprint = await calculateJwkThumbprint(
          { kty: "oct", k: base64url.encode(encryptionSecret) },
          `sha${encryptionSecret.byteLength << 3}` as Digest
        )
        if (kid === thumbprint) return encryptionSecret
      }

      throw new Error("no matching decryption secret")
    },
    {
      clockTolerance: 15,
      keyManagementAlgorithms: [alg],
      contentEncryptionAlgorithms: [enc, "A256GCM"],
    }
  )
  return payload as Payload
}

type GetTokenParamsBase = {
  secret?: JWTDecodeParams["secret"]
  salt?: JWTDecodeParams["salt"]
}

export interface GetTokenParams<R extends boolean = false>
  extends GetTokenParamsBase {
  /** 包含 JWT 的请求，JWT 可能在 cookies 中，也可能在 `Authorization` 头中。 */
  req: Request | { headers: Headers | Record<string, string> }
  /**
   * 使用安全前缀作为 cookie 名称，除非 `NEXTAUTH_URL` 中的 URL 是 http://
   * 或未设置（例如开发或测试实例）情况下使用无前缀名称
   */
  secureCookie?: boolean
  /** 如果 JWT 在 cookie 中，`getToken()` 应该查找的名称。 */
  cookieName?: string
  /**
   * 如果设置为 `true`，`getToken()` 将返回原始 JWT
   *
   * @default false
   */
  raw?: R
  decode?: JWTOptions["decode"]
  logger?: LoggerInstance | Console
}

/**
 * 接收一个 Auth.js 请求 (`req`) 并返回 Auth.js 签发的 JWT 的有效载荷，
 * 或原始 JWT 字符串。我们在 cookies 或 `Authorization` 头中查找 JWT。
 */
export async function getToken<R extends boolean = false>(
  params: GetTokenParams<R>
): Promise<R extends true ? string : JWT | null>
export async function getToken(
  params: GetTokenParams
): Promise<string | JWT | null> {
  const {
    secureCookie,
    cookieName = defaultCookies(secureCookie ?? false).sessionToken.name,
    decode: _decode = decode,
    salt = cookieName,
    secret,
    logger = console,
    raw,
    req,
  } = params

  if (!req) throw new Error("Must pass `req` to JWT getToken()")

  const headers =
    req.headers instanceof Headers ? req.headers : new Headers(req.headers)

  const sessionStore = new SessionStore(
    { name: cookieName, options: { secure: secureCookie } },
    parseCookie(headers.get("cookie") ?? ""),
    logger
  )

  let token = sessionStore.value

  const authorizationHeader = headers.get("authorization")

  if (!token && authorizationHeader?.split(" ")[0] === "Bearer") {
    const urlEncodedToken = authorizationHeader.split(" ")[1]
    token = decodeURIComponent(urlEncodedToken)
  }

  if (!token) return null

  if (raw) return token

  if (!secret)
    throw new MissingSecret("Must pass `secret` if not set to JWT getToken()")

  try {
    return await _decode({ token, secret, salt })
  } catch {
    return null
  }
}

async function getDerivedEncryptionKey(
  enc: string,
  keyMaterial: Parameters<typeof hkdf>[1],
  salt: Parameters<typeof hkdf>[2]
) {
  let length: number
  switch (enc) {
    case "A256CBC-HS512":
      length = 64
      break
    case "A256GCM":
      length = 32
      break
    default:
      throw new Error("Unsupported JWT Content Encryption Algorithm")
  }
  return await hkdf(
    "sha256",
    keyMaterial,
    salt,
    `Auth.js Generated Encryption Key (${salt})`,
    length
  )
}

export interface DefaultJWT extends Record<string, unknown> {
  name?: string | null
  email?: string | null
  picture?: string | null
  sub?: string
  iat?: number
  exp?: number
  jti?: string
}

/**
 * 当使用 JWT 会话时，由 `jwt` 回调返回
 *
 * [`jwt` 回调](https://authjs.dev/reference/core/types#jwt)
 */
export interface JWT extends Record<string, unknown>, DefaultJWT {}

export interface JWTEncodeParams<Payload = JWT> {
  /**
   * Auth.js 签发的 JWT 的最大年龄，以秒为单位。
   *
   * @default 30 * 24 * 60 * 60 // 30 天
   */
  maxAge?: number
  /** 与 `secret` 结合使用，以派生 JWT 的加密密钥。 */
  salt: string
  /** 与 `salt` 结合使用，以派生 JWT 的加密密钥。 */
  secret: string | string[]
  /** JWT 的有效载荷。 */
  token?: Payload
}

export interface JWTDecodeParams {
  /** 与 `secret` 结合使用，以派生 JWT 的加密密钥。 */
  salt: string
  /**
   * 与 `salt` 结合使用，以派生 JWT 的加密密钥。
   *
   * @note
   * 您也可以传递一个密钥数组，在这种情况下，第一个成功解密 JWT 的密钥将被使用。
   * 这对于在不使现有会话失效的情况下轮换密钥很有用。
   * 新的密钥应该添加到数组的开头，这将用于所有新会话。
   */
  secret: string | string[]
  /** 要解码的由 Auth.js 签发的 JWT */
  token?: string
}

export interface JWTOptions {
  /**
   * 用于编码/解码 Auth.js 签发的 JWT 的密钥。
   * 它可以是一个密钥数组，在这种情况下，第一个成功解密 JWT 的密钥将被使用。
   * 这对于在不使现有会话失效的情况下轮换密钥很有用。
   * @internal
   */
  secret: string | string[]
  /**
   * Auth.js 签发的 JWT 的最大年龄，以秒为单位。
   *
   * @default 30 * 24 * 60 * 60 // 30 天
   */
  maxAge: number
  /** 覆盖此方法以控制 Auth.js 签发的 JWT 编码。 */
  encode: (params: JWTEncodeParams) => Awaitable<string>
  /** 覆盖此方法以控制 Auth.js 签发的 JWT 解码。 */
  decode: (params: JWTDecodeParams) => Awaitable<JWT | null>
}
