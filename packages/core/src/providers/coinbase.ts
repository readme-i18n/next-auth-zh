/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Coinbase</b> 集成。</span>
 * <a href="https://coinbase.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/coinbase.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/coinbase
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 向您的页面添加 Coinbase 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/coinbase
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Coinbase from "@auth/core/providers/coinbase"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Coinbase({
 *       clientId: COINBASE_CLIENT_ID,
 *       clientSecret: COINBASE_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Coinbase OAuth 文档](https://developers.coinbase.com/api/v2)
 *
 * ### 注意事项
 *
 * :::tip
 * 此提供者模板有一个2小时的访问令牌。同时也会返回一个刷新令牌。
 * :::
 *
 * 默认情况下，Auth.js 假设 Coinbase 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Coinbase 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/coinbase.ts)。
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
export default function Coinbase(
  options: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "coinbase",
    name: "Coinbase",
    type: "oauth",
    authorization:
      "https://login.coinbase.com/oauth2/auth?scope=wallet:user:email+wallet:user:read",
    token: "https://login.coinbase.com/oauth2/token",
    userinfo: "https://api.coinbase.com/v2/user",
    profile(profile) {
      return {
        id: profile.data.id,
        name: profile.data.name,
        email: profile.data.email,
        image: profile.data.avatar_url,
      }
    },
    style: {
      brandColor: "#0052ff",
    },
    options,
  }
}
