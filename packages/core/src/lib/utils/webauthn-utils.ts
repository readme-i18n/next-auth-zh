import type { WebAuthnProviderType } from "../../providers/webauthn.js"
import type {
  Account,
  Authenticator,
  Awaited,
  InternalOptions,
  RequestInternal,
  ResponseInternal,
  User,
} from "../../types.js"
import type { Cookie } from "./cookie.js"
import {
  AdapterError,
  AuthError,
  InvalidProvider,
  MissingAdapter,
  WebAuthnVerificationError,
} from "../../errors.js"
import { webauthnChallenge } from "../actions/callback/oauth/checks.js"
import {
  type AuthenticationResponseJSON,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/types"
import type {
  Adapter,
  AdapterAccount,
  AdapterAuthenticator,
} from "../../adapters.js"
import type { GetUserInfo } from "../../providers/webauthn.js"
import { randomString } from "./web.js"
import type {
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
} from "@simplewebauthn/server"

export type WebAuthnRegister = "register"
export type WebAuthnAuthenticate = "authenticate"
export type WebAuthnAction = WebAuthnRegister | WebAuthnAuthenticate

type InternalOptionsWebAuthn = InternalOptions<WebAuthnProviderType> & {
  adapter: Required<Adapter>
}
export type WebAuthnOptionsResponseBody =
  | {
      action: WebAuthnAuthenticate
      options: PublicKeyCredentialRequestOptionsJSON
    }
  | {
      action: WebAuthnRegister
      options: PublicKeyCredentialCreationOptionsJSON
    }
type WebAuthnOptionsResponse = ResponseInternal & {
  body: WebAuthnOptionsResponseBody
}

export type CredentialDeviceType = "singleDevice" | "multiDevice"
interface InternalAuthenticator {
  providerAccountId: string
  credentialID: Uint8Array
  credentialPublicKey: Uint8Array
  counter: number
  credentialDeviceType: CredentialDeviceType
  credentialBackedUp: boolean
  transports?: AuthenticatorTransport[]
}

type RGetUserInfo = Awaited<ReturnType<GetUserInfo>>

/**
 * 根据提供的参数推断 WebAuthn 选项。
 *
 * @param action - 要执行的 WebAuthn 操作（可选）。
 * @param loggedInUser - 已登录的用户（可选）。
 * @param userInfoResponse - 包含用户信息的响应（可选）。
 *
 * @returns 要执行的 WebAuthn 操作，如果无法推断则返回 null。
 */
export function inferWebAuthnOptions(
  action: WebAuthnAction | undefined,
  loggedIn: boolean,
  userInfoResponse: RGetUserInfo
): WebAuthnAction | null {
  const { user, exists = false } = userInfoResponse ?? {}

  switch (action) {
    case "authenticate": {
      /**
       * 始终允许显式的认证请求。
       */
      return "authenticate"
    }
    case "register": {
      /**
       * 仅在以下情况下允许注册：
       * - 用户已登录，意味着用户想要注册一个新的认证器。
       * - 用户未登录且提供的用户信息不存在，意味着用户想要注册一个新账户。
       */
      if (user && loggedIn === exists) return "register"
      break
    }
    case undefined: {
      /**
       * 当未提供显式操作时，我们尝试根据提供的用户信息进行推断。以下是可能的情况：
       * - 已登录用户必须始终发送显式操作，因此在这种情况下我们放弃推断。
       * - 否则，如果未提供用户信息，期望的操作是不使用预定义认证器的认证。
       * - 否则，如果提供的用户信息属于现有用户，期望的操作是使用其预定义认证器进行认证。
       * - 最后，如果提供的用户信息属于不存在的用户，期望的操作是注册。
       */
      if (!loggedIn) {
        if (user) {
          if (exists) {
            return "authenticate"
          } else {
            return "register"
          }
        } else {
          return "authenticate"
        }
      }
      break
    }
  }

  // No decision could be made
  return null
}

/**
 * 获取 WebAuthn 选项请求的注册响应。
 *
 * @param options - WebAuthn 的内部选项。
 * @param request - 请求对象。
 * @param user - 用户信息。
 * @param resCookies - 可选，包含在响应中的 cookies。
 * @returns 一个解析为 WebAuthnOptionsResponse 的 promise。
 */
export async function getRegistrationResponse(
  options: InternalOptionsWebAuthn,
  request: RequestInternal,
  user: User & { email: string },
  resCookies?: Cookie[]
): Promise<WebAuthnOptionsResponse> {
  // Get registration options
  const regOptions = await getRegistrationOptions(options, request, user)
  // Get signed cookie
  const { cookie } = await webauthnChallenge.create(
    options,
    regOptions.challenge,
    user
  )

  return {
    status: 200,
    cookies: [...(resCookies ?? []), cookie],
    body: {
      action: "register" as const,
      options: regOptions,
    },
    headers: {
      "Content-Type": "application/json",
    },
  }
}

/**
 * 获取 WebAuthn 选项请求的认证响应。
 *
 * @param options - WebAuthn 的内部选项。
 * @param request - 请求对象。
 * @param user - 可选的用户信息。
 * @param resCookies - 可选的 cookies 数组，包含在响应中。
 * @returns 一个解析为 WebAuthnOptionsResponse 对象的 promise。
 */
export async function getAuthenticationResponse(
  options: InternalOptionsWebAuthn,
  request: RequestInternal,
  user?: User,
  resCookies?: Cookie[]
): Promise<WebAuthnOptionsResponse> {
  // Get authentication options
  const authOptions = await getAuthenticationOptions(options, request, user)
  // Get signed cookie
  const { cookie } = await webauthnChallenge.create(
    options,
    authOptions.challenge
  )

  return {
    status: 200,
    cookies: [...(resCookies ?? []), cookie],
    body: {
      action: "authenticate" as const,
      options: authOptions,
    },
    headers: {
      "Content-Type": "application/json",
    },
  }
}

export async function verifyAuthenticate(
  options: InternalOptionsWebAuthn,
  request: RequestInternal,
  resCookies: Cookie[]
): Promise<{ account: AdapterAccount; user: User }> {
  const { adapter, provider } = options

  // Get WebAuthn response from request body
  const data =
    request.body && typeof request.body.data === "string"
      ? (JSON.parse(request.body.data) as unknown)
      : undefined
  if (
    !data ||
    typeof data !== "object" ||
    !("id" in data) ||
    typeof data.id !== "string"
  ) {
    throw new AuthError("Invalid WebAuthn Authentication response")
  }

  // Reset the ID so we smooth out implementation differences
  const credentialID = toBase64(fromBase64(data.id))

  // Get authenticator from database
  const authenticator = await adapter.getAuthenticator(credentialID)
  if (!authenticator) {
    throw new AuthError(
      `WebAuthn authenticator not found in database: ${JSON.stringify({
        credentialID,
      })}`
    )
  }

  // Get challenge from request cookies
  const { challenge: expectedChallenge } = await webauthnChallenge.use(
    options,
    request.cookies,
    resCookies
  )

  // Verify the response
  let verification: VerifiedAuthenticationResponse
  try {
    const relayingParty = provider.getRelayingParty(options, request)
    verification = await provider.simpleWebAuthn.verifyAuthenticationResponse({
      ...provider.verifyAuthenticationOptions,
      expectedChallenge,
      response: data as AuthenticationResponseJSON,
      authenticator: fromAdapterAuthenticator(authenticator),
      expectedOrigin: relayingParty.origin,
      expectedRPID: relayingParty.id,
    })
  } catch (e: any) {
    throw new WebAuthnVerificationError(e)
  }

  const { verified, authenticationInfo } = verification

  // Make sure the response was verified
  if (!verified) {
    throw new WebAuthnVerificationError(
      "WebAuthn authentication response could not be verified"
    )
  }

  // Update authenticator counter
  try {
    const { newCounter } = authenticationInfo
    await adapter.updateAuthenticatorCounter(
      authenticator.credentialID,
      newCounter
    )
  } catch (e: any) {
    throw new AdapterError(
      `Failed to update authenticator counter. This may cause future authentication attempts to fail. ${JSON.stringify(
        {
          credentialID,
          oldCounter: authenticator.counter,
          newCounter: authenticationInfo.newCounter,
        }
      )}`,
      e
    )
  }

  // Get the account and user
  const account = await adapter.getAccount(
    authenticator.providerAccountId,
    provider.id
  )
  if (!account) {
    throw new AuthError(
      `WebAuthn account not found in database: ${JSON.stringify({
        credentialID,
        providerAccountId: authenticator.providerAccountId,
      })}`
    )
  }

  const user = await adapter.getUser(account.userId)
  if (!user) {
    throw new AuthError(
      `WebAuthn user not found in database: ${JSON.stringify({
        credentialID,
        providerAccountId: authenticator.providerAccountId,
        userID: account.userId,
      })}`
    )
  }

  return {
    account,
    user,
  }
}

export async function verifyRegister(
  options: InternalOptions<WebAuthnProviderType>,
  request: RequestInternal,
  resCookies: Cookie[]
): Promise<{ account: Account; user: User; authenticator: Authenticator }> {
  const { provider } = options

  // Get WebAuthn response from request body
  const data =
    request.body && typeof request.body.data === "string"
      ? (JSON.parse(request.body.data) as unknown)
      : undefined
  if (
    !data ||
    typeof data !== "object" ||
    !("id" in data) ||
    typeof data.id !== "string"
  ) {
    throw new AuthError("Invalid WebAuthn Registration response")
  }

  // Get challenge from request cookies
  const { challenge: expectedChallenge, registerData: user } =
    await webauthnChallenge.use(options, request.cookies, resCookies)
  if (!user) {
    throw new AuthError(
      "Missing user registration data in WebAuthn challenge cookie"
    )
  }

  // Verify the response
  let verification: VerifiedRegistrationResponse
  try {
    const relayingParty = provider.getRelayingParty(options, request)
    verification = await provider.simpleWebAuthn.verifyRegistrationResponse({
      ...provider.verifyRegistrationOptions,
      expectedChallenge,
      response: data as RegistrationResponseJSON,
      expectedOrigin: relayingParty.origin,
      expectedRPID: relayingParty.id,
    })
  } catch (e: any) {
    throw new WebAuthnVerificationError(e)
  }

  // Make sure the response was verified
  if (!verification.verified || !verification.registrationInfo) {
    throw new WebAuthnVerificationError(
      "WebAuthn registration response could not be verified"
    )
  }

  // Build a new account
  const account = {
    providerAccountId: toBase64(verification.registrationInfo.credentialID),
    provider: options.provider.id,
    type: provider.type,
  }

  // Build a new authenticator
  const authenticator = {
    providerAccountId: account.providerAccountId,
    counter: verification.registrationInfo.counter,
    credentialID: toBase64(verification.registrationInfo.credentialID),
    credentialPublicKey: toBase64(
      verification.registrationInfo.credentialPublicKey
    ),
    credentialBackedUp: verification.registrationInfo.credentialBackedUp,
    credentialDeviceType: verification.registrationInfo.credentialDeviceType,
    transports: transportsToString(
      (data as RegistrationResponseJSON).response
        .transports as AuthenticatorTransport[]
    ),
  }

  // Return created stuff
  return {
    user,
    account,
    authenticator,
  }
}

/**
 * 生成 WebAuthn 认证选项。
 *
 * @param options - WebAuthn 的内部选项。
 * @param request - 请求对象。
 * @param user - 可选的用户信息。
 * @returns 认证选项。
 */
async function getAuthenticationOptions(
  options: InternalOptionsWebAuthn,
  request: RequestInternal,
  user?: User
) {
  const { provider, adapter } = options

  // Get the user's authenticators.
  const authenticators =
    user && user["id"]
      ? await adapter.listAuthenticatorsByUserId(user.id)
      : null

  const relayingParty = provider.getRelayingParty(options, request)

  // Return the authentication options.
  return await provider.simpleWebAuthn.generateAuthenticationOptions({
    ...provider.authenticationOptions,
    rpID: relayingParty.id,
    allowCredentials: authenticators?.map((a) => ({
      id: fromBase64(a.credentialID),
      type: "public-key",
      transports: stringToTransports(a.transports),
    })),
  })
}

/**
 * 生成 WebAuthn 注册选项。
 *
 * @param options - WebAuthn 的内部选项。
 * @param request - 请求对象。
 * @param user - 用户信息。
 * @returns 注册选项。
 */
async function getRegistrationOptions(
  options: InternalOptionsWebAuthn,
  request: RequestInternal,
  user: User & { email: string }
) {
  const { provider, adapter } = options

  // Get the user's authenticators.
  const authenticators = user["id"]
    ? await adapter.listAuthenticatorsByUserId(user.id)
    : null

  // Generate a random user ID for the credential.
  // We can do this because we don't use this user ID to link the
  // credential to the user. Instead, we store actual userID in the
  // Authenticator object and fetch it via it's credential ID.
  const userID = randomString(32)

  const relayingParty = provider.getRelayingParty(options, request)

  // Return the registration options.
  return await provider.simpleWebAuthn.generateRegistrationOptions({
    ...provider.registrationOptions,
    userID,
    userName: user.email,
    userDisplayName: user.name ?? undefined,
    rpID: relayingParty.id,
    rpName: relayingParty.name,
    excludeCredentials: authenticators?.map((a) => ({
      id: fromBase64(a.credentialID),
      type: "public-key",
      transports: stringToTransports(a.transports),
    })),
  })
}

export function assertInternalOptionsWebAuthn(
  options: InternalOptions
): InternalOptionsWebAuthn {
  const { provider, adapter } = options

  // Adapter is required for WebAuthn
  if (!adapter)
    throw new MissingAdapter("An adapter is required for the WebAuthn provider")
  // Provider must be WebAuthn
  if (!provider || provider.type !== "webauthn") {
    throw new InvalidProvider("Provider must be WebAuthn")
  }
  // Narrow the options type for typed usage later
  return { ...options, provider, adapter }
}

function fromAdapterAuthenticator(
  authenticator: AdapterAuthenticator
): InternalAuthenticator {
  return {
    ...authenticator,
    credentialDeviceType:
      authenticator.credentialDeviceType as InternalAuthenticator["credentialDeviceType"],
    transports: stringToTransports(authenticator.transports),
    credentialID: fromBase64(authenticator.credentialID),
    credentialPublicKey: fromBase64(authenticator.credentialPublicKey),
  }
}

export function fromBase64(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, "base64"))
}

export function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64")
}

export function transportsToString(
  transports: InternalAuthenticator["transports"]
) {
  return transports?.join(",")
}

export function stringToTransports(
  tstring: string | undefined | null
): InternalAuthenticator["transports"] {
  return tstring
    ? (tstring.split(",") as InternalAuthenticator["transports"])
    : undefined
}
