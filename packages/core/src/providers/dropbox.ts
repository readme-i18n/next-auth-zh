/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Dropbox</b> 集成。</span>
 * <a href="https://dropbox.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/dropbox.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/dropbox
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 向您的页面添加 Dropbox 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/dropbox
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Dropbox from "@auth/core/providers/dropbox"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Dropbox({
 *       clientId: DROPBOX_CLIENT_ID,
 *       clientSecret: DROPBOX_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Dropbox OAuth 文档](https://developers.dropbox.com/oauth-guide)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Dropbox 提供程序基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Dropbox 提供程序附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/dropbox.ts)。
 * 要根据您的使用情况覆盖默认值，请查看[自定义内置 OAuth 提供程序](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供程序与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function Dropbox(
  options: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "dropbox",
    name: "Dropbox",
    type: "oauth",
    authorization: {
      url: "https://www.dropbox.com/oauth2/authorize",
      params: {
        token_access_type: "offline",
        scope: "account_info.read",
      },
    },
    token: "https://api.dropboxapi.com/oauth2/token",
    userinfo: {
      url: "https://api.dropboxapi.com/2/users/get_current_account",
      async request({ tokens, provider }) {
        return await fetch(provider.userinfo?.url as URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }).then(async (res) => await res.json())
      },
    },
    profile(profile) {
      return {
        id: profile.account_id,
        name: profile.name.display_name,
        email: profile.email,
        image: profile.profile_photo_url,
      }
    },
    style: { brandColor: "#0061fe" },
    options,
  }
}
