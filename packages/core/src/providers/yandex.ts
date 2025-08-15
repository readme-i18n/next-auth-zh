/**
 * <div class="provider" style={{backgroundColor: "#ffcc00", display: "flex", justifyContent: "space-between", color: "#000", padding: 16}}>
 * <span>内置的 <b>Yandex</b> 集成。</span>
 * <a href="https://yandex.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/yandex.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/yandex
 */

import { OAuthConfig, OAuthUserConfig } from "./oauth.js"

/**
 * - {@link https://yandex.com/dev/id/doc/en/user-information | 获取用户信息}
 * - {@link https://yandex.com/dev/id/doc/en/user-information#email-access | 访问电子邮件地址}
 * - {@link https://yandex.com/dev/id/doc/en/user-information#avatar-access | 访问用户的个人资料图片}
 * - {@link https://yandex.com/dev/id/doc/en/user-information#birthday-access | 访问出生日期}
 * - {@link https://yandex.com/dev/id/doc/en/user-information#name-access | 访问登录名、名字、姓氏和性别}
 * - {@link https://yandex.com/dev/id/doc/en/user-information#phone-access | 访问电话号码}
 */
export interface YandexProfile {
  /** 用户的 Yandex 登录名。 */
  login: string
  /** Yandex 用户的唯一 ID。 */
  id: string
  /**
   * 请求中 OAuth 令牌所颁发给的应用 ID。
   * 可在[应用属性](https://oauth.yandex.com/)中查看。点击应用名称即可打开属性。
   */
  client_id: string
  /** 已授权的 Yandex 用户 ID。它是在 Yandex 端基于 `client_id` 和 `user_id` 对生成的。 */
  psuid: string
  /** 用户的电子邮件地址数组。目前仅包含默认电子邮件地址。 */
  emails?: string[]
  /** 用于联系用户的默认电子邮件地址。 */
  default_email?: string
  /**
   * 表示 `default_avatar_id` 字段中指定的是存根（在 Yandex 注册时自动分配的个人资料图片）ID。
   */
  is_avatar_empty?: boolean
  /**
   * Yandex 用户个人资料图片的 ID。
   * 下载用户头像的格式：`https://avatars.yandex.net/get-yapic/<default_avatar_id>/<size>`
   * @example "https://avatars.yandex.net/get-yapic/31804/BYkogAC6AoB17bN1HKRFAyKiM4-1/islands-200"
   * 可用尺寸：
   * `islands-small`: 28×28 像素。
   * `islands-34`: 34×34 像素。
   * `islands-middle`: 42×42 像素。
   * `islands-50`: 50×50 像素。
   * `islands-retina-small`: 56×56 像素。
   * `islands-68`: 68×68 像素。
   * `islands-75`: 75×75 像素。
   * `islands-retina-middle`: 84×84 像素。
   * `islands-retina-50`: 100×100 像素。
   * `islands-200`: 200×200 像素。
   */
  default_avatar_id?: string
  /**
   * 用户的出生日期，格式为 YYYY-MM-DD。
   * 日期的未知部分用零填充，例如：`0000-12-23`。
   * 如果用户的出生日期未知，birthday 将为 `null`
   */
  birthday?: string | null
  first_name?: string
  last_name?: string
  display_name?: string
  /**
   * 用户在 Yandex ID 中指定的名字和姓氏。
   * 名字和姓氏的非拉丁字符以 Unicode 格式呈现。
   */
  real_name?: string
  /** 用户的性别。`null` 表示未知或未指定的性别。如果 Yandex 未提供，将为 `undefined`。 */
  sex?: "male" | "female" | null
  /**
   * 用于联系用户的默认电话号码。
   * API 可以自行决定从响应中排除用户的电话号码。
   * 该字段包含以下参数：
   * id: 电话号码 ID。
   * number: 用户的电话号码。
   */
  default_phone?: { id: number; number: string }
}

/**
 * 将 Yandex 登录添加到您的页面。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/yandex
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import Yandex from "@auth/core/providers/yandex"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Yandex({ clientId: YANDEX_CLIENT_ID, clientSecret: YANDEX_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Yandex - 创建 OAuth 应用](https://yandex.com/dev/id/doc/en/register-client#create)
 * - [Yandex - 管理 OAuth 应用](https://oauth.yandex.com/)
 * - [Yandex - OAuth 文档](https://yandex.com/dev/id/doc/en/)
 * - [了解更多关于 OAuth 的信息](https://authjs.dev/concepts/oauth)
 * - [源代码](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/yandex.ts)
 *
 *:::tip
 * Yandex 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/yandex.ts)。
 * 要覆盖默认值以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 * :::
 *
 * :::info **免责声明**
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵循规范，对于提供者与规范的任何偏差，Auth.js 不承担任何责任。
 * 您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。
 * 您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 * :::
 */
export default function Yandex(
  options: OAuthUserConfig<YandexProfile>
): OAuthConfig<YandexProfile> {
  return {
    id: "yandex",
    name: "Yandex",
    type: "oauth",
    /** @see [数据访问](https://yandex.com/dev/id/doc/en/register-client#access) */
    authorization:
      "https://oauth.yandex.ru/authorize?scope=login:info+login:email+login:avatar",
    token: "https://oauth.yandex.ru/token",
    userinfo: "https://login.yandex.ru/info?format=json",
    profile(profile) {
      return {
        id: profile.id,
        name: profile.display_name ?? profile.real_name ?? profile.first_name,
        email: profile.default_email ?? profile.emails?.[0] ?? null,
        image:
          !profile.is_avatar_empty && profile.default_avatar_id
            ? `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
            : null,
      }
    },
    style: {
      bg: "#ffcc00",
      text: "#000",
    },
    options,
  }
}
