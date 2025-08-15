/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>BoxyHQ SAML</b> 集成。</span>
 * <a href="https://boxyhq.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/boxyhq-saml.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/boxyhq-saml
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface BoxyHQSAMLProfile extends Record<string, any> {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

/**
 * 为您的页面添加 BoxyHQ SAML 登录功能。
 *
 * BoxyHQ SAML 是一个开源服务，它将 SAML SSO 登录流程作为 OAuth 2.0 流程处理，抽象了 SAML 协议的所有复杂性。轻松在您的应用中启用企业单点登录。
 *
 * 您可以将 BoxyHQ SAML 部署为独立服务，或使用我们的 NPM 库将其嵌入到您的应用中。[查看文档了解更多详情](https://boxyhq.com/docs/jackson/deploy)
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/boxyhq-saml
 * ```
 *
 * #### 配置
 *
 * 对于 OAuth 2.0 流程：
 *```ts
 * import { Auth } from "@auth/core"
 * import BoxyHQ from "@auth/core/providers/boxyhq-saml"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     BoxyHQ({
 *       authorization: { params: { scope: "" } }, // 这是 OAuth 2.0 流程所需的，否则默认为 openid
 *       clientId: BOXYHQ_SAML_CLIENT_ID,
 *       clientSecret: BOXYHQ_SAML_CLIENT_SECRET,
 *       issuer: BOXYHQ_SAML_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 * 对于 OIDC 流程：
 *
 *```ts
 * import { Auth } from "@auth/core"
 * import BoxyHQ from "@auth/core/providers/boxyhq-saml"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     BoxyHQ({
 *       clientId: BOXYHQ_SAML_CLIENT_ID,
 *       clientSecret: BOXYHQ_SAML_CLIENT_SECRET,
 *       issuer: BOXYHQ_SAML_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [BoxyHQ OAuth 文档](https://example.com)
 *
 * ## 配置
 *
 * SAML 登录需要为您的每个租户进行配置。一种常见的方法是使用电子邮件地址的域名来确定他们属于哪个租户。您也可以为此使用来自后端的唯一租户 ID（字符串），通常是某种账户或组织 ID。
 *
 * 查看[文档](https://boxyhq.com/docs/jackson/saml-flow#2-saml-config-api)了解更多详情。
 *
 *
 * 在客户端，您需要向 `signIn` 函数传递额外的参数 `tenant` 和 `product`。这将允许 BoxyHQL SAML 找出正确的 SAML 配置，并将您的用户带到正确的 SAML 身份提供者进行登录。
 *
 * ```tsx
 * import { signIn } from "auth";
 * ...
 *
 *   // 将用户的电子邮件映射到租户和产品
 *   const tenant = email.split("@")[1];
 *   const product = 'my_awesome_product';
 * ...
 *   <Button
 *     onClick={async (event) => {
 *       event.preventDefault();
 *
 *       signIn("boxyhq-saml", {}, { tenant, product });
 *     }}>
 * ...
 * ```
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 BoxyHQ 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * BoxyHQ 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/boxyhq-saml.ts)。
 * 要覆盖默认值以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提出问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提出问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论](https://authjs.dev/new/github-discussions)中寻求更多帮助。
 *
 * :::
 */
export default function SAMLJackson<P extends BoxyHQSAMLProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "boxyhq-saml",
    name: "BoxyHQ SAML",
    type: "oauth",
    authorization: {
      url: `${options.issuer}/api/oauth/authorize`,
      params: { provider: "saml" },
    },
    token: `${options.issuer}/api/oauth/token`,
    userinfo: `${options.issuer}/api/oauth/userinfo`,
    profile(profile) {
      return {
        id: profile.id,
        email: profile.email,
        name: [profile.firstName, profile.lastName].filter(Boolean).join(" "),
        image: null,
      }
    },
    style: {
      brandColor: "#25c2a0",
    },
    options,
  }
}
