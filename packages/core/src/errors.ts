type ErrorOptions = Error | Record<string, unknown>

type ErrorType =
  | "AccessDenied"
  | "AdapterError"
  | "CallbackRouteError"
  | "ErrorPageLoop"
  | "EventError"
  | "InvalidCallbackUrl"
  | "CredentialsSignin"
  | "InvalidEndpoints"
  | "InvalidCheck"
  | "JWTSessionError"
  | "MissingAdapter"
  | "MissingAdapterMethods"
  | "MissingAuthorize"
  | "MissingSecret"
  | "OAuthAccountNotLinked"
  | "OAuthCallbackError"
  | "OAuthProfileParseError"
  | "SessionTokenError"
  | "OAuthSignInError"
  | "EmailSignInError"
  | "SignOutError"
  | "UnknownAction"
  | "UnsupportedStrategy"
  | "InvalidProvider"
  | "UntrustedHost"
  | "Verification"
  | "MissingCSRF"
  | "AccountNotLinked"
  | "DuplicateConditionalUI"
  | "MissingWebAuthnAutocomplete"
  | "WebAuthnVerificationError"
  | "ExperimentalFeatureNotEnabled"

/**
 * Auth.js 所有错误的基类。
 * 通过 [`logger.error`](https://authjs.dev/reference/core#logger) 选项优化，以便在服务器日志中以良好格式打印。
 * @noInheritDoc
 */
export class AuthError extends Error {
  type: ErrorType
  /**
   * 确定错误应在哪个页面处理。通常 `signIn` 错误可以在页面内处理。
   * 默认为 `"error"`。
   * @internal
   */
  kind?: "signIn" | "error"

  cause?: Record<string, unknown> & { err?: Error }

  /** @internal */
  constructor(
    message?: string | Error | ErrorOptions,
    errorOptions?: ErrorOptions
  ) {
    if (message instanceof Error) {
      super(undefined, {
        cause: { err: message, ...(message.cause as any), ...errorOptions },
      })
    } else if (typeof message === "string") {
      if (errorOptions instanceof Error) {
        errorOptions = { err: errorOptions, ...(errorOptions.cause as any) }
      }
      super(message, errorOptions)
    } else {
      super(undefined, message)
    }
    this.name = this.constructor.name
    // @ts-expect-error https://github.com/microsoft/TypeScript/issues/3841
    this.type = this.constructor.type ?? "AuthError"
    // @ts-expect-error https://github.com/microsoft/TypeScript/issues/3841
    this.kind = this.constructor.kind ?? "error"

    Error.captureStackTrace?.(this, this.constructor)
    const url = `https://errors.authjs.dev#${this.type.toLowerCase()}`
    this.message += `${this.message ? ". " : ""}Read more at ${url}`
  }
}

/**
 * 当用户登录尝试失败时抛出。
 * @noInheritDoc
 */
export class SignInError extends AuthError {
  /** @internal */
  static kind = "signIn"
}

/**
 * 数据库 [`Adapter` 方法](https://authjs.dev/reference/core/adapters#methods)
 * 在执行过程中失败。
 *
 * :::tip
 * 如果设置了 `debug: true`，你可以在日志中查看 `[auth][debug]` 以了解更多关于失败的适配器方法执行的信息。
 * @example
 * ```sh
 * [auth][debug]: adapter_getUserByEmail
 * { "args": [undefined] }
 * ```
 * :::
 * @noInheritDoc
 */
export class AdapterError extends AuthError {
  static type = "AdapterError"
}

/**
 * 当 [`signIn` 回调](https://authjs.dev/reference/core/types#signin) 执行失败
 * 或返回 `false` 时抛出。
 * @noInheritDoc
 */
export class AccessDenied extends AuthError {
  static type = "AccessDenied"
}

/**
 * 当用户无法完成登录时发生此错误。
 * 根据提供者类型，可能有多种原因。
 *
 * :::tip
 * 查看日志中的 `[auth][details]` 以了解哪个提供者失败。
 * @example
 * ```sh
 * [auth][details]: { "provider": "github" }
 * ```
 * :::
 *
 * 对于 [OAuth 提供者](https://authjs.dev/getting-started/authentication/oauth)，可能的原因包括：
 * - 用户拒绝访问应用程序
 * - 解析 OAuth 配置文件时出错：
 *   检查提供者的 `profile` 或 `userinfo.request` 方法，确保正确获取用户配置文件。
 * - `signIn` 或 `jwt` 回调方法抛出未捕获的错误：
 *   检查回调方法的实现。
 *
 * 对于 [Email 提供者](https://authjs.dev/getting-started/authentication/email)，可能的原因包括：
 * - 提供的电子邮件/令牌组合无效/缺失：
 *   检查提供者的 `sendVerificationRequest` 方法是否正确发送了电子邮件。
 * - 提供的电子邮件/令牌组合已过期：
 *   要求用户重新登录。
 * - 数据库出错：
 *   检查数据库日志。
 *
 * 对于 [Credentials 提供者](https://authjs.dev/getting-started/authentication/credentials)，可能的原因包括：
 * - `authorize` 方法抛出未捕获的错误：
 *   检查提供者的 `authorize` 方法。
 * - `signIn` 或 `jwt` 回调方法抛出未捕获的错误：
 *   检查回调方法的实现。
 *
 * :::tip
 * 查看错误消息中的 `[auth][cause]` 以获取更多详情。
 * 它将显示原始堆栈跟踪。
 * :::
 * @noInheritDoc
 */
export class CallbackRouteError extends AuthError {
  static type = "CallbackRouteError"
}

/**
 * 当 Auth.js 配置错误，意外尝试在自定义错误页面上要求认证时抛出。
 * 为了防止无限循环，Auth.js 将改为渲染其默认错误页面。
 *
 * 要修复此问题，请确保 `error` 页面不需要认证。
 *
 * 了解更多信息，请访问 [指南：错误页面](https://authjs.dev/guides/pages/error)
 * @noInheritDoc
 */
export class ErrorPageLoop extends AuthError {
  static type = "ErrorPageLoop"
}

/**
 * [`events` 方法](https://authjs.dev/reference/core/types#eventcallbacks)
 * 在执行过程中失败。
 *
 * 确保 `events` 方法正确实现，并且未捕获的错误得到处理。
 *
 * 了解更多信息，请访问 [`events`](https://authjs.dev/reference/core/types#eventcallbacks)
 * @noInheritDoc
 */
export class EventError extends AuthError {
  static type = "EventError"
}

/**
 * 当 Auth.js 无法验证 `callbackUrl` 值时抛出。
 * 浏览器要么禁用了 cookies，要么 `callbackUrl` 不是有效的 URL。
 *
 * 可能有人试图操纵 Auth.js 用于将用户重定向回配置的 `callbackUrl`/页面的回调 URL。
 * 这可能是恶意黑客试图将用户重定向到钓鱼网站。
 * 为了防止这种情况，Auth.js 检查回调 URL 是否有效，如果无效则抛出此错误。
 *
 * 无需采取行动，但这可能是有人试图攻击你的应用程序的迹象。
 * @noInheritDoc
 */
export class InvalidCallbackUrl extends AuthError {
  static type = "InvalidCallbackUrl"
}

/**
 * 可以从 Credentials 提供者的 `authorize` 回调中抛出。
 * 当 `authorize` 回调期间发生错误时，可能发生两种情况：
 * 1. 用户被重定向到登录页面，URL 中带有 `error=CredentialsSignin&code=credentials`。`code` 是可配置的。
 * 2. 如果你在服务器端处理表单操作的框架中抛出此错误，则会抛出此错误，而不是重定向用户，因此你需要处理。
 * @noInheritDoc
 */
export class CredentialsSignin extends SignInError {
  static type = "CredentialsSignin"
  /**
   * 设置在重定向 URL 的 `code` 查询参数中的错误代码。
   *
   *
   * ⚠ 注意：此属性将包含在 URL 中，因此确保它不暗示敏感错误。
   *
   * 完整的错误总是记录在服务器上，如果你需要调试。
   *
   * 通常，我们不建议特别提示用户是否有错误的用户名或密码，
   * 尝试类似“无效凭证”的内容。
   */
  code: string = "credentials"
}

/**
 * 配置的 OAuth 或 OIDC 提供者缺少 `authorization`、`token` 或 `userinfo`，或 `issuer` 配置。
 * 要执行 OAuth 或 OIDC 登录，至少需要这些端点之一。
 *
 * 了解更多信息，请访问 [`OAuth2Config`](https://authjs.dev/reference/core/providers#oauth2configprofile) 或 [指南：OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)
 * @noInheritDoc
 */
export class InvalidEndpoints extends AuthError {
  static type = "InvalidEndpoints"
}

/**
 * 当无法执行 PKCE、state 或 nonce OAuth 检查时抛出。
 * 如果 OAuth 提供者配置不正确或浏览器阻止 cookies，可能会发生这种情况。
 *
 * 了解更多信息，请访问 [`checks`](https://authjs.dev/reference/core/providers#checks)
 * @noInheritDoc
 */
export class InvalidCheck extends AuthError {
  static type = "InvalidCheck"
}

/**
 * 当 Auth.js 无法解码或编码基于 JWT 的（`strategy: "jwt"`）会话时，在服务器上记录。
 *
 * 可能的原因包括 `secret` 配置错误或 JWT 或 `encode/decode` 方法格式错误。
 *
 * :::note
 * 当记录此错误时，会话 cookie 被销毁。
 * :::
 *
 * 了解更多信息，请访问 [`secret`](https://authjs.dev/reference/core#secret)、[`jwt.encode`](https://authjs.dev/reference/core/jwt#encode-1) 或 [`jwt.decode`](https://authjs.dev/reference/core/jwt#decode-2)
 * @noInheritDoc
 */
export class JWTSessionError extends AuthError {
  static type = "JWTSessionError"
}

/**
 * 如果 Auth.js 配置错误则抛出。如果你配置了 Email 提供者但没有设置数据库适配器，
 * 或尝试使用 `strategy: "database"` 会话而没有数据库适配器，可能会发生这种情况。
 * 在这两种情况下，确保你删除配置或添加缺失的适配器。
 *
 * 了解更多信息，请访问 [数据库适配器](https://authjs.dev/getting-started/database)、[Email 提供者](https://authjs.dev/getting-started/authentication/email) 或 [概念：数据库会话策略](https://authjs.dev/concepts/session-strategies#database-session)
 * @noInheritDoc
 */
export class MissingAdapter extends AuthError {
  static type = "MissingAdapter"
}

/**
 * 类似于 [`MissingAdapter`](https://authjs.dev/reference/core/errors#missingadapter) 抛出，但仅缺少一些必需的方法。
 *
 * 确保你删除配置或将缺失的方法添加到适配器。
 *
 * 了解更多信息，请访问 [数据库适配器](https://authjs.dev/getting-started/database)
 * @noInheritDoc
 */
export class MissingAdapterMethods extends AuthError {
  static type = "MissingAdapterMethods"
}

/**
 * 当 Credentials 提供者缺少 `authorize` 配置时抛出。
 * 要执行凭证登录，`authorize` 方法是必需的。
 *
 * 了解更多信息，请访问 [Credentials 提供者](https://authjs.dev/getting-started/authentication/credentials)
 * @noInheritDoc
 */
export class MissingAuthorize extends AuthError {
  static type = "MissingAuthorize"
}

/**
 * Auth.js 需要一个或多个密钥来设置，但没有找到。这用于加密 cookies、JWTs 和其他敏感数据。
 *
 * :::note
 * 如果你使用的是像 Next.js 这样的框架，我们尝试从 `AUTH_SECRET`、`AUTH_SECRET_1` 等环境变量中自动推断密钥。
 * 或者，你也可以显式设置 [`AuthConfig.secret`](https://authjs.dev/reference/core#secret) 选项。
 * :::
 *
 *
 * :::tip
 * 要生成随机字符串，你可以使用 Auth.js CLI：`npx auth secret`
 * :::
 * @noInheritDoc
 */
export class MissingSecret extends AuthError {
  static type = "MissingSecret"
}

/**
 * 当电子邮件地址已与账户关联，但用户尝试的 OAuth 账户未链接到它时抛出。
 *
 * 出于安全原因，如果用户未登录，Auth.js 不会自动将 OAuth 账户链接到现有账户。
 *
 * :::tip
 * 如果你信任 OAuth 提供者已验证用户的电子邮件地址，
 * 你可以通过在提供者配置中设置 [`allowDangerousEmailAccountLinking: true`](https://authjs.dev/reference/core/providers#allowdangerousemailaccountlinking)
 * 来启用自动账户链接。
 * :::
 * @noInheritDoc
 */
export class OAuthAccountNotLinked extends SignInError {
  static type = "OAuthAccountNotLinked"
}

/**
 * 当 OAuth 提供者在登录过程中返回错误时抛出。
 * 例如，如果用户拒绝访问应用程序或存在配置错误，可能会发生这种情况。
 *
 * 有关可能原因的完整列表，请查看规范 [Authorization Code Grant: Error Response](https://www.rfc-editor.org/rfc/rfc6749#section-4.1.2.1)
 * @noInheritDoc
 */
export class OAuthCallbackError extends SignInError {
  static type = "OAuthCallbackError"
}

/**
 * 在 OAuth 登录尝试期间，当无法解析提供者的响应时发生此错误。
 * 例如，如果提供者的 API 更改，或 [`OAuth2Config.profile`](https://authjs.dev/reference/core/providers#oauth2configprofile) 方法未正确实现，可能会发生这种情况。
 * @noInheritDoc
 */
export class OAuthProfileParseError extends AuthError {
  static type = "OAuthProfileParseError"
}

/**
 * 当 Auth.js 无法从数据库（`strategy: "database"`）检索会话时，在服务器上记录。
 *
 * 数据库适配器可能配置错误或数据库不可达。
 *
 * 了解更多信息，请访问 [概念：数据库会话策略](https://authjs.dev/concepts/session-strategies#database)
 * @noInheritDoc
 */
export class SessionTokenError extends AuthError {
  static type = "SessionTokenError"
}

/**
 * 当通过 [OAuth](https://authjs.dev/getting-started/authentication/oauth) 登录无法启动时发生。
 *
 * 可能的原因包括：
 * - 授权服务器不符合 [OAuth 2.0](https://www.ietf.org/rfc/rfc6749.html) 或 [OIDC](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *   检查错误消息中的详情。
 *
 * :::tip
 * 查看日志中的 `[auth][details]` 以了解哪个提供者失败。
 * @example
 * ```sh
 * [auth][details]: { "provider": "github" }
 * ```
 * :::
 * @noInheritDoc
 */
export class OAuthSignInError extends SignInError {
  static type = "OAuthSignInError"
}

/**
 * 当通过 [Email 提供者](https://authjs.dev/getting-started/authentication/email) 登录无法启动时发生。
 *
 * 可能的原因包括：
 * - 从客户端发送的电子邮件无效，无法通过 [`EmailConfig.normalizeIdentifier`](https://authjs.dev/reference/core/providers/email#normalizeidentifier) 标准化
 * - 提供的电子邮件/令牌组合已过期：
 *   要求用户重新登录。
 * - 数据库出错：
 *   检查数据库日志。
 * @noInheritDoc
 */
export class EmailSignInError extends SignInError {
  static type = "EmailSignInError"
}

/**
 * 表示在注销过程中发生的错误。此错误
 * 在终止用户会话时遇到问题时记录，无论是
 * 通过从数据库删除会话失败（在数据库会话
 * 策略中）还是在注销过程的其他部分遇到问题，例如
 * 发出注销事件或清除会话 cookies。
 *
 * 即使记录此错误，会话 cookie(s) 也会被清空。
 * @noInheritDoc
 */
export class SignOutError extends AuthError {
  static type = "SignOutError"
}

/**
 * Auth.js 被请求处理一个它不支持的操作。
 *
 * 查看 [`AuthAction`](https://authjs.dev/reference/core/types#authaction) 了解支持的操作。
 * @noInheritDoc
 */
export class UnknownAction extends AuthError {
  static type = "UnknownAction"
}

/**
 * 当存在 Credentials 提供者但未启用 JWT 策略（`strategy: "jwt"`）时抛出。
 *
 * 了解更多信息，请访问 [`strategy`](https://authjs.dev/reference/core#strategy) 或 [Credentials 提供者](https://authjs.dev/getting-started/authentication/credentials)
 * @noInheritDoc
 */
export class UnsupportedStrategy extends AuthError {
  static type = "UnsupportedStrategy"
}

/**
 * 当端点被错误地调用而没有提供者，或使用不支持的提供者时抛出。
 * @noInheritDoc
 */
export class InvalidProvider extends AuthError {
  static type = "InvalidProvider"
}

/**
 * 当 `trustHost` 选项未设置为 `true` 时抛出。
 *
 * Auth.js 需要将 `trustHost` 选项设置为 `true`，因为它依赖于请求头中的 `host` 值。
 *
 * :::note
 * 官方 Auth.js 库可能会尝试自动将 `trustHost` 选项设置为 `true`，如果请求来自受信任平台上的受信任主机。
 * :::
 *
 * 了解更多信息，请访问 [`trustHost`](https://authjs.dev/reference/core#trusthost) 或 [指南：部署](https://authjs.dev/getting-started/deployment)
 * @noInheritDoc
 */
export class UntrustedHost extends AuthError {
  static type = "UntrustedHost"
}

/**
 * 用户的电子邮件/令牌组合无效。
 * 这可能是因为电子邮件/令牌组合在数据库中未找到，
 * 或因为令牌已过期。要求用户重新登录。
 * @noInheritDoc
 */
export class Verification extends AuthError {
  static type = "Verification"
}

/**
 * 客户端操作（`signIn`、`signOut`、`useSession#update`）中缺少 CSRF 令牌的错误。
 * 当操作缺少双重提交 cookie（CSRF 保护的关键）时抛出。
 *
 * CSRF（[跨站请求伪造](https://owasp.org/www-community/attacks/csrf)）
 * 是一种利用认证用户凭证进行未授权操作的攻击。
 *
 * 双重提交 cookie 模式，一种 CSRF 防御，要求 cookie 和
 * 请求参数中的值匹配。更多信息请访问 [MDN Web 文档](https://developer.mozilla.org/en-US/docs/Glossary/CSRF)。
 * @noInheritDoc
 */
export class MissingCSRF extends SignInError {
  static type = "MissingCSRF"
}

const clientErrors = new Set<ErrorType>([
  "CredentialsSignin",
  "OAuthAccountNotLinked",
  "OAuthCallbackError",
  "AccessDenied",
  "Verification",
  "MissingCSRF",
  "AccountNotLinked",
  "WebAuthnVerificationError",
])

/**
 * 用于仅允许向客户端发送特定子集的错误。
 * 错误总是在服务器上记录，但为了防止泄露敏感信息，
 * 只有一部分错误按原样发送到客户端。
 * @internal
 */
export function isClientError(error: Error): error is AuthError {
  if (error instanceof AuthError) return clientErrors.has(error.type)
  return false
}
/**
 * 当多个提供者将 `enableConditionalUI` 设置为 `true` 时抛出。
 * 一次只能有一个提供者启用此选项。
 * @noInheritDoc
 */
export class DuplicateConditionalUI extends AuthError {
  static type = "DuplicateConditionalUI"
}

/**
 * 当 WebAuthn 提供者将 `enableConditionalUI` 设置为 `true` 但没有 formField 在其 autocomplete 参数中包含 `webauthn` 时抛出。
 *
 * `webauthn` autocomplete 参数是条件 UI 工作所必需的。
 * @noInheritDoc
 */
export class MissingWebAuthnAutocomplete extends AuthError {
  static type = "MissingWebAuthnAutocomplete"
}

/**
 * 当 WebAuthn 提供者无法验证客户端响应时抛出。
 * @noInheritDoc
 */
export class WebAuthnVerificationError extends AuthError {
  static type = "WebAuthnVerificationError"
}

/**
 * 当电子邮件地址已与账户关联，但用户尝试的账户未链接到它时抛出。
 *
 * 出于安全原因，如果用户未登录，Auth.js 不会自动将账户链接到现有账户。
 * @noInheritDoc
 */
export class AccountNotLinked extends SignInError {
  static type = "AccountNotLinked"
}

/**
 * 当使用实验性功能但未启用时抛出。
 * @noInheritDoc
 */
export class ExperimentalFeatureNotEnabled extends AuthError {
  static type = "ExperimentalFeatureNotEnabled"
}
