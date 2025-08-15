/**
 * <div class="provider" style={{backgroundColor: "#24292f", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>微信</b> 集成。</span>
 * <a href="https://www.wechat.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/wechat.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/wechat
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/** @see [获取认证用户](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Authorized_Interface_Calling_UnionID.html) */
export interface WeChatProfile {
  openid: string
  nickname: string
  sex: number
  province: string
  city: string
  country: string
  headimgurl: string
  privilege: string[]
  unionid: string
  [claim: string]: unknown
}

/**
 * 在您的页面添加微信登录功能，并向[微信API](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Authorized_Interface_Calling_UnionID.html)发起请求。
 *
 * ### 设置
 *
 * #### 回调URL
 * ```
 * https://example.com/api/auth/callback/wechat
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import WeChat from "@auth/core/providers/wechat"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [WeChat({
 *     clientId: AUTH_WECHAT_APP_ID,
 *     clientSecret: AUTH_WECHAT_APP_SECRET,
 *     platformType: "OfficialAccount",
 *   })],
 * })
 * ```
 *
 * ### 资源
 *
 * - [微信公众号](https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html)
 * - [微信公众号 - 网页授权](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)
 * - [微信公众号测试账号](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)
 * - [微信网站应用登录](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html)
 * - [使用微信测试账号对网页进行授权](https://cloud.tencent.com/developer/article/1703167)
 *
 * :::tip
 *
 * 微信提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/wechat.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置OAuth提供者](https://authjs.dev/guides/providers/custom-provider#override-default-options)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，您可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者任何偏离规范的行为不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */

export default function WeChat(
  options: OAuthUserConfig<WeChatProfile> & {
    platformType?: "OfficialAccount" | "WebsiteApp"
  }
): OAuthConfig<WeChatProfile> {
  const { clientId, clientSecret, platformType = "OfficialAccount" } = options

  return {
    id: "wechat",
    name: "WeChat",
    type: "oauth",
    style: { logo: "/wechat.svg", bg: "#fff", text: "#000" },
    checks: ["state"],
    authorization: {
      url:
        platformType === "OfficialAccount"
          ? "https://open.weixin.qq.com/connect/oauth2/authorize"
          : "https://open.weixin.qq.com/connect/qrconnect",
      params: {
        appid: clientId,
        scope:
          platformType === "OfficialAccount"
            ? "snsapi_userinfo"
            : "snsapi_login",
      },
    },
    token: {
      url: "https://api.weixin.qq.com/sns/oauth2/access_token",
      params: { appid: clientId, secret: clientSecret },
      async conform(response) {
        const data = await response.json()
        if (data.token_type === "bearer") {
          console.warn(
            "token_type is 'bearer'. Redundant workaround, please open an issue."
          )
          return response
        }
        return Response.json({ ...data, token_type: "bearer" }, response)
      },
    },
    userinfo: {
      url: "https://api.weixin.qq.com/sns/userinfo",
      async request({ tokens, provider }) {
        if (!provider.userinfo) return

        const url = new URL(provider.userinfo.url)
        url.searchParams.set("access_token", tokens.access_token!)
        url.searchParams.set("openid", String(tokens.openid))
        url.searchParams.set("lang", "zh_CN")
        const response = await fetch(url)
        return response.json()
      },
    },
    profile(profile) {
      return {
        id: profile.unionid,
        name: profile.nickname,
        email: null,
        image: profile.headimgurl,
      }
    },
    options,
  }
}
