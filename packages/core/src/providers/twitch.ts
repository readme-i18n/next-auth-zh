/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Twitch</b> 集成。</span>
 * <a href="https://www.twitch.tv/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/twitch.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/twitch
 */
import type { OIDCConfig, OIDCUserConfig } from "./index.js"

export interface TwitchProfile extends Record<string, any> {
  sub: string
  preferred_username: string
  email: string
  picture: string
}

/**
 * 向您的页面添加 Twitch 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/twitch
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Twitch from "@auth/core/providers/twitch"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Twitch({ clientId: TWITCH_CLIENT_ID, clientSecret: TWITCH_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Twitch 应用文档](https://dev.twitch.tv/console/apps)
 *
 * 在控制台添加以下重定向 URL `http://<your-next-app-url>/api/auth/callback/twitch`
 *
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Twitch 提供者基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::tip
 *
 * Twitch 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/twitch.ts)。
 * 要覆盖默认配置以适应您的使用场景，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是由于不符合规范造成的，我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function Twitch(
  config: OIDCUserConfig<TwitchProfile>
): OIDCConfig<TwitchProfile> {
  return {
    issuer: "https://id.twitch.tv/oauth2",
    id: "twitch",
    name: "Twitch",
    type: "oidc",
    client: { token_endpoint_auth_method: "client_secret_post" },
    authorization: {
      params: {
        scope: "openid user:read:email",
        claims: {
          id_token: { email: null, picture: null, preferred_username: null },
        },
      },
    },
    token: {
      async conform(response) {
        const body = await response.json()
        if (response.ok) {
          if (typeof body.scope === "string") {
            console.warn(
              "'scope' is a string. Redundant workaround, please open an issue."
            )
          } else if (Array.isArray(body.scope)) {
            body.scope = body.scope.join(" ")
            return new Response(JSON.stringify(body), response)
          } else if ("scope" in body) {
            delete body.scope
            return new Response(JSON.stringify(body), response)
          }
        } else {
          const { message: error_description, error } = body
          if (typeof error !== "string") {
            return new Response(
              JSON.stringify({ error: "invalid_request", error_description }),
              response
            )
          }
          console.warn(
            "Response has 'error'. Redundant workaround, please open an issue."
          )
        }
      },
    },
    style: { bg: "#65459B", text: "#fff" },
    options: config,
  }
}
