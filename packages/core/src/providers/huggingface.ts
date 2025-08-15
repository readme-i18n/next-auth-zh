/**
 * <div class="provider" style={{backgroundColor: "#fff", display: "flex", justifyContent: "space-between", color: "#000", padding: 16}}>
 * <span>内置的 <b>Hugging Face</b> 集成。</span>
 * <a href="https://huggingface.co">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/huggingface.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/huggingface
 */

import type { OIDCConfig, OIDCUserConfig } from "./index.js"

export interface HuggingfaceProfile {
  /**
   * 用户的唯一标识符。
   */
  sub: string
  /**
   * 用户的全名。
   *
   * 需要 'profile' 作用域
   */
  name?: string
  /**
   * 用户的用户名。
   *
   * 需要 'profile' 作用域
   */
  preferred_username?: string
  /**
   * 用户头像的 URL。
   *
   * 需要 'profile' 作用域
   */
  profile?: string
  /**
   * 用户个人资料图片的 URL。
   *
   * 需要 'profile' 作用域
   */
  picture?: string
  /**
   * 需要 'profile' 作用域
   *
   * 用户的网站。
   */
  website?: string
  /**
   * 需要 'email' 作用域
   *
   * 用户的电子邮件地址。
   */
  email?: string
  /**
   * 需要 'email' 作用域
   *
   * 用户的电子邮件地址是否已验证。应该总是为 true，Hugging Face 强制要求用户验证电子邮件地址以授予 OAuth 应用访问权限。
   */
  email_verified?: boolean
  /**
   * 用户是否有付费订阅。
   */
  isPro: boolean
  /**
   * 用户是否设置了支付方式。
   *
   * 需要 `read-billing` 作用域。
   */
  canPay?: boolean
  /**
   * 用户的组织列表。
   */
  orgs: Array<{
    /**
     * 组织的唯一标识符。
     */
    sub: string
    /**
     * 组织的名称。
     */
    name: string
    /**
     * 组织头像的 URL。
     */
    picture: string
    /**
     * 组织的用户名。
     */
    preferred_username: string
    /**
     * 组织是否有付费企业订阅。
     */
    isEnterprise: boolean
    /**
     * 组织是否设置了支付方式。
     *
     * 需要授予 oauth 应用访问组织的权限，此字段才会出现。
     */
    canPay?: boolean
    /**
     * 用户在组织中的角色。
     *
     * 需要授予 oauth 应用访问组织的权限，此字段才会出现。
     */
    roleInOrg?: "admin" | "write" | "read" | "contributor"
    /**
     * 用户需要重新认证以访问组织。
     *
     * 需要授予 oauth 应用访问组织的权限，此字段才会出现。
     */
    pendingSSO?: boolean
    /**
     * 用户需要启用 MFA 以访问组织。
     *
     * 需要授予 oauth 应用访问组织的权限，此字段才会出现。
     */
    missingMFA?: boolean
    /**
     * 资源组是企业组织的一个功能。
     *
     * 它们允许对组织内的资源进行细粒度的访问控制。
     *
     * 需要授予 oauth 应用访问组织的权限，此字段才会出现。
     */
    resourceGroups?: Array<{
      /**
       * 资源组的唯一标识符。
       */
      sub: string
      name: string
      /**
       * 用户在资源组中的角色。
       */
      role: "read" | "write" | "admin" | "contributor"
    }>
  }>
}

/**
 * 向您的页面添加 HuggingFace 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/huggingface
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import HuggingFace from "@auth/core/providers/huggingface"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     HuggingFace({
 *       clientId: HUGGINGFACE_CLIENT_ID,
 *       clientSecret: HUGGINGFACE_CLIENT_SECRET,
 *       authorization: {
 *        params: {
 *          scope: "openid profile email", // 指定您需要的作用域
 *          //  orgIds: "unique_org_id" // 如果您的 oauth 应用需要访问用户的特定组织
 *        }
 *       },
 *     }),
 *   ],
 * })
 * ```
 *
 * 以下作用域可用：
 *
 * - `openid`: 授予访问用户的 OpenID Connect 个人资料的权限。
 * - `profile`: 授予访问用户个人资料信息的权限。
 * - `email`: 授予访问用户电子邮件地址的权限。
 * - `read-repos`: 授予读取用户仓库的权限。
 * - `write-repos`: 授予写入用户仓库的权限。
 * - `manage-repos`: 可以代表用户创建/删除仓库。
 * - `write-discussions`: 可以代表用户发布讨论。
 * - `read-billing`: 知道用户是否设置了支付方式。
 * - `inference-api`: 可以代表用户调用推理提供者。
 * - `webhooks`: 可以代表用户管理 webhooks。
 *
 * 您需要先在您的 OAuth 应用设置中启用它们。
 *
 * /!\ 默认情况下，NextAuth 中启用了 `profile` 和 `email` 作用域。因此，您需要在您的 OAuth 应用设置中启用 `email` 作用域，否则您将收到作用域错误。
 *
 * ### 资源
 *
 *  - [Hugging Face OAuth 文档](https://huggingface.co/docs/hub/en/oauth#creating-an-oauth-app)
 *  - [创建 OAuth 应用](https://huggingface.co/settings/applications/new)
 *
 * ### 备注
 *
 * 默认情况下，Auth.js 假设 Hugging Face 提供者基于 [OIDC](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::tip
 *
 * HuggingFace 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/huggingface.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，您可以 [提出问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提出问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在 [讨论](https://authjs.dev/new/github-discussions) 中寻求更多帮助。
 *
 * :::
 */
export default function Huggingface(
  options: OIDCUserConfig<HuggingfaceProfile>
): OIDCConfig<HuggingfaceProfile> {
  return {
    id: "huggingface",
    name: "Hugging Face",
    type: "oidc",
    issuer: "https://huggingface.co",
    checks: ["state", "pkce"],

    style: {
      bg: "#FFD21E",
      text: "#000",
    },
    options,
  }
}
