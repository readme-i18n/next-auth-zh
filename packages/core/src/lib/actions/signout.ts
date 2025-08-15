import { SignOutError } from "../../errors.js"

import type { InternalOptions, ResponseInternal } from "../../types.js"
import type { Cookie, SessionStore } from "../utils/cookie.js"

/**
 * 销毁会话。
 * 如果会话策略是数据库存储，
 * 会话也会从数据库中删除。
 * 无论哪种情况，会话 cookie 都会被清除，
 * 并且会触发 {@link AuthConfig["events"].signOut}。
 */
export async function signOut(
  cookies: Cookie[],
  sessionStore: SessionStore,
  options: InternalOptions
): Promise<ResponseInternal> {
  const { jwt, events, callbackUrl: redirect, logger, session } = options
  const sessionToken = sessionStore.value
  if (!sessionToken) return { redirect, cookies }

  try {
    if (session.strategy === "jwt") {
      const salt = options.cookies.sessionToken.name
      const token = await jwt.decode({ ...jwt, token: sessionToken, salt })
      await events.signOut?.({ token })
    } else {
      const session = await options.adapter?.deleteSession(sessionToken)
      await events.signOut?.({ session })
    }
  } catch (e) {
    logger.error(new SignOutError(e as Error))
  }

  cookies.push(...sessionStore.clean())

  return { redirect, cookies }
}
