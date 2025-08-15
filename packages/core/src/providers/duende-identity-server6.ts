/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>DuendeIdentityServer6</b> 集成。</span>
 * <a href="https://docs.duendesoftware.com/identityserver/v6">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/duende-identity-server6.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/duende-identity-server6
 */
import type { OAuthConfig, OAuthUserConfig } from "./oauth.js"

export interface DuendeISUser extends Record<string, any> {
  email: string
  id: string
  name: string
  verified: boolean
}

/**
 * 向您的页面添加 DuendeIdentityServer6 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/duende-identity-server6
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import DuendeIdentityServer6 from "@auth/core/providers/duende-identity-server6"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     DuendeIdentityServer6({
 *       clientId: DIS6_CLIENT_ID,
 *       clientSecret: DIS6_CLIENT_SECRET,
 *       issuer: DIS6_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [DuendeIdentityServer6 文档](https://docs.duendesoftware.com/identityserver/v6)
 *
 * ### 说明
 *
 *
 * ## 演示 IdentityServer
 *
 * 以下配置适用于位于 https://demo.duendesoftware.com/ 的演示服务器。
 *
 * 如果您想尝试，可以复制并粘贴下面的配置。
 *
 * 您可以使用 <b>bob/bob</b> 或 <b>alice/alice</b> 登录演示服务。
 *
 * ```ts
 * import DuendeIdentityServer6 from "@auth/core/providers/duende-identity-server6"
 * providers: [
 *   DuendeIdentityServer6({
 *     clientId: "interactive.confidential",
 *     clientSecret: "secret",
 *     issuer: "https://demo.duendesoftware.com",
 *   })
 * ]
 * ```
 * 默认情况下，Auth.js 假设 DuendeIdentityServer6 提供程序基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::tip
 *
 * DuendeIdentityServer6 提供程序附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/duende-identity-server6.ts)。
 * 要覆盖默认值以适应您的用例，请查看 [自定义内置 OAuth 提供程序](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提出问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供程序与规范的任何偏差，Auth.js 不承担责任。您可以提出问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在 [讨论](https://authjs.dev/new/github-discussions) 中寻求更多帮助。
 *
 * :::
 */
export default function DuendeIdentityServer6<P extends DuendeISUser>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "duende-identity-server6",
    name: "DuendeIdentityServer6",
    type: "oidc",
    options,
  }
}
