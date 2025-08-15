/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>TikTok</b> 集成。</span>
 * <a href="https://www.tiktok.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/tiktok.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/tiktok
 */
import { customFetch } from "../lib/symbols.js"
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * [更多信息](https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info/)
 */
export interface TiktokProfile {
  data: {
    user: {
      /**
       * 用户在当前应用中的唯一标识。客户端的Open id。
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=open_id`。
       */
      open_id: string
      /**
       * 同一开发者不同应用中用户的唯一标识。
       * 例如，如果一个合作伙伴有X个客户端，
       * 同一个TikTok用户将获得X个open_id，
       * 但会有一个持久的union_id对应特定用户。
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=union_id`。
       */
      union_id?: string
      /**
       * 用户的个人资料图片。
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=avatar_url`。
       */
      avatar_url: string
      /**
       * 用户100x100尺寸的个人资料图片。
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=avatar_url_100`。
       */
      avatar_url_100?: string
      /**
       * 更高分辨率的用户个人资料图片
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=avatar_url_100`。
       */
      avatar_large_url?: string
      /**
       * 用户的个人资料名称
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=display_name`。
       */
      display_name: string
      /**
       * 用户的用户名。
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=username`。
       */
      username: string
      /** @note 目前TikTok不支持电子邮件  */
      email?: string
      /**
       * 用户如果有有效的个人简介描述。
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=bio_description`。
       */
      bio_description?: string
      /**
       * 用户TikTok个人资料页面的链接。
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=profile_deep_link`。
       */
      profile_deep_link?: string
      /**
       * TikTok是否在确认账户属于其所代表的用户后提供了验证徽章。
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=is_verified`。
       */
      is_verified?: boolean
      /**
       * 用户的粉丝数。
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=follower_count`。
       */
      follower_count?: number
      /**
       * 用户关注的账户数量。
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=following_count`。
       */
      following_count?: number
      /**
       * 用户所有视频获得的总点赞数。
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=likes_count`。
       */
      likes_count?: number
      /**
       * 用户公开发布的视频总数。
       *
       * 要返回此字段，请在用户资料请求的查询参数中添加 `fields=video_count`。
       */
      video_count?: number
    }
  }
  error: {
    /**
     * 字符串形式的错误类别。
     */
    code: string
    /**
     * 字符串形式的错误消息。
     */
    message: string
    /**
     * 字符串形式的错误消息。
     */
    log_id: string
  }
}

/**
 * 向您的页面添加TikTok登录。
 *
 * ### 设置
 *
 * #### 回调URL
 * ```
 * https://example.com/api/auth/callback/tiktok
 * ```
 *
 * #### 配置
 * 如果您已经设置了 `AUTH_TIKTOK_ID` 和 `AUTH_TIKTOK_SECRET` 环境变量，可以省略客户端和密钥。
 * 记住，AUTH_TIKTOK_ID 是TikTok应用中的客户端密钥
 *```ts
 * import { Auth } from "@auth/core"
 * import TikTok from "@auth/core/providers/tiktok"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     TikTok({ clientId: AUTH_TIKTOK_ID, clientSecret: AUTH_TIKTOK_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *  - [TikTok应用控制台](https://developers.tiktok.com/)
 *  - [TikTok登录套件文档](https://developers.tiktok.com/doc/login-kit-web/)
 *  - [可用范围](https://developers.tiktok.com/doc/tiktok-api-scopes/)
 *  - [测试沙盒](https://developers.tiktok.com/blog/introducing-sandbox)
 *
 *
 * ### 注意事项
 *
 * :::tip
 *
 * 生产应用不能使用localhost URL通过TikTok登录。您需要将域名和回调/重定向URL添加到您的TikTok应用，并由TikTok团队审核和批准。
 * 如果您需要测试您的实现，可以使用沙盒功能和ngrok在本地测试。
 *
 * :::
 *
 * :::tip
 *
 * TikTok不支持电子邮件地址。
 *
 * :::
 *
 * :::tip
 *
 * AUTH_TIKTOK_ID 将是TikTok应用中的客户端密钥
 *
 * :::
 *
 * 默认情况下，Auth.js假设TikTok提供者基于[OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html)规范。
 *
 * :::tip
 *
 * TikTok提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/tiktok.ts)。
 * 要覆盖默认值以适应您的用例，请查看[自定义内置OAuth提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * 如果您需要自定义TikTok提供者，可以使用以下配置作为自定义提供者
 *
 * ```ts
 * {
 *   async [customFetch](...args) {
 *     const url = new URL(args[0] instanceof Request ? args[0].url : args[0]);
 *     if (url.pathname.endsWith("/token/")) {
 *       const [url, request] = args;
 *       const customHeaders = {
 *         ...request?.headers,
 *         "content-type": "application/x-www-form-urlencoded",
 *       };
 *
 *       const customBody = new URLSearchParams(request?.body as string);
 *       customBody.append("client_key", process.env.AUTH_TIKTOK_ID!);
 *
 *       const response = await fetch(url, {
 *         ...request,
 *         headers: customHeaders,
 *         body: customBody.toString(),
 *       });
 *       const json = await response.json();
 *       return Response.json({ ...json });
 *     }
 *     return fetch(...args);
 *   },
 *
 *   id: "tiktok",
 *   name: "TikTok",
 *   type: "oauth",
 *   client: {
 *     token_endpoint_auth_method: "client_secret_post",
 *   },
 *
 *   authorization: {
 *     url: "https://www.tiktok.com/v2/auth/authorize",
 *     params: {
 *       client_key: options.clientId,
 *       scope: "user.info.profile", //添加您需要的范围，例如(user.info.profile,user.info.stats,video.list)
 *     },
 *   },
 *
 *   token: "https://open.tiktokapis.com/v2/oauth/token/",
 *
 *   userinfo: "https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name,username", //添加您需要的字段，例如(open_id,avatar_url,display_name,username)
 *
 *   profile(profile) {
 *     return {
 *       id: profile.data.user.open_id,
 *       name: profile.data.user.display_name,
 *       image: profile.data.user.avatar_url,
 *       email: profile.data.user.email || profile.data.user.username || null,
 *     };
 *   },
 * }
 *
 * ```
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提出问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js严格遵循规范，对于提供者任何偏离规范的行为不承担责任。您可以提出问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论](https://authjs.dev/new/github-discussions)中寻求更多帮助。
 *
 * :::
 */
export default function TikTok(
  options: OAuthUserConfig<TiktokProfile>
): OAuthConfig<TiktokProfile> {
  return {
    async [customFetch](...args) {
      const url = new URL(args[0] instanceof Request ? args[0].url : args[0])
      if (url.pathname.endsWith("/token/")) {
        const [url, request] = args

        const customHeaders = {
          ...request?.headers,
          "content-type": "application/x-www-form-urlencoded",
        }

        const customBody = new URLSearchParams(request?.body as string)
        customBody.append("client_key", options.clientId!)
        const response = await fetch(url, {
          ...request,
          headers: customHeaders,
          body: customBody.toString(),
        })
        const json = await response.json()
        return Response.json({ ...json })
      }
      return fetch(...args)
    },
    id: "tiktok",
    name: "TikTok",
    type: "oauth",
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    authorization: {
      url: "https://www.tiktok.com/v2/auth/authorize",
      params: {
        client_key: options.clientId,
        scope: "user.info.basic",
      },
    },

    token: "https://open.tiktokapis.com/v2/oauth/token/",
    userinfo:
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name",

    profile(profile) {
      return {
        id: profile.data.user.open_id,
        name: profile.data.user.display_name,
        image: profile.data.user.avatar_url,
        // Email address is not supported by TikTok.
        email: null,
      }
    },
    style: {
      bg: "#000",
      text: "#fff",
    },
    options,
  }
}
