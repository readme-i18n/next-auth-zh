import type { CommonProviderOptions } from "./index.js"
import type { Awaitable, Theme } from "../types.js"
export type { EmailProviderId } from "./provider-types.js"

// TODO: Kepts for backwards compatibility
// Remove this import and encourage users
// to import it from @auth/core/providers/nodemailer directly
import Nodemailer from "./nodemailer.js"
import type { NodemailerConfig, NodemailerUserConfig } from "./nodemailer.js"

/**
 * @deprecated
 *
 * 请从 `providers/nodemailer` 子模块而非 `providers/email` 导入此提供者。
 *
 * 要使用 nodemailer 登录，请将 `signIn("email")` 改为 `signIn("nodemailer")`
 */
export default function Email(config: NodemailerUserConfig): NodemailerConfig {
  return {
    ...Nodemailer(config),
    id: "email",
    name: "Email",
  }
}

// TODO: Rename to Token provider
// when started working on https://github.com/nextauthjs/next-auth/discussions/1465
export type EmailProviderType = "email"

export type EmailProviderSendVerificationRequestParams = {
  identifier: string
  url: string
  expires: Date
  provider: EmailConfig
  token: string
  theme: Theme
  request: Request
}

export interface EmailConfig extends CommonProviderOptions {
  id: string
  type: "email"
  name: string
  from?: string
  maxAge?: number
  sendVerificationRequest: (
    params: EmailProviderSendVerificationRequestParams
  ) => Awaitable<void>
  /** 用于哈希验证令牌。 */
  secret?: string
  /** 用于基于 HTTP 的电子邮件提供者。 */
  apiKey?: string
  /** 用于基于 SMTP 的电子邮件提供者。 */
  server?: NodemailerConfig["server"]
  generateVerificationToken?: () => Awaitable<string>
  normalizeIdentifier?: (identifier: string) => string
  options?: EmailUserConfig
}

export type EmailUserConfig = Omit<Partial<EmailConfig>, "options" | "type">
