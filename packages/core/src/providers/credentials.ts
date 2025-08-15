import type { CommonProviderOptions } from "./index.js"
import type { Awaitable, User } from "../types.js"
import type { JSX } from "preact"

/**
 * 除了在 {@link CredentialsConfig.authorize} 内部提供类型安全外，
 * 它还决定了凭证输入字段如何在默认登录页面上渲染。
 */
export interface CredentialInput
  extends Partial<JSX.IntrinsicElements["input"]> {
  label?: string
}

/** 需要配置 Credentials Provider。 */
export interface CredentialsConfig<
  CredentialsInputs extends Record<string, CredentialInput> = Record<
    string,
    CredentialInput
  >,
> extends CommonProviderOptions {
  type: "credentials"
  credentials: CredentialsInputs
  /**
   * 完全控制如何处理从用户接收到的凭证。
   *
   * :::warning
   * 默认情况下不对用户输入进行验证，因此请确保通过像 [Zod](https://zod.dev) 这样的流行库进行验证。
   * :::
   *
   * 此方法期望返回一个 `User` 对象以表示登录成功。
   *
   * 如果抛出 `CredentialsSignin` 或返回 `null`，可能会发生两种情况：
   * 1. 用户被重定向到登录页面，URL 中包含 `error=CredentialsSignin&code=credentials`。`code` 是可配置的，见下文。
   * 2. 如果在服务器端处理表单操作的框架中抛出此错误，此错误将由登录表单操作抛出，因此您需要在那里处理它。
   *
   * 对于情况1，通常建议不要提示用户例如输入了错误的用户名或密码，
   * 而是尝试使用类似“invalid-credentials”的通用信息。尽量使客户端错误信息尽可能通用。
   *
   * 要自定义错误代码，您可以创建一个扩展 {@link CredentialsSignin} 的自定义错误，并在 `authorize` 中抛出它。
   *
   * @example
   * ```ts
   * class CustomError extends CredentialsSignin {
   *  code = "custom_error"
   * }
   * // URL 将包含 `error=CredentialsSignin&code=custom_error`
   * ```
   *
   * @example
   * ```ts
   * async authorize(credentials, request) { // 您也可以访问原始请求
   *   if(!isValidCredentials(credentials)) {
   *      throw new CustomError()
   *   }
   *   return await getUser(credentials) // 假设它返回一个 User 或 null
   * }
   * ```
   */
  authorize: (
    /**
     * 可用键由 {@link CredentialInput} 确定。
     *
     * @note 字段的存在/正确性在编译时无法保证，
     * 因此您应始终在使用前验证输入。
     *
     * 您可以根据您的用例添加基本验证，
     * 或者您可以使用像 [Zod](https://zod.dev) 这样的流行库。
     */
    credentials: Partial<Record<keyof CredentialsInputs, unknown>>,
    /** 原始请求。 */
    request: Request
  ) => Awaitable<User | null>
}

export type CredentialsProviderId = "credentials"

/**
 * Credentials 提供者允许您处理使用任意凭证的登录，
 * 如用户名和密码、域、双因素认证或硬件设备（例如 YubiKey U2F / FIDO）。
 *
 * 它旨在支持您需要针对现有系统进行用户认证的用例。
 *
 * 它带来的限制是以这种方式认证的用户不会持久化到数据库中，
 * 因此，只有在会话启用了 JSON Web Tokens 时才能使用 Credentials 提供者。
 *
 * :::caution
 * 为基于凭证的认证提供的功能故意受限，以劝阻使用密码，因为用户名-密码模型存在固有的安全风险。
 *
 * OAuth 提供者花费大量金钱、时间和工程努力来构建：
 *
 * - 滥用检测（机器人防护、速率限制）
 * - 密码管理（密码重置、凭证填充、轮换）
 * - 数据安全（加密/加盐、强度验证）
 *
 * 以及更多认证解决方案。您的应用程序很可能会受益于利用这些经过实战检验的解决方案，而不是尝试从头开始重建它们。
 *
 * 如果您仍然希望为您的应用程序构建基于密码的认证，尽管存在这些风险，Auth.js 给您完全控制权来实现。
 *
 * :::
 *
 * 有关如何与令牌交互的更多信息，请参阅 [回调文档](/reference/core#authconfig#callbacks)。例如，您可以通过从 `jwt()` 回调返回一个对象来向令牌添加额外信息：
 *
 * ```ts
 * callbacks: {
 *   async jwt({ token, user, account, profile, isNewUser }) {
 *     if (user) {
 *       token.id = user.id
 *     }
 *     return token
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * import { Auth } from "@auth/core"
 * import Credentials from "@auth/core/providers/credentials"
 *
 * const request = new Request("https://example.com")
 * const response = await AuthHandler(request, {
 *   providers: [
 *     Credentials({
 *       credentials: {
 *         username: { label: "Username" },
 *         password: {  label: "Password", type: "password" }
 *       },
 *       async authorize({ request }) {
 *         const response = await fetch(request)
 *         if(!response.ok) return null
 *         return await response.json() ?? null
 *       }
 *     })
 *   ],
 *   secret: "...",
 *   trustHost: true,
 * })
 * ```
 * @see [用户名/密码示例](https://authjs.dev/getting-started/authentication/credentials)
 */
export default function Credentials<
  CredentialsInputs extends Record<string, CredentialInput> = Record<
    string,
    CredentialInput
  >,
>(config: Partial<CredentialsConfig<CredentialsInputs>>): CredentialsConfig {
  return {
    id: "credentials",
    name: "Credentials",
    type: "credentials",
    credentials: {},
    authorize: () => null,
    // @ts-expect-error
    options: config,
  }
}
