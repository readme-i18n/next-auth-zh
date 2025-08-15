/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>GitLab</b> 集成。</span>
 * <a href="https://gitlab.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/gitlab.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/gitlab
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface GitLabProfile extends Record<string, any> {
  id: number
  username: string
  email: string
  name: string
  state: string
  avatar_url: string
  web_url: string
  created_at: string
  bio: string
  location?: string
  public_email: string
  skype: string
  linkedin: string
  twitter: string
  website_url: string
  organization: string
  job_title: string
  pronouns: string
  bot: boolean
  work_information?: string
  followers: number
  following: number
  local_time: string
  last_sign_in_at: string
  confirmed_at: string
  theme_id: number
  last_activity_on: string
  color_scheme_id: number
  projects_limit: number
  current_sign_in_at: string
  identities: Array<{
    provider: string
    extern_uid: string
  }>
  can_create_group: boolean
  can_create_project: boolean
  two_factor_enabled: boolean
  external: boolean
  private_profile: boolean
  commit_email: string
  shared_runners_minutes_limit: number
  extra_shared_runners_minutes_limit: number
}

/**
 * 向您的页面添加 GitLab 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/gitlab
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import GitLab from "@auth/core/providers/gitlab"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     GitLab({ clientId: GITLAB_CLIENT_ID, clientSecret: GITLAB_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [GitLab OAuth 文档](https://docs.gitlab.com/ee/api/oauth2.html)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 GitLab 提供程序基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 * 如果您想在注册时保存用户的电子邮件地址，请在作用域中启用 `read_user` 选项。
 * :::
 *
 * :::tip
 *
 * GitLab 提供程序附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/gitlab.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供程序](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供程序与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function GitLab<P extends GitLabProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "gitlab",
    name: "GitLab",
    type: "oauth",
    authorization: "https://gitlab.com/oauth/authorize?scope=read_user",
    token: "https://gitlab.com/oauth/token",
    userinfo: "https://gitlab.com/api/v4/user",
    profile(profile) {
      return {
        id: profile.sub?.toString(),
        name: profile.name ?? profile.username,
        email: profile.email,
        image: profile.avatar_url,
      }
    },
    style: { bg: "#FC6D26", text: "#fff" },
    options,
  }
}
