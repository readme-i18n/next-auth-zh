/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>IdentityServer4</b> 集成。</span>
 * <a href="https://identityserver4.readthedocs.io">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/identity-server4.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/identity-server4
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 向您的页面添加 IdentityServer4 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/identity-server4
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import IdentityServer4 from "@auth/core/providers/identity-server4"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     IdentityServer4({
 *       clientId: IDENTITY_SERVER4_CLIENT_ID,
 *       clientSecret: IDENTITY_SERVER4_CLIENT_SECRET,
 *       issuer: IDENTITY_SERVER4_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [IdentityServer4 OAuth 文档](https://identityserver4.readthedocs.io/en/latest/)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 IdentityServer4 提供者
 * 基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::warning
 * IdentityServer4 已停止维护，仅发布安全更新至 2022 年 11 月。您应考虑使用替代提供者。
 * :::
 * :::tip
 *
 * IdentityServer4 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/identity-server4.ts)。
 * 要针对您的使用场景覆盖默认值，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，
 * 我们无法承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function IdentityServer4(
  options: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "identity-server4",
    name: "IdentityServer4",
    type: "oidc",
    options,
  }
}
