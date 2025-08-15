/**
 * <div class="provider" style={{backgroundColor: "#00a1e0", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Salesforce</b> 集成。</span>
 * <a href="https://www.salesforce.com/ap/?ir=1">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/salesforce.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/salesforce
 */
import type { OIDCConfig, OIDCUserConfig } from "./index.js"

export interface SalesforceProfile extends Record<string, any> {
  sub: string
  nickname: string
  email: string
  picture: string
}

/**
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/salesforce
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import Salesforce from "@auth/core/providers/salesforce"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Salesforce({
 *       clientId: AUTH_SALESFORCE_ID,
 *       clientSecret: AUTH_SALESFORCE_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Auth0 文档](https://auth0.com/docs/authenticate)
 *
 * ### 注意事项
 *
 * Salesforce 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/salesforce.ts)。要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * ## 帮助
 *
 * 如果您认为在默认配置中发现了错误，您可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵循规范，对于提供者与规范的任何偏差，Auth.js 无法承担责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 */
export default function Salesforce(
  options: OIDCUserConfig<SalesforceProfile>
): OIDCConfig<SalesforceProfile> {
  return {
    id: "salesforce",
    name: "Salesforce",
    type: "oidc",
    issuer: "https://login.salesforce.com",
    idToken: false,
    checks: ["pkce", "state", "nonce"],
    style: { bg: "#00a1e0" },
    options,
  }
}
