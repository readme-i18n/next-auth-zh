/**
 * _如需从 v4 迁移，请访问 [升级指南 (v5)](https://authjs.dev/getting-started/migrating-to-v5)。_
 *
 * ## 安装
 *
 * ```bash npm2yarn
 * npm install next-auth@beta
 * ```
 *
 * ## 环境变量推断
 *
 * 自 v4 起，`NEXTAUTH_URL` 和 `NEXTAUTH_SECRET` 已被推断。
 *
 * 自 NextAuth.js v5 起，还能自动推断以 `AUTH_` 为前缀的环境变量。
 *
 * 例如，`AUTH_GITHUB_ID` 和 `AUTH_GITHUB_SECRET` 将分别用作 GitHub 提供者的 `clientId` 和 `clientSecret` 选项。
 *
 * :::tip
 * OAuth 提供者的环境变量命名推断遵循以下格式：`AUTH_{PROVIDER}_{ID|SECRET}`。
 *
 * `PROVIDER` 是提供者 ID 的大写下划线形式，后跟 `ID` 或 `SECRET`。
 * :::
 *
 * 为保持一致性，`AUTH_SECRET` 和 `AUTH_URL` 也分别作为 `NEXTAUTH_SECRET` 和 `NEXTAUTH_URL` 的别名。
 *
 * 要为应用添加社交登录，配置如下：
 *
 * ```ts title="auth.ts"
 * import NextAuth from "next-auth"
 * import GitHub from "next-auth/providers/github"
 * export const { handlers, auth } = NextAuth({ providers: [ GitHub ] })
 * ```
 *
 * 以及 `.env.local` 文件：
 *
 * ```sh title=".env.local"
 * AUTH_GITHUB_ID=...
 * AUTH_GITHUB_SECRET=...
 * AUTH_SECRET=...
 * ```
 *
 * :::tip
 * 在生产环境中，`AUTH_SECRET` 是必需的环境变量——如果未设置，NextAuth.js 将抛出错误。详情请参阅 [MissingSecretError](https://authjs.dev/reference/core/errors#missingsecret)。
 * :::
 *
 * 如果需要覆盖提供者的默认值，仍可像以前一样调用函数 `GitHub({...})`。
 *
 * ## 延迟初始化
 * 你也可以延迟初始化 NextAuth.js（以前称为高级初始化），这允许你在某些情况下（如路由处理器、中间件、API 路由或 `getServerSideProps`）访问请求上下文中的配置。
 * 上述示例变为：
 *
 * ```ts title="auth.ts"
 * import NextAuth from "next-auth"
 * import GitHub from "next-auth/providers/github"
 * export const { handlers, auth } = NextAuth(req => {
 *  if (req) {
 *   console.log(req) // 对请求进行操作
 *  }
 *  return { providers: [ GitHub ] }
 * })
 * ```
 *
 * :::tip
 * 如果你想根据请求自定义配置（例如，在暂存/开发环境中添加不同的提供者），这将非常有用。
 * :::
 *
 * @module next-auth
 */

import { Auth, customFetch } from "@auth/core"
import { reqWithEnvURL, setEnvDefaults } from "./lib/env.js"
import { initAuth } from "./lib/index.js"
import { signIn, signOut, update } from "./lib/actions.js"

import type { Awaitable, Session } from "@auth/core/types"
import type { ProviderId } from "@auth/core/providers"
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next"
import type {
  AppRouteHandlerFn,
  AppRouteHandlerFnContext,
} from "./lib/types.js"
// @ts-expect-error Next.js does not yet correctly use the `package.json#exports` field
import type { NextRequest, NextMiddleware } from "next/server"
import type {
  NextAuthConfig,
  NextAuthRequest,
  NextAuthMiddleware,
} from "./lib/index.js"
export { AuthError, CredentialsSignin } from "@auth/core/errors"

export { customFetch }

export type {
  Session,
  Account,
  Profile,
  DefaultSession,
  User,
} from "@auth/core/types"

type AppRouteHandlers = Record<
  "GET" | "POST",
  (req: NextRequest) => Promise<Response>
>

export type { NextAuthConfig, NextAuthRequest }

/**
 * 调用 {@link NextAuth|NextAuth} 的结果，使用 {@link NextAuthConfig} 初始化。
 * 它包含在你的 Next.js 应用中设置和与 NextAuth.js 交互的方法。
 */
export interface NextAuthResult {
  /**
   * NextAuth.js 的 [路由处理器](https://beta.nextjs.org/docs/routing/route-handlers) 方法。这些用于为 OAuth/Email 提供者暴露端点，
   * 以及可以从客户端联系的 REST API 端点（如 `/api/auth/session`）。
   *
   * 在 `auth.ts` 中初始化 NextAuth.js 后，
   * 重新导出这些方法。
   *
   * 在 `app/api/auth/[...nextauth]/route.ts` 中：
   *
   * ```ts title="app/api/auth/[...nextauth]/route.ts"
   * export { GET, POST } from "../../../../auth"
   * export const runtime = "edge" // 可选
   * ```
   * 然后在 `auth.ts` 中：
   * ```ts title="auth.ts"
   * // ...
   * export const { handlers: { GET, POST }, auth } = NextAuth({...})
   * ```
   */
  handlers: AppRouteHandlers
  /**
   * 一个在你的 Next.js 应用中与 NextAuth.js 交互的通用方法。
   * 在 `auth.ts` 中初始化 NextAuth.js 后，在中间件、服务器组件、路由处理器（`app/`）以及 Edge 或 Node.js API 路由（`pages/`）中使用此方法。
   *
   * ##### 在中间件中
   *
   * :::info
   * 将 `auth` 添加到你的中间件是可选的，但建议保持用户会话活跃。
   * :::
   *
   * 认证由 {@link NextAuthConfig.callbacks|callbacks.authorized} 回调完成。
   * @example
   * ```ts title="middleware.ts"
   * export { auth as middleware } from "./auth"
   * ```
   *
   * 或者你可以用 `auth` 包装你自己的中间件，其中 `req` 被 `auth` 扩展：
   * @example
   * ```ts title="middleware.ts"
   * import { auth } from "./auth"
   * export default auth((req) => {
   *   // req.auth
   * })
   * ```
   *
   * ```ts
   * // 可选地，不在某些路径上调用中间件
   * // 了解更多：https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
   * export const config = {
   *   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
   * }
   * ```
   *
   * ##### 在服务器组件中
   *
   * @example
   * ```ts title="app/page.ts"
   * import { auth } from "../auth"
   *
   * export default async function Page() {
   *   const { user } = await auth()
   *   return <p>Hello {user?.name}</p>
   * }
   * ```
   *
   * ##### 在路由处理器中
   * @example
   * ```ts title="app/api/route.ts"
   * import { auth } from "../../auth"
   *
   * export const POST = auth((req) => {
   *   // req.auth
   * })
   * ```
   *
   * ##### 在 Edge API 路由中
   *
   * @example
   * ```ts title="pages/api/protected.ts"
   * import { auth } from "../../auth"
   *
   * export default auth((req) => {
   *   // req.auth
   * })
   *
   * export const config = { runtime: "edge" }
   * ```
   *
   * ##### 在 API 路由中
   *
   * @example
   * ```ts title="pages/api/protected.ts"
   * import { auth } from "../auth"
   * import type { NextApiRequest, NextApiResponse } from "next"
   *
   * export default async (req: NextApiRequest, res: NextApiResponse) => {
   *   const session = await auth(req, res)
   *   if (session) {
   *     // 对会话进行操作
   *     return res.json("这是受保护的内容。")
   *   }
   *   res.status(401).json("你必须登录。")
   * }
   * ```
   *
   * ##### 在 `getServerSideProps` 中
   *
   * @example
   * ```ts title="pages/protected-ssr.ts"
   * import { auth } from "../auth"
   *
   * export const getServerSideProps: GetServerSideProps = async (context) => {
   *   const session = await auth(context)
   *
   *   if (session) {
   *     // 对会话进行操作
   *     return { props: { session, content: (await res.json()).content } }
   *   }
   *
   *   return { props: {} }
   * }
   * ```
   */
  auth: ((
    ...args: [NextApiRequest, NextApiResponse]
  ) => Promise<Session | null>) &
    ((...args: []) => Promise<Session | null>) &
    ((...args: [GetServerSidePropsContext]) => Promise<Session | null>) &
    ((
      ...args: [
        (
          req: NextAuthRequest,
          ctx: AppRouteHandlerFnContext
        ) => ReturnType<AppRouteHandlerFn>,
      ]
    ) => AppRouteHandlerFn) &
    ((...args: [NextAuthMiddleware]) => NextMiddleware)
  /**
   * 使用提供者登录。如果未指定提供者，用户将被重定向到登录页面。
   *
   * 默认情况下，用户登录后会被重定向到当前页面。你可以通过设置 `redirectTo` 选项与相对路径来覆盖此行为。
   *
   * @example
   * ```ts title="app/layout.tsx"
   * import { signIn } from "../auth"
   *
   * export default function Layout() {
   *  return (
   *   <form action={async () => {
   *     "use server"
   *     await signIn("github")
   *   }}>
   *    <button>使用 GitHub 登录</button>
   *   </form>
   * )
   * ```
   *
   * 如果在登录过程中发生错误，将抛出 {@link AuthError} 的实例。你可以这样捕获它：
   * ```ts title="app/layout.tsx"
   * import { AuthError } from "next-auth"
   * import { signIn } from "../auth"
   *
   * export default function Layout() {
   *  return (
   *    <form action={async (formData) => {
   *      "use server"
   *      try {
   *        await signIn("credentials", formData)
   *     } catch(error) {
   *       if (error instanceof AuthError) // 处理认证错误
   *       throw error // 重新抛出所有其他错误
   *     }
   *    }}>
   *     <button>登录</button>
   *   </form>
   *  )
   * }
   * ```
   *
   */
  signIn: <P extends ProviderId, R extends boolean = true>(
    /** 登录的提供者 */
    provider?: P, // See: https://github.com/microsoft/TypeScript/issues/29729
    options?:
      | FormData
      | ({
          /** 登录后重定向到的相对路径。默认情况下，用户被重定向到当前页面。 */
          redirectTo?: string
          /** 如果设置为 `false`，`signIn` 方法将返回重定向的 URL 而不是自动重定向。 */
          redirect?: R
        } & Record<string, any>),
    authorizationParams?:
      | string[][]
      | Record<string, string>
      | string
      | URLSearchParams
  ) => Promise<R extends false ? any : never>
  /**
   * 登出用户。如果会话是使用数据库策略创建的，会话将从数据库中移除，相关 cookie 将失效。
   * 如果会话是使用 JWT 创建的，cookie 将失效。
   *
   * 默认情况下，用户登出后被重定向到当前页面。你可以通过设置 `redirectTo` 选项与相对路径来覆盖此行为。
   *
   * @example
   * ```ts title="app/layout.tsx"
   * import { signOut } from "../auth"
   *
   * export default function Layout() {
   *  return (
   *   <form action={async () => {
   *     "use server"
   *     await signOut()
   *   }}>
   *    <button>登出</button>
   *   </form>
   * )
   * ```
   *
   *
   */
  signOut: <R extends boolean = true>(options?: {
    /** 登出后重定向到的相对路径。默认情况下，用户被重定向到当前页面。 */
    redirectTo?: string
    /** 如果设置为 `false`，`signOut` 方法将返回重定向的 URL 而不是自动重定向。 */
    redirect?: R
  }) => Promise<R extends false ? any : never>
  unstable_update: (
    data: Partial<Session | { user: Partial<Session["user"]> }>
  ) => Promise<Session | null>
}

/**
 *  初始化 NextAuth.js。
 *
 *  @example
 * ```ts title="auth.ts"
 * import NextAuth from "next-auth"
 * import GitHub from "@auth/core/providers/github"
 *
 * export const { handlers, auth } = NextAuth({ providers: [GitHub] })
 * ```
 *
 * 延迟初始化：
 *
 * @example
 * ```ts title="auth.ts"
 * import NextAuth from "next-auth"
 * import GitHub from "@auth/core/providers/github"
 *
 * export const { handlers, auth } = NextAuth(async (req) => {
 *   console.log(req) // 对请求进行操作
 *   return {
 *     providers: [GitHub],
 *   },
 * })
 * ```
 */
export default function NextAuth(
  config:
    | NextAuthConfig
    | ((request: NextRequest | undefined) => Awaitable<NextAuthConfig>)
): NextAuthResult {
  if (typeof config === "function") {
    const httpHandler = async (req: NextRequest) => {
      const _config = await config(req)
      setEnvDefaults(_config)
      return Auth(reqWithEnvURL(req), _config)
    }

    return {
      handlers: { GET: httpHandler, POST: httpHandler } as const,
      // @ts-expect-error
      auth: initAuth(config, (c) => setEnvDefaults(c)),

      signIn: async (provider, options, authorizationParams) => {
        const _config = await config(undefined)
        setEnvDefaults(_config)
        return signIn(provider, options, authorizationParams, _config)
      },
      signOut: async (options) => {
        const _config = await config(undefined)
        setEnvDefaults(_config)
        return signOut(options, _config)
      },
      unstable_update: async (data) => {
        const _config = await config(undefined)
        setEnvDefaults(_config)
        return update(data, _config)
      },
    }
  }
  setEnvDefaults(config)
  const httpHandler = (req: NextRequest) => Auth(reqWithEnvURL(req), config)
  return {
    handlers: { GET: httpHandler, POST: httpHandler } as const,
    // @ts-expect-error
    auth: initAuth(config),
    signIn: (provider, options, authorizationParams) => {
      return signIn(provider, options, authorizationParams, config)
    },
    signOut: (options) => {
      return signOut(options, config)
    },
    unstable_update: (data) => {
      return update(data, config)
    },
  }
}
