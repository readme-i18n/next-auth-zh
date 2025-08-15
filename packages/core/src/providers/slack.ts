/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置 <b>Slack</b> 集成。</span>
 * <a href="https://www.slack.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/slack.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/slack
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface SlackProfile extends Record<string, any> {
  ok: boolean
  sub: string
  "https://slack.com/user_id": string
  "https://slack.com/team_id": string
  email: string
  email_verified: boolean
  date_email_verified: number
  name: string
  picture: string
  given_name: string
  family_name: string
  locale: string
  "https://slack.com/team_name": string
  "https://slack.com/team_domain": string
  "https://slack.com/user_image_24": string
  "https://slack.com/user_image_32": string
  "https://slack.com/user_image_48": string
  "https://slack.com/user_image_72": string
  "https://slack.com/user_image_192": string
  "https://slack.com/user_image_512": string
  "https://slack.com/user_image_1024": string
  "https://slack.com/team_image_34": string
  "https://slack.com/team_image_44": string
  "https://slack.com/team_image_68": string
  "https://slack.com/team_image_88": string
  "https://slack.com/team_image_102": string
  "https://slack.com/team_image_132": string
  "https://slack.com/team_image_230": string
  "https://slack.com/team_image_default": boolean
}

/**
 * 为您的页面添加 Slack 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/slack
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Slack from "@auth/core/providers/slack"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Slack({ clientId: SLACK_CLIENT_ID, clientSecret: SLACK_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Slack 认证文档](https://api.slack.com/authentication)
 * - [使用 Slack 登录](https://api.slack.com/docs/sign-in-with-slack)
 * - [Slack 应用控制台](https://api.slack.com/apps)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Slack 提供者基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::danger
 *
 * Slack 要求您的应用的重定向 URL 使用 https，即使是本地开发也是如此。
 * 一个简单的解决方法是使用像 [ngrok](https://ngrok.com/) 这样的服务，它创建一个到您应用的安全隧道，使用 https。记得将 URL 也设置为 `NEXTAUTH_URL`。
 *
 * :::
 *
 * :::tip
 *
 * Slack 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/slack.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，您可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function Slack<P extends SlackProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "slack",
    name: "Slack",
    type: "oidc",
    issuer: "https://slack.com",
    checks: ["nonce"],
    style: { brandColor: "#611f69" },
    options,
  }
}
