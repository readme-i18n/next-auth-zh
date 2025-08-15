/**
 * <div class="provider" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
 * <span style={{fontSize: "1.35rem" }}>
 *  内置的 <b>Kinde</b> 集成登录。
 * </span>
 * <a href="https://kinde.com" style={{backgroundColor: "#0F0F0F", padding: "12px", borderRadius: "100%" }}>
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/kinde.svg" width="24"/>
 * </a>
 * </div>
 *
 * @module providers/kinde
 */
import type { OIDCConfig, OIDCUserConfig } from "./index.js"

/** 使用 profile 回调时从 Kinde 返回的用户资料。[参考](https://kinde.com/api/docs/#get-user-profile)。 */
export interface KindeProfile extends Record<string, any> {
  /** 用户的名字。 */
  first_name: string
  /** 用户的唯一标识符。 */
  id: string
  /** 用户的姓氏。 */
  last_name: string
  /** 指向用户个人资料图片的 URL。 */
  picture: string
  /** 用户的电子邮件地址。 */
  preferred_email: string
  /** 用户在之前系统中的标识符。 */
  provided_id: string
  /** 用户的用户名。 */
  username: string
}

/**
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/kinde
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import Kinde from "@auth/core/providers/kinde"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Kinde({
 *       clientId: KINDE_CLIENT_ID,
 *       clientSecret: KINDE_CLIENT_SECRET,
 *       issuer: KINDE_DOMAIN,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Kinde 文档](https://docs.kinde.com/)
 *
 * ### 说明
 *
 * Kinde 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/kinde.ts)。要根据您的使用情况覆盖默认值，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * ## 帮助
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵循规范，对于提供者与规范的任何偏差，我们无法承担责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 */
export default function Kinde(
  config: OIDCUserConfig<KindeProfile>
): OIDCConfig<KindeProfile> {
  return {
    id: "kinde",
    name: "Kinde",
    type: "oidc",
    style: { text: "#0F0F0F", bg: "#fff" },
    options: config,
    checks: ["state", "pkce"],
  }
}
