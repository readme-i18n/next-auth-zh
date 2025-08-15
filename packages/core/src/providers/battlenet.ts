/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Battle.net</b> 集成。</span>
 * <a href="https://Battle.net/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/battlenet.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/battlenet
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface BattleNetProfile extends Record<string, any> {
  sub: string
  battle_tag: string
}

/** 查看 [可用区域](https://develop.battle.net/documentation/guides/regionality-and-apis) */
export type BattleNetIssuer =
  | "https://oauth.battle.net"
  | "https://oauth.battlenet.com.cn"
  | "https://www.battlenet.com.cn/oauth"
  | `https://${"us" | "eu" | "kr" | "tw"}.battle.net/oauth`

/**
 * 向您的页面添加 Battle.net 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/battlenet
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import BattleNet from "@auth/core/providers/battlenet"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     BattleNet({
 *       clientId: BATTLENET_CLIENT_ID,
 *       clientSecret: BATTLENET_CLIENT_SECRET,
 *       issuer: BATTLENET_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 * issuer 必须是以下值之一，基于可用区域：
 * ```
 * type BattleNetIssuer =
 *   | "https://oauth.battle.net"
 *   | "https://oauth.battlenet.com.cn"
 *   | "https://www.battlenet.com.cn/oauth"
 *   | "https://us.battle.net/oauth"
 *   | "https://eu.battle.net/oauth"
 *   | "https://kr.battle.net/oauth"
 *   | "https://tw.battle.net/oauth"
 * ```
 *
 * ### 资源
 *
 *  - [BattleNet OAuth 文档](https://develop.battle.net/documentation/guides/using-oauth)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 BattleNet 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * BattleNet 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/battlenet.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function BattleNet<P extends BattleNetProfile>(
  options: OAuthUserConfig<P> & { issuer: BattleNetIssuer }
): OAuthConfig<P> {
  return {
    id: "battlenet",
    name: "Battle.net",
    type: "oidc",
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.battle_tag,
        email: null,
        image: null,
      }
    },
    style: { bg: "#148eff", text: "#fff" },
    options,
  }
}
