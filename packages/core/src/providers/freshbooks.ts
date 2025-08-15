/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>FreshBooks</b> 集成。</span>
 * <a href="https://freshbooks.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/freshbooks.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/freshbooks
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 在您的页面上添加 FreshBooks 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/freshbooks
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import FreshBooks from "@auth/core/providers/freshbooks"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     FreshBooks({
 *       clientId: FRESHBOOKS_CLIENT_ID,
 *       clientSecret: FRESHBOOKS_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [FreshBooks OAuth 文档](https://www.freshbooks.com/api/authenticating-with-oauth-2-0-on-the-new-freshbooks-api
)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 FreshBooks 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * FreshBooks 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/freshbooks.ts)。
 * 要覆盖默认配置以适应您的使用场景，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
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
export default function Freshbooks(
  options: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "freshbooks",
    name: "Freshbooks",
    type: "oauth",
    authorization: "https://auth.freshbooks.com/service/auth/oauth/authorize",
    token: "https://api.freshbooks.com/auth/oauth/token",
    userinfo: "https://api.freshbooks.com/auth/api/v1/users/me",
    async profile(profile) {
      return {
        id: profile.response.id,
        name: `${profile.response.first_name} ${profile.response.last_name}`,
        email: profile.response.email,
        image: null,
      }
    },
    style: {
      bg: "#0075dd",
      text: "#fff",
    },
    options,
  }
}
