/**
 * <div class="provider" style={{backgroundColor: "#0082C9", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Nextcloud</b> 集成。</span>
 * <a href="https://nextcloud.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/nextcloud.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/nextcloud
 */

import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 表示从 `/ocs/v1.php/cloud/users/` 返回的 Nextcloud 用户个人资料数据。
 * @see [查看文档以获取更多详情](https://docs.nextcloud.com/server/latest/admin_manual/configuration_user/instruction_set_for_users.html#get-data-of-a-single-user)
 */
export interface NextcloudProfile extends Record<string, any> {
  /**
   * 用户的用户名。
   * @example "frank"
   */
  id: string

  /**
   * 与用户关联的电子邮件地址。
   * @example "frank@domain.tld"
   */
  email: string | null

  /**
   * 用户的显示名称。
   * @example "Frank K."
   */
  displayname: string

  /**
   * 用户的电话号码。
   */
  phone: string

  /**
   * 用户的地址。
   * @example "Foobar 12, 12345 Town"
   */
  address: string

  /**
   * 用户的网站 URL。
   * @example "https://nextcloud.com"
   */
  website: string

  /**
   * 用户的 Twitter 句柄。
   * @example "Nextcloud"
   */
  twitter: string

  /**
   * 用户的 Fediverse 句柄。
   */
  fediverse: string

  /**
   * 与用户关联的组织。
   */
  organisation: string

  /**
   * 用户的角色或职位。
   */
  role: string

  /**
   * 用户的标题或简短描述。
   */
  headline: string

  /**
   * 用户的传记或详细描述。
   */
  biography: string

  /**
   * 用户所属的组名数组。
   * @example ["admin", "group1", "group2"]
   */
  groups: string[]

  /**
   * 用户的语言偏好。
   * @example "en"
   */
  language: string

  /**
   * 用户的区域设置或语言区域。
   * @example "en_US"
   */
  locale: string

  /**
   * 指示用户账户是启用还是禁用。
   * @example true
   */
  enabled: boolean

  /**
   * 用户文件的存储位置。
   * @example "/path/to/nextcloud/data/frank"
   */
  storageLocation: string
}

/**
 * 向您的页面添加 Nextcloud 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/auth/callback/nextcloud
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import Nextcloud from "@auth/core/providers/nextcloud"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Nextcloud({ clientId: AUTH_NEXTCLOUD_ID, clientSecret: AUTH_NEXTCLOUD_SECRET, issuer: AUTH_NEXTCLOUD_ISSUER }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Nextcloud 文档](https://docs.nextcloud.com/)
 * - [Nextcloud OAuth 2](https://docs.nextcloud.com/server/latest/admin_manual/configuration_server/oauth2.html)
 * - [Nextcloud 客户端和客户端 API](https://docs.nextcloud.com/server/latest/developer_manual/client_apis/index.html)
 * - [Nextcloud 用户配置 API](https://docs.nextcloud.com/server/latest/admin_manual/configuration_user/user_provisioning_api.html)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Nextcloud 提供程序基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Nextcloud 提供程序附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/nextcloud.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供程序](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供程序与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function Nextcloud(
  options: OAuthUserConfig<NextcloudProfile>
): OAuthConfig<NextcloudProfile> {
  return {
    id: "nextcloud",
    name: "Nextcloud",
    type: "oauth",
    authorization: `${options.issuer}/apps/oauth2/authorize`,
    token: `${options.issuer}/apps/oauth2/api/v1/token`,
    userinfo: {
      url: `${options.issuer}/ocs/v1.php/cloud/users`,
      async request({ tokens, provider }) {
        const url = `${provider.userinfo?.url}/${tokens.user_id}`

        const res = await fetch(url, {
          headers: {
            "OCS-APIRequest": "true",
            Authorization: `Bearer ${tokens.access_token}`,
            Accept: "application/json",
          },
        }).then((res) => res.json())
        return res.ocs.data
      },
    },
    profile(profile) {
      return {
        id: profile.id,
        name: profile.displayname,
        email: profile.email,
        image: `${options.issuer}/avatar/${profile.id}/512`,
      }
    },
    style: {
      logo: "/nextcloud.svg",
      bg: "#fff",
      text: "#0082C9",
    },
    options,
  }
}
