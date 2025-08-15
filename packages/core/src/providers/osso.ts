/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Osso</b> 集成。</span>
 * <a href="https://ossoapp.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/osso.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/osso
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 向您的页面添加 Osso 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/osso
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Osso from "@auth/core/providers/osso"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Osso({
 *       clientId: OSSO_CLIENT_ID,
 *       clientSecret: OSSO_CLIENT_SECRET,
 *       issuer: OSSO_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 * Osso 是一个开源服务，它处理针对身份提供者的 SAML 认证，规范化配置文件，并通过 OAuth 2.0 代码授权流程使这些配置文件可供您使用。
 * 
 * - 如果您还没有 Osso 实例，您可以使用 [Osso 的演示应用](https://demo.ossoapp.com) 进行测试。有关部署 Osso 实例的文档，请参阅 https://ossoapp.com/docs/deploy/overview/
 *  - [Osso OAuth 文档](https://ossoapp.com/)
 *
 * 您可以在 Osso 管理界面上配置您的 OAuth 客户端，即 https://demo.ossoapp.com/admin/config - 您需要获取客户端 ID 和密钥，并允许列出您的重定向 URI。
 * [SAML SSO 与 OAuth 有所不同](https://ossoapp.com/blog/saml-vs-oauth) - 对于每个希望使用 SAML 登录到您的应用程序的租户，您和您的客户需要在 Osso 的管理界面和租户的身份提供者的管理仪表板中执行多步配置。Osso 为 Okta 和 OneLogin 等提供者提供了文档，这些是基于云的 IDP，也提供用于测试的开发人员账户。Osso 还提供了一个 [模拟 IDP](https://idp.ossoapp.com)，您可以在不需要注册身份提供者服务的情况下用于测试。

 * 在 https://ossoapp.com/docs/configure/overview 查看 Osso 的完整配置和测试文档。
 * 
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Osso 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::note
 * 
 * `issuer` 应该是完全限定的域名，例如 `demo.ossoapp.com`
 * 
 * :::
 * 
 * :::tip
 *
 * Osso 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/osso.ts)。
 * 要覆盖默认值以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，您可以 [提出问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提出问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在 [讨论](https://authjs.dev/new/github-discussions) 中寻求更多帮助。
 *
 * :::
 */
export default function Osso(
  config: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "osso",
    name: "Osso",
    type: "oauth",
    authorization: `${config.issuer}oauth/authorize`,
    token: `${config.issuer}oauth/token`,
    userinfo: `${config.issuer}oauth/me`,
    options: config,
  }
}
