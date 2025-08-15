// @ts-expect-error Next.js does not yet correctly use the `package.json#exports` field
import { NextRequest } from "next/server"
import type { NextAuthConfig } from "./index.js"
import { setEnvDefaults as coreSetEnvDefaults } from "@auth/core"

/** 如果定义了 `NEXTAUTH_URL` 或 `AUTH_URL`，则覆盖请求的 URL。 */
export function reqWithEnvURL(req: NextRequest): NextRequest {
  const url = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL
  if (!url) return req
  const { origin: envOrigin } = new URL(url)
  const { href, origin } = req.nextUrl
  return new NextRequest(href.replace(origin, envOrigin), req)
}

/**
 * 为了向后兼容，`next-auth` 默认检查 `NEXTAUTH_URL`
 * 并且 `basePath` 默认为 `/api/auth` 而非 `/auth`
 * （这是所有其他 Auth.js 集成的默认值）。
 *
 * 出于同样的原因，也会检查 `NEXTAUTH_SECRET`。
 */
export function setEnvDefaults(config: NextAuthConfig) {
  try {
    config.secret ??= process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
    const url = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL
    if (!url) return
    const { pathname } = new URL(url)
    if (pathname === "/") return
    config.basePath ||= pathname
  } catch {
    // Catching and swallowing potential URL parsing errors, we'll fall
    // back to `/api/auth` below.
  } finally {
    config.basePath ||= "/api/auth"
    coreSetEnvDefaults(process.env, config, true)
  }
}
