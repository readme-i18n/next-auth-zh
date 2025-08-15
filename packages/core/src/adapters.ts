/**
 * Auth.js 可以与_任何_数据层（数据库、ORM 或后端 API、HTTP 客户端）集成
 * 以自动创建用户、自动处理账户链接、支持无密码登录，
 * 并存储会话信息。
 *
 * 此模块包含用于创建与 Auth.js 兼容的适配器的实用函数和类型。
 *
 * Auth.js 支持 2 种会话策略来持久化用户的登录状态。
 * 默认是使用基于 cookie + {@link https://authjs.dev/concepts/session-strategies#jwt-session JWT}
 * 的会话存储（`strategy: "jwt"`），
 * 但你也可以使用数据库适配器将会话存储在数据库中。
 *
 * 在继续之前，Auth.js 有一个 {@link https://adapters.authjs.dev 官方数据库适配器列表}。如果你的数据库列在那里，
 * 你可能不需要创建自己的适配器。如果你使用的数据解决方案无法与官方适配器集成，此模块将帮助你创建兼容的适配器。
 *
 * :::caution 注意
 * 尽管 `@auth/core` _是_框架/运行时无关的，适配器可能依赖于客户端/ORM 包，
 * 这些包可能还不兼容你的框架/运行时（例如，它可能依赖于 [Node.js APIs](https://nodejs.org/docs/latest/api)）。
 * 相关问题应报告给相应的包维护者。
 * :::
 *
 * ## 安装
 *
 * ```bash npm2yarn
 * npm install @auth/core
 * ```
 *
 * 然后，你可以从 `@auth/core/adapters` 导入此子模块。
 *
 * ## 使用
 *
 * 每个适配器方法及其函数签名在 {@link Adapter} 接口中有文档说明。
 *
 * ```ts title=my-adapter.ts
 * import { type Adapter } from "@auth/core/adapters"
 *
 * // 1. 最简单的形式，一个普通对象。
 * export const MyAdapter: Adapter {
 *  // 在此实现适配器方法
 * }
 *
 * // 或
 *
 * // 2. 一个返回对象的函数。官方适配器使用此模式。
 * export function MyAdapter(config: any): Adapter {
 *  // 使用提供的配置实例化客户端/ORM，或将其作为参数传入。
 *  // 通常，你可能已经在应用程序的其他地方有了一个客户端实例，
 *  // 所以只有在需要或没有实例时才应创建新实例。
 *
 *  return {
 *    // 实现适配器方法
 *  }
 * }
 *
 * ```
 *
 * 然后，你可以将你的适配器作为 `adapter` 选项传递给 Auth.js。
 *
 * ```ts title=index.ts
 * import { MyAdapter } from "./my-adapter"
 *
 * const response = await Auth(..., {
 *   adapter: MyAdapter, // 1.
 *   // 或
 *   adapter: MyAdapter({ /* config *\/ }), // 2.
 *   ...
 * })
 * ```
 *
 * 注意，你可能能够调整现有适配器以与你的数据层一起工作，而不是从头开始创建一个。
 *
 * ```ts title=my-adapter.ts
 * import { type Adapter } from "@auth/core/adapters"
 * import { PrismaAdapter } from "@auth/prisma-adapter"
 * import { PrismaClient } from "@prisma/client"
 *
 * const prisma = new PrismaClient()
 *
 * const adapter: Adapter = {
 *   ...PrismaAdapter(prisma),
 *   // 在此添加你的自定义方法
 * }
 *
 * const request = new Request("https://example.com")
 * const response = await Auth(request, { adapter, ... })
 * ```
 *
 * ## 模型
 *
 * Auth.js 可以与任何数据库一起使用。模型告诉你 Auth.js 期望从你的数据库中获得什么结构。模型会根据你使用的适配器略有不同，但总体上，将与下面的图表有相似的结构。每个模型都可以用额外的字段扩展。
 *
 * :::note
 * Auth.js / NextAuth.js 对其数据库行使用 `camelCase`，同时对 OAuth 相关值尊重传统的 `snake_case` 格式化。如果混合大小写对你来说是个问题，大多数适配器都有专门的文档部分关于如何强制大小写约定。
 * :::
 *
 * ```mermaid
 * erDiagram
 *     User ||--|{ Account : ""
 *     User {
 *       string id
 *       string name
 *       string email
 *       timestamp emailVerified
 *       string image
 *     }
 *     User ||--|{ Session : ""
 *     Session {
 *       string id
 *       timestamp expires
 *       string sessionToken
 *       string userId
 *     }
 *     Account {
 *       string id
 *       string userId
 *       string type
 *       string provider
 *       string providerAccountId
 *       string refresh_token
 *       string access_token
 *       int expires_at
 *       string token_type
 *       string scope
 *       string id_token
 *       string session_state
 *     }
 *     User ||--|{ VerificationToken : ""
 *     VerificationToken {
 *       string identifier
 *       string token
 *       timestamp expires
 *     }
 * ```
 *
 * ## 测试
 *
 * 有一个测试套件[可用](https://github.com/nextauthjs/next-auth/blob/main/packages/utils/adapter.ts)
 * 以确保你的适配器与 Auth.js 兼容。
 *
 * ## 已知问题
 *
 * 以下功能在 Auth.js 中目前缺少内置支持，但可以在用户层面解决。如果你想帮助实现这些功能，请联系。
 *
 * ### 令牌轮换
 *
 * Auth.js _目前_不支持 {@link https://authjs.dev/concepts/oauth `access_token` 轮换}开箱即用。
 * 必要的信息（`refresh_token`、过期时间等）被存储在数据库中，但轮换令牌的逻辑
 * 未在核心库中实现。
 * [此指南](https://authjs.dev/guides/refresh-token-rotation#database-strategy)应提供在用户层面实现此功能的必要步骤。
 *
 * ### 联合登出
 *
 * Auth.js _目前_不支持开箱即用的联合登出。
 * 这意味着即使从数据库中删除了活动会话，用户仍将登录到身份提供者，
 * 他们只会从应用程序中登出。
 * 例如，如果你使用 Google 作为身份提供者，并且你从数据库中删除会话，
 * 用户仍将登录到 Google，但他们将从你的应用程序中登出。
 *
 * 如果你的用户可能从公共共享计算机（例如：图书馆）使用应用程序，你可能想要实现联合登出。
 *
 * @module adapters
 */

import { ProviderType } from "./providers/index.js"
import type { Account, Authenticator, Awaitable, User } from "./types.js"
// TODO: Discuss if we should expose methods to serialize and deserialize
// the data? Many adapters share this logic, so it could be useful to
// have a common implementation.

/**
 * 用户代表可以登录到应用程序的人。
 * 如果用户尚不存在，将在他们首次登录时创建，
 * 使用身份提供者返回的信息（个人资料数据）。
 * 同时也会创建一个相应的账户并与用户链接。
 */
export interface AdapterUser extends User {
  /** 用户的唯一标识符。 */
  id: string
  /** 用户的电子邮件地址。 */
  email: string
  /**
   * 用户是否通过[电子邮件提供者](https://authjs.dev/getting-started/authentication/email)验证了他们的电子邮件地址。
   * 如果用户尚未通过电子邮件提供者登录，则为 `null`，或首次成功登录的日期。
   */
  emailVerified: Date | null
}

/**
 * 账户的类型。
 */
export type AdapterAccountType = Extract<
  ProviderType,
  "oauth" | "oidc" | "email" | "webauthn"
>

/**
 * 账户是用户和提供者之间的连接。
 *
 * 有两种类型的账户：
 * - OAuth/OIDC 账户，当用户使用 OAuth 提供者登录时创建。
 * - 电子邮件账户，当用户使用[电子邮件提供者](https://authjs.dev/getting-started/authentication/email)登录时创建。
 *
 * 一个用户可以拥有多个账户。
 */
export interface AdapterAccount extends Account {
  userId: string
  type: AdapterAccountType
}

/**
 * 会话保存有关用户当前登录状态的信息。
 */
export interface AdapterSession {
  /**
   * 一个随机生成的值，用于在使用 `"database"` `AuthConfig.strategy` 选项时在数据库中查找会话。
   * 此值保存在客户端的安全的、HTTP-Only cookie 中。
   */
  sessionToken: string
  /** 将活动会话连接到数据库中的用户 */
  userId: string
  /**
   * 会话过期的绝对日期。
   *
   * 如果在过期日期之前访问会话，
   * 它将根据 `SessionOptions.maxAge` 定义的 `maxAge` 选项延长。
   * 它在 `SessionOptions.updateAge` 定义的周期内最多延长一次。
   *
   * 如果在过期日期之后访问会话，
   * 它将从数据库中删除以清理非活动会话。
   *
   */
  expires: Date
}

/**
 * 验证令牌是一个临时令牌，用于通过用户的电子邮件地址登录。
 * 当用户使用[电子邮件提供者](https://authjs.dev/getting-started/authentication/email)登录时创建。
 * 当用户点击电子邮件中的链接时，令牌和电子邮件被发送回服务器
 * 在那里它被哈希并与数据库中的值进行比较。
 * 如果令牌和电子邮件匹配，并且令牌尚未过期，用户将被登录。
 * 然后令牌从数据库中删除。
 */
export interface VerificationToken {
  /** 用户的电子邮件地址。 */
  identifier: string
  /** 令牌过期的绝对日期。 */
  expires: Date
  /**
   * 一个[哈希](https://en.wikipedia.org/wiki/Hash_function)令牌，使用 `AuthConfig.secret` 值。
   */
  token: string
}

/**
 * 认证器代表分配给用户的凭证认证器。
 */
export interface AdapterAuthenticator extends Authenticator {
  /**
   * 认证器的用户 ID。
   */
  userId: string
}

/**
 * 适配器是一个具有函数属性（方法）的对象，这些方法从数据源读取和写入数据。
 * 将这些方法视为将数据层标准化为 Auth.js 可以理解的通用接口的方式。
 *
 * 这使得 Auth.js 非常灵活，并允许它与任何数据层一起使用。
 *
 * 适配器方法用于执行以下操作：
 * - 创建/更新/删除用户
 * - 将账户链接到用户/从用户解链接
 * - 处理活动会话
 * - 支持跨多个设备的无密码认证
 *
 * :::note
 * 如果任何方法未实现，但被 Auth.js 调用，
 * 将向用户显示错误并且操作将失败。
 * :::
 */
export interface Adapter {
  /**
   * 在数据库中创建用户并返回它。
   *
   * 另见[用户管理](https://authjs.dev/guides/creating-a-database-adapter#user-management)
   */
  createUser?(user: AdapterUser): Awaitable<AdapterUser>
  /**
   * 通过用户 ID 从数据库返回用户。
   *
   * 另见[用户管理](https://authjs.dev/guides/creating-a-database-adapter#user-management)
   */
  getUser?(id: string): Awaitable<AdapterUser | null>
  /**
   * 通过用户的电子邮件地址从数据库返回用户。
   *
   * 另见[验证令牌](https://authjs.dev/guides/creating-a-database-adapter#verification-tokens)
   */
  getUserByEmail?(email: string): Awaitable<AdapterUser | null>
  /**
   * 使用提供者 ID 和特定账户的用户 ID 获取用户。
   *
   * 另见[用户管理](https://authjs.dev/guides/creating-a-database-adapter#user-management)
   */
  getUserByAccount?(
    providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">
  ): Awaitable<AdapterUser | null>
  /**
   * 更新数据库中的用户并返回它。
   *
   * 另见[用户管理](https://authjs.dev/guides/creating-a-database-adapter#user-management)
   */
  updateUser?(
    user: Partial<AdapterUser> & Pick<AdapterUser, "id">
  ): Awaitable<AdapterUser>
  /**
   * @todo 此方法目前尚未调用。
   *
   * 另见[用户管理](https://authjs.dev/guides/creating-a-database-adapter#user-management)
   */
  deleteUser?(
    userId: string
  ): Promise<void> | Awaitable<AdapterUser | null | undefined>
  /**
   * 此方法在内部调用（但也可以用于手动链接）。
   * 它在数据库中创建一个[账户](https://authjs.dev/reference/core/adapters#models)。
   *
   * 另见[用户管理](https://authjs.dev/guides/creating-a-database-adapter#user-management)
   */
  linkAccount?(
    account: AdapterAccount
  ): Promise<void> | Awaitable<AdapterAccount | null | undefined>
  /** @todo 此方法目前尚未调用。 */
  unlinkAccount?(
    providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">
  ): Promise<void> | Awaitable<AdapterAccount | undefined>
  /**
   * 为用户创建会话并返回它。
   *
   * 另见[数据库会话管理](https://authjs.dev/guides/creating-a-database-adapter#database-session-management)
   */
  createSession?(session: {
    sessionToken: string
    userId: string
    expires: Date
  }): Awaitable<AdapterSession>
  /**
   * 一次性从数据库返回会话和用户。
   *
   * :::tip
   * 如果数据库支持连接，建议减少数据库查询次数。
   * :::
   *
   * 另见[数据库会话管理](https://authjs.dev/guides/creating-a-database-adapter#database-session-management)
   */
  getSessionAndUser?(
    sessionToken: string
  ): Awaitable<{ session: AdapterSession; user: AdapterUser } | null>
  /**
   * 更新数据库中的会话并返回它。
   *
   * 另见[数据库会话管理](https://authjs.dev/guides/creating-a-database-adapter#database-session-management)
   */
  updateSession?(
    session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
  ): Awaitable<AdapterSession | null | undefined>
  /**
   * 从数据库中删除会话。最好此方法也
   * 返回正在删除的会话以用于日志记录目的。
   *
   * 另见[数据库会话管理](https://authjs.dev/guides/creating-a-database-adapter#database-session-management)
   */
  deleteSession?(
    sessionToken: string
  ): Promise<void> | Awaitable<AdapterSession | null | undefined>
  /**
   * 创建验证令牌并返回它。
   *
   * 另见[验证令牌](https://authjs.dev/guides/creating-a-database-adapter#verification-tokens)
   */
  createVerificationToken?(
    verificationToken: VerificationToken
  ): Awaitable<VerificationToken | null | undefined>
  /**
   * 从数据库返回验证令牌并删除它
   * 以便它只能使用一次。
   *
   * 另见[验证令牌](https://authjs.dev/guides/creating-a-database-adapter#verification-tokens)
   */
  useVerificationToken?(params: {
    identifier: string
    token: string
  }): Awaitable<VerificationToken | null>
  /**
   * 通过提供者账户 ID 和提供者获取账户。
   *
   * 如果未找到账户，适配器必须返回 `null`。
   */
  getAccount?(
    providerAccountId: AdapterAccount["providerAccountId"],
    provider: AdapterAccount["provider"]
  ): Awaitable<AdapterAccount | null>
  /**
   * 从其 credentialID 返回认证器。
   *
   * 如果未找到认证器，适配器必须返回 `null`。
   */
  getAuthenticator?(
    credentialID: AdapterAuthenticator["credentialID"]
  ): Awaitable<AdapterAuthenticator | null>
  /**
   * 创建新的认证器。
   *
   * 如果创建失败，适配器必须抛出错误。
   */
  createAuthenticator?(
    authenticator: AdapterAuthenticator
  ): Awaitable<AdapterAuthenticator>
  /**
   * 返回用户的所有认证器。
   *
   * 如果未找到用户，适配器仍应返回空数组。
   * 如果由于其他原因检索失败，适配器必须抛出错误。
   */
  listAuthenticatorsByUserId?(
    userId: AdapterAuthenticator["userId"]
  ): Awaitable<AdapterAuthenticator[]>
  /**
   * 更新认证器的计数器。
   *
   * 如果更新失败，适配器必须抛出错误。
   */
  updateAuthenticatorCounter?(
    credentialID: AdapterAuthenticator["credentialID"],
    newCounter: AdapterAuthenticator["counter"]
  ): Awaitable<AdapterAuthenticator>
}

// https://github.com/honeinc/is-iso-date/blob/master/index.js
const isoDateRE =
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/

/** 确定给定值是否可以解析为 `Date` */
export function isDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    isoDateRE.test(value) &&
    !isNaN(Date.parse(value))
  )
}

// @ts-expect-error For compatibility with older versions of NextAuth.js
declare module "next-auth/adapters" {
  type JsonObject = {
    [Key in string]?: JsonValue
  }
  type JsonArray = JsonValue[]
  type JsonPrimitive = string | number | boolean | null
  type JsonValue = JsonPrimitive | JsonObject | JsonArray
  interface AdapterAccount {
    type: "oauth" | "email" | "oidc"
    [key: string]: JsonValue | undefined
  }
}
