/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Facebook</b> 集成。</span>
 * <a href="https://facebook.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/facebook.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/facebook
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

interface FacebookPictureData {
  url: string
}

interface FacebookPicture {
  data: FacebookPictureData
}
export interface FacebookProfile extends Record<string, any> {
  id: string
  picture: FacebookPicture
}

/**
 * 为您的页面添加 Facebook 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/facebook
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Facebook from "@auth/core/providers/facebook"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Facebook({
 *       clientId: FACEBOOK_CLIENT_ID,
 *       clientSecret: FACEBOOK_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Facebook OAuth 文档](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/)
 *
 * ### 注意事项
 *
 * :::tip
 * 生产环境的应用不能使用 localhost URL 通过 Facebook 登录。您需要在 Facebook 中创建一个专门的开发应用来使用 localhost 回调 URL。
 * :::
 *
 * :::tip
 * 对于在移动设备上创建的账户，可能不会返回电子邮件地址。
 * :::
 *
 * 默认情况下，Auth.js 假设 Facebook 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Facebook 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/facebook.ts)。
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
export default function Facebook<P extends FacebookProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "facebook",
    name: "Facebook",
    type: "oauth",
    authorization: {
      url: "https://www.facebook.com/v19.0/dialog/oauth",
      params: {
        scope: "email",
      },
    },
    token: "https://graph.facebook.com/oauth/access_token",
    userinfo: {
      // https://developers.facebook.com/docs/graph-api/reference/user/#fields
      url: "https://graph.facebook.com/me?fields=id,name,email,picture",
      async request({ tokens, provider }) {
        return await fetch(provider.userinfo?.url as URL, {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        }).then(async (res) => await res.json())
      },
    },
    profile(profile: P) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        image: profile.picture.data.url,
      }
    },
    style: { bg: "#006aff", text: "#fff" },
    options,
  }
}
