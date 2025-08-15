/**
 * <div class="provider" style={{backgroundColor: "#24292f", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>ClickUp</b> 集成。</span>
 * <a href="https://clickup.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/click-up.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/click-up
 */

import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/** @see [获取认证用户](https://clickup.com/api/clickupreference/operation/GetAuthorizedUser/)*/
export interface ClickUpProfile {
  user: {
    id: number
    username: string
    color: string
    profilePicture: string
  }
}

/**
 * 在您的页面添加 ClickUp 登录功能，并向 [ClickUp APIs](https://clickup.com/api/) 发起请求。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/clickup
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import ClickUp from "@auth/core/providers/click-up"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     ClickUp({
 *       clientId: CLICKUP_CLIENT_ID,
 *       clientSecret: CLICKUP_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [ClickUp - 授权 OAuth 应用](https://clickup.com/api/developer-portal/authentication#oauth-flow)
 * - [源代码](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/click-up.ts)
 *
 * ### 说明
 *
 * 默认情况下，Auth.js 假设 ClickUp 提供程序基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * ClickUp 提供程序附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/click-up.ts)。
 * 要覆盖默认配置以适应您的使用场景，请查看 [自定义内置 OAuth 提供程序](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供程序与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是由于不符合规范引起的，我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function ClickUp(
  config: OAuthUserConfig<ClickUpProfile>
): OAuthConfig<ClickUpProfile> {
  return {
    id: "click-up",
    name: "ClickUp",
    type: "oauth",
    authorization: "https://app.clickup.com/api",
    token: "https://api.clickup.com/api/v2/oauth/token",
    userinfo: "https://api.clickup.com/api/v2/user",
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    checks: ["state"],
    profile: (profile: ClickUpProfile) => {
      return {
        id: profile.user.id.toString(),
        name: profile.user.username,
        profilePicture: profile.user.profilePicture,
        color: profile.user.color,
      }
    },
    style: {
      bg: "#24292f",
      text: "#fff",
    },
    options: config,
  }
}
