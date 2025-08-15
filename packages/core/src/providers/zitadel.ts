/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Zitadel</b> 集成。</span>
 * <a href="https://zitadel.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/zitadel.svg" height="48"/>
 * </a>
 * </div>
 *
 * @module providers/zitadel
 */

import type { OIDCConfig, OAuthUserConfig } from "./index.js"

/**
 * 使用 profile 回调时从 ZITADEL 返回的用户资料。标准声明参考见[此处](https://zitadel.com/docs/apis/openidoauth/claims#standard-claims)。
 * 如果需要访问 ZITADEL API 或需要额外信息，请确保添加相应的作用域。
 */
export interface ZitadelProfile extends Record<string, any> {
  amr: string // Authentication Method References as defined in RFC8176
  aud: string // The audience of the token, by default all client id's and the project id are included
  auth_time: number // UNIX time of the authentication
  azp: string // Client id of the client who requested the token
  email: string // Email Address of the subject
  email_verified: boolean // if the email was verified by ZITADEL
  exp: number // Time the token expires (as unix time)
  family_name: string // The subjects family name
  given_name: string // Given name of the subject
  gender: string // Gender of the subject
  iat: number // Time of the token was issued at (as unix time)
  iss: string // Issuing domain of a token
  jti: string // Unique id of the token
  locale: string // Language from the subject
  name: string // The subjects full name
  nbf: number // Time the token must not be used before (as unix time)
  picture: string // The subjects profile picture
  phone: string // Phone number provided by the user
  phone_verified: boolean // if the phonenumber was verified by ZITADEL
  preferred_username: string // ZITADEL's login name of the user. Consist of username@primarydomain
  sub: string // Subject ID of the user
}

/**
 * 向您的页面添加 ZITADEL 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/zitadel
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import ZITADEL from "@auth/core/providers/zitadel"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     ZITADEL({
 *       clientId: ZITADEL_CLIENT_ID,
 *       clientSecret: ZITADEL_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 * - [ZITADEL OpenID 端点](https://zitadel.com/docs/apis/openidoauth/endpoints)
 * - [ZITADEL 推荐的 OAuth 流程](https://zitadel.com/docs/guides/integrate/oauth-recommended-flows)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 ZITADEL 提供者基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * 创建凭证时使用的重定向 URI 必须包含您的完整域名并以回调路径结尾。例如：
 * - 生产环境：`https://{YOUR_DOMAIN}/api/auth/callback/zitadel`
 * - 开发环境：`http://localhost:3000/api/auth/callback/zitadel`
 *
 * 确保在 ZITADEL 控制台中启用开发模式以允许本地开发的重定向。
 *
 * :::tip
 *
 * ZITADEL 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/zitadel.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 * :::tip
 *
 * ZITADEL 还在 profile 中返回一个 email_verified 布尔属性。您可以使用此属性限制仅允许已验证账户的用户访问。
 * ```ts
 * const options = {
 *   ...
 *   callbacks: {
 *     async signIn({ account, profile }) {
 *       if (account.provider === "zitadel") {
 *         return profile.email_verified;
 *       }
 *       return true; // 对其他没有 `email_verified` 的提供者进行不同的验证
 *     },
 *   }
 *   ...
 * }
 * ```
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
export default function ZITADEL<P extends ZitadelProfile>(
  options: OAuthUserConfig<P>
): OIDCConfig<P> {
  return {
    id: "zitadel",
    name: "ZITADEL",
    type: "oidc",
    options,
  }
}
