/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Instagram</b> 集成。</span>
 * <a href="https://www.instagram.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/instagram.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/instagram
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 为您的页面添加 Instagram 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/instagram
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Instagram from "@auth/core/providers/instagram"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Instagram({
 *       clientId: INSTAGRAM_CLIENT_ID,
 *       clientSecret: INSTAGRAM_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Instagram OAuth 文档](https://developers.facebook.com/docs/instagram-basic-display-api/getting-started)
 *  - [Instagram OAuth 应用](https://developers.facebook.com/apps/)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Instagram 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 *
 * :::warning
 * Instagram API 不会返回电子邮件地址。
 * :::
 *
 * :::tip
 * Instagram 显示应用需要在您的 Facebook 应用中配置回调 URL，且 Facebook 要求即使对于本地主机也使用 **https**！为了实现这一点，您需要[为本地主机添加 SSL](https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec/) 或使用代理如 [ngrok](https://ngrok.com/docs)。
 * :::
 * :::tip
 *
 * Instagram 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/instagram.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵循规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function Instagram(
  config: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "instagram",
    name: "Instagram",
    type: "oauth",
    authorization:
      "https://api.instagram.com/oauth/authorize?scope=user_profile",
    token: "https://api.instagram.com/oauth/access_token",
    userinfo:
      "https://graph.instagram.com/me?fields=id,username,account_type,name",
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    async profile(profile) {
      return {
        id: profile.id,
        name: profile.username,
        email: null,
        image: null,
      }
    },
    style: {
      bg: "#fff",
      text: "#000",
    },
    options: config,
  }
}
