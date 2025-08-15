/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Notion</b> 集成。</span>
 * <a href="https://notion.so">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/notion.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/notion
 */

import type { OAuthConfig, OAuthUserConfig } from "./oauth.js"

export interface Person extends Record<string, any> {
  email: string
}

// https://developers.notion.com/reference/user
export interface User extends Record<string, any> {
  object: "user" | "bot"
  id: string
  type: string
  name: string
  avatar_url: null | string
  person: Person
  owner?: {
    type: "workspace" | "user"
    workspace: string
  }
  workspace_name?: string | null
}

export interface Owner {
  type: string
  user: User
}

// Notion responds with an access_token + some additional information, which we define here
// More info -  https://developers.notion.com/docs/authorization#step-4-notion-responds-with-an-access_token-and-some-additional-information
export interface NotionProfile extends Record<string, any> {
  access_token: string
  bot_id: string
  duplicated_template_id: string
  owner?: Owner
  workspace_icon: string
  workspace_id: number
  workspace_name: string
}

// Any config required that isn't part of the `OAuthUserConfig` spec should belong here
// For example, we must pass a `redirectUri` to the Notion API when requesting tokens, therefore we add it here
interface AdditionalConfig {
  redirectUri: string
}

const NOTION_HOST = "https://api.notion.com"
const NOTION_API_VERSION = "2022-06-28"

/**
 * 向您的页面添加 Notion 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/notion
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Notion from "@auth/core/providers/notion"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Notion({
 *       clientId: NOTION_CLIENT_ID,
 *       clientSecret: NOTION_CLIENT_SECRET,
 *       redirectUri: NOTION_CLIENT_REDIRECT_URI,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 * - [Notion 文档](https://developers.notion.com/docs)
 * - [Notion 授权文档](https://developers.notion.com/docs/authorization)
 * - [Notion 集成](https://www.notion.so/my-integrations)
 *
 * ### 注意事项
 * 您需要在配置页面选择“公共集成”以获取 `oauth_id` 和 `oauth_secret`。私有集成不提供这些详细信息。
 * 您必须提供 `clientId` 和 `clientSecret` 才能使用此提供商，以及重定向 URI（因为 Notion 端点需要这些来获取令牌）。
 *
 * :::tip
 *
 * Notion 提供商附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/notion.ts)。
 * 要覆盖默认值以适应您的用例，请查看[自定义内置 OAuth 提供商](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供商对规范的任何偏差，Auth.js 不承担任何责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function NotionProvider<P extends NotionProfile>(
  options: OAuthUserConfig<P> & AdditionalConfig
): OAuthConfig<P> {
  return {
    id: "notion",
    name: "Notion",
    type: "oauth",
    token: {
      url: `${NOTION_HOST}/v1/oauth/token`,
    },
    userinfo: {
      url: `${NOTION_HOST}/v1/users`,

      // The result of this method will be the input to the `profile` callback.
      // We use a custom request handler, since we need to do things such as pass the "Notion-Version" header
      // More info: https://authjs.dev/getting-started/providers/notion
      async request(context) {
        const profile = await fetch(`${NOTION_HOST}/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${context.tokens.access_token}`,
            "Notion-Version": NOTION_API_VERSION,
          },
        })

        const {
          bot: {
            owner: { user },
          },
        } = await profile.json()

        return user
      },
    },
    authorization: {
      params: {
        client_id: options.clientId,
        response_type: "code",
        owner: "user",
        redirect_uri: options.redirectUri,
      },
      url: `${NOTION_HOST}/v1/oauth/authorize`,
    },

    async profile(profile) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.person.email,
        image: profile.avatar_url,
      }
    },
    style: { bg: "#fff", text: "#000" },
    options,
  }
}
