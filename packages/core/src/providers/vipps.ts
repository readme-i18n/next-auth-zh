import type { OIDCConfig, OIDCUserConfig } from "./index.js"

interface Address {
  address_type: string
  country: string
  formatted: string
  postal_code: string
  region: string
  street_address: string
}

/** @see [User Profile Structure](https://developer.vippsmobilepay.com/api/userinfo/#operation/userinfoAuthorizationCode) */
export interface VippsProfile extends Record<string, any> {
  accounts: {
    account_name: string
    account_number: number
    bank_name: string
  }[]
  address: Address
  other_addresses: Address[]
  birthdate: string
  email: string
  email_verified: boolean
  family_name: string
  given_name: string
  name: string
  nin: string
  phone_number: string
  sid: string
  sub: string
  delegatedConsents: {
    language: string
    heading: string
    termsDescription: string
    confirmConsentButtonText: string
    links: {
      termsLinkText: string
      termsLinkUrl: string
      privacyStatementLinkText: string
      privacyStatementLinkUrl: string
    }
    timeOfConsent: string
    consents: {
      id: string
      accepted: boolean
      required: boolean
      textDisplayedToUser: string
    }[]
  }
}

/**
 * @see [Vipps Login API](https://developer.vippsmobilepay.com/docs/APIs/login-api/api-guide)
 *
 * ## 示例
 *
 * ```ts
 * import Vipps from "@auth/core/providers/vipps"
 * ...
 * providers: [
 *  Vipps({
 *    clientId: process.env.AUTH_VIPPS_ID,
 *    clientSecret: process.env.AUTH_VIPPS_SECRET,
 *  })
 * ]
 * ...
 * ```
 * ::: note
 * 如果处于测试阶段，请确保使用 apitest.vipps.no 覆盖 issuer 选项
 * :::
 */
export default function Vipps(
  options: OIDCUserConfig<VippsProfile>
): OIDCConfig<VippsProfile> {
  return {
    id: "vipps",
    name: "Vipps",
    type: "oidc",
    issuer: "https://api.vipps.no/access-management-1.0/access/",
    authorization: { params: { scope: "openid name email" } },
    idToken: false,
    style: { brandColor: "#f05c18" },
    checks: ["pkce", "state", "nonce"],
    options,
  }
}
