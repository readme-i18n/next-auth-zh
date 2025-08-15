// @ts-expect-error Next.js does not yet correctly use the `package.json#exports` field
import type { NextRequest } from "next/server"

/**
 * AppRouteHandlerFnContext 是作为第二个参数传递给处理器的上下文对象。
 */
export type AppRouteHandlerFnContext = {
  params: Promise<any>
}
/**
 * 应用路由的处理函数。如果返回非 Response 类型的值，将会抛出错误。
 */
export type AppRouteHandlerFn = (
  /**
   * 传入的请求对象。
   */
  req: NextRequest,
  /**
   * 请求上的上下文属性（如果这是一个动态路由，还包括参数）。
   */
  ctx: AppRouteHandlerFnContext
) => void | Response | Promise<void | Response>

export type AppRouteHandlers = Record<
  "GET" | "POST",
  (req: NextRequest) => Promise<Response>
>
