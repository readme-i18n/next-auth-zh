/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Box</b> 集成。</span>
 * <a href="https://box.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/box.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/box
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 向您的页面添加 Box 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/box
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Box from "@auth/core/providers/box"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Box({ clientId: BOX_CLIENT_ID, clientSecret: BOX_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Box 开发者文档](https://developer.box.com/reference/)
 *  - [Box OAuth 文档](https://developer.box.com/guides/sso-identities-and-app-users/connect-okta-to-app-users/configure-box/)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Box 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Box 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/box.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function Box(
  options: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "box",
    name: "Box",
    type: "oauth",
    authorization: "https://account.box.com/api/oauth2/authorize",
    token: "https://api.box.com/oauth2/token",
    userinfo: "https://api.box.com/2.0/users/me",
    profile(profile) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.login,
        image: profile.avatar_url,
      }
    },
    style: {
      bg: "#0075C9",
      text: "#fff",
    },
    options,
  }
}
