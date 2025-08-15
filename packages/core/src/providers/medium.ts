/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Medium</b> 集成。</span>
 * <a href="https://medium.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/medium.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/medium
 */

import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 向您的页面添加 Medium 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/medium
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Medium from "@auth/core/providers/medium"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Medium({ clientId: MEDIUM_CLIENT_ID, clientSecret: MEDIUM_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Medium OAuth 文档](https://example.com)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Medium 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::warning
 *
 * Medium API 不会返回电子邮件地址。
 *
 * :::
 *
 * :::tip
 *
 * Medium 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/medium.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function Medium(
  config: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "medium",
    name: "Medium",
    type: "oauth",
    authorization: "https://medium.com/m/oauth/authorize?scope=basicProfile",
    token: "https://api.medium.com/v1/tokens",
    userinfo: "https://api.medium.com/v1/me",
    profile(profile) {
      return {
        id: profile.data.id,
        name: profile.data.name,
        email: null,
        image: profile.data.imageUrl,
      }
    },
    options: config,
  }
}
