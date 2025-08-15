/**
 * <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
 * <span style={{fontSize: "1.35rem" }}>
 *  内置的 <b>Atlassian</b> 集成登录。
 * </span>
 * <a href="https://www.atlassian.com/" style={{backgroundColor: "black", padding: "12px", borderRadius: "100%" }}>
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/atlassian.svg" width="24" style={{ marginTop: "-3px"}} />
 * </a>
 * </div>
 *
 * @module providers/atlassian
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/** 使用 profile 回调时从 Atlassian 返回的用户资料。 */
export interface AtlassianProfile extends Record<string, any> {
  /**
   * 用户的 Atlassian 账户 ID
   */
  account_id: string
  /**
   * 用户名
   */
  name: string
  /**
   * 用户的电子邮件
   */
  email: string
  /**
   * 用户的个人资料图片
   */
  picture: string
}

/**
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/atlassian
 * ```
 *
 * #### 配置
 *
 * 导入提供者并在你的 **Auth.js** 初始化文件中进行配置：
 *
 * ```ts
 * import Atlassian from "@auth/core/providers/atlassian"
 * ...
 * providers: [
 *  Atlassian({
 *    clientId: env.AUTH_ATLASSIAN_ID,
 *    clientSecret: env.AUTH_ATLASSIAN_SECRET,
 *  }),
 * ]
 * ...
 * ```
 *
 * ### 配置 Atlassian
 *
 * 按照以下步骤操作：
 *
 * 1. 在 [developer.atlassian.com](https://developer.atlassian.com) 的任何页面上，选择右上角的个人资料图标，然后从下拉菜单中选择 **开发者控制台**。
 * 2. 从列表中选择你的应用（如果没有，请先创建一个）
 * 3. 在左侧菜单中选择 **授权**
 * 4. 在 OAuth 2.0 (3LO) 旁边，选择 **配置**（对于新创建的应用选择 **添加**）
 * 5. 输入 **回调 URL**：`https://{YOUR_DOMAIN}/api/auth/callback/atlassian`
 * 6. 点击保存更改
 * 7. 在左侧菜单中选择 **设置**
 * 8. 访问并复制你的应用的 **客户端 ID** 和 **密钥**
 *
 * 然后，在项目根目录下创建一个 `.env` 文件，并添加以下条目：
 *
 * ```
 * AUTH_ATLASSIAN_ID=<步骤8中复制的客户端ID>
 * AUTH_ATLASSIAN_SECRET=<步骤8中复制的密钥>
 * ```
 *
 * ### 资源
 *
 * - [Atlassian 文档](https://developer.atlassian.com/cloud/jira/software/oauth-2-3lo-apps/)
 *
 * ### 注意事项
 *
 * Atlassian 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/atlassian.ts)。要覆盖默认配置以适应你的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/providers/custom-provider#override-default-options)。
 *
 * ## 帮助
 *
 * 如果你认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。你可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。你可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 */
export default function Atlassian(
  options: OAuthUserConfig<AtlassianProfile>
): OAuthConfig<AtlassianProfile> {
  return {
    id: "atlassian",
    name: "Atlassian",
    type: "oauth",
    authorization: {
      url: "https://auth.atlassian.com/authorize",
      params: { audience: "api.atlassian.com", scope: "read:me" },
    },
    token: "https://auth.atlassian.com/oauth/token",
    userinfo: "https://api.atlassian.com/me",
    profile(profile) {
      return {
        id: profile.account_id,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }
    },
    checks: ["state"],
    style: { bg: "#fff", text: "#0052cc" },
    options,
  }
}
