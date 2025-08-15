/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Twitter</b> 集成。</span>
 * <a href="https://www.x.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/twitter.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/twitter
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * [用户查询](https://developer.x.com/en/docs/twitter-api/users/lookup/api-reference/get-users-me)
 */
export interface TwitterProfile {
  data: {
    /**
     * 此用户的唯一标识符。以字符串形式返回，以避免与无法处理大整数的语言和工具产生兼容性问题。
     */
    id: string
    /** 此用户的友好名称，如个人资料所示。 */
    name: string
    /** @note 目前 Twitter 不支持电子邮件。 */
    email?: string
    /** 此用户的 Twitter 用户名（屏幕名称）。 */
    username: string
    /**
     * 用户个人资料中指定的位置，如果用户提供了的话。
     * 由于这是一个自由格式的值，它可能不表示有效的位置，但在使用位置查询执行搜索时可能会进行模糊评估。
     *
     * 要返回此字段，请在授权请求的查询参数中添加 `user.fields=location`。
     */
    location?: string
    /**
     * 此对象及其子字段包含有关用户描述中具有特殊含义的文本的详细信息。
     *
     * 要返回此字段，请在授权请求的查询参数中添加 `user.fields=entities`。
     */
    entities?: {
      /** 包含用户个人资料网站的详细信息。 */
      url: {
        /** 包含用户个人资料网站的详细信息。 */
        urls: Array<{
          /** 识别的用户个人资料网站的起始位置（基于零）。所有起始索引都是包含的。 */
          start: number
          /** 识别的用户个人资料网站的结束位置（基于零）。此结束索引是排他的。 */
          end: number
          /** 用户输入的格式的 URL。 */
          url: string
          /** 完全解析的 URL。 */
          expanded_url: string
          /** 用户个人资料中显示的 URL。 */
          display_url: string
        }>
      }
      /** 包含位于用户描述中的 URL、Hashtags、Cashtags 或提及的详细信息。 */
      description: {
        hashtags: Array<{
          start: number
          end: number
          tag: string
        }>
      }
    }
    /**
     * 指示此用户是否为已验证的 Twitter 用户。
     *
     * 要返回此字段，请在授权请求的查询参数中添加 `user.fields=verified`。
     */
    verified?: boolean
    /**
     * 此用户的个人资料描述（也称为 bio）的文本，如果用户提供了的话。
     *
     * 要返回此字段，请在授权请求的查询参数中添加 `user.fields=description`。
     */
    description?: string
    /**
     * 用户个人资料中指定的 URL，如果存在的话。
     *
     * 要返回此字段，请在授权请求的查询参数中添加 `user.fields=url`。
     */
    url?: string
    /** 此用户的个人资料图片的 URL，如用户个人资料所示。 */
    profile_image_url?: string
    protected?: boolean
    /**
     * 此用户固定推文的唯一标识符。
     *
     * 您可以通过在授权请求的查询参数中添加 `expansions=pinned_tweet_id` 来在 `includes.tweets` 中获取扩展对象。
     */
    pinned_tweet_id?: string
    created_at?: string
  }
  includes?: {
    tweets?: Array<{
      id: string
      text: string
    }>
  }
  [claims: string]: unknown
}

/**
 * 向您的页面添加 Twitter 登录。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/twitter
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Twitter from "@auth/core/providers/twitter"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Twitter({
 *       clientId: TWITTER_CLIENT_ID,
 *       clientSecret: TWITTER_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Twitter 应用文档](https://developer.x.com/en/apps)
 *
 * ## OAuth 2
 * Twitter 支持 OAuth 2，目前是可选的。要启用它，只需在您的提供者配置中添加 version: "2.0"：
 * ```ts
 * Twitter({
 *   clientId: process.env.TWITTER_ID,
 *   clientSecret: process.env.TWITTER_SECRET,
 *   version: "2.0", // 选择加入 Twitter OAuth 2.0
 * })
 * ```
 * 请记住，尽管这个更改很容易，但它改变了您可以与之交互的 Twitter API 的方式和范围。阅读官方的 Twitter OAuth 2 文档以获取更多详情。
 *
 *
 * :::note
 *
 * 目前 Twitter OAuth 2.0 不支持电子邮件。
 *
 * :::
 *
 * ### 注意事项
 *
 * Twitter 是目前唯一使用 OAuth 1.0 规范的内置提供者。
 * 这意味着您不会收到 `access_token` 或 `refresh_token`，而是分别收到 `oauth_token` 和 `oauth_token_secret`。如果您正在使用 [适配器](https://authjs.dev/reference/core/adapters)，请记得将这些添加到您的数据库架构中。
 *
 * :::tip
 *
 * 如果您想获取用户的电子邮件地址，必须在您的应用权限中启用“向用户请求电子邮件地址”选项。
 *
 * :::
 *
 * 默认情况下，Auth.js 假设 Twitter 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Twitter 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/twitter.ts)。
 * 要覆盖默认值以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵循规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在 [讨论](https://authjs.dev/new/github-discussions) 中寻求更多帮助。
 *
 * :::
 */
export default function Twitter(
  config: OAuthUserConfig<TwitterProfile>
): OAuthConfig<TwitterProfile> {
  return {
    id: "twitter",
    name: "Twitter",
    type: "oauth",
    checks: ["pkce", "state"],
    authorization:
      "https://x.com/i/oauth2/authorize?scope=users.read tweet.read offline.access",
    token: "https://api.x.com/2/oauth2/token",
    userinfo: "https://api.x.com/2/users/me?user.fields=profile_image_url",
    profile({ data }) {
      return {
        id: data.id,
        name: data.name,
        email: data.email ?? null,
        image: data.profile_image_url,
      }
    },
    style: { bg: "#1da1f2", text: "#fff" },
    options: config,
  }
}
