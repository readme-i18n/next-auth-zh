/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Kakao</b> 集成。</span>
 * <a href="https://www.kakaocorp.com/page/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/kakao.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/kakao
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export type DateTime = string
export type Gender = "female" | "male"
export type Birthday = "SOLAR" | "LUNAR"
export type AgeRange =
  | "1-9"
  | "10-14"
  | "15-19"
  | "20-29"
  | "30-39"
  | "40-49"
  | "50-59"
  | "60-69"
  | "70-79"
  | "80-89"
  | "90-"

/**
 * https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#req-user-info
 * type from : https://gist.github.com/ziponia/cdce1ebd88f979b2a6f3f53416b56a77
 */
export interface KakaoProfile extends Record<string, any> {
  id: number
  has_signed_up?: boolean
  connected_at?: DateTime
  synched_at?: DateTime
  properties?: {
    id?: string
    status?: string
    registered_at?: DateTime
    msg_blocked?: boolean
    nickname?: string
    profile_image?: string
    thumbnail_image?: string
  }
  kakao_account?: {
    profile_needs_agreement?: boolean
    profile_nickname_needs_agreement?: boolean
    profile_image_needs_agreement?: boolean
    profile?: {
      nickname?: string
      thumbnail_image_url?: string
      profile_image_url?: string
      is_default_image?: boolean
    }
    name_needs_agreement?: boolean
    name?: string
    email_needs_agreement?: boolean
    is_email_valid?: boolean
    is_email_verified?: boolean
    email?: string
    age_range_needs_agreement?: boolean
    age_range?: AgeRange
    birthyear_needs_agreement?: boolean
    birthyear?: string
    birthday_needs_agreement?: boolean
    birthday?: string
    birthday_type?: Birthday
    gender_needs_agreement?: boolean
    gender?: Gender
    phone_number_needs_agreement?: boolean
    phone_number?: string
    ci_needs_agreement?: boolean
    ci?: string
    ci_authenticated_at?: DateTime
  }
}

/**
 * 向您的页面添加 Kakao 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/kakao
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Kakao from "@auth/core/providers/kakao"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Kakao({ clientId: KAKAO_CLIENT_ID, clientSecret: KAKAO_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Kakao OAuth 文档](https://developers.kakao.com/product/kakaoLogin)
 *  - [Kakao OAuth 配置](https://developers.kakao.com/docs/latest/en/kakaologin/common)
 *
 * ## 配置
 * 在 https://developers.kakao.com/console/app 创建提供者和 Kakao 应用。在应用的 Kakao 登录设置下，激活网页应用，更改同意项并配置回调 URL。
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Kakao 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 *
 * 创建凭证时使用的“授权重定向 URI”必须包含您的完整域名并以回调路径结尾。例如；
 *
 * ![스크린샷 2023-11-28 오후 9 27 41](https://github.com/nextauthjs/next-auth/assets/66895208/7d4c2df6-45a6-4937-bb10-4b47c987bff4)
 *
 * - 生产环境: `https://{YOUR_DOMAIN}/api/auth/callback/kakao`
 * - 开发环境: `http://localhost:3000/api/auth/callback/kakao`
 *
 * :::tip
 *
 * Kakao 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/kakao.ts)。
 * 要覆盖默认值以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::tip
 *
 * Kakao 的客户端密钥位于 **Summary(韩语中写作 요약정보) 标签的 App Keys 字段**
 * (我的应用 > 应用设置 > Summary)
 *
 * ![스크린샷 2023-11-28 오후 9 47 17](https://github.com/nextauthjs/next-auth/assets/66895208/a87e5705-26b9-4f83-99d7-6df097a3632c)
 *
 * Kakao 的 clientSecret 密钥位于 **Security(韩语中写作 보안) 标签的 App Keys 字段**
 * (我的应用 > 产品设置 > Kakao 登录 > Security)
 *
 * ![스크린샷 2023-11-28 오후 9 38 25](https://github.com/nextauthjs/next-auth/assets/66895208/6a763921-4f70-40f4-a3e1-9abc78276d45)
 *
 * :::
 *
 * :::tip
 *
 * Kakao 开发者控制台右上角有一个按钮可以将语言从韩文切换为英文
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function Kakao<P extends KakaoProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "kakao",
    name: "Kakao",
    type: "oauth",
    authorization: "https://kauth.kakao.com/oauth/authorize?scope",
    token: "https://kauth.kakao.com/oauth/token",
    userinfo: "https://kapi.kakao.com/v2/user/me",
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    profile(profile) {
      return {
        id: profile.id.toString(),
        name: profile.kakao_account?.profile?.nickname,
        email: profile.kakao_account?.email,
        image: profile.kakao_account?.profile?.profile_image_url,
      }
    },
    options,
  }
}
