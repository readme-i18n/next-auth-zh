/**
 * <div class="provider" style={{backgroundColor: "#0072c6", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Azure AD B2C</b> 集成。</span>
 * <a href="https://learn.microsoft.com/en-us/azure/active-directory-b2c/tutorial-create-tenant">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/azure.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/azure-ad-b2c
 */

import type { OIDCConfig, OIDCUserConfig } from "./index.js"

/** @see [Claims](https://learn.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview#claims) */
export interface AzureADB2CProfile {
  exp: number
  nbf: number
  ver: string
  iss: string
  sub: string
  aud: string
  iat: number
  auth_time: number
  oid: string
  country: string
  name: string
  postalCode: string
  emails: string[]
  tfp: string
  preferred_username: string
}

/**
 * 向您的页面添加 Azure AD B2C 登录功能。
 *
 *
 * ## 配置
 *
 * ### 基础配置
 *
 * 基础配置设置 Azure AD B2C 以返回 ID 令牌。这应作为运行高级配置之前的先决条件完成。
 *
 * 1. [Azure AD B2C 租户](https://docs.microsoft.com/en-us/azure/active-directory-b2c/tutorial-create-tenant)
 * 2. [应用注册](https://docs.microsoft.com/en-us/azure/active-directory-b2c/tutorial-register-applications)
 * 3. [用户流](https://docs.microsoft.com/en-us/azure/active-directory-b2c/tutorial-create-user-flows)
 *
 * 对于步骤“用户属性和令牌声明”，设置以下内容：
 *
 * - 收集属性：
 *   - 电子邮件地址
 *   - 显示名称
 *   - 名字
 *   - 姓氏
 * - 返回声明：
 *   - 电子邮件地址
 *   - 显示名称
 *   - 名字
 *   - 姓氏
 *   - 身份提供者
 *   - 身份提供者访问令牌
 *   - 用户的对象 ID
 *
 * @example
 *
 * ```ts
 * import { Auth } from "@auth/core"
 * import AzureADB2C from "@auth/core/providers/azure-ad-b2c"
 *
 * const request = new Request("https://example.com")
 * const response = await AuthHandler(request, {
 *   // 可选地，您可以传递 `tenantId` 和 `primaryUserFlow` 而不是 `issuer`
 *   providers: [AzureADB2C({ clientId: "", clientSecret: "", issuer: "" })],
 * })
 * ```
 *
 * ---
 *
 * ### 资源
 *
 * - [Azure Active Directory B2C 文档](https://learn.microsoft.com/en-us/azure/active-directory-b2c)
 *
 * ---
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Azure AD B2C 提供者基于 [OIDC](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::tip
 *
 * Azure AD B2C 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/azure-ad-b2c.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，您可以 [提出问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提出问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论](https://authjs.dev/new/github-discussions) 中寻求更多帮助。
 *
 * :::
 */
export default function AzureADB2C(
  options: OIDCUserConfig<AzureADB2CProfile>
): OIDCConfig<AzureADB2CProfile> {
  return {
    id: "azure-ad-b2c",
    name: "Azure AD B2C",
    type: "oidc",
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name ?? profile.preferred_username,
        email: profile?.emails?.[0],
        image: null,
      }
    },
    style: { text: "#fff", bg: "#0072c6" },
    options,
  }
}
