/**
 * <div class="provider" style={{backgroundColor: "#0072c6", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Microsoft Entra ID</b> 集成。</span>
 * <a href="https://learn.microsoft.com/en-us/entra/identity">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/microsoft-entra-id.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/microsoft-entra-id
 */
import { conformInternal, customFetch } from "../lib/symbols.js"
import type { OIDCConfig, OIDCUserConfig } from "./index.js"

/**
 * @see [Microsoft Identity Platform - ID token claims reference](https://learn.microsoft.com/en-us/entra/identity-platform/id-token-claims-reference)
 * @see [Microsoft Identity Platform - Optional claims reference](https://learn.microsoft.com/en-us/entra/identity-platform/optional-claims-reference)
 */
export interface MicrosoftEntraIDProfile {
  /**
   * 标识令牌的预期接收者。在 `id_tokens` 中，
   * 受众是你的应用的应用程序ID，这是在Azure门户中分配给你的应用的。
   * 这个值应该被验证。如果它不匹配你的应用的应用程序ID，令牌应该被拒绝。
   */
  aud: string
  /**
   * 标识发行者，或“授权服务器”，它构建并返回令牌。
   * 它还标识了用户被认证的租户。如果令牌是由v2.0端点发行的，URI以 `/v2.0` 结尾。
   * 表示用户是来自Microsoft账户的消费者用户的GUID是 `9188040d-6c67-4c5b-b112-36a304b66dad`。
   * 你的应用应该使用声明中的GUID部分来限制可以登录应用的租户集合，如果适用的话。	 */
  iss: string
  /** 指示令牌的认证发生的时间。 */
  iat: Date
  /**
   * 记录认证令牌主体的身份提供者。
   * 这个值与发行者声明的值相同，除非用户账户不在与发行者相同的租户中 - 例如，来宾。
   * 如果声明不存在，意味着可以使用 `iss` 的值代替。
   * 对于在组织上下文中使用的个人账户（例如，被邀请到租户的个人账户），
   * `idp` 声明可能是 'live.com' 或包含Microsoft账户租户 `9188040d-6c67-4c5b-b112-36a304b66dad` 的STS URI。
   */
  idp: string
  /**
   * 标识JWT在之前不能被接受处理的时间。
   */
  nbf: Date
  /**
   * 标识JWT在或之后不能被接受处理的过期时间。
   * 在某些情况下，资源可能会在此之前拒绝令牌。
   * 例如，如果需要更改认证或检测到令牌撤销。
   */
  exp: Date
  /**
   * 仅当ID令牌与OAuth 2.0授权代码一起发行时，代码哈希才包含在ID令牌中。
   * 它可以用来验证授权代码的真实性。要了解如何进行这种验证，请参见
   * [OpenID Connect规范](https://openid.net/specs/openid-connect-core-1_0.html#HybridIDToken)。
   * 这个声明不会从 `/token` 端点的ID令牌中返回。
   */
  c_hash: string
  /**
   * 仅当ID令牌是从 `/authorize` 端点与OAuth 2.0访问令牌一起发行时，访问令牌哈希才包含在ID令牌中。
   * 它可以用来验证访问令牌的真实性。要了解如何进行这种验证，请参见
   * [OpenID Connect规范](https://openid.net/specs/openid-connect-core-1_0.html#HybridIDToken)。
   * 这个声明不会从 `/token` 端点的ID令牌中返回。
   */
  at_hash: string
  /**
   * 一个内部声明，用于记录令牌重用的数据。应该被忽略。
   */
  aio: string
  /**
   * 代表用户的主要用户名。它可以是电子邮件地址、电话号码或没有指定格式的通用用户名。
   * 它的值是可变的，可能会随时间变化。由于它是可变的，这个值不能用于做出授权决定。
   * 它可以用于用户名提示和在人类可读的UI中作为用户名。`profile` 范围
   * 是接收这个声明所必需的。仅在v2.0令牌中存在。
   */
  preferred_username: string
  /**
   * 默认情况下，对于有电子邮件地址的来宾账户存在。你的应用
   * 可以为托管用户（来自与资源相同的租户）请求 `email`
   * [可选声明](https://learn.microsoft.com/en-us/entra/identity-platform/optional-claims)。
   * 这个值不保证是正确的，并且会随时间变化。永远
   * 不要将它用于授权或保存用户数据。如果你需要
   * 在你的应用中有一个可寻址的电子邮件地址，直接向用户请求
   * 这些数据，使用这个声明作为建议或在你的UX中预填充。在
   * v2.0端点，你的应用也可以请求 `email` OpenID Connect
   * 范围 - 你不需要同时请求可选声明和范围来
   * 获取声明。
   */
  email: string
  /**
   * `name` 声明提供了一个人类可读的值，标识了
   * 令牌的主体。这个值不保证是唯一的，它可以被
   * 更改，应该仅用于显示目的。`profile` 范围
   * 是接收这个声明所必需的。
   */
  name: string
  /**
   * nonce 匹配原始授权请求中包含的参数
   * 到IDP。如果不匹配，你的应用应该拒绝令牌。
   */
  nonce: string
  /**
   * 对象的不可变标识符，在这种情况下，是用户账户。这个
   * ID 跨应用程序唯一标识用户 - 两个不同的
   * 应用程序登录同一个用户会在 `oid` 声明中收到相同的值。
   * Microsoft Graph 将这个ID作为用户账户的 `id` 属性返回。
   * 因为 `oid` 允许多个应用关联用户，
   * `profile` 范围是接收这个声明所必需的。如果一个用户存在于
   * 多个租户中，用户在每个租户中包含一个不同的对象ID - 它们
   * 被认为是不同的账户，即使用户使用相同的凭据登录
   * 每个账户。`oid` 声明是一个GUID并且
   * 不能被重用。
   */
  oid: string
  /** 分配给登录用户的角色集合。 */
  roles: string[]
  /** 一个内部声明，用于重新验证令牌。应该被忽略。 */
  rh: string
  /**
   * 令牌中信息的主体。例如，应用的用户。
   * 这个值是不可变的，不能被重新分配或重用。
   * 主体是一个成对标识符，对应用程序ID是唯一的。
   * 如果一个用户使用两个不同的客户端ID登录两个不同的应用，
   * 这些应用会收到两个不同的主体声明值。你可能
   * 根据你的架构和隐私需求，想要或不想要两个值。
   */
  sub: string
  /** 代表用户登录的租户。对于工作和学校
   * 账户，GUID是用户登录的组织的不变租户ID。
   * 对于登录到个人Microsoft账户租户的服务（如Xbox、Teams for Life或Outlook），
   * 值是 `9188040d-6c67-4c5b-b112-36a304b66dad`。
   */
  tid: string
  /**
   * 代表会话的唯一标识符，将在新会话建立时生成。
   */
  sid: string
  /**
   * 令牌标识符声明，等同于JWT规范中的jti。
   * 唯一的，每个令牌的标识符，区分大小写。
   */
  uti: string
  /** 指示ID令牌的版本。 */
  ver: "2.0"
  /**
   * 如果存在，总是为真，表示用户至少在一个组中。
   * 指示客户端应该使用Microsoft Graph API来确定
   * 用户的组
   * (`https://graph.microsoft.com/v1.0/users/{userID}/getMemberObjects`)。
   */
  hasgroups: boolean
  /**
   * 用户在租户中的账户状态。如果用户是租户的成员，
   * 值是 `0`。如果他们是来宾，值是 `1`。
   */
  acct: 0 | 1
  /**
   * 认证上下文ID。指示持有者有资格执行的操作的认证上下文ID。
   * 认证上下文ID可以用来在你的应用和服务中触发对步骤认证的需求。
   * 经常与 `xms_cc` 声明一起使用。
   */
  acrs: string
  /** 用户上次认证的时间。 */
  auth_time: Date
  /**
   * 用户的国家/地区。如果这个字段存在并且
   * 字段的值是标准的两个字母的国家/地区代码，如
   * FR、JP、SZ等，这个声明会被返回。
   */
  ctry: string
  /**
   * IP地址。添加请求客户端的原始地址
   * （当在VNET内部时）。
   */
  fwd: string
  /**
   * 组声明的可选格式。`groups` 声明与
   * [应用程序清单](https://learn.microsoft.com/en-us/entra/identity-platform/reference-app-manifest)中的
   * GroupMembershipClaims设置一起使用，这也必须设置。
   */
  groups: string
  /**
   * 登录提示。一个不透明的、可靠的登录提示声明，是base64编码的。
   * 不要修改这个值。这个声明是用于在所有流程中获取SSO的 `login_hint` OAuth参数的最佳值。
   * 它可以在应用程序之间传递，以帮助它们静默SSO - 应用程序A可以
   * 登录用户，读取 `login_hint` 声明，然后在用户选择链接时
   * 将声明和当前租户上下文发送给应用程序B，在查询字符串或
   * 片段中。为了避免竞争条件和可靠性问题，`login_hint` 声明
   * 不包括用户的当前租户，默认使用用户的家庭租户。
   * 在用户来自另一个租户的来宾场景中，必须在登录
   * 请求中提供租户标识符。并传递给你合作的应用程序。
   * 这个声明旨在与你SDK现有的 `login_hint` 功能一起使用，
   * 无论它如何暴露。
   */
  login_hint: string
  /**
   * 资源租户的国家/地区。与 `ctry` 相同，除了由管理员在租户级别设置。
   * 也必须是一个标准的两个字母的值。
   */
  tenant_ctry: string
  /**
   * 资源租户的地区
   */
  tenant_region_scope: string
  /**
   * UserPrincipalName。用户的标识符，可以与 `username_hint` 参数一起使用。
   * 不是用户的持久标识符，不应该用于授权或唯一标识用户
   * 信息（例如，作为数据库键）。相反，使用用户对象
   * ID (`oid`) 作为数据库键。更多信息，请参见
   * [通过验证声明保护应用程序和API](https://learn.microsoft.com/en-us/entra/identity-platform/claims-validation)。
   * 使用
   * [替代登录ID](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-use-email-signin)
   * 登录的用户不应该显示他们的用户主体名称（UPN）。相反，使用
   * 以下ID令牌声明来向用户显示登录状态：
   * `preferred_username` 或 `unique_name` 用于v1令牌和
   * `preferred_username` 用于v2令牌。尽管这个声明是自动
   * 包含的，你可以指定它为一个可选声明，附加其他
   * 属性来修改它在来宾用户案例中的行为。你应该使用
   * `login_hint` 声明用于 `login_hint` 用途 - 人类可读的标识符
   * 如UPN是不可靠的。
   */
  upn: string
  /** 来源于用户的PrimaryAuthoritativeEmail */
  verified_primary_email: string[]
  /** 来源于用户的SecondaryAuthoritativeEmail */
  verified_secondary_email: string[]
  /** VNET 指定信息。 */
  vnet: string
  /**
   * 客户端能力。指示获取令牌的客户端应用程序是否能够处理声明挑战。
   * 它经常与声明 `acrs` 一起使用。这个声明通常用于条件访问和连续访问评估场景。
   * 令牌发行给资源服务器或服务应用程序控制这个声明在令牌中的存在。
   * 访问令牌中的 `cp1` 值是识别客户端应用程序能够处理声明挑战的权威方式。
   * 更多信息，请参见
   * [声明挑战、声明请求和客户端能力](https://learn.microsoft.com/en-us/entra/identity-platform/claims-challenge?tabs=dotnet)。
   */
  xms_cc: string
  /**
   * 布尔值，指示用户的电子邮件域名所有者是否已被验证。
   * 如果电子邮件属于用户账户所在的租户，并且租户管理员已经完成了域名的验证，
   * 电子邮件被认为是域名已验证的。此外，电子邮件必须来自Microsoft
   * 账户（MSA）、Google账户，或用于使用一次性密码（OTP）流程进行认证。
   * Facebook和SAML/WS-Fed账户没有验证的域名。
   * 为了使这个声明在令牌中返回，`email` 声明的存在是必需的。
   */
  xms_edov: boolean
  /**
   * 首选数据位置。对于多地理位置租户，首选数据
   * 位置是显示用户所在地理区域的三字母代码。
   * 更多信息，请参见
   * [Microsoft Entra Connect 关于首选数据位置的文档](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-sync-feature-preferreddatalocation)。
   */
  xms_pdl: string
  /**
   * 用户首选语言。用户的优选语言，如果设置。来源于
   * 他们的家庭租户，在来宾访问场景中。格式为LL-CC
   * （"en-us"）。
   */
  xms_pl: string
  /**
   * 租户首选语言。资源租户的优选语言，如果
   * 设置。格式为LL（"en"）。
   */
  xms_tpl: string
  /**
   * 零接触部署ID。用于 `Windows AutoPilot` 的设备标识。
   */
  ztdid: string
  /** IP地址。客户端登录的IP地址。 */
  ipaddr: string
  /** 本地安全标识符 */
  onprem_sid: string
  /**
   * 密码过期时间。在 `iat` 声明中的时间之后的秒数，密码将过期。
   * 这个声明仅在密码即将过期时包含（由密码策略中的“通知天数”定义）。
   */
  pwd_exp: number
  /**
   * 更改密码URL。用户可以访问以更改他们的
   * 密码的URL。这个声明仅在密码即将过期时包含
   * （由密码策略中的“通知天数”定义）。
   */
  pwd_url: string
  /**
   * 内部公司网络。信号客户端是否从公司网络登录。
   * 如果不是，声明不包括。基于MFA中的
   * [可信IP](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-mfa-mfasettings#trusted-ips)
   * 设置。
   */
  in_corp: string
  /**
   * 姓氏。提供用户的姓氏、姓或家族名，如用户对象中定义的。
   * 例如，`"family_name":"Miller"`。
   * 在MSA和Microsoft Entra ID中支持。需要 `profile` 范围。
   */
  family_name: string
  /**
   * 名字。提供用户的名字或“given”名，如用户对象上设置的。
   * 例如，`"given_name": "Frank"`。在MSA和
   * Microsoft Entra ID中支持。需要 `profile` 范围。
   */
  given_name: string
}

/**
 * ### 设置
 *
 * #### 回调URL
 *
 * ```
 * https://example.com/api/auth/callback/microsoft-entra-id
 * ```
 *
 * #### 环境变量
 *
 * ```env
 * AUTH_MICROSOFT_ENTRA_ID_ID="<Application (client) ID>"
 * AUTH_MICROSOFT_ENTRA_ID_SECRET="<Client secret value>"
 * AUTH_MICROSOFT_ENTRA_ID_ISSUER="https://login.microsoftonline.com/<Directory (tenant) ID>/v2.0/"
 * ```
 *
 * #### 配置
 *
 * 当省略 `issuer` 参数时，它将默认为
 * `"https://login.microsoftonline.com/common/v2.0/"`。
 * 这允许任何Microsoft账户（个人、学校或工作）登录。
 *
 * ```typescript
 * import MicrosoftEntraID from "@auth/core/providers/microsoft-entra-id"
 * ...
 * providers: [
 *   MicrosoftEntraID({
 *     clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
 *     clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
 *   }),
 * ]
 * ...
 * ```
 *
 * 为了只允许你组织的用户登录，你需要配置
 * `issuer` 参数与你的目录（租户）ID。
 *
 * ```env
 * AUTH_MICROSOFT_ENTRA_ID_ISSUER="https://login.microsoftonline.com/<Directory (tenant) ID>/v2.0/"
 * ```
 *
 * ```typescript
 * import MicrosoftEntraID from "@auth/core/providers/microsoft-entra-id"
 * ...
 * providers: [
 *   MicrosoftEntraID({
 *     clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
 *     clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
 *     issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
 *   }),
 * ]
 * ...
 * ```
 *
 * ### 资源
 *
 *  - [Microsoft Entra OAuth 文档](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
 *  - [Microsoft Entra OAuth 应用](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)
 *
 * ### 备注
 *
 * Microsoft Entra ID 返回个人资料图片在一个ArrayBuffer中，而不是
 * 只是一个图片的URL，所以我们的提供者将其转换为base64编码的
 * 图片字符串并返回。参见：
 * https://learn.microsoft.com/en-us/graph/api/profilephoto-get?view=graph-rest-1.0&tabs=http#examples.
 * 默认图片大小是48x48以避免
 * [空间不足](https://next-auth.js.org/faq#json-web-tokens)
 * 如果会话被保存为JWT。
 *
 * 默认情况下，Auth.js 假设 Microsoft Entra ID 提供者基于
 * [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html)
 * 规范。
 *
 * :::tip
 *
 * Microsoft Entra ID 提供者带有一个
 * [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/microsoft-entra-id.ts)。
 * 要覆盖默认值以适应你的用例，查看
 * [自定义内置OAuth提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果你认为你在默认配置中发现了错误，你可以
 * [开一个issue](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，不能承担
 * 提供者对规范的任何偏差的责任。你可以开
 * 一个issue，但如果问题是不符合规范，我们可能
 * 不会追求解决方案。你可以在
 * [讨论](https://authjs.dev/new/github-discussions)中寻求更多帮助。
 *
 * :::
 */
export default function MicrosoftEntraID(
  config: OIDCUserConfig<MicrosoftEntraIDProfile> & {
    /**
     * https://learn.microsoft.com/en-us/graph/api/profilephoto-get?view=graph-rest-1.0&tabs=http#examples
     *
     * @default 48
     */
    profilePhotoSize?: 48 | 64 | 96 | 120 | 240 | 360 | 432 | 504 | 648
  }
): OIDCConfig<MicrosoftEntraIDProfile> {
  const { profilePhotoSize = 48 } = config

  // If issuer is not set, first fallback to environment variable, then
  // fallback to /common/ uri.
  config.issuer ??=
    process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ||
    "https://login.microsoftonline.com/common/v2.0"

  return {
    id: "microsoft-entra-id",
    name: "Microsoft Entra ID",
    type: "oidc",
    authorization: { params: { scope: "openid profile email User.Read" } },
    async profile(profile, tokens) {
      // https://learn.microsoft.com/en-us/graph/api/profilephoto-get?view=graph-rest-1.0&tabs=http#examples
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/photos/${profilePhotoSize}x${profilePhotoSize}/$value`,
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      )

      // Confirm that profile photo was returned
      let image
      // TODO: Do this without Buffer
      if (response.ok && typeof Buffer !== "undefined") {
        try {
          const pictureBuffer = await response.arrayBuffer()
          const pictureBase64 = Buffer.from(pictureBuffer).toString("base64")
          image = `data:image/jpeg;base64, ${pictureBase64}`
        } catch {}
      }

      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: image ?? null,
      }
    },
    style: { text: "#fff", bg: "#0072c6" },
    async [customFetch](...args) {
      const url = new URL(args[0] instanceof Request ? args[0].url : args[0])
      if (url.pathname.endsWith(".well-known/openid-configuration")) {
        const response = await fetch(...args)
        const json = await response.clone().json()
        const tenantRe = /microsoftonline\.com\/(\w+)\/v2\.0/
        const tenantId = config.issuer?.match(tenantRe)?.[1] ?? "common"
        const issuer = json.issuer.replace("{tenantid}", tenantId)
        return Response.json({ ...json, issuer })
      }
      return fetch(...args)
    },
    [conformInternal]: true,
    options: config,
  }
}
