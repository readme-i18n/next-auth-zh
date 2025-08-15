/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Pinterest</b> 集成。</span>
 * <a href="https://www.pinterest.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/pinterest.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/pinterest
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface PinterestProfile extends Record<string, any> {
  account_type: "BUSINESS" | "PINNER"
  profile_image: string
  website_url: string
  username: string
}

/**
 * 为您的页面添加 Pinterest 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/pinterest
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Pinterest from "@auth/core/providers/pinterest"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Pinterest({
 *       clientId: PINTEREST_CLIENT_ID,
 *       clientSecret: PINTEREST_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Pinterest OAuth 文档](https://developers.pinterest.com/docs/getting-started/authentication/)
 *  - [Pinterest 应用控制台](https://developers.pinterest.com/apps/)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Pinterest 提供程序基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 *
 * :::tip
 *
 * 要在生产环境中使用，请确保应用具有标准 API 访问权限，而非试用访问权限
 *
 * :::
 *
 * :::tip
 *
 * Pinterest 提供程序附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/pinterest.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供程序](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供程序与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function PinterestProvider<P extends PinterestProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "pinterest",
    name: "Pinterest",
    type: "oauth",
    authorization: {
      url: "https://www.pinterest.com/oauth",
      params: { scope: "user_accounts:read" },
    },
    token: "https://api.pinterest.com/v5/oauth/token",
    userinfo: "https://api.pinterest.com/v5/user_account",
    profile({ username, profile_image }) {
      return {
        id: username,
        name: username,
        image: profile_image,
        email: null,
      }
    },
    style: {
      brandColor: "#bd081c",
    },
    options,
  }
}
