/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Mailgun</b> 集成。</span>
 * <a href="https://www.mailgun.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/mailgun.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/mailgun
 */
import type { EmailConfig, EmailUserConfig } from "./index.js"
import { html, text } from "../lib/utils/email.js"

/**
 * 为您的页面添加 Mailgun 登录功能。
 *
 * ### 设置
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Mailgun from "@auth/core/providers/mailgun"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Mailgun({
 *       from: MAILGUN_DOMAIN,
 *       region: "EU", // 可选
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Mailgun 文档](https://documentation.mailgun.com/docs/mailgun)
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵循规范，对于提供者任何偏离规范的行为概不负责。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function MailGun(
  config: EmailUserConfig & {
    /**
     * https://documentation.mailgun.com/docs/mailgun/api-reference/#base-url
     *
     * @default "US"
     */
    region?: "US" | "EU"
  }
): EmailConfig {
  const { region = "US" } = config
  const servers = {
    US: "api.mailgun.net",
    EU: "api.eu.mailgun.net",
  }
  const apiServer = servers[region]

  return {
    id: "mailgun",
    type: "email",
    name: "Mailgun",
    from: "Auth.js <no-reply@authjs.dev>",
    maxAge: 24 * 60 * 60,
    async sendVerificationRequest(params) {
      const { identifier: to, provider, url, theme } = params
      const { host } = new URL(url)
      const domain = provider.from?.split("@").at(1)

      if (!domain) throw new Error("malformed Mailgun domain")

      const form = new FormData()
      form.append("from", `${provider.name} <${provider.from}>`)
      form.append("to", to)
      form.append("subject", `Sign in to ${host}`)
      form.append("html", html({ host, url, theme }))
      form.append("text", text({ host, url }))

      const res = await fetch(`https://${apiServer}/v3/${domain}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`api:${provider.apiKey}`)}`,
        },
        body: form,
      })

      if (!res.ok) throw new Error("Mailgun error: " + (await res.text()))
    },
    options: config,
  }
}
