/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>HubSpot</b> 集成。</span>
 * <a href="https://hubspot.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/hubspot.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/hubspot
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

interface HubSpotProfile extends Record<string, any> {
  // https://legacydocs.hubspot.com/docs/methods/oauth2/get-access-token-information
  user: string
  user_id: string
  hub_domain: string
  hub_id: string
}

/**
 * 在您的页面中添加 HubSpot 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/hubspot
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import HubSpot from "@auth/core/providers/hubspot"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     HubSpot({
 *       clientId: HUBSPOT_CLIENT_ID,
 *       clientSecret: HUBSPOT_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [HubSpot OAuth 文档](https://developers.hubspot.com/docs/api/oauth-quickstart-guide)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 HubSpot 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * 您需要在开发者账户中有一个应用，如 https://developers.hubspot.com/docs/api/developer-tools-overview 所述
 * :::note
 * HubSpot 返回关于令牌持有者的有限信息（参见 [文档](https://legacydocs.hubspot.com/docs/methods/oauth2/get-access-token-information)）。另一个问题是，名称和个人资料照片无法通过 API 获取，如 [此处](https://community.hubspot.com/t5/APIs-Integrations/Profile-photo-is-not-retrieved-with-User-API/m-p/325521) 讨论。
 * :::
 * :::tip
 *
 * HubSpot 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/hubspot.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function HubSpot<P extends HubSpotProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "hubspot",
    name: "HubSpot",
    type: "oauth",
    authorization: {
      url: "https://app.hubspot.com/oauth/authorize",
      params: { scope: "oauth", client_id: options.clientId },
    },
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    token: "https://api.hubapi.com/oauth/v1/token",
    userinfo: {
      url: "https://api.hubapi.com/oauth/v1/access-tokens",
      async request({ tokens, provider }) {
        const url = `${provider.userinfo?.url}/${tokens.access_token}`

        return await fetch(url, {
          headers: { "Content-Type": "application/json" },
          method: "GET",
        }).then(async (res) => await res.json())
      },
    },
    profile(profile) {
      return {
        id: profile.user_id,
        name: profile.user,
        email: profile.user,

        // TODO: get image from profile once it's available
        // Details available https://community.hubspot.com/t5/APIs-Integrations/Profile-photo-is-not-retrieved-with-User-API/m-p/325521
        image: null,
      }
    },
    style: { bg: "#ff7a59", text: "#fff" },
    options,
  }
}
