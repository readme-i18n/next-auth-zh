import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server"
import { MissingAdapter } from "../errors.js"

import type { CommonProviderOptions, CredentialInput } from "./index.js"
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyAuthenticationResponseOpts,
  VerifyRegistrationResponseOpts,
} from "@simplewebauthn/server"

import type {
  InternalOptions,
  RequestInternal,
  SemverString,
  User,
} from "../types.js"

export type WebAuthnProviderType = "webauthn"

export const DEFAULT_WEBAUTHN_TIMEOUT = 5 * 60 * 1000 // 5 minutes
export const DEFAULT_SIMPLEWEBAUTHN_BROWSER_VERSION: SemverString = "v9.0.1"

export type RelayingParty = {
  /** 依赖方ID。使用网站的域名。 */
  id: string
  /** 依赖方名称。使用网站的名称。 */
  name: string
  /** 依赖方来源。使用网站的来源。 */
  origin: string
}

type RelayingPartyArray = {
  /** 依赖方ID。使用网站的域名。 */
  id: string | string[]
  /** 依赖方名称。使用网站的名称。 */
  name: string | string[]
  /** 依赖方来源。使用网站的来源。 */
  origin: string | string[]
}

export type GetUserInfo = (
  options: InternalOptions<WebAuthnProviderType>,
  request: RequestInternal
) => Promise<
  | { user: User; exists: true }
  | { user: Omit<User, "id">; exists: false }
  | null
>

type ConfigurableAuthenticationOptions = Omit<
  GenerateAuthenticationOptionsOpts,
  "rpID" | "allowCredentials" | "challenge"
>
type ConfigurableRegistrationOptions = Omit<
  GenerateRegistrationOptionsOpts,
  | "rpName"
  | "rpID"
  | "userID"
  | "userName"
  | "challenge"
  | "userDisplayName"
  | "excludeCredentials"
>
type ConfigurableVerifyAuthenticationOptions = Omit<
  VerifyAuthenticationResponseOpts,
  | "expectedChallenge"
  | "expectedOrigin"
  | "expectedRPID"
  | "authenticator"
  | "response"
>
type ConfigurableVerifyRegistrationOptions = Omit<
  VerifyRegistrationResponseOpts,
  "expectedChallenge" | "expectedOrigin" | "expectedRPID" | "response"
>

export interface WebAuthnConfig extends CommonProviderOptions {
  type: WebAuthnProviderType
  /**
   * 依赖方（RP）配置
   *
   * 如果未提供，将使用请求的URL。
   **/
  relayingParty?: Partial<RelayingPartyArray>
  /**
   * 返回当前请求的依赖方的函数。
   */
  getRelayingParty: (
    options: InternalOptions<WebAuthnProviderType>,
    request: RequestInternal
  ) => RelayingParty
  /**
   * 启用条件UI。
   *
   * 注意：同一时间只能有一个提供者启用此选项。默认为`true`。
   */
  enableConditionalUI: boolean
  /**
   * 登录页面加载的SimpleWebAuthn浏览器脚本版本。
   *
   * 仅当提供者启用了条件UI时加载。如果设置为false，则不会加载任何脚本。
   * 默认为`v9.0.0`。
   */
  simpleWebAuthnBrowserVersion: SemverString | false
  /** 默认Passkey登录/注册表单中显示的字段。
   * 除了默认的Auth.js认证页面外，这些字段不会被验证或强制执行。
   *
   * 默认情况下显示一个电子邮件字段。
   */
  formFields: Record<string, CredentialInput>
  /**
   * 认证期间传递给@simplewebauthn的认证选项。
   */
  authenticationOptions?: Partial<ConfigurableAuthenticationOptions>
  /**
   * 注册期间传递给@simplewebauthn的注册选项。
   */
  registrationOptions: Partial<ConfigurableRegistrationOptions>
  /**
   * 认证期间传递给@simplewebauthn的验证认证选项。
   */
  verifyAuthenticationOptions?: Partial<ConfigurableVerifyAuthenticationOptions>
  /**
   * 注册期间传递给@simplewebauthn的验证注册选项。
   */
  verifyRegistrationOptions?: Partial<ConfigurableVerifyRegistrationOptions>
  /**
   * 返回认证器在注册和认证期间使用的用户信息的函数。
   *
   * - 它接受提供者选项、请求对象，并返回用户信息。
   * - 如果请求包含现有用户的数据（例如电子邮件地址），函数必须返回现有用户且`exists`必须为`true`。
   * - 如果请求包含足够的信息来创建新用户，函数必须返回新用户信息且`exists`必须为`false`。
   * - 如果请求不包含足够的信息来创建新用户，函数必须返回`null`。
   *
   * 它不应有任何副作用（即不应修改数据库）。
   *
   * 在创建passkey时：
   *  - passkey的用户ID将是一个随机字符串。
   *  - passkey的用户名将是user.email
   *  - passkey的用户显示名称将是user.name（如果存在）或user.email
   *
   * 默认情况下，它查找并使用"email"请求参数在数据库中查找用户。
   */
  getUserInfo: GetUserInfo
  /** 用于注册和认证的SimpleWebAuthn实例。 */
  simpleWebAuthn: {
    verifyAuthenticationResponse: typeof verifyAuthenticationResponse
    verifyRegistrationResponse: typeof verifyRegistrationResponse
    generateAuthenticationOptions: typeof generateAuthenticationOptions
    generateRegistrationOptions: typeof generateRegistrationOptions
  }
}

/**
 * 向您的页面添加WebAuthn登录。
 *
 * ### 设置
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import WebAuthn from "@auth/core/providers/webauthn"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [WebAuthn],
 * })
 * ```
 * ### 资源
 *
 * - [SimpleWebAuthn - 服务器端](https://simplewebauthn.dev/docs/packages/server)
 * - [SimpleWebAuthn - 客户端](https://simplewebauthn.dev/docs/packages/client)
 * - [源代码](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/webauthn.ts)
 *
 * :::tip
 *
 * WebAuthn提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/webauthn.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置WebAuthn提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提出问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js严格遵守规范，对于提供者与规范的任何偏差，Auth.js不承担责任。您可以提出问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论](https://authjs.dev/new/github-discussions)中寻求更多帮助。
 *
 * :::
 */
export default function WebAuthn(
  config: Partial<WebAuthnConfig>
): WebAuthnConfig {
  return {
    id: "webauthn",
    name: "WebAuthn",
    enableConditionalUI: true,
    simpleWebAuthn: {
      generateAuthenticationOptions,
      generateRegistrationOptions,
      verifyAuthenticationResponse,
      verifyRegistrationResponse,
    },
    authenticationOptions: { timeout: DEFAULT_WEBAUTHN_TIMEOUT },
    registrationOptions: { timeout: DEFAULT_WEBAUTHN_TIMEOUT },
    formFields: {
      email: {
        label: "Email",
        required: true,
        autocomplete: "username webauthn",
      },
    },
    simpleWebAuthnBrowserVersion: DEFAULT_SIMPLEWEBAUTHN_BROWSER_VERSION,
    getUserInfo,
    getRelayingParty,
    ...config,
    type: "webauthn",
  }
}

/**
 * 为WebAuthn提供者检索用户信息。
 *
 * 它查找"email"查询参数并使用它在数据库中查找用户。
 * 它还接受"name"查询参数来设置用户的显示名称。
 *
 * @param options - 内部选项对象。
 * @param request - 包含查询参数的请求对象。
 * @returns 现有或新用户信息。
 * @throws {MissingAdapter} 如果适配器缺失。
 * @throws {EmailSignInError} 如果未提供电子邮件地址。
 */
const getUserInfo: GetUserInfo = async (options, request) => {
  const { adapter } = options
  if (!adapter)
    throw new MissingAdapter(
      "WebAuthn provider requires a database adapter to be configured"
    )

  // Get email address from the query.
  const { query, body, method } = request
  const email = (method === "POST" ? body?.email : query?.email) as unknown

  // If email is not provided, return null
  if (!email || typeof email !== "string") return null

  const existingUser = await adapter.getUserByEmail(email)
  if (existingUser) {
    return { user: existingUser, exists: true }
  }

  // If the user does not exist, return a new user info.
  return { user: { email }, exists: false }
}

/**
 * 根据提供的选项检索依赖方信息。
 * 如果未提供依赖方信息，则回退使用URL信息。
 */
function getRelayingParty(
  /** 包含提供者和URL信息的选项对象。 */
  options: InternalOptions<WebAuthnProviderType>
): RelayingParty {
  const { provider, url } = options
  const { relayingParty } = provider

  const id = Array.isArray(relayingParty?.id)
    ? relayingParty.id[0]
    : relayingParty?.id

  const name = Array.isArray(relayingParty?.name)
    ? relayingParty.name[0]
    : relayingParty?.name
  const origin = Array.isArray(relayingParty?.origin)
    ? relayingParty.origin[0]
    : relayingParty?.origin

  return {
    id: id ?? url.hostname,
    name: name ?? url.host,
    origin: origin ?? url.origin,
  }
}
