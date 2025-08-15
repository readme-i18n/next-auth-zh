/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>Built-in <b>Discord</b> integration.</span>
 * <a href="https://discord.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/discord.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/discord
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 对应此处文档记录的用户结构：
 * https://discord.com/developers/docs/resources/user#user-object-user-structure
 */
export interface DiscordProfile extends Record<string, any> {
  /** 用户的ID（即数字形式的雪花ID） */
  id: string
  /** 用户的用户名，平台内不唯一 */
  username: string
  /** 用户的Discord标签 */
  discriminator: string
  /** 用户的显示名称，如果已设置 */
  global_name: string | null
  /**
   * 用户的头像哈希值：
   * https://discord.com/developers/docs/reference#image-formatting
   */
  avatar: string | null
  /** 用户是否属于某个OAuth2应用 */
  bot?: boolean
  /**
   * 用户是否为Discord官方系统用户（紧急消息系统的一部分）
   */
  system?: boolean
  /** 用户账户是否启用了双因素认证 */
  mfa_enabled: boolean
  /**
   * 用户的横幅哈希值：
   * https://discord.com/developers/docs/reference#image-formatting
   */
  banner: string | null

  /** 用户的横幅颜色，编码为十六进制颜色代码的整数表示 */
  accent_color: number | null

  /**
   * 用户选择的语言选项：
   * https://discord.com/developers/docs/reference#locales
   */
  locale: string
  /** 此账户的电子邮件是否已验证 */
  verified: boolean
  /** 用户的电子邮件 */
  email: string | null
  /**
   * 用户账户的标志：
   * https://discord.com/developers/docs/resources/user#user-object-user-flags
   */
  flags: number
  /**
   * 用户账户上的Nitro订阅类型：
   * https://discord.com/developers/docs/resources/user#user-object-premium-types
   */
  premium_type: number
  /**
   * 用户账户上的公开标志：
   * https://discord.com/developers/docs/resources/user#user-object-user-flags
   */
  public_flags: number
  /** 未文档化的字段；对应用户的自定义昵称 */
  display_name: string | null
  /**
   * 未文档化的字段；对应Discord功能，例如可以将头像放入冰立方中
   */
  avatar_decoration: string | null
  /**
   * 未文档化的字段；对应高级功能，可以选择自定义横幅颜色
   */
  banner_color: string | null
  /** 未文档化的字段；其个人资料图片的CDN URL */
  image_url: string
}

/**
 * 为您的页面添加Discord登录功能。
 *
 * ### 设置
 *
 * #### 回调URL
 * ```
 * https://example.com/api/auth/callback/discord
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Discord from "@auth/core/providers/discord"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Discord({
 *       clientId: DISCORD_CLIENT_ID,
 *       clientSecret: DISCORD_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Discord OAuth文档](https://discord.com/developers/docs/topics/oauth2)
 *  - [Discord OAuth应用](https://discord.com/developers/applications)
 *
 * ### 备注
 *
 * 默认情况下，Auth.js假设Discord提供者基于[OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html)规范。
 *
 * :::tip
 *
 * Discord提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/discord.ts)。
 * 要为您的情况覆盖默认值，请查看[自定义内置OAuth提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提出问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js严格遵守规范，对于提供者与规范的任何偏差，我们无法承担责任。您可以提出问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论](https://authjs.dev/new/github-discussions)中寻求更多帮助。
 *
 * :::
 */
export default function Discord<P extends DiscordProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "discord",
    name: "Discord",
    type: "oauth",
    authorization: {
      url: "https://discord.com/api/oauth2/authorize",
      params: { scope: "identify email" },
    },
    token: "https://discord.com/api/oauth2/token",
    userinfo: "https://discord.com/api/users/@me",
    profile(profile) {
      if (profile.avatar === null) {
        const defaultAvatarNumber =
          profile.discriminator === "0"
            ? Number(BigInt(profile.id) >> BigInt(22)) % 6
            : parseInt(profile.discriminator) % 5
        profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
      } else {
        const format = profile.avatar.startsWith("a_") ? "gif" : "png"
        profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`
      }
      return {
        id: profile.id,
        name: profile.global_name ?? profile.username,
        email: profile.email,
        image: profile.image_url,
      }
    },
    style: { bg: "#5865F2", text: "#fff" },
    options,
  }
}
