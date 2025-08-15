/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>WorkOS</b> 集成。</span>
 * <a href="https://workos.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/workos.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/workos
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"
/**
 * - {@link https://workos.com/docs/reference/sso/profile | 返回的 profile 对象}
 */
export interface WorkOSProfile extends Record<string, any> {
  object: string
  id: string
  organization_id: string
  connection_id: string
  connection_type: string
  idp_id: string
  email: string
  first_name: string
  last_name: string
  raw_attributes: {
    id: string
    email: string
    lastName: string
    firstName: string
    picture: string
  }
}

/**
 * 向您的页面添加 WorkOS 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/workos
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import WorkOS from "@auth/core/providers/workos"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     WorkOS({
 *       clientId: WORKOS_CLIENT_ID,
 *       clientSecret: WORKOS_CLIENT_SECRET,
 *       issuer: WORKOS_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [WorkOS SSO OAuth 文档](https://workos.com/docs/reference/sso)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 WorkOS 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * WorkOS 本身不是一个身份提供者，而是多个单点登录（SSO）提供者之间的桥梁。
 * 因此，我们需要进行一些额外的更改以使用 WorkOS 认证用户。
 *
 * 为了使用 WorkOS 登录用户，我们需要指定使用哪个 WorkOS 连接。
 * 一种常见的方法是收集用户的电子邮件地址并提取域名。这可以通过自定义登录页面完成。
 * 要添加自定义登录页面，您可以使用 `pages` 选项：
 * ```ts
 * pages: {
 *   signIn: "/auth/signin",
 * }
 * ```
 * 然后，我们可以添加一个自定义登录页面，显示一个输入框，用户可以输入他们的电子邮件地址。
 * 然后我们从用户的电子邮件地址中提取域名，并将其传递给 `signIn` 函数的 `authorizationParams` 参数：
 * ```js title="pages/auth/signin.js"
 * import { useState } from "react"
 * import { getProviders, signIn } from "next-auth/react"
 *
 * export default function SignIn({ providers }) {
 *   const [email, setEmail] = useState("")
 *
 *   return (
 *     <>
 *       {Object.values(providers).map((provider) => {
 *         if (provider.id === "workos") {
 *           return (
 *             <div key={provider.id}>
 *               <input
 *                 type="email"
 *                 value={email}
 *                 placeholder="Email"
 *                 onChange={(event) => setEmail(event.target.value)}
 *               />
 *               <button
 *                 onClick={() =>
 *                   signIn(provider.id, undefined, {
 *                     domain: email.split("@")[1],
 *                   })
 *                 }
 *               >
 *                 使用 SSO 登录
 *               </button>
 *             </div>
 *           )
 *         }
 *
 *         return (
 *           <div key={provider.id}>
 *             <button onClick={() => signIn(provider.id)}>
 *               使用 {provider.name} 登录
 *             </button>
 *           </div>
 *         )
 *       })}
 *     </>
 *   )
 * }
 *
 * export async function getServerSideProps(context) {
 *   const providers = await getProviders()
 *   return {
 *     props: { providers },
 *   }
 * }
 * ```
 *
 * :::tip
 *
 * WorkOS 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/workos.ts)。
 * 要覆盖默认值以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论](https://authjs.dev/new/github-discussions)中寻求更多帮助。
 *
 * :::
 */
export default function WorkOS<P extends WorkOSProfile>(
  options: OAuthUserConfig<P> & { connection?: string }
): OAuthConfig<P> {
  const { issuer = "https://api.workos.com/", connection = "" } = options

  const connectionParams = new URLSearchParams({ connection })

  return {
    id: "workos",
    name: "WorkOS",
    type: "oauth",
    authorization: `${issuer}sso/authorize?${connectionParams}`,
    token: `${issuer}sso/token`,
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    userinfo: `${issuer}sso/profile`,
    profile(profile) {
      return {
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        image: profile.raw_attributes.picture ?? null,
      }
    },
    style: { bg: "#6363f1", text: "#fff" },
    options,
  }
}
