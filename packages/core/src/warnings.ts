/**
 * - `debug-enabled`: `debug` 选项被评估为 `true`。它会在终端中添加额外的日志，这在开发中很有用，
 *   但由于可能打印用户的敏感信息，请确保在生产环境中将其设置为 `false`。
 *   在 Node.js 环境中，你可以设置为 `debug: process.env.NODE_ENV !== "production"`。
 *   请根据你的运行时/框架咨询如何正确设置此值。
 * - `csrf-disabled`: 你试图从 Auth.js 获取 CSRF 响应（例如通过调用 `/csrf` 端点），
 *   但在当前设置中，通过 Auth.js 的 CSRF 保护已被关闭。如果你没有直接使用 `@auth/core`，
 *   而是使用了已经内置 CSRF 保护的框架库（如 `@auth/sveltekit`），则可能会发生这种情况。你可能不需要 CSRF 响应。
 * - `env-url-basepath-redundant`: `AUTH_URL`（或 `NEXTAUTH_URL`）和 `authConfig.basePath` 同时被声明。这是一个配置错误 - 你应该移除 `authConfig.basePath` 配置，
 *   或者移除 `AUTH_URL`（或 `NEXTAUTH_URL`）的 `pathname`。只需要其中一个。
 * - `env-url-basepath-mismatch`: `AUTH_URL`（或 `NEXTAUTH_URL`）和 `authConfig.basePath` 同时被声明，但它们不匹配。这是一个配置错误。
 *   在这种情况下，`@auth/core` 将使用 `basePath` 来构建对应操作（/signin、/signout 等）的完整 URL。
 * - `experimental-webauthn`: 实验性 WebAuthn 功能已启用。
 *
 */
export type WarningCode =
  | "debug-enabled"
  | "csrf-disabled"
  | "env-url-basepath-redundant"
  | "env-url-basepath-mismatch"
  | "experimental-webauthn"
