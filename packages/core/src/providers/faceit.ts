/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>FACEIT</b> 集成。</span>
 * <a href="https://faceit.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/faceit.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/faceit
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 向您的页面添加 FACEIT 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/faceit
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import FACEIT from "@auth/core/providers/faceit"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     FACEIT({ clientId: FACEIT_CLIENT_ID, clientSecret: FACEIT_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [FACEIT OAuth 文档](https://cdn.faceit.com/third_party/docs/FACEIT_Connect_3.0.pdf)
 *
 * ### 注意事项
 *
 * 授权类型: Authorization Code
 * 获取基本信息（邮箱、昵称、guid 和头像）所需的作用域: openid, email, profile
 * 默认情况下，Auth.js 假设 FACEIT 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * FACEIT 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/faceit.ts)。
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
export default function FACEIT(
  options: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "faceit",
    name: "FACEIT",
    type: "oauth",
    authorization: "https://accounts.faceit.com/accounts?redirect_popup=true",
    // @ts-expect-error - TODO fix this
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${options.clientId}:${options.clientSecret}`
      ).toString("base64")}`,
    },
    token: "https://api.faceit.com/auth/v1/oauth/token",
    userinfo: "https://api.faceit.com/auth/v1/resources/userinfo",
    profile(profile) {
      return {
        id: profile.guid,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }
    },
    options,
  }
}
