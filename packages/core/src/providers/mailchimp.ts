/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Mailchimp</b> 集成。</span>
 * <a href="https://mailchimp.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/mailchimp.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/mailchimp
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 向您的页面添加 Mailchimp 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/mailchimp
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Mailchimp from "@auth/core/providers/mailchimp"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Mailchimp({
 *       clientId: MAILCHIMP_CLIENT_ID,
 *       clientSecret: MAILCHIMP_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Mailchimp OAuth 文档](https://admin.mailchimp.com/account/oauth2/client/)
 *  - [Mailchimp 文档：访问用户数据](https://mailchimp.com/developer/marketing/guides/access-user-data-oauth-2/)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Mailchimp 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Mailchimp 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/mailchimp.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function Mailchimp(
  config: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "mailchimp",
    name: "Mailchimp",
    type: "oauth",
    authorization: "https://login.mailchimp.com/oauth2/authorize",
    token: "https://login.mailchimp.com/oauth2/token",
    userinfo: "https://login.mailchimp.com/oauth2/metadata",
    profile(profile) {
      return {
        id: profile.login.login_id,
        name: profile.accountname,
        email: profile.login.email,
        image: null,
      }
    },
    style: {
      bg: "#000",
      text: "#fff",
    },
    options: config,
  }
}
