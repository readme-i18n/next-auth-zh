/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Figma</b> 集成。</span>
 * <a href="https://figma.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/figma.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/figma
 */
import { OAuth2Config, OAuthUserConfig } from "./index.js"

/**
 * @see https://www.figma.com/developers/api#users-types
 */
interface FigmaProfile {
  id: string
  email: string
  handle: string
  img_url: string
}

/**
 * ### 设置
 *
 * #### 回调 URL
 *
 * ```ts
 * https://example.com/api/auth/callback/figma
 * ```
 *
 * #### 配置
 *
 * ```ts
 * import { Auth } from "@auth/core"
 * import Figma from "@auth/core/providers/figma"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Figma({
 *       clientId: process.env.AUTH_FIGMA_ID,
 *       clientSecret: process.env.AUTH_FIGMA_SECRET
 *     })
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [在 Figma 上使用 OAuth 2](https://www.figma.com/developers/api#oauth2)
 * - [作用域](https://www.figma.com/developers/api#authentication-scopes)
 *
 * #### 注意事项
 *
 * 默认情况下，Auth.js 假设 Figma 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Figma 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/figma.ts)。
 * 要覆盖默认值以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
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
export default function Figma(
  options: OAuthUserConfig<FigmaProfile>
): OAuth2Config<FigmaProfile> {
  return {
    id: "figma",
    name: "Figma",
    type: "oauth",
    authorization: {
      url: "https://www.figma.com/oauth",
      params: {
        scope: "files:read",
      },
    },
    checks: ["state"],
    token: "https://api.figma.com/v1/oauth/token",
    userinfo: "https://api.figma.com/v1/me",
    profile(profile) {
      return {
        name: profile.handle,
        email: profile.email,
        id: profile.id,
        image: profile.img_url,
      }
    },
    style: {
      text: "#fff",
      bg: "#ff7237",
    },
    options,
  }
}
