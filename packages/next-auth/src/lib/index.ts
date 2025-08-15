import { Auth, createActionURL, type AuthConfig } from "@auth/core"
// @ts-expect-error Next.js does not yet correctly use the `package.json#exports` field
import { headers } from "next/headers"
// @ts-expect-error Next.js does not yet correctly use the `package.json#exports` field
import { NextResponse } from "next/server"
import { reqWithEnvURL } from "./env.js"

import type { AuthAction, Awaitable, Session } from "@auth/core/types"
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next"
import type { AppRouteHandlerFn } from "./types.js"
// @ts-expect-error Next.js does not yet correctly use the `package.json#exports` field
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server"

/** 配置 NextAuth.js。 */
export interface NextAuthConfig extends Omit<AuthConfig, "raw"> {
  /**
   * 回调是异步函数，可用于控制在执行与认证相关的操作时发生什么。
   * 回调**允许您无需数据库即可实现访问控制**或**与外部数据库或API集成**。
   */
  callbacks?: AuthConfig["callbacks"] & {
    /**
     * 当用户需要授权时调用，使用[Middleware](https://nextjs.org/docs/advanced-features/middleware)。
     *
     * 您可以通过返回一个{@link NextResponse}来覆盖此行为。
     *
     * @example
     * ```ts title="app/auth.ts"
     * async authorized({ request, auth }) {
     *   const url = request.nextUrl
     *
     *   if(request.method === "POST") {
     *     const { authToken } = (await request.json()) ?? {}
     *     // If the request has a valid auth token, it is authorized
     *     const valid = await validateAuthToken(authToken)
     *     if(valid) return true
     *     return NextResponse.json("Invalid auth token", { status: 401 })
     *   }
     *
     *   // Logged in users are authenticated, otherwise redirect to login page
     *   return !!auth.user
     * }
     * ```
     *
     * :::warning
     * 如果您返回一个重定向响应，请确保您重定向到的页面不受此回调保护，
     * 否则您可能会陷入无限重定向循环。
     * :::
     */
    authorized?: (params: {
      /** 待授权的请求。 */
      request: NextRequest
      /** 已认证的用户或令牌（如果有）。 */
      auth: Session | null
    }) => Awaitable<boolean | NextResponse | Response | undefined>
  }
}

async function getSession(headers: Headers, config: NextAuthConfig) {
  const url = createActionURL(
    "session",
    // @ts-expect-error `x-forwarded-proto` is not nullable, next.js sets it by default
    headers.get("x-forwarded-proto"),
    headers,
    process.env,
    config
  )
  const request = new Request(url, {
    headers: { cookie: headers.get("cookie") ?? "" },
  })

  return Auth(request, {
    ...config,
    callbacks: {
      ...config.callbacks,
      // Since we are server-side, we don't need to filter out the session data
      // See https://authjs.dev/getting-started/migrating-to-v5#authenticating-server-side
      // TODO: Taint the session data to prevent accidental leakage to the client
      // https://react.dev/reference/react/experimental_taintObjectReference
      async session(...args) {
        const session =
          // If the user defined a custom session callback, use that instead
          (await config.callbacks?.session?.(...args)) ?? {
            ...args[0].session,
            expires:
              args[0].session.expires?.toISOString?.() ??
              args[0].session.expires,
          }
        const user = args[0].user ?? args[0].token
        return { user, ...session } satisfies Session
      },
    },
  }) as Promise<Response>
}

export interface NextAuthRequest extends NextRequest {
  auth: Session | null
}

export type NextAuthMiddleware = (
  request: NextAuthRequest,
  event: NextFetchEvent
) => ReturnType<NextMiddleware>

export type WithAuthArgs =
  | [NextAuthRequest, any]
  | [NextAuthMiddleware]
  | [AppRouteHandlerFn]
  | [NextApiRequest, NextApiResponse]
  | [GetServerSidePropsContext]
  | []

function isReqWrapper(arg: any): arg is NextAuthMiddleware | AppRouteHandlerFn {
  return typeof arg === "function"
}

export function initAuth(
  config:
    | NextAuthConfig
    | ((request: NextRequest | undefined) => Awaitable<NextAuthConfig>),
  onLazyLoad?: (config: NextAuthConfig) => void // To set the default env vars
) {
  if (typeof config === "function") {
    return async (...args: WithAuthArgs) => {
      if (!args.length) {
        // React Server Components
        const _headers = await headers()
        const _config = await config(undefined) // Review: Should we pass headers() here instead?
        onLazyLoad?.(_config)

        return getSession(_headers, _config).then((r) => r.json())
      }

      if (args[0] instanceof Request) {
        // middleware.ts inline
        // export { auth as default } from "auth"
        const req = args[0]
        const ev = args[1]
        const _config = await config(req)
        onLazyLoad?.(_config)

        // args[0] is supposed to be NextRequest but the instanceof check is failing.
        return handleAuth([req, ev], _config)
      }

      if (isReqWrapper(args[0])) {
        // middleware.ts wrapper/route.ts
        // import { auth } from "auth"
        // export default auth((req) => { console.log(req.auth) }})
        const userMiddlewareOrRoute = args[0]
        return async (
          ...args: Parameters<NextAuthMiddleware | AppRouteHandlerFn>
        ) => {
          const _config = await config(args[0])
          onLazyLoad?.(_config)
          return handleAuth(args, _config, userMiddlewareOrRoute)
        }
      }
      // API Routes, getServerSideProps
      const request = "req" in args[0] ? args[0].req : args[0]
      const response: any = "res" in args[0] ? args[0].res : args[1]
      const _config = await config(request)
      onLazyLoad?.(_config)

      // @ts-expect-error -- request is NextRequest
      return getSession(new Headers(request.headers), _config).then(
        async (authResponse) => {
          const auth = await authResponse.json()

          for (const cookie of authResponse.headers.getSetCookie())
            if ("headers" in response)
              response.headers.append("set-cookie", cookie)
            else response.appendHeader("set-cookie", cookie)

          return auth satisfies Session | null
        }
      )
    }
  }
  return (...args: WithAuthArgs) => {
    if (!args.length) {
      // React Server Components
      return Promise.resolve(headers()).then((h: Headers) =>
        getSession(h, config).then((r) => r.json())
      )
    }
    if (args[0] instanceof Request) {
      // middleware.ts inline
      // export { auth as default } from "auth"
      const req = args[0]
      const ev = args[1]
      return handleAuth([req, ev], config)
    }

    if (isReqWrapper(args[0])) {
      // middleware.ts wrapper/route.ts
      // import { auth } from "auth"
      // export default auth((req) => { console.log(req.auth) }})
      const userMiddlewareOrRoute = args[0]
      return async (
        ...args: Parameters<NextAuthMiddleware | AppRouteHandlerFn>
      ) => {
        return handleAuth(args, config, userMiddlewareOrRoute).then((res) => {
          return res
        })
      }
    }

    // API Routes, getServerSideProps
    const request = "req" in args[0] ? args[0].req : args[0]
    const response: any = "res" in args[0] ? args[0].res : args[1]

    return getSession(
      // @ts-expect-error
      new Headers(request.headers),
      config
    ).then(async (authResponse) => {
      const auth = await authResponse.json()

      for (const cookie of authResponse.headers.getSetCookie())
        if ("headers" in response) response.headers.append("set-cookie", cookie)
        else response.appendHeader("set-cookie", cookie)

      return auth satisfies Session | null
    })
  }
}

async function handleAuth(
  args: Parameters<NextMiddleware | AppRouteHandlerFn>,
  config: NextAuthConfig,
  userMiddlewareOrRoute?: NextAuthMiddleware | AppRouteHandlerFn
) {
  const request = reqWithEnvURL(args[0])
  const sessionResponse = await getSession(request.headers, config)
  const auth = await sessionResponse.json()

  let authorized: boolean | NextResponse | Response | undefined = true

  if (config.callbacks?.authorized) {
    authorized = await config.callbacks.authorized({ request, auth })
  }

  let response: any = NextResponse.next?.()

  if (authorized instanceof Response) {
    // User returned a custom response, like redirecting to a page or 401, respect it
    response = authorized

    const redirect = authorized.headers.get("Location")
    const { pathname } = request.nextUrl
    // If the user is redirecting to the same NextAuth.js action path as the current request,
    // don't allow the redirect to prevent an infinite loop
    if (
      redirect &&
      isSameAuthAction(pathname, new URL(redirect).pathname, config)
    ) {
      authorized = true
    }
  } else if (userMiddlewareOrRoute) {
    // Execute user's middleware/handler with the augmented request
    const augmentedReq = request as NextAuthRequest
    augmentedReq.auth = auth
    response =
      (await userMiddlewareOrRoute(augmentedReq, args[1])) ??
      NextResponse.next()
  } else if (!authorized) {
    const signInPage = config.pages?.signIn ?? `${config.basePath}/signin`
    if (request.nextUrl.pathname !== signInPage) {
      // Redirect to signin page by default if not authorized
      const signInUrl = request.nextUrl.clone()
      signInUrl.pathname = signInPage
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.href)
      response = NextResponse.redirect(signInUrl)
    }
  }

  const finalResponse = new Response(response?.body, response)

  // Preserve cookies from the session response
  for (const cookie of sessionResponse.headers.getSetCookie())
    finalResponse.headers.append("set-cookie", cookie)

  return finalResponse
}

function isSameAuthAction(
  requestPath: string,
  redirectPath: string,
  config: NextAuthConfig
) {
  const action = redirectPath.replace(`${requestPath}/`, "") as AuthAction
  const pages = Object.values(config.pages ?? {})

  return (
    (actions.has(action) || pages.includes(redirectPath)) &&
    redirectPath === requestPath
  )
}

const actions = new Set<AuthAction>([
  "providers",
  "session",
  "csrf",
  "signin",
  "signout",
  "callback",
  "verify-request",
  "error",
])
