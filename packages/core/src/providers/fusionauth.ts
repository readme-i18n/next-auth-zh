/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>FusionAuth</b> 集成。</span>
 * <a href="https://fusionauth.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/fushionauth.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/fusionauth
 */
import type { OAuthConfig, OAuthUserConfig } from "./oauth.js"

/**
 * 这是 FusionAuth 返回的默认 openid 签名
 * 可以使用 [lambda 函数](https://fusionauth.io/docs/v1/tech/lambdas) 进行自定义
 */
export interface FusionAuthProfile extends Record<string, any> {
  aud: string
  exp: number
  iat: number
  iss: string
  sub: string
  jti: string
  authenticationType: string
  email: string
  email_verified: boolean
  preferred_username?: string
  name?: string
  given_name?: string
  middle_name?: string
  family_name?: string
  at_hash: string
  c_hash: string
  scope: string
  sid: string
  picture?: string
}

/**
 * 将 FusionAuth 登录添加到您的页面。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/fusionauth
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import FusionAuth from "@auth/core/providers/fusionauth"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     FusionAuth({
 *       clientId: FUSIONAUTH_CLIENT_ID,
 *       clientSecret: FUSIONAUTH_CLIENT_SECRET,
 *       tenantId: FUSIONAUTH_TENANT_ID,
 *       issuer: FUSIONAUTH_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 * :::warning
 * 如果您使用多租户，需要传递 tenantId 选项以应用正确的主题。
 * :::
 *
 * ### 资源
 *
 *  - [FusionAuth OAuth 文档](https://fusionauth.io/docs/lifecycle/authenticate-users/oauth/)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 FusionAuth 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * ## 配置
 * :::tip
 * 可以在 https://your-fusionauth-server-url/admin/application 创建应用。
 *
 * 更多信息，请遵循 [FusionAuth 5分钟设置指南](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide)。
 * :::
 *
 * 在应用的 OAuth 设置中，配置以下内容。
 *
 * - 重定向 URL
 *   - https://localhost:3000/api/auth/callback/fusionauth
 * - 启用的授权
 *   - 确保 _授权码_ 已启用。
 *
 * 如果使用 JSON Web Tokens，需要确保签名算法为 RS256，可以通过
 * 前往设置，密钥管理，生成 RSA 并选择 SHA-256 作为算法来创建 RS256 密钥对。之后，前往应用的 JWT 设置
 * 并选择此密钥作为访问令牌签名密钥和 ID 令牌签名密钥。
 * :::tip
 *
 * FusionAuth 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/fusionauth.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵循规范，对于提供者与规范的任何偏差不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 * 
 * 
 * 强烈建议在 Next.js 中使用此提供者时遵循此示例调用，
 * 以便您可以在服务器上访问 access_token 和 id_token。
 * 
 * ```ts
 * /// <reference types="next-auth" />
import NextAuth from 'next-auth';
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: 'fusionauth',
      name: 'FusionAuth',
      type: 'oidc',
      issuer: process.env.AUTH_FUSIONAUTH_ISSUER!,
      clientId: process.env.AUTH_FUSIONAUTH_CLIENT_ID!,
      clientSecret: process.env.AUTH_FUSIONAUTH_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'offline_access email openid profile',
          tenantId: process.env.AUTH_FUSIONAUTH_TENANT_ID!,
        },
      },
      userinfo: `${process.env.AUTH_FUSIONAUTH_ISSUER}/oauth2/userinfo`,
      // 这是由于已知的处理问题
      // TODO: https://github.com/nextauthjs/next-auth/issues/8745#issuecomment-1907799026
      token: {
        url: `${process.env.AUTH_FUSIONAUTH_ISSUER}/oauth2/token`,
        conform: async (response: Response) => {
          if (response.status === 401) return response;

          const newHeaders = Array.from(response.headers.entries())
            .filter(([key]) => key.toLowerCase() !== 'www-authenticate')
            .reduce(
              (headers, [key, value]) => (headers.append(key, value), headers),
              new Headers()
            );

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        },
      },
    },
  ],
  session: {
    strategy: 'jwt',
  },
  // 需要在会话中获取 account 对象并启用
  // 调用依赖 JWT 令牌的外部 API 的能力。
  callbacks: {
    async jwt(params) {
      const { token, user, account } = params;
      if (account) {
        // 首次登录，保存 `access_token`、其过期时间和 `refresh_token`
        return {
          ...token,
          ...account,
        };
      } else if (
        token.expires_at &&
        Date.now() < (token.expires_at as number) * 1000
      ) {
        // 后续登录，但 `access_token` 仍然有效
        return token;
      } else {
        // 后续登录，但 `access_token` 已过期，尝试刷新
        if (!token.refresh_token) throw new TypeError('Missing refresh_token');

        try {
          const refreshResponse = await fetch(
            `${process.env.AUTH_FUSIONAUTH_ISSUER}/oauth2/token`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                client_id: process.env.AUTH_FUSIONAUTH_CLIENT_ID!,
                client_secret: process.env.AUTH_FUSIONAUTH_CLIENT_SECRET!,
                grant_type: 'refresh_token',
                refresh_token: token.refresh_token as string,
              }),
            }
          );

          if (!refreshResponse.ok) {
            throw new Error('Failed to refresh token');
          }

          const tokensOrError = await refreshResponse.json();

          if (!refreshResponse.ok) throw tokensOrError;

          const newTokens = tokensOrError as {
            access_token: string;
            expires_in: number;
            refresh_token?: string;
          };

          return {
            ...token,
            access_token: newTokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
            // 一些提供者只发放一次刷新令牌，所以如果没有获取到新的则保留旧的
            refresh_token: newTokens.refresh_token
              ? newTokens.refresh_token
              : token.refresh_token,
          };
        } catch (error) {
          console.error('Error refreshing access_token', error);
          // 如果刷新令牌失败，返回错误以便在页面上处理
          token.error = 'RefreshTokenError';
          return token;
        }
      }
    },
    async session(params) {
      const { session, token } = params;
      return { ...session, ...token };
    },
  },
});

declare module 'next-auth' {
  interface Session {
    access_token: string;
    expires_in: number;
    id_token?: string;
    expires_at: number;
    refresh_token?: string;
    refresh_token_id?: string;
    error?: 'RefreshTokenError';
    scope: string;
    token_type: string;
    userId: string;
    provider: string;
    type: string;
    providerAccountId: string;
  }
}

declare module 'next-auth' {
  interface JWT {
    access_token: string;
    expires_in: number;
    id_token?: string;
    expires_at: number;
    refresh_token?: string;
    refresh_token_id?: string;
    error?: 'RefreshTokenError';
    scope: string;
    token_type: string;
    userId: string;
    provider: string;
    type: string;
    providerAccountId: string;
  }
}
```
 * 
 * 
 * 
 */
export default function FusionAuth<P extends FusionAuthProfile>(
  // tenantId only needed if there is more than one tenant configured on the server
  options: OAuthUserConfig<P> & { tenantId?: string }
): OAuthConfig<P> {
  return {
    id: "fusionauth",
    name: "FusionAuth",
    type: "oidc",
    issuer: options.issuer,
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    wellKnown: options?.tenantId
      ? `${options.issuer}/.well-known/openid-configuration?tenantId=${options.tenantId}`
      : `${options.issuer}/.well-known/openid-configuration`,
    authorization: {
      params: {
        scope: "openid offline_access email profile",
        ...(options?.tenantId && { tenantId: options.tenantId }),
      },
    },
    userinfo: `${options.issuer}/oauth2/userinfo`,
    // This is due to a known processing issue
    // TODO: https://github.com/nextauthjs/next-auth/issues/8745#issuecomment-1907799026
    token: {
      url: `${options.issuer}/oauth2/token`,
      conform: async (response: Response) => {
        if (response.status === 401) return response

        const newHeaders = Array.from(response.headers.entries())
          .filter(([key]) => key.toLowerCase() !== "www-authenticate")
          .reduce(
            (headers, [key, value]) => (headers.append(key, value), headers),
            new Headers()
          )

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        })
      },
    },
    checks: ["pkce", "state"],
    profile(profile) {
      return {
        id: profile.sub,
        email: profile.email,
        name:
          profile.name ??
          profile.preferred_username ??
          [profile.given_name, profile.middle_name, profile.family_name]
            .filter((x) => x)
            .join(" "),
        image: profile.picture,
      }
    },
    options,
  }
}
