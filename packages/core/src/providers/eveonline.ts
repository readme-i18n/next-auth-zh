/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>EVEOnline</b> 集成。</span>
 * <a href="https://eveonline.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/eveonline.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/eveonline
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface EVEOnlineProfile extends Record<string, any> {
  CharacterID: number
  CharacterName: string
  ExpiresOn: string
  Scopes: string
  TokenType: string
  CharacterOwnerHash: string
  IntellectualProperty: string
}

/**
 * 向您的页面添加 EveOnline 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/eveonline
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import EveOnline from "@auth/core/providers/eveonline"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     EveOnline({
 *       clientId: EVEONLINE_CLIENT_ID,
 *       clientSecret: EVEONLINE_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [EveOnline OAuth 文档](https://developers.eveonline.com/blog/article/sso-to-authenticated-calls)
 *
 * ### 注意事项
 *
 * :::tip
 * 创建应用时，请确保选择 `Authentication Only` 作为连接类型。
 * :::
 *
 * :::tip
 * 如果使用 JWT 进行会话管理，您可以将 `CharacterID` 添加到 JWT 和会话中。示例：
 * ```ts
 * options: {
 *   jwt: {
 *     secret: process.env.JWT_SECRET,
 *   },
 *   callbacks: {
 *     session: async ({ session, token }) => {
 *       session.user.id = token.id;
 *       return session;
 *     }
 *   }
 * }
 * ```
 * :::
 * 默认情况下，Auth.js 假设 EveOnline 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * EveOnline 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/eveonline.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。
 * 您可以提交问题，但如果问题是由于不符合规范造成的，我们可能不会寻求解决方案。
 * 您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function EVEOnline<P extends EVEOnlineProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "eveonline",
    name: "EVE Online",
    type: "oauth",
    authorization:
      "https://login.eveonline.com/v2/oauth/authorize?scope=publicData",
    token: "https://login.eveonline.com/v2/oauth/token",
    userinfo: "https://login.eveonline.com/oauth/verify",
    checks: ["state"],
    profile(profile) {
      return {
        id: String(profile.CharacterID),
        name: profile.CharacterName,
        email: null,
        image: `https://image.eveonline.com/Character/${profile.CharacterID}_128.jpg`,
      }
    },
    options,
  }
}
