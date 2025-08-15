/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>LINE</b> 集成。</span>
 * <a href="https://LINE.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/line.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/line
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface LineProfile extends Record<string, any> {
  iss: string
  sub: string
  aud: string
  exp: number
  iat: number
  amr: string[]
  name: string
  picture: string
  user: any
}

/**
 * 向您的页面添加 LINE 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/line
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import LINE from "@auth/core/providers/line"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     LINE({ clientId: LINE_CLIENT_ID, clientSecret: LINE_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [LINE 登录文档](https://developers.line.biz/en/docs/line-login/integrate-line-login/)
 *  - [LINE 应用控制台](https://developers.line.biz/console/)
 *
 * ## 配置
 * 在 https://developers.line.biz/console/ 创建一个提供者和一个 LINE 登录频道。在 LINE Login 下的频道设置中，激活 web 应用并配置以下内容：回调 URL `http://localhost:3000/api/auth/callback/line`
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 LINE 提供者基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::tip
 *
 * 要获取电子邮件地址，您需要申请电子邮件地址权限。打开 [Line 开发者控制台](https://developers.line.biz/console/)，进入您的登录频道。滚动到底部找到 **OpenID Connect** -> **Email address permission**。点击 **Apply** 并按照指示操作。
 *
 * :::
 *
 * :::tip
 *
 * LINE 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/line.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担任何责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function LINE<P extends LineProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "line",
    name: "LINE",
    type: "oidc",
    issuer: "https://access.line.me",
    client: {
      id_token_signed_response_alg: "HS256",
    },
    style: { bg: "#00C300", text: "#fff" },
    options,
    checks: ["state"],
  }
}
