/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b> Wikimedia</b> 集成。</span>
 * <a href="https://mediawiki.org/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/wikimedia.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/wikimedia
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export type WikimediaGroup =
  | "*"
  | "user"
  | "autoconfirmed"
  | "extendedconfirmed"
  | "bot"
  | "sysop"
  | "bureaucrat"
  | "steward"
  | "accountcreator"
  | "import"
  | "transwiki"
  | "ipblock-exempt"
  | "oversight"
  | "rollbacker"
  | "propertycreator"
  | "wikidata-staff"
  | "flood"
  | "translationadmin"
  | "confirmed"
  | "flow-bot"
  | "checkuser"

export type WikimediaGrant =
  | "basic"
  | "blockusers"
  | "checkuser"
  | "createaccount"
  | "delete"
  | "editinterface"
  | "editmycssjs"
  | "editmyoptions"
  | "editmywatchlist"
  | "editpage"
  | "editprotected"
  | "editsiteconfig"
  | "globalblock"
  | "highvolume"
  | "import"
  | "mergehistory"
  | "oath"
  | "oversight"
  | "patrol"
  | "privateinfo"
  | "protect"
  | "rollback"
  | "sendemail"
  | "shortenurls"
  | "uploadfile"
  | "viewdeleted"
  | "viewmywatchlist"

export type WikimediaRight =
  | "abusefilter-log"
  | "apihighlimits"
  | "applychangetags"
  | "autoconfirmed"
  | "autopatrol"
  | "autoreview"
  | "bigdelete"
  | "block"
  | "blockemail"
  | "bot"
  | "browsearchive"
  | "changetags"
  | "checkuser"
  | "checkuser-log"
  | "createaccount"
  | "createpage"
  | "createpagemainns"
  | "createtalk"
  | "delete"
  | "delete-redirect"
  | "deletedhistory"
  | "deletedtext"
  | "deletelogentry"
  | "deleterevision"
  | "edit"
  | "edit-legal"
  | "editinterface"
  | "editmyoptions"
  | "editmyusercss"
  | "editmyuserjs"
  | "editmyuserjson"
  | "editmywatchlist"
  | "editprotected"
  | "editsemiprotected"
  | "editsitecss"
  | "editsitejs"
  | "editsitejson"
  | "editusercss"
  | "edituserjs"
  | "edituserjson"
  | "globalblock"
  | "import"
  | "importupload"
  | "ipblock-exempt"
  | "item-merge"
  | "item-redirect"
  | "item-term"
  | "markbotedits"
  | "massmessage"
  | "mergehistory"
  | "minoredit"
  | "move"
  | "move-subpages"
  | "movefile"
  | "movestable"
  | "mwoauth-authonlyprivate"
  | "nominornewtalk"
  | "noratelimit"
  | "nuke"
  | "patrol"
  | "patrolmarks"
  | "property-create"
  | "property-term"
  | "protect"
  | "purge"
  | "read"
  | "reupload"
  | "reupload-own"
  | "reupload-shared"
  | "rollback"
  | "sendemail"
  | "skipcaptcha"
  | "suppressionlog"
  | "tboverride"
  | "templateeditor"
  | "torunblocked"
  | "transcode-reset"
  | "translate"
  | "undelete"
  | "unwatchedpages"
  | "upload"
  | "upload_by_url"
  | "viewmywatchlist"
  | "viewsuppressed"
  | "writeapi"

export interface WikimediaProfile extends Record<string, any> {
  sub: string
  username: string
  editcount: number
  confirmed_email: boolean
  blocked: boolean
  registered: string
  groups: WikimediaGroup[]
  rights: WikimediaRight[]
  grants: WikimediaGrant[]
  realname: string
  email: string
}

/**
 * 向您的页面添加 Wikimedia 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/wikimedia
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Wikimedia from "@auth/core/providers/wikimedia"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Wikimedia({
 *       clientId: WIKIMEDIA_CLIENT_ID,
 *       clientSecret: WIKIMEDIA_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Wikimedia OAuth 文档](https://www.mediawiki.org/wiki/Extension:OAuth)
 *
 * ## 配置步骤
 * - 访问并接受消费者注册文档：https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration
 * - 请求一个新的 OAuth 2.0 消费者以获取 `clientId` 和 `clientSecret`：https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2
 *   - 在控制台添加以下重定向 URL：`http://<your-next-app-url>/api/auth/callback/wikimedia`
 *   - 不要勾选此消费者仅适用于 __您的用户名__ 的复选框
 *   - 除非您明确需要更大的范围，否则可以随意选择标有仅用户身份验证的单选按钮 - 无读取页面或代表用户行事的能力。
 *
 * 注册后，您最初只能使用自己的 Wikimedia 账户测试您的应用程序。
 * 您可能需要等待几天，应用程序才能被批准供所有人使用。
 *
 * ### 注意事项
 * 此提供商还支持所有 Wikimedia 项目：
 * - Wikipedia
 * - Wikidata
 * - Wikibooks
 * - Wiktionary
 * - 等等..
 *
 * 请注意，Wikimedia 账户不一定有关联的电子邮件地址。因此，您可能希望在允许用户登录之前检查他们是否有电子邮件地址。
 *
 * 默认情况下，Auth.js 假设 Wikimedia 提供商基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Wikimedia 提供商附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/wikimedia.ts)。
 * 要覆盖默认值以适应您的用例，请查看 [自定义内置 OAuth 提供商](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，您可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供商对规范的任何偏差，Auth.js 不承担任何责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在 [讨论](https://authjs.dev/new/github-discussions) 中寻求更多帮助。
 *
 * :::
 */
export default function Wikimedia<P extends WikimediaProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "wikimedia",
    name: "Wikimedia",
    type: "oauth",
    token: "https://meta.wikimedia.org/w/rest.php/oauth2/access_token",
    userinfo: "https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile",
    authorization:
      "https://meta.wikimedia.org/w/rest.php/oauth2/authorize?scope=",
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.username,
        email: profile.email,
        image: null,
      }
    },
    style: { bg: "#000", text: "#fff" },
    options,
  }
}
