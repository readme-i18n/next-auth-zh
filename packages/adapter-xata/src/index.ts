/**
 * <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16}}>
 *  <p>Official <a href="https://xata.io/docs/overview">Xata</a> adapter for Auth.js / NextAuth.js.</p>
 *  <a href="https://xata.io/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/adapters/xata.svg" width="50"/>
 *  </a>
 * </div>
 *
 * ## 安装
 *
 * 1. 安装 Auth.js 和 Xata 适配器
 *
 * ```bash npm2yarn
 * npm install @auth/xata-adapter
 * ```
 *
 * 2. 全局安装 Xata CLI（如果尚未安装）
 *
 * ```bash npm2yarn
 * npm install -g @xata.io/cli
 * ```
 *
 * 3. 登录
 *
 * ```bash
 * xata auth login
 * ```
 *
 * @module @auth/xata-adapter
 */

import type { Adapter } from "@auth/core/adapters"
import type { XataClient } from "./xata.js"

export function XataAdapter(client: XataClient): Adapter {
  return {
    async createUser(user) {
      const newUser = await client.db.nextauth_users.create(user)
      return newUser
    },
    async getUser(id) {
      const user = await client.db.nextauth_users.filter({ id }).getFirst()
      return user ?? null
    },
    async getUserByEmail(email) {
      const user = await client.db.nextauth_users.filter({ email }).getFirst()
      return user ?? null
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const result = await client.db.nextauth_users_accounts
        .select(["user.*"])
        .filter({
          "account.providerAccountId": providerAccountId,
          "account.provider": provider,
        })
        .getFirst()
      const user = result?.user
      return user ?? null
    },
    async updateUser(user) {
      const result = await client.db.nextauth_users.update(user.id!, user)
      return (
        result ?? {
          ...user,
          id: user.id!,
          emailVerified: user.emailVerified ?? null,
        }
      )
    },
    async deleteUser(id) {
      return await client.db.nextauth_users.delete(id)
    },
    async linkAccount(initialAccount) {
      const { userId, ...account } = initialAccount
      const newXataAccount = await client.db.nextauth_accounts.create({
        ...account,
        user: { id: userId },
      })
      await client.db.nextauth_users_accounts.create({
        user: { id: userId },
        account: { id: newXataAccount.id },
      })
    },
    async unlinkAccount({ providerAccountId, provider }) {
      /**
       * @todo 当我们支持 DELETE WHERE 时重构此部分。
       */
      const connectedAccount = await client.db.nextauth_users_accounts
        .filter({
          "account.providerAccountId": providerAccountId,
          "account.provider": provider,
        })
        .getFirst()

      if (!connectedAccount) {
        return
      }
      return await client.db.nextauth_users_accounts.delete(connectedAccount.id)
    },
    async createSession(initialSession) {
      const { userId, ...session } = initialSession
      const newXataSession = await client.db.nextauth_sessions.create({
        ...session,
        user: { id: userId },
      })
      await client.db.nextauth_users_sessions.create({
        user: { id: userId },
        session: { id: newXataSession.id },
      })
      return { ...session, ...newXataSession, userId }
    },
    async getSessionAndUser(sessionToken) {
      const result = await client.db.nextauth_users_sessions
        .select(["user.*", "session.*"])
        .filter({ "session.sessionToken": sessionToken })
        .getFirst()
      if (!result?.session || !result?.user) {
        return null
      }

      return {
        session: {
          ...result.session,
          sessionToken: result.session.sessionToken!,
          expires: result.session.expires!,
          userId: result.user.id,
        },
        user: {
          ...result.user,
          emailVerified: result.user.emailVerified ?? null,
        },
      }
    },
    async updateSession({ sessionToken, ...data }) {
      const session = await client.db.nextauth_sessions
        .filter({ sessionToken })
        .getFirst()
      if (!session) {
        return null
      }

      await client.db.nextauth_sessions.update({ ...session, ...data })
      return {
        ...session,
        sessionToken,
        userId: data.userId!,
        expires: data.expires!,
      }
    },

    async deleteSession(sessionToken) {
      /**
       * @todo 当我们支持 DELETE WHERE 时重构此部分。
       */
      const session = await client.db.nextauth_sessions
        .filter({ sessionToken })
        .getFirst()
      if (!session) {
        return
      }
      const connectedSession = await client.db.nextauth_users_sessions
        .filter({ "session.sessionToken": sessionToken })
        .getFirst()
      if (!connectedSession) {
        return
      }
      await client.db.nextauth_sessions.delete(session.id)
      await client.db.nextauth_users_sessions.delete(connectedSession.id)
    },
    async createVerificationToken(token) {
      await client.db.nextauth_verificationTokens.create({
        expires: token.expires,
        identifier: token.identifier,
        token: token.token,
      })
      return token
    },
    async useVerificationToken(token) {
      /**
       * @todo 当我们支持 DELETE WHERE 时重构此部分。
       */
      const xataToken = await client.db.nextauth_verificationTokens
        .filter({ identifier: token.identifier, token: token.token })
        .getFirst()
      if (!xataToken) {
        return null
      }
      await client.db.nextauth_verificationTokens.delete(xataToken.id)
      return { ...token, expires: new Date() }
    },
  }
}
