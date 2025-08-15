/**
 * <div class="provider" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
 * <span style={{fontSize: "1.35rem" }}>
 *  内置的 <b>Apple</b> 登录集成。
 * </span>
 * <a href="https://apple.com" style={{backgroundColor: "black", padding: "12px", borderRadius: "100%" }}>
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/apple.svg" width="24"/>
 * </a>
 * </div>
 *
 * @module providers/apple
 */

import { conformInternal, customFetch } from "../lib/symbols.js"
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/** 使用 profile 回调时，Apple 返回的用户资料。 */
export interface AppleProfile extends Record<string, any> {
  /**
   * 发行者注册声明标识了签发身份令牌的主体。
   * 由于令牌由 Apple 生成，其值为 `https://appleid.apple.com`。
   */
  iss: "https://appleid.apple.com"
  /**
   * 受众注册声明标识了身份令牌的目标接收者。
   * 由于令牌是为您的应用准备的，其值为开发者账户中的 `client_id`。
   */
  aud: string
  /**
   * 签发时间注册声明表示 Apple 签发身份令牌的时间，
   * 以自 Epoch 以来的秒数为单位，UTC 时间。
   */
  iat: number

  /**
   * 过期时间注册声明标识了身份令牌过期的时间或之后的时间，
   * 以自 Epoch 以来的秒数为单位，UTC 时间。
   * 验证令牌时，该值必须大于当前日期/时间。
   */
  exp: number
  /**
   * 主题注册声明标识了身份令牌的主体。
   * 由于此令牌是为您的应用准备的，其值为用户的唯一标识符。
   */
  sub: string
  /**
   * 用于关联客户端会话和身份令牌的字符串值。
   * 此值用于缓解重放攻击，仅在授权请求期间传递时存在。
   */
  nonce: string

  /**
   * 布尔值，指示交易是否在支持 nonce 的平台上进行。
   * 如果您在授权请求中发送了 nonce 但在身份令牌中未看到 nonce 声明，
   * 请检查此声明以决定如何继续。
   * 如果此声明返回 true，您应将 nonce 视为强制性的并终止交易；
   * 否则，您可以继续将 nonce 视为可选的。
   */
  nonce_supported: boolean

  /**
   * 表示用户电子邮件地址的字符串值。
   * 电子邮件地址可能是用户的真实电子邮件地址或代理地址，
   * 取决于他们的状态私人电子邮件中继服务。
   */
  email: string

  /**
   * 字符串或布尔值，指示服务是否已验证电子邮件。
   * 此声明的值始终为 true，因为服务器仅返回已验证的电子邮件地址。
   * 值可以是字符串 (`"true"`) 或布尔值 (`true`)。
   */
  email_verified: "true" | true

  /**
   * 字符串或布尔值，指示用户共享的电子邮件是否为代理地址。
   * 值可以是字符串 (`"true"` 或 `"false"`) 或布尔值 (`true` 或 `false`)。
   */
  is_private_email: boolean | "true" | "false"

  /**
   * 整数值，指示用户是否看起来是真实的人。
   * 使用此声明的值来缓解欺诈。可能的值有：0（或不支持）、1（或未知）、2（或可能是真实的）。
   * 更多信息，请参见 [`ASUserDetectionStatus`](https://developer.apple.com/documentation/authenticationservices/asuserdetectionstatus)。
   * 此声明仅在 iOS 14 及更高版本、macOS 11 及更高版本、watchOS 7 及更高版本、tvOS 14 及更高版本中存在；
   * 基于网页的应用不支持或不存在此声明。
   */
  real_user_status: 0 | 1 | 2

  /**
   * 字符串值，表示用于将用户迁移到您的团队的传输标识符。
   * 此声明仅在您转移应用后的 60 天传输期内存在。
   * 更多信息，请参见 [将新应用和用户引入您的团队](https://developer.apple.com/documentation/sign_in_with_apple/bringing_new_apps_and_users_into_your_team)。
   */
  transfer_sub: string
  at_hash: string
  auth_time: number
  user?: AppleNonConformUser
}

/**
 * 这是 Apple 在用户首次同意应用时发送的 `user` 查询参数的结构。
 * @see https://developer.apple.com/documentation/sign_in_with_apple/request_an_authorization_to_the_sign_in_with_apple_server#4066168
 */
export interface AppleNonConformUser {
  name: {
    firstName: string
    lastName: string
  }
  email: string
}

/**
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/auth/callback/apple
 * ```
 *
 * #### 配置
 * ```ts
 * import Apple from "@auth/core/providers/apple"
 * ...
 * providers: [
 *   Apple({
 *     clientId: env.AUTH_APPLE_ID,
 *     clientSecret: env.AUTH_APPLE_SECRET,
 *   })
 * ]
 * ...
 * ```
 *
 * ### 资源
 *
 * - 使用 Apple 登录 [概述](https://developer.apple.com/sign-in-with-apple/get-started/)
 * - 使用 Apple 登录 [REST API](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api)
 * - [如何从 Apple ID 服务器检索](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/authenticating_users_with_sign_in_with_apple#3383773) 用户信息
 * - [了解更多关于 OAuth](https://authjs.dev/concepts/oauth)
 * - [创建客户端密钥](https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret)
 *
 * ### 注意事项
 *
 * - Apple 不支持 localhost/http URL。您只能使用带有 HTTPS 的实时 URL。
 * - Apple 要求客户端密钥为 JWT。我们提供了一个 CLI 命令 `npx auth add apple`，以帮助您生成一个。
 *   这将提示您输入必要的信息，并在最后将 `AUTH_APPLE_ID` 和 `AUTH_APPLE_SECRET` 添加到您的 `.env` 文件中。
 * - Apple 提供最少的用户信息。它返回用户的电子邮件和名称，但仅在用户首次同意应用时。
 * - Apple 提供者不支持为多个部署（如[预览部署](https://authjs.dev/getting-started/deployment#securing-a-preview-deployment)）设置相同的客户端。
 * - Apple 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/apple.ts)。要覆盖默认值以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * ## 帮助
 *
 * 如果您认为在默认配置中发现了错误，可以[提出问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵循规范，对于提供者与规范的任何偏差，我们无法承担责任。
 * 您可以提出问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论](https://authjs.dev/new/github-discussions)中寻求更多帮助。
 */
export default function Apple(
  config: OAuthUserConfig<AppleProfile>
): OAuthConfig<AppleProfile> {
  return {
    id: "apple",
    name: "Apple",
    type: "oidc",
    issuer: "https://appleid.apple.com",
    authorization: {
      params: {
        scope: "name email", // https://developer.apple.com/documentation/sign_in_with_apple/clientconfigi/3230955-scope
        response_mode: "form_post",
      },
    },
    // We need to parse the special `user` parameter the first time the user consents to the app.
    // It adds the `name` object to the `profile`, with `firstName` and `lastName` fields.
    [conformInternal]: true,
    profile(profile) {
      const name = profile.user
        ? `${profile.user.name.firstName} ${profile.user.name.lastName}`
        : profile.email
      return {
        id: profile.sub,
        name: name,
        email: profile.email,
        image: null,
      }
    },
    // Apple does not provide a userinfo endpoint.
    async [customFetch](...args) {
      const url = new URL(args[0] instanceof Request ? args[0].url : args[0])
      if (url.pathname.endsWith(".well-known/openid-configuration")) {
        const response = await fetch(...args)
        const json = await response.clone().json()
        return Response.json({
          ...json,
          userinfo_endpoint: "https://appleid.apple.com/fake_endpoint",
        })
      }
      return fetch(...args)
    },
    client: { token_endpoint_auth_method: "client_secret_post" },
    style: { text: "#fff", bg: "#000" },
    checks: ["nonce", "state"],
    options: config,
  }
}
