/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Cognito</b> 集成。</span>
 * <a href="https://docs.aws.amazon.com/cognito">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/cognito.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/cognito
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface CognitoProfile extends Record<string, any> {
  sub: string
  name: string
  email: string
  picture: string
}

/**
 * 在您的页面添加 Cognito 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/cognito
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Cognito from "@auth/core/providers/cognito"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Cognito({
 *       clientId: COGNITO_CLIENT_ID,
 *       clientSecret: COGNITO_CLIENT_SECRET,
 *       issuer: COGNITO_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Cognito OAuth 文档](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html)
 *
 * ### 注意事项
 * 您需要选择您的 AWS 区域以进入 Cognito 仪表板。
 *
 * :::tip
 * issuer 是一个 URL，看起来像这样：https://cognito-idp.{region}.amazonaws.com/{PoolId}
 * :::
 * `PoolId` 来自 Cognito 的 General Settings，不要与 App Client ID 混淆。
 * :::warning
 * 确保您选择了所有适当的客户端设置，否则 OAuth 流程将无法工作。
 * :::
 *
 * 默认情况下，Auth.js 假设 Cognito 提供商基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::tip
 *
 * Cognito 提供商附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/cognito.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供商](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供商对规范的任何偏离，Auth.js 不承担任何责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function Cognito<P extends CognitoProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "cognito",
    name: "Cognito",
    type: "oidc",
    style: {
      brandColor: "#C17B9E",
    },
    options,
  }
}
