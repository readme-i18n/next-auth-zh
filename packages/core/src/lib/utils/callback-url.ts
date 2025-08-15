import type { InternalOptions } from "../../types.js"

interface CreateCallbackUrlParams {
  options: InternalOptions
  /** 尝试从请求体（POST）读取值，若不存在则从查询参数（GET）中读取 */
  paramValue?: string
  cookieValue?: string
}

/**
 * 基于查询参数/cookie + 验证获取回调 URL，
 * 并将其添加到 `req.options.callbackUrl` 中。
 */
export async function createCallbackUrl({
  options,
  paramValue,
  cookieValue,
}: CreateCallbackUrlParams) {
  const { url, callbacks } = options

  let callbackUrl = url.origin

  if (paramValue) {
    // If callbackUrl form field or query parameter is passed try to use it if allowed
    callbackUrl = await callbacks.redirect({
      url: paramValue,
      baseUrl: url.origin,
    })
  } else if (cookieValue) {
    // If no callbackUrl specified, try using the value from the cookie if allowed
    callbackUrl = await callbacks.redirect({
      url: cookieValue,
      baseUrl: url.origin,
    })
  }

  return {
    callbackUrl,
    // Save callback URL in a cookie so that it can be used for subsequent requests in signin/signout/callback flow
    callbackUrlCookie: callbackUrl !== cookieValue ? callbackUrl : undefined,
  }
}
