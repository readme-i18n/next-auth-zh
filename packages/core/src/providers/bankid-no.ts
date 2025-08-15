/**
 * <div class="provider" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
 * <span style={{fontSize: "1.35rem" }}>
 *  内置的 <b>BankID Norway</b> 集成登录。
 * </span>
 * <a href="https://bankid.no" style={{backgroundColor: "black", padding: "12px", borderRadius: "100%" }}>
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/bankid-no.svg" width="24"/>
 * </a>
 * </div>
 *
 * @module providers/bankid-no
 */
import type { OIDCConfig, OIDCUserConfig } from "./index.js"

/**
 * @see [核心概念 - ID Token](https://confluence.bankidnorge.no/confluence/pdoidcl/technical-documentation/core-concepts/id-token)
 * @see [用户信息](https://confluence.bankidnorge.no/confluence/pdoidcl/technical-documentation/api/userinfo)
 */
export interface BankIDNorwayProfile {
  exp: number
  iat: number
  /** 纪元时间 */
  auth_time: number
  jti: string
  iss: string
  /** 始终为 client_id */
  aud: string
  sub: string
  typ: "ID"
  /** 等于 client_id */
  azp: string
  session_state: string
  at_hash: string
  name: string
  given_name: string
  family_name: string
  birthdate: string
  updated_at: number
  /**
   * 用于[IDP选项](https://confluence.bankidnorge.no/confluence/pdoidcl/technical-documentation/core-concepts/identity-providers)的统一资源名称(URN)，
   * 包括保证级别(LOA)。
   * @example
   * ```
   * urn:bankid:bid;LOA=4
   * ```
   */
  acr: string
  sid: string
  /**
   * 用于认证终端用户的[IDP选项](https://confluence.bankidnorge.no/confluence/pdoidcl/technical-documentation/core-concepts/identity-providers)名称。
   * 如果终端用户需要进行认证升级，
   * 注意此值可能与[授权](https://confluence.bankidnorge.no/confluence/pdoidcl/technical-documentation/api/authorize)端点`login_hint`参数中指定的任何`amr`值不同。
   */
  amr: "BID" | "BIM" | "BIS"
  /** 来自关联BankID证书的个人标识符(PID)/序列号。 */
  bankid_altsub: string
  /**
   * 在BID或BIM情况下，返回终端用户证书的颁发者。
   * @example
   * ```
   * CN=BankID Bankenes ID-tjeneste Bank CA 2,
   * OU=988477052,
   * O=Bankenes ID-tjeneste AS,*
   * C=NO;OrginatorId=9775;OriginatorName=Gjensidige Bank RA 1
   * ```
   */
  originator: string
  additionalCertInfo: {
    certValidFrom: number
    serialNumber: string
    keyAlgorithm: string
    keySize: string
    policyOid: string
    certQualified: boolean
    certValidTo: number
    versionNumber: string
    subjectName: string
  }
  /** 当前用作[欺诈数据](https://confluence.bankidnorge.no/confluence/pdoidcl/technical-documentation/advanced-topics/fraud-data)服务[securityData](https://confluence.bankidnorge.no/confluence/pdoidcl/technical-documentation/api/securitydata)端点的输入参数 */
  tid: string
  /** 仅从`userinfo_endpoint`返回 */
  email?: string
  /**
   * [挪威国家身份证号码（fødselsnummer）](https://www.skatteetaten.no/en/person/foreign/norwegian-identification-number/national-identity-number)。可以作为`sub`的替代。
   * 需要在[授权](https://confluence.bankidnorge.no/confluence/pdoidcl/technical-documentation/api/authorize)端点请求`nnin_altsub`范围。
   * @example
   * ```
   * 181266*****
   * ```
   */
  nnin_altsub?: string
}

/**
 * ### 设置
 *
 * #### 回调URL
 * ```
 * https://example.com/api/auth/callback/bankid-no
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import BankIDNorge from "@auth/core/providers/bankid-no"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Auth0({
 *       clientId: AUTH_BANKID_NO_ID,
 *       clientSecret: AUTH_BANKID_NO_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [来自BankID的OpenID Connect提供者](https://confluence.bankidnorge.no/confluence/pdoidcl)
 *
 * ### 说明
 *
 * BankID Norge提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/bankid-no.ts)。要覆盖默认配置以适应您的用例，请查看[自定义内置OAuth提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * ## 帮助
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js严格遵循规范，对于提供者与规范的任何偏差，Auth.js不承担责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 */
export default function BankIDNorway(
  config: OIDCUserConfig<BankIDNorwayProfile>
): OIDCConfig<BankIDNorwayProfile> {
  return {
    id: "bankid-no",
    name: "BankID Norge",
    type: "oidc",
    issuer: "https://auth.bankid.no/auth/realms/prod",
    client: {
      token_endpoint_auth_method: "client_secret_post",
      userinfo_signed_response_alg: "RS256",
    },
    idToken: false,
    authorization: { params: { ui_locales: "no", login_hint: "BIS" } },
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email ?? null,
        image: null,
      }
    },
    checks: ["pkce", "state", "nonce"],
    style: { text: "#fff", bg: "#39134c" },
    options: config,
  }
}
