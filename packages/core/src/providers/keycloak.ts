/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Keycloak</b> 集成。</span>
 * <a href="https://keycloak.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/keycloak.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/keycloak
 */
import type { OIDCConfig, OIDCUserConfig } from "./index.js"

export interface KeycloakProfile extends Record<string, any> {
  exp: number
  iat: number
  auth_time: number
  jti: string
  iss: string
  aud: string
  sub: string
  typ: string
  azp: string
  session_state: string
  at_hash: string
  acr: string
  sid: string
  email_verified: boolean
  name: string
  preferred_username: string
  given_name: string
  family_name: string
  email: string
  picture: string
  user: any
}

/**
 * 在您的页面中添加 Keycloak 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/keycloak
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Keycloak from "@auth/core/providers/keycloak"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Keycloak({
 *       clientId: KEYCLOAK_CLIENT_ID,
 *       clientSecret: KEYCLOAK_CLIENT_SECRET,
 *       issuer: KEYCLOAK_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Keycloak OIDC 文档](https://www.keycloak.org/docs/latest/server_admin/#_oidc_clients)
 *
 * :::tip
 *
 * 在 Keycloak 中创建一个 "Access Type" 为 "confidential" 的 openid-connect 客户端。
 *
 * :::
 *
 * :::note
 *
 * issuer 应包含 realm —— 例如 https://my-keycloak-domain.com/realms/My_Realm
 *
 * :::
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Keycloak 提供者基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::tip
 *
 * Keycloak 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/keycloak.ts)。
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
export default function Keycloak<P extends KeycloakProfile>(
  options: OIDCUserConfig<P>
): OIDCConfig<P> {
  return {
    id: "keycloak",
    name: "Keycloak",
    type: "oidc",
    style: { brandColor: "#428bca" },
    options,
  }
}
