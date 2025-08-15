/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Pipedrive</b> 集成。</span>
 * <a href="https://www.pipedrive.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/pipedrive.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/pipedrive
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface PipedriveProfile extends Record<string, any> {
  success: boolean
  data: {
    id: number
    name: string
    default_currency?: string
    locale?: string
    lang?: number
    email: string
    phone?: string
    activated?: boolean
    last_login?: Date
    created?: Date
    modified?: Date
    signup_flow_variation?: string
    has_created_company?: boolean
    is_admin?: number
    active_flag?: boolean
    timezone_name?: string
    timezone_offset?: string
    role_id?: number
    icon_url?: string
    is_you?: boolean
    company_id?: number
    company_name?: string
    company_domain?: string
    company_country?: string
    company_industry?: string
    language?: {
      language_code?: string
      country_code?: string
    }
  }
}

/**
 * 在您的页面中添加 Pipedrive 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/pipedrive
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Pipedrive from "@auth/core/providers/pipedrive"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Pipedrive({
 *       clientId: PIPEDRIVE_CLIENT_ID,
 *       clientSecret: PIPEDRIVE_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Pipedrive OAuth 文档](https://pipedrive.readme.io/docs/marketplace-oauth-authorization)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Pipedrive 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Pipedrive 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/pipedrive.ts)。
 * 要根据您的使用情况覆盖默认值，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
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
export default function Pipedrive<P extends PipedriveProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "pipedrive",
    name: "Pipedrive",
    type: "oauth",
    authorization: "https://oauth.pipedrive.com/oauth/authorize",
    token: "https://oauth.pipedrive.com/oauth/token",
    userinfo: "https://api.pipedrive.com/users/me",
    profile: ({ data: profile }) => {
      return {
        id: profile.id.toString(),
        name: profile.name,
        email: profile.email,
        image: profile.icon_url,
      }
    },
    options,
  }
}
