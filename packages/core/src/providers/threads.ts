/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Threads</b> 集成。</span>
 * <a href="https://www.threads.net/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/threads.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/threads
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * [用户](https://developers.facebook.com/docs/threads/reference/user)
 */
export interface ThreadsProfile {
  data: {
    /**
     * 该用户的唯一标识符。以字符串形式返回，以避免与无法处理大整数的语言和工具产生兼容性问题。
     */
    id: string
    /**
     * 该用户的Threads用户名。
     *
     * 要返回此字段，需在授权请求的查询参数中添加`fields=username`。
     */
    username?: string
    /**
     * 该用户个人资料中显示的图片URL。
     *
     * 要返回此字段，需在授权请求的查询参数中添加`fields=threads_profile_picture_url`。
     */
    threads_profile_picture_url?: string
    /**
     * 该用户个人资料中的简介文本（也称为bio），如果用户提供了的话。
     *
     * 要返回此字段，需在授权请求的查询参数中添加`fields=threads_biography`。
     */
    threads_biography?: string
  }
}

/**
 * 向您的页面添加Threads登录功能。
 *
 * ### 设置
 *
 * #### 回调URL
 * ```
 * https://example.com/api/auth/callback/threads
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Threads from "@auth/core/providers/threads"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Threads({
 *       clientId: THREADS_CLIENT_ID,
 *       clientSecret: THREADS_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Threads OAuth 文档](https://developers.facebook.com/docs/threads)
 * - [Threads OAuth 应用](https://developers.facebook.com/apps/)
 *
 * ### 注意事项
 *
 * :::warning
 *
 * Threads API 不会返回电子邮件地址。
 *
 * :::
 *
 * :::tip
 *
 * Threads 要求回调URL在您的Facebook应用中配置，且Facebook要求即使是本地主机也使用**https**！为此，您需要[为本地主机添加SSL](https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec/)或使用代理如[ngrok](https://ngrok.com/docs)。
 *
 * :::
 *
 * 默认情况下，Auth.js假设Threads提供者基于[OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html)规范。
 *
 * :::tip
 *
 * Threads提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/threads.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置OAuth提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js严格遵守规范，对于提供者与规范的任何偏差，Auth.js不承担责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function Threads(
  config: OAuthUserConfig<ThreadsProfile>
): OAuthConfig<ThreadsProfile> {
  return {
    id: "threads",
    name: "Threads",
    type: "oauth",
    checks: ["state"],
    authorization: "https://threads.net/oauth/authorize?scope=threads_basic",
    token: "https://graph.threads.net/oauth/access_token",
    userinfo:
      "https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url",
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    profile({ data }) {
      return {
        id: data.id,
        name: data.username || null,
        email: null,
        image: data.threads_profile_picture_url || null,
      }
    },
    style: { bg: "#000", text: "#fff" },
    options: config,
  }
}
