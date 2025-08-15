/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>WordPress</b> 集成。</span>
 * <a href="https://wordpress.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/wordpress.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/wordpress
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 在您的页面中添加 WordPress 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/wordpress
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import WordPress from "@auth/core/providers/wordpress"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     WordPress({
 *       clientId: WORKPRESS_CLIENT_ID,
 *       clientSecret: WORKPRESS_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [WordPress OAuth 文档](https://developer.wordpress.com/docs/oauth2/)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 WordPress 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * WordPress 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/wordpress.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是由于不符合规范造成的，
 * 我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function WordPress(
  config: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "wordpress",
    name: "WordPress.com",
    type: "oauth",
    authorization:
      "https://public-api.wordpress.com/oauth2/authorize?scope=auth",
    token: "https://public-api.wordpress.com/oauth2/token",
    userinfo: "https://public-api.wordpress.com/rest/v1/me",
    profile(profile) {
      return {
        id: profile.ID,
        name: profile.display_name,
        email: profile.email,
        image: profile.avatar_URL,
      }
    },
    options: config,
  }
}
