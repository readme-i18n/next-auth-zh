/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Naver</b> 集成。</span>
 * <a href="https://naver.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/naver.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/naver
 */

import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/** https://developers.naver.com/docs/login/profile/profile.md */
export interface NaverProfile extends Record<string, any> {
  resultcode: string
  message: string
  response: {
    id: string
    nickname?: string
    name?: string
    email?: string
    gender?: "F" | "M" | "U"
    age?: string
    birthday?: string
    profile_image?: string
    birthyear?: string
    mobile?: string
  }
}

/**
 * 在您的页面中添加 Naver 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/naver
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Naver from "@auth/core/providers/naver"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Naver({ clientId: NAVER_CLIENT_ID, clientSecret: NAVER_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Naver OAuth 文档](https://developers.naver.com/docs/login/overview/overview.md)
 *  - [Naver OAuth 文档 2](https://developers.naver.com/docs/login/api/api.md)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Naver 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Naver 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/naver.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，您可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function Naver<P extends NaverProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "naver",
    name: "Naver",
    type: "oauth",
    authorization: "https://nid.naver.com/oauth2.0/authorize",
    token: "https://nid.naver.com/oauth2.0/token",
    userinfo: "https://openapi.naver.com/v1/nid/me",
    profile(profile) {
      return {
        id: profile.response.id,
        name: profile.response.nickname,
        email: profile.response.email,
        image: profile.response.profile_image,
      }
    },
    options,
  }
}
