/**
 * <div class="provider" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
 * <span style={{fontSize: "1.35rem" }}>
 *  内置的 <b>Auth0</b> 集成登录。
 * </span>
 * <a href="https://auth0.com" style={{backgroundColor: "black", padding: "12px", borderRadius: "100%" }}>
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/auth0.svg" width="24"/>
 * </a>
 * </div>
 *
 * @module providers/auth0
 */
import type { OIDCConfig, OIDCUserConfig } from "./index.js"

/** 使用 profile 回调时从 Auth0 返回的用户资料。[参考](https://auth0.com/docs/manage-users/user-accounts/user-profiles/user-profile-structure)。 */
export interface Auth0Profile extends Record<string, any> {
  /** 用户的唯一标识符。 */
  sub: string
  /** 存储有关用户信息的自定义字段，这些信息影响用户的访问，如支持计划、安全角色（如果不使用授权核心功能集）或访问控制组。了解更多，请阅读元数据概述。 */
  app_metadata: object
  /** 指示用户是否已被阻止。导入确保用户在迁移到 Auth0 时保持被阻止状态。 */
  blocked: boolean
  /** 时间戳，指示用户资料首次创建的时间。 */
  created_at: Date
  /** (唯一) 用户的电子邮件地址。 */
  email: string
  /** 指示用户是否已验证其电子邮件地址。 */
  email_verified: boolean
  /** 用户的姓氏。 */
  family_name: string
  /** 用户的名字。 */
  given_name: string
  /** 存储有关用户信息的自定义字段，这些信息不影响他们可以或不能访问的内容，如工作地址、家庭地址或用户偏好。了解更多，请阅读元数据概述。 */
  user_metadata: object
  /** (唯一) 用户的用户名。 */
  username: string
  /** 包含从用户最初认证的身份提供者检索的信息。用户还可以将其资料链接到多个身份提供者；这些身份也将出现在此数组中。单个身份提供者对象的内容因提供者而异。在某些情况下，它还包括与提供者一起使用的 API 访问令牌。 */
  identities: Array<{
    /** 用于认证用户的 Auth0 连接名称。 */
    connection: string
    /** 指示连接是否为社交连接。 */
    isSocial: boolean
    /** 认证用户的实体名称，如 Facebook、Google、SAML 或您自己的提供者。 */
    provider: string
    /** 用户在此连接/提供者中的唯一标识符。 */
    user_id: string
    /** 与连接关联的用户信息。当资料被链接时，它会被填充为次要账户的关联用户信息。 */
    profileData: object
    [key: string]: any
  }>
  /** 与用户上次登录关联的 IP 地址。 */
  last_ip: string
  /** 时间戳，指示用户上次登录的时间。如果用户被阻止并登录，被阻止的会话会更新 last_login。如果您在规则内部使用此属性，使用 user< 对象，其值将与触发规则的登录相关联；这是因为规则在登录后执行。 */
  last_login: Date
  /** 时间戳，指示用户密码上次重置/更改的时间。在用户创建时，此字段不存在。此属性仅适用于数据库连接。 */
  last_password_reset: Date
  /** 用户登录的次数。如果用户被阻止并登录，被阻止的会话计入 logins_count。 */
  logins_count: number
  /** 用户注册的多因素提供者列表。 */
  multifactor: string
  /** 用户的全名。 */
  name: string
  /** 用户的昵称。 */
  nickname: string
  /** 用户的电话号码。仅适用于有 SMS 连接的用户。 */
  phone_number: string
  /** 指示用户是否已验证其电话号码。仅适用于有 SMS 连接的用户。 */
  phone_verified: boolean
  /** 指向用户资料图片的 URL。 */
  picture: string
  /** 时间戳，指示用户资料上次更新/修改的时间。对 last_login 的更改被视为更新，因此大多数情况下，updated_at 将与 last_login 匹配。 */
  updated_at: Date
  /** (唯一) 用户的标识符。导入允许用户记录在多个系统之间同步，而无需使用映射表。 */
  user_id: string
}

/**
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/auth0
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import Auth0 from "@auth/core/providers/auth0"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Auth0({
 *       clientId: AUTH0_ID,
 *       clientSecret: AUTH0_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Auth0 文档](https://auth0.com/docs/authenticate)
 *
 * ### 备注
 *
 * Auth0 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/auth0.ts)。要为您的情况覆盖默认值，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * ## 帮助
 *
 * 如果您认为在默认配置中发现了错误，您可以[提出问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提出问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论](https://authjs.dev/new/github-discussions)中寻求更多帮助。
 */
export default function Auth0(
  config: OIDCUserConfig<Auth0Profile>
): OIDCConfig<Auth0Profile> {
  return {
    id: "auth0",
    name: "Auth0",
    type: "oidc",
    style: { text: "#fff", bg: "#EB5424" },
    options: config,
  }
}
