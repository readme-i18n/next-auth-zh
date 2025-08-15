/**
 * :::danger
 * 此选项专为框架作者设计。
 * :::
 *
 * Auth.js 内置了 CSRF 防护，但
 * 如果你正在实现一个已经具备 CSRF 攻击防护的框架，可以通过
 * 将此值传递给 {@link AuthConfig.skipCSRFCheck} 来跳过此检查。
 */
export const skipCSRFCheck = Symbol("skip-csrf-check")

/**
 * :::danger
 * 此选项专为框架作者设计。
 * :::
 *
 * Auth.js 默认返回一个符合 web 标准的 {@link Response}，但
 * 如果你正在实现一个框架，可能希望通过
 * 将此值传递给 {@link AuthConfig.raw} 来获取原始的内部响应。
 */
export const raw = Symbol("return-type-raw")

/**
 * :::danger
 * 此选项允许你覆盖提供者默认使用的 `fetch` 函数，
 * 直接向提供者的 OAuth 端点发起请求。
 * 使用不当可能会带来安全隐患。
 * :::
 *
 * 它可以用于支持企业代理、自定义 fetch 库、缓存发现端点、
 * 添加测试用的模拟、日志记录、为非规范兼容的提供者设置自定义头部/参数等。
 *
 * @example
 * ```ts
 * import { Auth, customFetch } from "@auth/core"
 * import GitHub from "@auth/core/providers/github"
 *
 * const dispatcher = new ProxyAgent("my.proxy.server")
 * function proxy(...args: Parameters<typeof fetch>): ReturnType<typeof fetch> {
 *   return undici(args[0], { ...(args[1] ?? {}), dispatcher })
 * }
 *
 * const response = await Auth(request, {
 *   providers: [GitHub({ [customFetch]: proxy })]
 * })
 * ```
 *
 * @see https://undici.nodejs.org/#/docs/api/ProxyAgent?id=example-basic-proxy-request-with-local-agent-dispatcher
 * @see https://authjs.dev/guides/corporate-proxy
 */
export const customFetch = Symbol("custom-fetch")

/**
 * @internal
 *
 * 用于标记一些在核心库中处理的提供者。
 *
 * **请勿使用，否则后果自负。**
 */
export const conformInternal = Symbol("conform-internal")
