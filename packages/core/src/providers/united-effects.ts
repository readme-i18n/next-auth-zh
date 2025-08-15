/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>United Effects</b> 集成。</span>
 * <a href="https://www.unitedeffects.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/united-effects.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/united-effects
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"
export interface UnitedEffectsProfile extends Record<string, any> {
  sub: string
  email: string
}
/**
 * 向您的页面添加 United Effects 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/united-effects
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import UnitedEffects from "@auth/core/providers/united-effects"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     UnitedEffects({ clientId: UE_CLIENT_ID, clientSecret: UE_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [UnitedEffects Auth.js 文档](https://docs.unitedeffects.com/integrations/nextauthjs)",
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 UnitedEffects 提供者基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::note
 *
 * `issuer` 应该是包含您的 Auth Group ID 的完整 URL——例如 `https://auth.unitedeffects.com/YQpbQV5dbW-224dCovz-3`
 *
 * :::
 *
 * :::danger
 *
 * United Effects API 设计上不返回用户名或图像，因此此提供者将返回两者的 null。United Effects 将用户个人信息安全置于首位，并构建了一个与提供者 API 分离的安全配置文件访问请求系统。
 *
 * :::
 *
 * :::tip
 *
 * UnitedEffects 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/united-effects.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担任何责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function UnitedEffects<P extends UnitedEffectsProfile>(
  options: OAuthUserConfig<P> & { issuer: string }
): OAuthConfig<P> {
  return {
    id: "united-effects",
    name: "United Effects",
    type: "oidc",
    authorization: {
      params: { scope: "openid email profile", resource: options.issuer },
    },
    options,
  }
}
