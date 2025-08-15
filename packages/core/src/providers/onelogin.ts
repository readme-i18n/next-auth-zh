/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>OneLogin</b> 集成。</span>
 * <a href="https://onelogin.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/onelogin.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/onelogin
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 在您的页面中添加 OneLogin 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/onelogin
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import OneLogin from "@auth/core/providers/onelogin"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     OneLogin({
 *       clientId: ONELOGIN_CLIENT_ID,
 *       clientSecret: ONELOGIN_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [OneLogin OAuth 文档](https://example.com)
 *
 * ### 备注
 *
 * 默认情况下，Auth.js 假设 OneLogin 提供者基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::tip
 *
 * OneLogin 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/onelogin.ts)。
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
export default function OneLogin(
  config: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "onelogin",
    name: "OneLogin",
    type: "oidc",
    wellKnown: `${config.issuer}/oidc/2/.well-known/openid-configuration`,
    options: config,
  }
}
