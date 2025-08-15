import { createHash, randomString } from "../../../utils/web.js"

import type { AuthAction, InternalOptions } from "../../../../types.js"
import { MissingCSRF } from "../../../../errors.js"
interface CreateCSRFTokenParams {
  options: InternalOptions
  cookieValue?: string
  isPost: boolean
  bodyValue?: string
}

/**
 * 确保为后续所有请求设置 CSRF Token cookie。
 * 作为 CSRF 令牌缓解策略的一部分使用。
 *
 * 创建一个类似 'next-auth.csrf-token' 的 cookie，其值为 'token|hash'，
 * 其中 'token' 是 CSRF 令牌，'hash' 是由令牌和密钥生成的哈希值，
 * 两个值通过管道符 '|' 连接。通过存储该值及其哈希值（使用密钥作为盐），
 * 我们可以验证该 cookie 是由服务器设置而非恶意攻击者。
 *
 * 更多详情，请参考以下 OWASP 链接：
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie
 * https://owasp.org/www-chapter-london/assets/slides/David_Johansson-Double_Defeat_of_Double-Submit_Cookie.pdf
 */
export async function createCSRFToken({
  options,
  cookieValue,
  isPost,
  bodyValue,
}: CreateCSRFTokenParams) {
  if (cookieValue) {
    const [csrfToken, csrfTokenHash] = cookieValue.split("|")

    const expectedCsrfTokenHash = await createHash(
      `${csrfToken}${options.secret}`
    )

    if (csrfTokenHash === expectedCsrfTokenHash) {
      // If hash matches then we trust the CSRF token value
      // If this is a POST request and the CSRF Token in the POST request matches
      // the cookie we have already verified is the one we have set, then the token is verified!
      const csrfTokenVerified = isPost && csrfToken === bodyValue

      return { csrfTokenVerified, csrfToken }
    }
  }

  // New CSRF token
  const csrfToken = randomString(32)
  const csrfTokenHash = await createHash(`${csrfToken}${options.secret}`)
  const cookie = `${csrfToken}|${csrfTokenHash}`

  return { cookie, csrfToken }
}

export function validateCSRF(action: AuthAction, verified?: boolean) {
  if (verified) return
  throw new MissingCSRF(`CSRF token was missing during an action ${action}`)
}
