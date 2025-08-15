/**
 * <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16}}>
 *  <p>Auth.js / NextAuth.js 的官方 <a href="https://kysely.dev/">Kysely</a> 适配器。</p>
 *  <a href="https://kysely.dev/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/adapters/kysely.svg" width="30" />
 *  </a>
 * </div>
 *
 * ## 安装
 *
 * ```bash npm2yarn
 * npm install @auth/kysely-adapter kysely
 * ```
 *
 * @module @auth/kysely-adapter
 */
import { Kysely, SqliteAdapter } from "kysely"

import {
  type Adapter,
  type AdapterUser,
  type AdapterAccount,
  type AdapterSession,
  type VerificationToken,
  isDate,
} from "@auth/core/adapters"

export interface Database {
  User: AdapterUser
  Account: AdapterAccount
  Session: AdapterSession
  VerificationToken: VerificationToken
}

export const format = {
  from<T>(object?: Record<string, any>): T {
    const newObject: Record<string, unknown> = {}
    for (const key in object) {
      const value = object[key]
      if (isDate(value)) newObject[key] = new Date(value)
      else newObject[key] = value
    }
    return newObject as T
  },
  to<T>(object: Record<string, any>): T {
    const newObject: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(object))
      newObject[key] = value instanceof Date ? value.toISOString() : value
    return newObject as T
  },
}

export function KyselyAdapter(db: Kysely<Database>): Adapter {
  const { adapter } = db.getExecutor()
  const { supportsReturning } = adapter
  const isSqlite = adapter instanceof SqliteAdapter
  /** 如果数据库是 SQLite，将日期转换为 ISO 字符串格式  */
  const to = isSqlite ? format.to : <T>(x: T) => x as T
  /** 如果数据库是 SQLite，将 ISO 字符串转换为日期 */
  const from = isSqlite ? format.from : <T>(x: T) => x as T
  return {
    async createUser(data) {
      const user = { ...data, id: crypto.randomUUID() }
      await db.insertInto("User").values(to(user)).executeTakeFirstOrThrow()
      return user
    },
    async getUser(id) {
      const result = await db
        .selectFrom("User")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst()
      if (!result) return null
      return from(result)
    },
    async getUserByEmail(email) {
      const result = await db
        .selectFrom("User")
        .selectAll()
        .where("email", "=", email)
        .executeTakeFirst()
      if (!result) return null
      return from(result)
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const result = await db
        .selectFrom("User")
        .innerJoin("Account", "User.id", "Account.userId")
        .selectAll("User")
        .where("Account.providerAccountId", "=", providerAccountId)
        .where("Account.provider", "=", provider)
        .executeTakeFirst()
      if (!result) return null
      return from(result)
    },
    async updateUser({ id, ...user }) {
      const userData = to(user)
      const query = db.updateTable("User").set(userData).where("id", "=", id)
      const result = supportsReturning
        ? query.returningAll().executeTakeFirstOrThrow()
        : query
            .executeTakeFirstOrThrow()
            .then(() =>
              db
                .selectFrom("User")
                .selectAll()
                .where("id", "=", id)
                .executeTakeFirstOrThrow()
            )
      return from(await result)
    },
    async deleteUser(userId) {
      await db
        .deleteFrom("User")
        .where("User.id", "=", userId)
        .executeTakeFirst()
    },
    async linkAccount(account) {
      await db
        .insertInto("Account")
        .values(to(account))
        .executeTakeFirstOrThrow()
      return account
    },
    async unlinkAccount({ providerAccountId, provider }) {
      await db
        .deleteFrom("Account")
        .where("Account.providerAccountId", "=", providerAccountId)
        .where("Account.provider", "=", provider)
        .executeTakeFirstOrThrow()
    },
    async createSession(session) {
      await db.insertInto("Session").values(to(session)).execute()
      return session
    },
    async getSessionAndUser(sessionToken) {
      const result = await db
        .selectFrom("Session")
        .innerJoin("User", "User.id", "Session.userId")
        .selectAll("User")
        .select(["Session.expires", "Session.userId"])
        .where("Session.sessionToken", "=", sessionToken)
        .executeTakeFirst()
      if (!result) return null
      const { userId, expires, ...user } = result
      const session = { sessionToken, userId, expires }
      return { user: from(user), session: from(session) }
    },
    async updateSession(session) {
      const sessionData = to(session)
      const query = db
        .updateTable("Session")
        .set(sessionData)
        .where("Session.sessionToken", "=", session.sessionToken)
      const result = supportsReturning
        ? await query.returningAll().executeTakeFirstOrThrow()
        : await query.executeTakeFirstOrThrow().then(async () => {
            return await db
              .selectFrom("Session")
              .selectAll()
              .where("Session.sessionToken", "=", sessionData.sessionToken)
              .executeTakeFirstOrThrow()
          })
      return from(result)
    },
    async deleteSession(sessionToken) {
      await db
        .deleteFrom("Session")
        .where("Session.sessionToken", "=", sessionToken)
        .executeTakeFirstOrThrow()
    },
    async createVerificationToken(data) {
      await db.insertInto("VerificationToken").values(to(data)).execute()
      return data
    },
    async useVerificationToken({ identifier, token }) {
      const query = db
        .deleteFrom("VerificationToken")
        .where("VerificationToken.token", "=", token)
        .where("VerificationToken.identifier", "=", identifier)

      const result = supportsReturning
        ? await query.returningAll().executeTakeFirst()
        : await db
            .selectFrom("VerificationToken")
            .selectAll()
            .where("token", "=", token)
            .where("identifier", "=", identifier)
            .executeTakeFirst()
            .then(async (res) => {
              await query.executeTakeFirst()
              return res
            })
      if (!result) return null
      return from(result)
    },
  }
}

/**
 * 对原始 `Kysely` 类的封装，以验证传入的数据库接口。虽然也可以使用常规的 Kysely 实例，但封装它
 * 可以确保数据库接口实现了 Auth.js 所需的字段。当与 `kysely-codegen` 一起使用时，`Codegen` 类型可以作为
 * 第二个泛型参数传入。生成的类型将被使用，而 `KyselyAuth` 仅验证正确的字段是否存在。
 * @noInheritDoc
 */
export class KyselyAuth<DB extends T, T = Database> extends Kysely<DB> {}

export type Codegen = {
  [K in keyof Database]: { [J in keyof Database[K]]: unknown }
}
