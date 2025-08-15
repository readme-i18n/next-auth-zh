/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Mattermost</b> 集成。</span>
 * <a href="https://mattermost.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/mattermost.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/mattermost
 */
import type { OAuthConfig, OAuthUserConfig } from "./oauth.js"

/** [获取用户](https://api.mattermost.com/#tag/users/operation/GetUser) */
export interface MattermostProfile {
  id: string
  /** 用户创建的时间，以毫秒为单位 */
  create_at: number
  /** 用户最后更新的时间，以毫秒为单位 */
  update_at: number
  /** 用户删除的时间，以毫秒为单位 */
  delete_at: number
  username: string
  auth_data: string
  auth_service: string
  email: string
  email_verified: boolean
  nickname: string
  first_name: string
  last_name: string
  position: string
  roles: string
  notify_props: {
    /** 设置为 "true" 以启用频道范围内的通知（@channel, @all 等），"false" 以禁用。默认为 "true"。 */
    channel: string
    comments: string
    /** 设置为 "all" 以接收所有活动的桌面通知，"mention" 仅接收提及和直接消息，"none" 以禁用。默认为 "all"。 */
    desktop: string
    /** 设置为 "true" 以启用桌面通知的声音，"false" 以禁用。默认为 "true"。 */
    desktop_sound: string
    desktop_threads: string
    /** 设置为 "true" 以启用电子邮件通知，"false" 以禁用。默认为 "true"。 */
    email: string
    email_threads: string
    /** 设置为 "true" 以启用对名字的提及。如果设置了名字，默认为 "true"，否则为 "false"。 */
    first_name: string
    /** 一个逗号分隔的单词列表，视为提及。默认为用户名和 @username。 */
    mention_keys: string
    /** 设置为 "all" 以接收所有活动的推送通知，"mention" 仅接收提及和直接消息，"none" 以禁用。默认为 "mention"。 */
    push: string
    push_status: string
    push_threads: string
  }
  last_password_update: number
  locale: string
  timezone: {
    /** 当 "useAutomaticTimezone" 设置为 "true" 时，此值自动设置。 */
    automaticTimezone: string
    /** 手动设置时区时的值，例如 "Europe/Berlin"。 */
    manualTimezone: string
    /** 设置为 "true" 以使用浏览器/系统时区，"false" 以手动设置。默认为 "true"。 */
    useAutomaticTimezone: string
  }
  disable_welcome_email: boolean
  /** 接受的条款服务 ID，如果有的话。如果为空，此字段不显示。 */
  terms_of_service_id?: string
  /** 用户接受条款服务的时间，以毫秒为单位 */
  terms_of_service_create_at?: number
}
/**
 * 向您的页面添加 Mattermost 登录。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/mattermost
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Mattermost from "@auth/core/providers/mattermost"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Mattermost({
 *       clientId: MATTERMOST_CLIENT_ID,
 *       clientSecret: MATTERMOST_CLIENT_SECRET,
 *       issuer: MATTERMOST_ISSUER, // 您的 Mattermost 实例的基础 URL。例如 `https://my-cool-server.cloud.mattermost.com`
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Mattermost OAuth 文档](https://example.com)
 *
 * ### 备注
 *
 * 默认情况下，Auth.js 假设 Mattermost 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * 要创建您的 Mattermost OAuth2 应用，请访问 `http://<您的 Mattermost 实例 URL>/<您的团队>/integrations/oauth2-apps`
 *
 * :::warning
 *
 * Mattermost 提供者需要设置 `issuer` 选项。这是您的 Mattermost 实例的基础 URL。例如 https://my-cool-server.cloud.mattermost.com
 *
 * :::
 *
 * :::tip
 *
 * Mattermost 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/mattermost.ts)。
 * 要覆盖默认值以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，您可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论](https://authjs.dev/new/github-discussions) 中寻求更多帮助。
 *
 * :::
 */
export default function Mattermost<P extends MattermostProfile>(
  config: OAuthUserConfig<P> & { issuer: string }
): OAuthConfig<P> {
  const { issuer, ...rest } = config

  return {
    id: "mattermost",
    name: "Mattermost",
    type: "oauth",
    client: { token_endpoint_auth_method: "client_secret_post" },
    token: `${issuer}/oauth/access_token`,
    authorization: `${issuer}/oauth/authorize`,
    userinfo: `${issuer}/api/v4/users/me`,
    profile(profile) {
      return {
        id: profile.id,
        name: profile.username ?? `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        image: null,
      }
    },
    style: { bg: "#000", text: "#fff" },
    options: rest,
  }
}
