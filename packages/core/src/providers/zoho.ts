/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>ZOHO</b> 集成。</span>
 * <a href="https://zoho.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/zoho.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/zoho
 */

import type { OAuthConfig, OAuthUserConfig } from "./index.js"
/**
 * 在您的页面上添加 ZOHO 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/zoho
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import ZOHO from "@auth/core/providers/zoho"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     ZOHO({ clientId: ZOHO_CLIENT_ID, clientSecret: ZOHO_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Zoho OAuth 2.0 集成指南](https://www.zoho.com/accounts/protocol/oauth/web-server-applications.html)
 * - [Zoho API 控制台](https://api-console.zoho.com)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 ZOHO 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * ZOHO 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/zoho.ts)。
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
export default function Zoho(
  config: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "zoho",
    name: "Zoho",
    type: "oauth",
    authorization:
      "https://accounts.zoho.com/oauth/v2/auth?scope=AaaServer.profile.Read",
    token: "https://accounts.zoho.com/oauth/v2/token",
    userinfo: "https://accounts.zoho.com/oauth/user/info",
    profile(profile) {
      return {
        id: profile.ZUID,
        name: `${profile.First_Name} ${profile.Last_Name}`,
        email: profile.Email,
        image: null,
      }
    },
    options: config,
  }
}
