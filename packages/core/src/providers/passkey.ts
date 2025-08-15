/**
 * <div class="provider" style={{backgroundColor: "#24292f", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置 <b>Passkey</b> 集成。</span>
 * <a href="https://passkeys.dev">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/passkey.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/passkey
 */

import WebAuthn, {
  WebAuthnConfig,
  DEFAULT_WEBAUTHN_TIMEOUT,
} from "./webauthn.js"

/**
 * 为您的页面添加 Passkey 登录功能。
 *
 * ### 设置
 *
 * 安装所需的 peer 依赖。
 *
 * ```bash npm2yarn
 * npm install @simplewebauthn/browser@9.0.1
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import Passkey from "@auth/core/providers/passkey"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [Passkey],
 * })
 * ```
 * ### 资源
 *
 * - [SimpleWebAuthn - 服务器端](https://simplewebauthn.dev/docs/packages/server)
 * - [SimpleWebAuthn - 客户端](https://simplewebauthn.dev/docs/packages/client)
 * - [Passkeys.dev - 介绍](https://passkeys.dev/docs/intro/what-are-passkeys/)
 * - [Passkeys.dev - 规范](https://passkeys.dev/docs/reference/specs/)
 * - [源代码](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/passkey.ts)
 *
 * ### 注意事项
 *
 * 此提供者是 WebAuthn 提供者的扩展，定义了一些与 Passkey 支持相关的默认值。
 * 您可以覆盖这些值，但请注意，如果您这样做，认证器可能不会将您的凭据识别为 Passkey 凭据。
 *
 * :::tip
 *
 * Passkey 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/passkey.ts)。
 * 要为您的用例覆盖默认值，请查看[自定义内置 WebAuthn 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。
 * 您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。
 * 您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function Passkey(
  config: Partial<WebAuthnConfig>
): WebAuthnConfig {
  return WebAuthn({
    id: "passkey",
    name: "Passkey",
    authenticationOptions: {
      timeout: DEFAULT_WEBAUTHN_TIMEOUT,
      userVerification: "required",
    },
    registrationOptions: {
      timeout: DEFAULT_WEBAUTHN_TIMEOUT,
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "required",
      },
    },
    verifyAuthenticationOptions: {
      requireUserVerification: true,
    },
    verifyRegistrationOptions: {
      requireUserVerification: true,
    },
    ...config,
  })
}
