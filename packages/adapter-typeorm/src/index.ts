/**
 * <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px"}}>
 *  <p>Auth.js / NextAuth.js 的官方 <a href="https://typeorm.io">TypeORM</a> 适配器。</p>
 *  <a href="https://typeorm.io">
 *   <img style={{display: "block" }} width="56" src="/img/adapters/typeorm.svg" />
 *  </a>
 * </div>
 *
 * ## 安装
 *
 * ```bash npm2yarn
 * npm install @auth/typeorm-adapter typeorm
 * ```
 *
 * @module @auth/typeorm-adapter
 */

import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
} from "@auth/core/adapters"
import { DataSourceOptions, DataSource, EntityManager } from "typeorm"
import * as defaultEntities from "./entities.js"
import { parseDataSourceConfig, updateConnectionEntities } from "./utils.js"

export const entities = defaultEntities

export type Entities = typeof entities

/** 这是 TypeORM 适配器选项的接口。 */
export interface TypeORMAdapterOptions {
  /**
   * 用于创建数据库表的 {@link https://orkhan.gitbook.io/typeorm/docs/entities TypeORM 实体}。
   */
  entities?: Entities
}

let _dataSource: DataSource | undefined

export async function getManager(options: {
  dataSource: string | DataSourceOptions
  entities: Entities
}): Promise<EntityManager> {
  if (!_dataSource) {
    const { dataSource, entities } = options
    const config = {
      ...parseDataSourceConfig(dataSource),
      entities: Object.values(entities),
    }
    _dataSource = new DataSource(config)
  }

  const manager = _dataSource?.manager

  if (!manager.connection.isInitialized) {
    await manager.connection.initialize()
  }

  if (process.env.NODE_ENV !== "production") {
    await updateConnectionEntities(_dataSource, Object.values(options.entities))
  }
  return manager
}

export function TypeORMAdapter(
  dataSource: string | DataSourceOptions,
  options?: TypeORMAdapterOptions
): Adapter {
  const entities = options?.entities
  const c = {
    dataSource,
    entities: {
      UserEntity: entities?.UserEntity ?? defaultEntities.UserEntity,
      SessionEntity: entities?.SessionEntity ?? defaultEntities.SessionEntity,
      AccountEntity: entities?.AccountEntity ?? defaultEntities.AccountEntity,
      VerificationTokenEntity:
        entities?.VerificationTokenEntity ??
        defaultEntities.VerificationTokenEntity,
    },
  }

  const UserEntityName = c.entities.UserEntity.name
  const AccountEntityName = c.entities.AccountEntity.name
  const SessionEntityName = c.entities.SessionEntity.name
  const VerificationTokenEntityName = c.entities.VerificationTokenEntity.name

  return {
    /**
     * 测试中使用的方法。你在应用中不需要调用此方法。
     * @internal
     */
    async __disconnect() {
      const m = await getManager(c)
      await m.connection.close()
    },
    createUser: async (data) => {
      const m = await getManager(c)
      const user = await m.save(UserEntityName, data)
      return user
    },
    // @ts-expect-error
    async getUser(id) {
      const m = await getManager(c)
      const user = await m.findOne(UserEntityName, { where: { id } })
      if (!user) return null
      return { ...user }
    },
    // @ts-expect-error
    async getUserByEmail(email) {
      const m = await getManager(c)
      const user = await m.findOne(UserEntityName, { where: { email } })
      if (!user) return null
      return { ...user }
    },
    async getUserByAccount(provider_providerAccountId) {
      const m = await getManager(c)
      // @ts-expect-error
      const account = await m.findOne<AdapterAccount & { user: AdapterUser }>(
        AccountEntityName,
        // @ts-expect-error
        { where: provider_providerAccountId, relations: ["user"] }
      )
      if (!account) return null
      return account.user ?? null
    },
    // @ts-expect-error
    async updateUser(data) {
      const m = await getManager(c)
      const user = await m.save(UserEntityName, data)
      return user
    },
    async deleteUser(id) {
      const m = await getManager(c)
      await m.transaction(async (tm) => {
        await tm.delete(AccountEntityName, { userId: id })
        await tm.delete(SessionEntityName, { userId: id })
        await tm.delete(UserEntityName, { id })
      })
    },
    async linkAccount(data) {
      const m = await getManager(c)
      const account = await m.save(AccountEntityName, data)
      return account
    },
    async unlinkAccount(providerAccountId) {
      const m = await getManager(c)
      await m.delete<AdapterAccount>(AccountEntityName, providerAccountId)
    },
    async createSession(data) {
      const m = await getManager(c)
      const session = await m.save(SessionEntityName, data)
      return session
    },
    async getSessionAndUser(sessionToken) {
      const m = await getManager(c)
      const sessionAndUser = await m.findOne<
        AdapterSession & { user: AdapterUser }
      >(SessionEntityName, { where: { sessionToken }, relations: ["user"] })

      if (!sessionAndUser) return null
      const { user, ...session } = sessionAndUser
      return { session, user }
    },
    async updateSession(data) {
      const m = await getManager(c)
      await m.update(
        SessionEntityName,
        { sessionToken: data.sessionToken },
        data
      )
      // TODO: Try to return?
      return null
    },
    async deleteSession(sessionToken) {
      const m = await getManager(c)
      await m.delete(SessionEntityName, { sessionToken })
    },
    async createVerificationToken(data) {
      const m = await getManager(c)
      const verificationToken = await m.save(VerificationTokenEntityName, data)
      // @ts-expect-error
      delete verificationToken.id
      return verificationToken
    },
    // @ts-expect-error
    async useVerificationToken(identifier_token) {
      const m = await getManager(c)
      const verificationToken = await m.findOne(VerificationTokenEntityName, {
        where: identifier_token,
      })
      if (!verificationToken) {
        return null
      }
      await m.delete(VerificationTokenEntityName, identifier_token)
      // @ts-expect-error
      delete verificationToken.id
      return verificationToken
    },
  }
}
