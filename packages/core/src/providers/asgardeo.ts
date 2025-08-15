/**
 * <div class="provider" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
 * <span style={{fontSize: "1.35rem" }}>
 *  内置使用 <b>Asgardeo</b> 集成的登录功能。
 * </span>
 * <a href="https://wso2.com/asgardeo/" style={{backgroundColor: "#ECEFF1", padding: "12px", borderRadius: "100%" }}>
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/asgardeo.svg" width="24"/>
 * </a>
 * </div>
 *
 * @module providers/asgardeo
 */

import type { OIDCConfig, OIDCUserConfig } from "./index.js"

/** 使用 profile 回调时从 Asgardeo 返回的用户资料。 */
export interface AsgardeoProfile extends Record<string, any> {
  /**
   * 用户的 Asgardeo 账户 ID
   */
  sub: string
  /**
   * 用户名
   */
  given_name: string
  /**
   * 用户邮箱
   */
  email: string
  /**
   * 用户头像
   */
  picture: string
}

/**
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/asgardeo
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Asgardeo from "@auth/core/providers/asgardeo";
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Asgardeo({
 *       clientId: ASGARDEO_CLIENT_ID,
 *       clientSecret: ASGARDEO_CLIENT_SECRET,
 *       issuer: ASGARDEO_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 配置 Asgardeo
 *
 * 按照以下步骤操作：
 *
 * 1. 登录 [Asgardeo 控制台](https://console.asgardeo.io)
 * 2. 接着，转到“应用”标签页（更多信息[在此](https://wso2.com/asgardeo/docs/guides/applications/register-oidc-web-app/)）
 * 3. 注册一个基于标准的 Open ID Connect 应用
 * 4. 添加**回调 URLs**：`http://localhost:3000/api/auth/callback/asgardeo`（开发环境）和 `https://{YOUR_DOMAIN}.com/api/auth/callback/asgardeo`（生产环境）
 * 5. 注册应用后，转到“协议”标签页。
 * 6. 勾选 `code` 作为授权类型。
 * 7. 添加“授权重定向 URLs”和“允许的来源字段”
 * 8. 在控制台中设置邮箱、名字、头像 URL 为用户必填属性。
 *
 * 然后，在项目根目录创建 `.env` 文件并添加以下条目：
 *
 * ```
 * ASGARDEO_CLIENT_ID="在此处粘贴从协议标签页复制的客户端 ID"
 * ASGARDEO_CLIENT_SECRET="在此处粘贴从协议标签页复制的客户端密钥"
 * ASGARDEO_ISSUER="在此处粘贴从信息标签页复制的发行者 URL"
 * ```
 *
 * ### 资源
 *
 * - [Asgardeo - 认证指南](https://wso2.com/asgardeo/docs/guides/authentication)
 * - [了解更多关于 OAuth 的信息](https://authjs.dev/concepts/oauth)
 *
 * ### 注意事项
 *
 * Asgardeo 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/asgardeo.ts)。要根据您的使用场景覆盖默认设置，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::info
 * 默认情况下，Auth.js 假设 Asgardeo 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范
 * :::
 *
 * ## 帮助
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 */
export default function Asgardeo(
  config: OIDCUserConfig<AsgardeoProfile>
): OIDCConfig<AsgardeoProfile> {
  return {
    id: "asgardeo",
    name: "Asgardeo",
    type: "oidc",
    wellKnown: `${config?.issuer}/oauth2/token/.well-known/openid-configuration`,
    style: {
      bg: "#000",
      text: "#fff",
    },
    options: config,
  }
}
