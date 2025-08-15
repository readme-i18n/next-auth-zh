/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Webex</b> 集成。</span>
 * <a href="https://webex.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/webex.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/webex
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 使用 profile 回调时从 Webex 返回的用户资料。
 *
 * 请参考 Webex 开发者门户上的 {@link https://developer.webex.com/docs/api/v1/people/get-my-own-details People - Get My Own Details}
 * 获取额外字段。返回的字段可能因用户角色、OAuth 集成的范围以及 OAuth 集成所属的组织而异。
 */
export interface WebexProfile extends Record<string, any> {
  id: string
  emails: string[]
  displayName?: string
  avatar?: string
}

/**
 * 向您的页面添加 Webex 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/webex
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Webex from "@auth/core/providers/webex"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Webex({ clientId: WEBEX_CLIENT_ID, clientSecret: WEBEX_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Webex OAuth 2.0 集成指南](https://developer.webex.com/docs/integrations)
 * - [使用 Webex 登录](https://developer.webex.com/docs/login-with-webex)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Webex 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Webex 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/webex.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，您可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function Webex<P extends WebexProfile>(
  config: OAuthUserConfig<P> & { apiBaseUrl?: string }
): OAuthConfig<P> {
  const apiBaseUrl = config?.apiBaseUrl ?? "https://webexapis.com/v1"

  return {
    id: "webex",
    name: "Webex",
    type: "oauth",
    authorization: {
      url: `${apiBaseUrl}/authorize`,
      params: { scope: "spark:kms spark:people_read" },
    },
    token: `${apiBaseUrl}/access_token`,
    userinfo: `${apiBaseUrl}/people/me`,
    profile(profile) {
      return {
        id: profile.id,
        email: profile.emails[0],
        name: profile.displayName,
        image: profile.avatar,
      }
    },
    options: config,
  }
}
