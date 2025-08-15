/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Todoist</b> 集成。</span>
 * <a href="https://www.todoist.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/todoist.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/todoist
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * @see https://developer.todoist.com/sync/v9/#user
 */
interface TodoistProfile extends Record<string, any> {
  avatar_big: string
  email: string
  full_name: string
  id: string
}

/**
 * 向您的页面添加 Todoist 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/todoist
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Todoist from "@auth/core/providers/todoist"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Todoist({
 *       clientId: TODOIST_CLIENT_ID,
 *       clientSecret: TODOIST_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Todoist OAuth 文档](https://developer.todoist.com/guides/#oauth)
 * - [Todoist 配置](https://developer.todoist.com/appconsole.html)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Todoist 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Todoist 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/todoist.ts)。
 * 要覆盖默认值以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
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
export default function TodoistProvider<P extends TodoistProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "todoist",
    name: "Todoist",
    type: "oauth",
    authorization: {
      url: "https://todoist.com/oauth/authorize",
      params: { scope: "data:read" },
    },
    token: "https://todoist.com/oauth/access_token",
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    userinfo: {
      async request({ tokens }) {
        // To obtain Todoist user info, we need to call the Sync API
        // See https://developer.todoist.com/sync/v9
        const res = await fetch("https://api.todoist.com/sync/v9/sync", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sync_token: "*",
            resource_types: '["user"]',
          }),
        })

        const { user: profile } = await res.json()
        return profile
      },
    },
    profile(profile) {
      return {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        image: profile.avatar_big,
      }
    },
    style: { text: "#000", bg: "#E44332" },
    options,
  }
}
