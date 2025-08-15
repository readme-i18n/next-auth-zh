/**
 * <div class="provider" style={{backgroundColor: "#24292f", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>GitHub</b> 集成。</span>
 * <a href="https://github.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/github.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/github
 */

import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface GitHubEmail {
  email: string
  primary: boolean
  verified: boolean
  visibility: "public" | "private"
}

/** @see [获取认证用户](https://docs.github.com/en/rest/users/users#get-the-authenticated-user) */
export interface GitHubProfile {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string | null
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
  name: string | null
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  hireable: boolean | null
  bio: string | null
  twitter_username?: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  private_gists?: number
  total_private_repos?: number
  owned_private_repos?: number
  disk_usage?: number
  suspended_at?: string | null
  collaborators?: number
  two_factor_authentication: boolean
  plan?: {
    collaborators: number
    name: string
    space: number
    private_repos: number
  }
  [claim: string]: unknown
}

/**
 * 向您的页面添加 GitHub 登录功能，并向 [GitHub APIs](https://docs.github.com/en/rest) 发起请求。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/github
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import GitHub from "@auth/core/providers/github"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     GitHub({ clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [GitHub - 创建 OAuth 应用](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)
 * - [GitHub - 授权 OAuth 应用](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
 * - [GitHub - 配置您的 GitHub OAuth 应用](https://github.com/settings/developers)
 * - [了解更多关于 OAuth 的信息](https://authjs.dev/concepts/oauth)
 * - [源代码](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/github.ts)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 GitHub 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * GitHub 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/github.ts)。
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
export default function GitHub(
  config: OAuthUserConfig<GitHubProfile> & {
    /** 用于 [GitHub Enterprise Server](https://docs.github.com/en/enterprise-server/get-started) 的配置。 */
    enterprise?: {
      /** 您的 GitHub Enterprise Server 实例的基础 URL。 */
      baseUrl?: string
    }
  }
): OAuthConfig<GitHubProfile> {
  const baseUrl = config?.enterprise?.baseUrl ?? "https://github.com"
  const apiBaseUrl = config?.enterprise?.baseUrl
    ? `${config?.enterprise?.baseUrl}/api/v3`
    : "https://api.github.com"

  return {
    id: "github",
    name: "GitHub",
    type: "oauth",
    authorization: {
      url: `${baseUrl}/login/oauth/authorize`,
      params: { scope: "read:user user:email" },
    },
    token: `${baseUrl}/login/oauth/access_token`,
    userinfo: {
      url: `${apiBaseUrl}/user`,
      async request({ tokens, provider }) {
        const profile = await fetch(provider.userinfo?.url as URL, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "User-Agent": "authjs",
          },
        }).then(async (res) => await res.json())

        if (!profile.email) {
          // If the user does not have a public email, get another via the GitHub API
          // See https://docs.github.com/en/rest/users/emails#list-public-email-addresses-for-the-authenticated-user
          const res = await fetch(`${apiBaseUrl}/user/emails`, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
              "User-Agent": "authjs",
            },
          })

          if (res.ok) {
            const emails: GitHubEmail[] = await res.json()
            profile.email = (emails.find((e) => e.primary) ?? emails[0]).email
          }
        }

        return profile
      },
    },
    profile(profile) {
      return {
        id: profile.id.toString(),
        name: profile.name ?? profile.login,
        email: profile.email,
        image: profile.avatar_url,
      }
    },
    style: { bg: "#24292f", text: "#fff" },
    options: config,
  }
}
