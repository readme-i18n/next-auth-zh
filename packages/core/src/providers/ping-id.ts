import type { OIDCConfig, OIDCUserConfig } from "./index.js"

export interface PingProfile extends Record<string, any> {
  iss: string
  sub: string
  aud: string
  iat: number
  exp: number
  acr: string
  amr: [string]
  auth_time: number
  at_hash: string
  sid: string
  preferred_username: string
  given_name: string
  picture: string
  updated_at: number
  name: string
  family_name: string
  email: string
  env: string
  org: string
  "p1.region": string
}

/**
 * 在您的页面中添加 PingId 登录功能。
 *
 * ## 文档
 *
 * - [在 Ping Identity 中创建应用](https://docs.pingidentity.com/r/en-us/pingone/p1_add_app_worker)
 *
 *  ---
 * ## 示例
 *
 * ```ts
 * import PingId from "@auth/core/providers/ping-id"
 *
 * ...
 * providers: [
 *  PingId({
 *    clientId: AUTH_PING_ID_ID,
 *    clientSecret: AUTH_PING_ID_SECRET,
 *    issuer: PING_ID_ISSUER
 *  })
 * ]
 * ...
 * ```
 *
 * ## 帮助
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵循规范，对于提供商对规范的任何偏离，我们无法承担责任。
 * 您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。
 * 您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 */

export default function PingId(
  options: OIDCUserConfig<PingProfile>
): OIDCConfig<PingProfile> {
  return {
    id: "ping-id",
    name: "Ping Identity",
    type: "oidc",
    options,
  }
}
