/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>SimpleLogin</b> 集成。</span>
 * <a href="https://simplelogin.io">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/simplelogin.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/simplelogin
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface SimpleLoginProfile {
  id: number
  sub: string
  email: string
  email_verified: boolean
  name: string
  avatar_url: string | undefined
  client: string
}

/**
 * 向您的页面添加 SimpleLogin 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/simplelogin
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import SimpleLogin from "@auth/core/providers/simplelogin"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     SimpleLogin({
 *       clientId: SIMPLELOGIN_CLIENT_ID,
 *       clientSecret: SIMPLELOGIN_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [使用 SimpleLogin 登录](https://simplelogin.io/developer/)
 *  - [SimpleLogin OAuth 文档](https://simplelogin.io/docs/siwsl/intro/)
 *  - [SimpleLogin OAuth 配置](https://app.simplelogin.io/developer)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 SimpleLogin 提供者基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * 使用的“授权重定向 URI”必须包含您的完整域名并以回调路径结尾。默认情况下，SimpleLogin 将所有 `http[s]://localhost:*` 地址列入白名单以方便本地开发。例如；
 *
 * - 生产环境：`https://{YOUR_DOMAIN}/api/auth/callback/simplelogin`
 * - 开发环境：默认情况下 **localhost** 被列入白名单。
 *
 * :::warning
 *
 * **出于安全考虑，授权重定向 URI** 必须使用 **HTTPS**（`localhost` 除外）。
 *
 * :::
 *
 * :::tip
 *
 * SimpleLogin 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/simplelogin.ts)。
 * 要根据您的使用情况覆盖默认值，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，我们无法承担责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function SimpleLogin<P extends SimpleLoginProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "simplelogin",
    name: "SimpleLogin",
    type: "oidc",
    issuer: "https://app.simplelogin.io",
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.avatar_url,
      }
    },
    style: { brandColor: "#e3156a" },
    options,
  }
}
