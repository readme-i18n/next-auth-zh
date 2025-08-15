/**
 * @source https://github.com/jshttp/cookie
 * @author blakeembrey
 * @license MIT
 */

/**
 * 这是一个临时解决方案，以支持仅支持ESM的环境，直到`cookie`提供ESM构建。
 * @see https://github.com/jshttp/cookie/issues/211
 */

/**
 * 用于匹配RFC 6265第4.1.1节中cookie-name的正则表达式
 * 这里引用了RFC 2616第2.2节中已废弃的token定义
 * 该定义已被RFC 7230附录B中的token定义所替代。
 *
 * cookie-name       = token
 * token             = 1*tchar
 * tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
 *                     "*" / "+" / "-" / "." / "^" / "_" /
 *                     "`" / "|" / "~" / DIGIT / ALPHA
 */
const cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/

/**
 * 用于匹配RFC 6265第4.1.1节中cookie-value的正则表达式
 *
 * cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
 * cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
 *                     ; 不包括控制字符、空格、双引号、逗号、分号和反斜杠的US-ASCII字符
 */
const cookieValueRegExp =
  /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/

/**
 * 用于匹配RFC 6265第4.1.1节中domain-value的正则表达式
 *
 * domain-value      = <subdomain>
 *                     ; 定义于[RFC1034]第3.5节，由[RFC1123]第2.1节增强
 * <subdomain>       = <label> | <subdomain> "." <label>
 * <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
 *                     标签长度必须不超过63个字符。
 *                     根据RFC1123，第一个字符是'let-dig'而非'letter'
 * <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
 * <let-dig-hyp>     = <let-dig> | "-"
 * <let-dig>         = <letter> | <digit>
 * <letter>          = 大写A到Z或小写a到z中的任意一个字母字符
 * <digit>           = 0到9中的任意一个数字
 *
 * 保持对前导点的支持：https://github.com/jshttp/cookie/issues/173
 *
 * > (注意，如果存在前导%x2E（"."），即使该字符不被允许，也会被忽略，但如果存在尾随%x2E（"."），将导致用户代理忽略该属性。)
 */
const domainValueRegExp =
  /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i

/**
 * 用于匹配RFC 6265第4.1.1节中path-value的正则表达式
 *
 * path-value        = <any CHAR except CTLs or ";">
 * CHAR              = %x01-7F
 *                     ; 定义于RFC 5234附录B.1
 */
const pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/

const __toString = Object.prototype.toString

const NullObject = /* @__PURE__ */ (() => {
  const C = function () {}
  C.prototype = Object.create(null)
  return C
})() as unknown as { new (): any }

/**
 * 解析选项。
 */
export interface ParseOptions {
  /**
   * 指定一个函数，用于解码[cookie-value](https://datatracker.ietf.org/doc/html/rfc6265#section-4.1.1)。
   * 由于cookie的值有有限的字符集（且必须是一个简单字符串），此函数可用于将先前编码的cookie值解码为JavaScript字符串。
   *
   * 默认函数是全局的`decodeURIComponent`，包装在`try..catch`中。如果抛出错误，将返回cookie的原始值。如果提供自己的编码/解码方案，必须确保错误得到适当处理。
   *
   * @default decode
   */
  decode?: (str: string) => string | undefined
}

/**
 * 解析cookie头部。
 *
 * 将给定的cookie头部字符串解析为一个对象
 * 该对象包含各种cookie作为键（名称）=>值
 */
export function parse(
  str: string,
  options?: ParseOptions
): Record<string, string | undefined> {
  const obj: Record<string, string | undefined> = new NullObject()
  const len = str.length
  // RFC 6265 sec 4.1.1, RFC 2616 2.2 defines a cookie name consists of one char minimum, plus '='.
  if (len < 2) return obj

  const dec = options?.decode || decode
  let index = 0

  do {
    const eqIdx = str.indexOf("=", index)
    if (eqIdx === -1) break // No more cookie pairs.

    const colonIdx = str.indexOf(";", index)
    const endIdx = colonIdx === -1 ? len : colonIdx

    if (eqIdx > endIdx) {
      // backtrack on prior semicolon
      index = str.lastIndexOf(";", eqIdx - 1) + 1
      continue
    }

    const keyStartIdx = startIndex(str, index, eqIdx)
    const keyEndIdx = endIndex(str, eqIdx, keyStartIdx)
    const key = str.slice(keyStartIdx, keyEndIdx)

    // only assign once
    if (obj[key] === undefined) {
      let valStartIdx = startIndex(str, eqIdx + 1, endIdx)
      let valEndIdx = endIndex(str, endIdx, valStartIdx)

      const value = dec(str.slice(valStartIdx, valEndIdx))
      obj[key] = value
    }

    index = endIdx + 1
  } while (index < len)

  return obj
}

function startIndex(str: string, index: number, max: number) {
  do {
    const code = str.charCodeAt(index)
    if (code !== 0x20 /*   */ && code !== 0x09 /* \t */) return index
  } while (++index < max)
  return max
}

function endIndex(str: string, index: number, min: number) {
  while (index > min) {
    const code = str.charCodeAt(--index)
    if (code !== 0x20 /*   */ && code !== 0x09 /* \t */) return index + 1
  }
  return min
}

/**
 * 序列化选项。
 */
export interface SerializeOptions {
  /**
   * 指定一个函数，用于编码[cookie-value](https://datatracker.ietf.org/doc/html/rfc6265#section-4.1.1)。
   * 由于cookie的值有有限的字符集（且必须是一个简单字符串），此函数可用于将值编码为适合cookie值的字符串，并在解析时应与`decode`镜像。
   *
   * @default encodeURIComponent
   */
  encode?: (str: string) => string
  /**
   * 指定[`Max-Age` `Set-Cookie`属性](https://tools.ietf.org/html/rfc6265#section-5.2.2)的`number`（以秒为单位）。
   *
   * [cookie存储模型规范](https://tools.ietf.org/html/rfc6265#section-5.3)指出，如果同时设置了`expires`和`maxAge`，则`maxAge`优先，但并非所有客户端都遵守这一点，
   * 因此如果两者都设置，它们应指向相同的日期和时间。
   */
  maxAge?: number
  /**
   * 指定[`Expires` `Set-Cookie`属性](https://tools.ietf.org/html/rfc6265#section-5.2.1)的`Date`对象。
   * 当未设置过期时间时，客户端将其视为“非持久性cookie”并在当前会话结束时删除它。
   *
   * [cookie存储模型规范](https://tools.ietf.org/html/rfc6265#section-5.3)指出，如果同时设置了`expires`和`maxAge`，则`maxAge`优先，但并非所有客户端都遵守这一点，
   * 因此如果两者都设置，它们应指向相同的日期和时间。
   */
  expires?: Date
  /**
   * 指定[`Domain` `Set-Cookie`属性](https://tools.ietf.org/html/rfc6265#section-5.2.3)的值。
   * 当未设置域时，客户端认为cookie仅适用于当前域。
   */
  domain?: string
  /**
   * 指定[`Path` `Set-Cookie`属性](https://tools.ietf.org/html/rfc6265#section-5.2.4)的值。
   * 当未设置路径时，路径被视为["默认路径"](https://tools.ietf.org/html/rfc6265#section-5.1.4)。
   */
  path?: string
  /**
   * 启用[`HttpOnly` `Set-Cookie`属性](https://tools.ietf.org/html/rfc6265#section-5.2.6)。
   * 启用后，客户端将不允许客户端JavaScript在`document.cookie`中看到cookie。
   */
  httpOnly?: boolean
  /**
   * 启用[`Secure` `Set-Cookie`属性](https://tools.ietf.org/html/rfc6265#section-5.2.5)。
   * 启用后，客户端仅在浏览器有HTTPS连接时发送cookie回来。
   */
  secure?: boolean
  /**
   * 启用[`Partitioned` `Set-Cookie`属性](https://tools.ietf.org/html/draft-cutler-httpbis-partitioned-cookies/)。
   * 启用后，客户端仅在当前域_和_顶级域匹配时发送cookie回来。
   *
   * 这是一个尚未完全标准化的属性，未来可能会更改。
   * 这也意味着客户端在理解此属性之前可能会忽略它。更多信息可以在[提案](https://github.com/privacycg/CHIPS)中找到。
   */
  partitioned?: boolean
  /**
   * 指定[`Priority` `Set-Cookie`属性](https://tools.ietf.org/html/draft-west-cookie-priority-00#section-4.1)的值。
   *
   * - `'low'` 将`Priority`属性设置为`Low`。
   * - `'medium'` 将`Priority`属性设置为`Medium`，未设置时的默认优先级。
   * - `'high'` 将`Priority`属性设置为`High`。
   *
   * 关于优先级级别的更多信息可以在[规范](https://tools.ietf.org/html/draft-west-cookie-priority-00#section-4.1)中找到。
   */
  priority?: "low" | "medium" | "high"
  /**
   * 指定[`SameSite` `Set-Cookie`属性](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-09#section-5.4.7)的值。
   *
   * - `true` 将`SameSite`属性设置为`Strict`，以强制执行严格的同站点策略。
   * - `'lax'` 将`SameSite`属性设置为`Lax`，以执行宽松的同站点策略。
   * - `'none'` 将`SameSite`属性设置为`None`，以明确跨站点cookie。
   * - `'strict'` 将`SameSite`属性设置为`Strict`，以强制执行严格的同站点策略。
   *
   * 关于执行级别的更多信息可以在[规范](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-09#section-5.4.7)中找到。
   */
  sameSite?: boolean | "lax" | "strict" | "none"
}

/**
 * 将数据序列化为cookie头部。
 *
 * 将名称值对序列化为适合HTTP头部的cookie字符串。可选选项对象指定cookie参数。
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 */
export function serialize(
  name: string,
  val: string,
  options?: SerializeOptions
): string {
  const enc = options?.encode || encodeURIComponent

  if (!cookieNameRegExp.test(name)) {
    throw new TypeError(`argument name is invalid: ${name}`)
  }

  const value = enc(val)

  if (!cookieValueRegExp.test(value)) {
    throw new TypeError(`argument val is invalid: ${val}`)
  }

  let str = name + "=" + value
  if (!options) return str

  if (options.maxAge !== undefined) {
    if (!Number.isInteger(options.maxAge)) {
      throw new TypeError(`option maxAge is invalid: ${options.maxAge}`)
    }

    str += "; Max-Age=" + options.maxAge
  }

  if (options.domain) {
    if (!domainValueRegExp.test(options.domain)) {
      throw new TypeError(`option domain is invalid: ${options.domain}`)
    }

    str += "; Domain=" + options.domain
  }

  if (options.path) {
    if (!pathValueRegExp.test(options.path)) {
      throw new TypeError(`option path is invalid: ${options.path}`)
    }

    str += "; Path=" + options.path
  }

  if (options.expires) {
    if (
      !isDate(options.expires) ||
      !Number.isFinite(options.expires.valueOf())
    ) {
      throw new TypeError(`option expires is invalid: ${options.expires}`)
    }

    str += "; Expires=" + options.expires.toUTCString()
  }

  if (options.httpOnly) {
    str += "; HttpOnly"
  }

  if (options.secure) {
    str += "; Secure"
  }

  if (options.partitioned) {
    str += "; Partitioned"
  }

  if (options.priority) {
    const priority =
      typeof options.priority === "string"
        ? options.priority.toLowerCase()
        : undefined
    switch (priority) {
      case "low":
        str += "; Priority=Low"
        break
      case "medium":
        str += "; Priority=Medium"
        break
      case "high":
        str += "; Priority=High"
        break
      default:
        throw new TypeError(`option priority is invalid: ${options.priority}`)
    }
  }

  if (options.sameSite) {
    const sameSite =
      typeof options.sameSite === "string"
        ? options.sameSite.toLowerCase()
        : options.sameSite
    switch (sameSite) {
      case true:
      case "strict":
        str += "; SameSite=Strict"
        break
      case "lax":
        str += "; SameSite=Lax"
        break
      case "none":
        str += "; SameSite=None"
        break
      default:
        throw new TypeError(`option sameSite is invalid: ${options.sameSite}`)
    }
  }

  return str
}

/**
 * URL解码字符串值。优化为在没有%时跳过原生调用。
 */
function decode(str: string): string {
  if (str.indexOf("%") === -1) return str

  try {
    return decodeURIComponent(str)
  } catch (e) {
    return str
  }
}

/**
 * 判断值是否为Date。
 */
function isDate(val: any): val is Date {
  return __toString.call(val) === "[object Date]"
}
