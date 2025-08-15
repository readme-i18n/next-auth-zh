import { OAuthConfig, OAuthUserConfig } from "./index.js"

/** @see [Azure DevOps Services REST API 7.0 · Profiles · Get](https://learn.microsoft.com/en-us/rest/api/azure/devops/profile/profiles/get?view=azure-devops-rest-7.0&tabs=HTTP#examples) */
export interface AzureDevOpsProfile extends Record<string, any> {
  id: string
  displayName: string
  emailAddress: string
  coreAttributes: { Avatar: { value: { value: string } } }
}

/**
 *
 * @deprecated
 * 虽然仍可用，但微软[不再支持](https://learn.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/oauth?view=azure-devops#available-oauth-models) Azure DevOps OAuth，并建议改用[Microsoft Entra ID](/getting-started/providers/microsoft-entra-id)。
 *
 * ## 文档
 *
 * [Microsoft Docs](https://docs.microsoft.com/en-us) · [Azure DevOps](https://docs.microsoft.com/en-us/azure/devops/) · [使用 OAuth 2.0 授权访问 REST API](https://docs.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/oauth?view=azure-devops])
 *
 * ## 配置
 *
 * ### 注册应用
 *
 * :::tip
 * [`https://app.vsaex.visualstudio.com/app/register`](https://app.vsaex.visualstudio.com/app/register)
 * :::
 *
 * 提供必要信息：
 *
 * - 公司名称
 * - 应用名称
 * - 应用网站
 * - 授权回调 URL
 *   - 生产环境使用 `https://example.com/api/auth/callback/azure-devops`
 *   - 开发环境使用 `https://localhost/api/auth/callback/azure-devops`
 * - 授权范围
 *   - 最低要求为 `用户资料（读取）`
 *
 * 点击‘创建应用’
 *
 * :::warning
 * 即使是本地主机也必须使用 HTTPS
 * :::
 *
 * :::warning
 * 后续若要更改范围，需删除并重新创建应用
 * :::
 *
 * 以下数据为下一步所需：
 *
 * - 应用 ID
 * - 客户端密钥（点击‘显示’按钮后，忽略其上方的应用密钥条目）
 * - 授权范围
 *
 * ### 设置环境变量
 *
 * 在 `.env.local` 中创建以下条目：
 *
 * ```
 * AZURE_DEVOPS_APP_ID=<在此处粘贴应用 ID 值>
 * AZURE_DEVOPS_CLIENT_SECRET=<在此处粘贴生成的客户端密钥值>
 * AZURE_DEVOPS_SCOPE=<在此处粘贴以空格分隔的授权范围列表>
 * ```
 *
 * ## 示例
 *
 * ```ts
 * import AzureDevOps from "@auth/core/providers/azure-devops"
 * ...
 * providers: [
 *   AzureDevOps({
 *     clientId: process.env.AZURE_DEVOPS_APP_ID,
 *     clientSecret: process.env.AZURE_DEVOPS_CLIENT_SECRET,
 *     scope: process.env.AZURE_DEVOPS_SCOPE,
 *   }),
 * ]
 * ...
 * ```
 *
 * ### 刷新令牌轮换
 *
 * 以[主指南](/guides/basics/refresh-token-rotation)为起点，并考虑以下事项：
 *
 * ```ts
 * async jwt({ token, user, account }) {
 *   ...
 *   // 令牌有绝对过期时间
 *   const accessTokenExpires = account.expires_at * 1000
 *   ...
 * }
 *
 * async function refreshAccessToken(token) {
 *   ...
 *   const response = await fetch(
 *     "https://app.vssps.visualstudio.com/oauth2/token",
 *     {
 *       headers: { "Content-Type": "application/x-www-form-urlencoded" },
 *       method: "POST",
 *       body: new URLSearchParams({
 *         client_assertion_type:
 *           "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
 *         client_assertion: process.env.AZURE_DEVOPS_CLIENT_SECRET,
 *         grant_type: "refresh_token",
 *         assertion: token.refreshToken,
 *         redirect_uri:
 *           process.env.NEXTAUTH_URL + "/api/auth/callback/azure-devops",
 *       }),
 *     }
 *   )
 *   ...
 *   // 刷新后的令牌带有相对过期时间
 *   const accessTokenExpires = Date.now() + newToken.expires_in * 1000
 *   ...
 * }
 * ```
 */
export default function AzureDevOpsProvider<P extends AzureDevOpsProfile>(
  options: OAuthUserConfig<P> & {
    /**
     * https://docs.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/oauth?view=azure-devops#scopes
     * @default vso.profile
     */
    scope?: string
  }
): OAuthConfig<P> {
  const scope = options.scope ?? "vso.profile"
  const tokenEndpointUrl = "https://app.vssps.visualstudio.com/oauth2/authorize"
  const userInfoEndpointUrl =
    "https://app.vssps.visualstudio.com/_apis/profile/profiles/me?details=true&coreAttributes=Avatar&api-version=6.0"

  return {
    id: "azure-devops",
    name: "Azure DevOps",
    type: "oauth",

    authorization: {
      url: "https://app.vssps.visualstudio.com/oauth2/authorize",
      params: { response_type: "Assertion", scope },
    },

    token: {
      url: tokenEndpointUrl,
      async request(context) {
        const response = await fetch(tokenEndpointUrl, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          method: "POST",
          body: new URLSearchParams({
            client_assertion_type:
              "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            client_assertion: context.provider.clientSecret as string,
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: context.params.code as string,
            redirect_uri: context.provider.callbackUrl,
          }),
        })
        return { tokens: await response.json() }
      },
    },

    userinfo: {
      url: userInfoEndpointUrl,
      async request(context) {
        const accessToken = context.tokens.access_token as string
        const response = await fetch(userInfoEndpointUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        return response.json()
      },
    },

    profile(profile) {
      return {
        id: profile.id,
        name: profile.displayName,
        email: profile.emailAddress,
        image: `data:image/jpeg;base64,${profile.coreAttributes.Avatar.value.value}`,
      }
    },

    options,
  }
}
