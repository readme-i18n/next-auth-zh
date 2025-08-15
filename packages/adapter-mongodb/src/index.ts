/**
 * <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16}}>
 *  <p>Auth.js / NextAuth.js 的官方 <a href="https://www.mongodb.com">MongoDB</a> 适配器。</p>
 *  <a href="https://www.mongodb.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/adapters/mongodb.svg" width="30" />
 *  </a>
 * </div>
 *
 * ## 安装
 *
 * ```bash npm2yarn
 * npm install @auth/mongodb-adapter mongodb
 * ```
 *
 * @module @auth/mongodb-adapter
 */
import { ObjectId } from "mongodb"

import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken,
} from "@auth/core/adapters"
import type { MongoClient } from "mongodb"

/**
 * 此适配器使用了 https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management。
 * 此特性非常新，需要在所有环境中为 `Symbol.asyncDispose` 提供运行时 polyfills 才能正常工作。
 * 同时，还需要在 `tsconfig.json` 文件中将编译目标设置为 `es2022` 或以下，并配置 `lib` 选项以包含 `esnext` 或 `esnext.disposable`。
 *
 * 您可以在上面的链接中找到关于此特性和 polyfills 的更多信息。
 */
// @ts-expect-error read only property is not assignable
Symbol.asyncDispose ??= Symbol("Symbol.asyncDispose")

/** 这是 MongoDB 适配器选项的接口。 */
export interface MongoDBAdapterOptions {
  /**
   * {@link https://www.mongodb.com/docs/manual/core/databases-and-collections/#collections MongoDB 集合}的名称。
   */
  collections?: {
    Users?: string
    Accounts?: string
    Sessions?: string
    VerificationTokens?: string
  }
  /**
   * 您想要给 MongoDB 数据库命名的名称
   */
  databaseName?: string
  /**
   * 用于管理 MongoDB 客户端关闭的回调函数。
   * 当 `client` 作为返回 MongoClient 的函数提供时，这可能很有用。
   * 它允许对数据库连接进行更自定义的管理，
   * 解决持久性、容器重用和连接关闭问题。
   */
  onClose?: (client: MongoClient) => Promise<void>
}

export const defaultCollections: Required<
  Required<MongoDBAdapterOptions>["collections"]
> = {
  Users: "users",
  Accounts: "accounts",
  Sessions: "sessions",
  VerificationTokens: "verification_tokens",
}

export const format = {
  /** 接收一个 MongoDB 对象并返回一个普通的 JavaScript 对象 */
  from<T = Record<string, unknown>>(object: Record<string, any>): T {
    const newObject: Record<string, unknown> = {}
    for (const key in object) {
      const value = object[key]
      if (key === "_id") {
        newObject.id = value.toHexString()
      } else if (key === "userId") {
        newObject[key] = value.toHexString()
      } else {
        newObject[key] = value
      }
    }
    return newObject as T
  },
  /** 接收一个普通的 JavaScript 对象并将其转换为 MongoDB 对象 */
  to<T = Record<string, unknown>>(object: Record<string, any>) {
    const newObject: Record<string, unknown> = {
      _id: _id(object.id),
    }
    for (const key in object) {
      const value = object[key]
      if (key === "userId") newObject[key] = _id(value)
      else if (key === "id") continue
      else newObject[key] = value
    }
    return newObject as T & { _id: ObjectId }
  },
}

/** @internal */
export function _id(hex?: string) {
  if (hex?.length !== 24) return new ObjectId()
  return new ObjectId(hex)
}

export function MongoDBAdapter(
  /**
   * MongoDB 客户端。
   *
   * MongoDB 团队建议提供一个未连接的 `MongoClient` 实例，以避免如果客户端连接失败时未处理的 promise 拒绝。
   *
   * 或者，您也可以传递：
   * - 一个解析为已连接 `MongoClient` 的 promise（不推荐）。
   * - 一个函数，以处理更复杂和自定义的连接策略。
   *
   * 结合 `options.onClose` 使用函数，当您想要一个更高级和自定义的连接策略以解决与持久性、容器重用和连接关闭相关的挑战时，可能很有用。
   */
  client:
    | MongoClient
    | Promise<MongoClient>
    | (() => MongoClient | Promise<MongoClient>),
  options: MongoDBAdapterOptions = {}
): Adapter {
  const { collections } = options
  const { from, to } = format

  const getDb = async () => {
    const _client: MongoClient = await (typeof client === "function"
      ? client()
      : client)
    const _db = _client.db(options.databaseName)
    const c = { ...defaultCollections, ...collections }
    return {
      U: _db.collection<AdapterUser>(c.Users),
      A: _db.collection<AdapterAccount>(c.Accounts),
      S: _db.collection<AdapterSession>(c.Sessions),
      V: _db.collection<VerificationToken>(c?.VerificationTokens),
      [Symbol.asyncDispose]: async () => {
        await options.onClose?.(_client)
      },
    }
  }

  return {
    async createUser(data) {
      const user = to<AdapterUser>(data)
      await using db = await getDb()
      await db.U.insertOne(user)
      return from<AdapterUser>(user)
    },
    async getUser(id) {
      await using db = await getDb()
      const user = await db.U.findOne({ _id: _id(id) })
      if (!user) return null
      return from<AdapterUser>(user)
    },
    async getUserByEmail(email) {
      await using db = await getDb()
      const user = await db.U.findOne({ email })
      if (!user) return null
      return from<AdapterUser>(user)
    },
    async getUserByAccount(provider_providerAccountId) {
      await using db = await getDb()
      const account = await db.A.findOne(provider_providerAccountId)
      if (!account) return null
      const user = await db.U.findOne({ _id: new ObjectId(account.userId) })
      if (!user) return null
      return from<AdapterUser>(user)
    },
    async updateUser(data) {
      const { _id, ...user } = to<AdapterUser>(data)
      await using db = await getDb()
      const result = await db.U.findOneAndUpdate(
        { _id },
        { $set: user },
        { returnDocument: "after" }
      )

      return from<AdapterUser>(result!)
    },
    async deleteUser(id) {
      const userId = _id(id)
      await using db = await getDb()
      await Promise.all([
        db.A.deleteMany({ userId: userId as any }),
        db.S.deleteMany({ userId: userId as any }),
        db.U.deleteOne({ _id: userId }),
      ])
    },
    linkAccount: async (data) => {
      const account = to<AdapterAccount>(data)
      await using db = await getDb()
      await db.A.insertOne(account)
      return account
    },
    async unlinkAccount(provider_providerAccountId) {
      await using db = await getDb()
      const account = await db.A.findOneAndDelete(provider_providerAccountId)
      return from<AdapterAccount>(account!)
    },
    async getSessionAndUser(sessionToken) {
      await using db = await getDb()
      const session = await db.S.findOne({ sessionToken })
      if (!session) return null
      const user = await db.U.findOne({ _id: new ObjectId(session.userId) })
      if (!user) return null
      return {
        user: from<AdapterUser>(user),
        session: from<AdapterSession>(session),
      }
    },
    async createSession(data) {
      const session = to<AdapterSession>(data)
      await using db = await getDb()
      await db.S.insertOne(session)
      return from<AdapterSession>(session)
    },
    async updateSession(data) {
      const { _id, ...session } = to<AdapterSession>(data)
      await using db = await getDb()
      const updatedSession = await db.S.findOneAndUpdate(
        { sessionToken: session.sessionToken },
        { $set: session },
        { returnDocument: "after" }
      )
      return from<AdapterSession>(updatedSession!)
    },
    async deleteSession(sessionToken) {
      await using db = await getDb()
      const session = await db.S.findOneAndDelete({
        sessionToken,
      })
      return from<AdapterSession>(session!)
    },
    async createVerificationToken(data) {
      await using db = await getDb()
      await db.V.insertOne(to(data))
      return data
    },
    async useVerificationToken(identifier_token) {
      await using db = await getDb()
      const verificationToken = await db.V.findOneAndDelete(identifier_token)
      if (!verificationToken) return null
      const { _id, ...rest } = verificationToken
      return rest
    },
  }
}
