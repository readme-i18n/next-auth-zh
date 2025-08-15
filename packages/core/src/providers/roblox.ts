/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Roblox</b> 集成。</span>
 * <a href="https://roblox.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/roblox.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/roblox
 */
import type { OIDCUserConfig, OIDCConfig } from "./index.js"

/**
 * 对应于此处记录的用户结构：
 * https://create.roblox.com/docs/cloud/reference/oauth2 (Example User with Profile Scope)
 */
export interface RobloxProfile extends Record<string, any> {
  /* Roblox 用户 ID */
  sub: string

  /* Roblox 显示名称 */
  name: string

  /* Roblox 显示名称 */
  nickname: string

  /* Roblox 用户名 */
  preferred_username: string

  /* Roblox 账户创建时间的 Unix 时间戳。 */
  created_at: number

  /* Roblox 账户个人资料 URL */
  profile: string

  /* Roblox 头像头像图片。如果头像图片尚未生成或已被审核，可能为 null */
  picture: string | null
}

/**
 * 向您的页面添加 Roblox 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/roblox
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Roblox from "@auth/providers/roblox"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Roblox({
 *       clientId: AUTH_ROBLOX_ID,
 *       clientSecret: AUTH_ROBLOX_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Roblox OAuth 文档](https://create.roblox.com/docs/cloud/open-cloud/oauth2-overview)
 *  - [Roblox OAuth 应用](https://create.roblox.com/dashboard/credentials?activeTab=OAuthTab)
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵循规范，对于提供者任何偏离规范的行为，我们无法承担责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function Roblox(
  options: OIDCUserConfig<RobloxProfile>
): OIDCConfig<RobloxProfile> {
  return {
    id: "roblox",
    name: "Roblox",
    type: "oidc",
    authorization: { params: { scope: "openid profile" } },
    issuer: "https://apis.roblox.com/oauth/",
    checks: ["pkce", "state"],
    style: { bg: "#5865F2", text: "#fff" },
    options,
  }
}
