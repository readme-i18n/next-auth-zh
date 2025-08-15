/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>LinkedIn</b> 集成。</span>
 * <a href="https://linkedin.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/linkedin.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/linkedin
 */
import type { OIDCConfig, OIDCUserConfig } from "./index.js"

/** @see https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2#response-body-schema */
export interface LinkedInProfile extends Record<string, any> {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
  email: string
  email_verified: boolean
}

/**
 * 向您的页面添加 LinkedIn 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/linkedin
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import LinkedIn from "@auth/core/providers/linkedin"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     LinkedIn({
 *       clientId: LINKEDIN_CLIENT_ID,
 *       clientSecret: LINKEDIN_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [LinkedIn OAuth 文档](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
 *  - [LinkedIn 应用控制台](https://www.linkedin.com/developers/apps/)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 LinkedIn 提供者基于 [OIDC](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::tip
 *
 * LinkedIn 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/linkedin.ts)。
 * 要覆盖默认配置以适应您的使用场景，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，您可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function LinkedIn<P extends LinkedInProfile>(
  options: OIDCUserConfig<P>
): OIDCConfig<P> {
  return {
    id: "linkedin",
    name: "LinkedIn",
    type: "oidc",
    client: { token_endpoint_auth_method: "client_secret_post" },
    issuer: "https://www.linkedin.com/oauth",
    style: { bg: "#069", text: "#fff" },
    checks: ["state"],
    options,
  }
}
