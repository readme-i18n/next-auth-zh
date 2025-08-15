/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Google</b> 集成。</span>
 * <a href="https://google.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/google.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/google
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface GoogleProfile extends Record<string, any> {
  aud: string
  azp: string
  email: string
  email_verified: boolean
  exp: number
  family_name?: string
  given_name: string
  hd?: string
  iat: number
  iss: string
  jti?: string
  locale?: string
  name: string
  nbf?: number
  picture: string
  sub: string
}

/**
 * 为您的页面添加 Google 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/google
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Google from "@auth/core/providers/google"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Google({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Google OAuth 文档](https://developers.google.com/identity/protocols/oauth2)
 *  - [Google OAuth 配置](https://console.developers.google.com/apis/credentials)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Google 提供者基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 *
 * 创建凭证时使用的“授权重定向 URI”必须包含您的完整域名并以回调路径结尾。例如；
 *
 * - 生产环境：`https://{YOUR_DOMAIN}/api/auth/callback/google`
 * - 开发环境：`http://localhost:3000/api/auth/callback/google`
 *
 * :::warning
 * Google 仅在用户首次登录时向应用程序提供刷新令牌。
 *
 * 要强制 Google 重新发放刷新令牌，用户需要从其账户中移除应用程序并重新登录：
 * https://myaccount.google.com/permissions
 *
 * 或者，您也可以在 `authorization` 的 `params` 对象中传递选项，这将强制在登录时始终提供刷新令牌，但这会在每次登录时要求所有用户确认是否希望授予您的应用程序访问权限。
 *
 * 如果您需要访问 Google 账户的 RefreshToken 或 AccessToken 并且没有使用数据库来持久化用户账户，这可能是您需要做的事情。
 *
 * ```ts
 * const options = {
 *   providers: [
 *     Google({
 *       clientId: process.env.GOOGLE_ID,
 *       clientSecret: process.env.GOOGLE_SECRET,
 *       authorization: {
 *         params: {
 *           prompt: "consent",
 *           access_type: "offline",
 *           response_type: "code"
 *         }
 *       }
 *     })
 *   ],
 * }
 * ```
 *
 * :::
 *
 * :::tip
 * Google 还在 OAuth 配置文件中返回一个 `email_verified` 布尔属性。
 *
 * 您可以使用此属性限制对特定域已验证账户的人的访问。
 *
 * ```ts
 * const options = {
 *   ...
 *   callbacks: {
 *     async signIn({ account, profile }) {
 *       if (account.provider === "google") {
 *         return profile.email_verified && profile.email.endsWith("@example.com")
 *       }
 *       return true // 对其他没有 `email_verified` 的提供者进行不同的验证
 *     },
 *   }
 *   ...
 * }
 * ```
 *
 * :::
 * :::tip
 *
 * Google 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/google.ts)。
 * 要覆盖默认值以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提出问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者对规范的任何偏差，Auth.js 不承担责任。您可以提出问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论](https://authjs.dev/new/github-discussions) 中寻求更多帮助。
 *
 * :::
 */
export default function Google<P extends GoogleProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "google",
    name: "Google",
    type: "oidc",
    issuer: "https://accounts.google.com",
    style: {
      brandColor: "#1a73e8",
    },
    options,
  }
}
