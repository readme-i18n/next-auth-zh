/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Reddit</b> 集成。</span>
 * <a href="https://www.reddit.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/reddit.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/reddit
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 向您的页面添加 Reddit 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/reddit
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Reddit from "@auth/core/providers/reddit"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Reddit({ clientId: REDDIT_CLIENT_ID, clientSecret: REDDIT_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Reddit API 文档](https://www.reddit.com/dev/api/)
 * - [Reddit 应用控制台](https://www.reddit.com/prefs/apps/ )
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Reddit 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::danger
 *
 * Reddit 每次通过其页面时都需要授权。
 * 每个客户端 ID / 客户端密钥只允许一个回调 URL。
 *
 * :::
 *
 * :::tip
 *
 * 此提供者模板仅有一小时的访问令牌，并且只有 "identity" 作用域。如果您还想获取刷新令牌，必须遵循以下步骤：
 *```ts
 * providers: [
 *  Reddit({
 *    clientId: process.env.REDDIT_CLIENT_ID,
 *    clientSecret: process.env.REDDIT_CLIENT_SECRET,
 *    authorization: {
 *      params: {
 *        duration: 'permanent',
 *      },
 *    },
 *  }),
 * ]
 * ```
 * :::
 *
 * :::tip
 *
 * Reddit 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/reddit.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，我们无法承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function Reddit(
  config: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "reddit",
    name: "Reddit",
    type: "oauth",
    authorization: "https://www.reddit.com/api/v1/authorize?scope=identity",
    token: "https://www.reddit.com/api/v1/access_token",
    userinfo: "https://oauth.reddit.com/api/v1/me",
    checks: ["state"],
    style: {
      brandColor: "#FF4500",
    },
    options: config,
  }
}
