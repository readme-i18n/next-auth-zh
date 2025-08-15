/**
 * <div class="provider" style={{ display: "flex", justifyContent: "space-between", color: "#fff" }}>
 * <span>内置的 <b>Bitbucket</b> 集成。</span>
 * <a href="https://bitbucket.org">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/bitbucket.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/bitbucket
 */

import { OAuthConfig, OAuthUserConfig } from "./index.js"

type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>)

/**
 * @see https://developer.atlassian.com/cloud/bitbucket/rest/api-group-users/#api-user-get
 */
export interface BitbucketProfile {
  display_name: string
  links: Record<
    LiteralUnion<
      "self" | "avatar" | "repositories" | "snippets" | "html" | "hooks"
    >,
    { href?: string }
  >
  created_on: string
  type: string
  uuid: string
  has_2fa_enabled: boolean | null
  username: string
  is_staff: boolean
  account_id: string
  nickname: string
  account_status: string
  location: string | null
}

/**
 *
 * ### 设置
 *
 * #### 回调 URL
 *
 * ```ts
 * https://example.com/api/auth/callback/bitbucket
 * ```
 *
 * #### 配置
 *
 * ```ts
 * import { Auth } from "@auth/core"
 * import Bitbucket from "@auth/core/providers/bitbucket"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Bitbucket({
 *       clientId: process.env.BITBUCKET_CLIENT_ID,
 *       clientSecret: process.env.BITBUCKET_CLIENT_SECRET,
 *     })
 *   ],
 * })
 * ```
 *
 * #### 资源
 *
 * - [在 Bitbucket Cloud 上使用 OAuth](https://support.atlassian.com/bitbucket-cloud/docs/use-oauth-on-bitbucket-cloud/)
 * - [Bitbucket REST API 认证](https://developer.atlassian.com/cloud/bitbucket/rest/intro/#authentication)
 * - [Bitbucket REST API 用户](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-users/#api-group-users)
 *
 *  #### 注意事项
 *
 * 默认情况下，Auth.js 假设 Bitbucket 提供程序基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Bitbucket 提供程序附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/bitbucket.ts)。
 * 要覆盖默认值以适应您的用例，请查看 [自定义内置 OAuth 提供程序](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供程序与规范的任何偏差，Auth.js 不承担任何责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function Bitbucket(
  options: OAuthUserConfig<BitbucketProfile>
): OAuthConfig<BitbucketProfile> {
  return {
    id: "bitbucket",
    name: "Bitbucket",
    type: "oauth",
    authorization: {
      url: "https://bitbucket.org/site/oauth2/authorize",
      params: {
        scope: "account",
      },
    },
    token: "https://bitbucket.org/site/oauth2/access_token",
    userinfo: "https://api.bitbucket.org/2.0/user",
    profile(profile) {
      return {
        name: profile.display_name ?? profile.username,
        id: profile.account_id,
        image: profile.links.avatar?.href,
      }
    },
    options,
    style: {
      text: "#fff",
      bg: "#205081",
    },
  }
}
