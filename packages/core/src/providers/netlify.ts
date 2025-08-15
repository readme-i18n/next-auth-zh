/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Netlify</b> 集成。</span>
 * <a href="https://netlify.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/netlify.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/netlify
 */

import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 向您的页面添加 Netlify 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/netlify
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Netlify from "@auth/core/providers/netlify"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Netlify({
 *       clientId: NETLIFY_CLIENT_ID,
 *       clientSecret: NETLIFY_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Netlify OAuth 博客](https://www.netlify.com/blog/2016/10/10/integrating-with-netlify-oauth2/)
 *  - [Netlify OAuth 示例](https://github.com/netlify/netlify-oauth-example/)
 *
 * ### 说明
 *
 * 默认情况下，Auth.js 假设 Netlify 提供程序基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Netlify 提供程序附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/netlify.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供程序](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供程序与规范的任何偏差，Auth.js 不承担任何责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function Netlify(
  config: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "netlify",
    name: "Netlify",
    type: "oauth",
    authorization: "https://app.netlify.com/authorize?scope",
    token: "https://api.netlify.com/oauth/token",
    userinfo: "https://api.netlify.com/api/v1/user",
    profile(profile) {
      return {
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        image: profile.avatar_url,
      }
    },
    style: {
      brandColor: "#32e6e2",
    },
    options: config,
  }
}
