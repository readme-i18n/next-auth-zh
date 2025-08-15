/**
 * <div class="provider" style={{backgroundColor: "#24292f", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>NetSuite</b> 集成。</span>
 * <a href="https://system.netsuite.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/netsuite.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/netsuite
 */

/*
 * 此 NetSuite 提供程序使用 OAuth 2 功能。确保您已设置集成记录和访问令牌以便使用此提供程序。
 * 在此处阅读更多关于 OAuth 2 设置的信息：https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157771281570.html
 */

import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface OAuthNetSuiteOptions {
  /**
   *  提示选项 - 也可在下方查看
   *
   *  @link https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_160855585734.html
   *
   * 	authorization.params.prompt
   *
   * 可选的 prompt 参数提供了对登录/同意屏幕何时出现的额外控制。以下是您可以使用 prompt 参数的值：
   * "none" - 同意屏幕不出现。如果没有活跃的会话，应用程序将返回一个错误。
   * "login" - 用户必须认证，即使存在活跃的会话。
   * 此选项仅在应用程序将请求发送到特定账户域时有效。
   * "consent" - 每次都会出现同意屏幕。如果没有活跃的会话，用户必须认证。
   * login consent 或 consent login - 每次都会出现同意屏幕，并且用户必须认证即使存在活跃的会话，并允许连接到 NetSuite。类似于 GitHub、Google 和 Facebook 的数据同意屏幕。
   */
  prompt: string | "none" | "login" | "consent"
  /**
   * 示例：TSTDRV1234567 或生产环境的 81555
   */
  accountID: string
  /**
   * restlets rest_webservices 或 restlets 或 rest_webservices suiteanalytics_connect restlets
   */
  scope: string
  /**
   * 可以是一个返回运行时信息或记录信息的 restlet 或 suitelet -> 推荐使用 RESTlet
   */
  userinfo: string
}

export interface NetSuiteProfile {
  // Main N/runtime.getCurrentUser() object return
  id: number
  name: string
  email: string
  location: number
  role: number
  roleId?: string
  roleCenter?: string
  contact?: number
  subsidiary?: number
  department?: number
}

/**
 * 将 NetSuite 登录添加到您的页面，并向以下地址发起请求：
 * - [NetSuite RESTLets](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4567507062.html#Tracking-RESTlet-Calls-Made-with-TBA-and-OAuth-2.0)。
 * - [NetSuite REST Web Services](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/book_1559132836.html#SuiteTalk-REST-Web-Services-API-Guide)。
 *
 * ### 设置
 *
 * #### 免责声明
 * 使用此提供程序，即表示您同意与 NetSuite 共享您的数据。
 * 使用此提供程序，我们假设您遵守 NetSuite 的[服务条款](https://www.netsuite.com/portal/assets/pdf/terms_of_service.pdf)和[隐私政策](https://www.oracle.com/legal/privacy)。
 * 此提供程序的作者与 NetSuite 无关联。继续使用此提供程序，您必须是 NetSuite 客户并拥有 NetSuite 账户（完全访问用户）。
 * **确保您的 NetSuite 账户中启用了 OAuth 2.0 功能，并为当前角色/用户设置了适当的权限**
 *
 * 在设置提供程序之前，您需要：
 * - [创建集成记录](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157771733782.html#procedure_157838925981)
 *   - 取消选中 TBA 认证流程复选框。
 *   - 选中 OAuth 2.0 认证流程复选框。
 *   - 将下面的 `Callback URL` 复制并粘贴到 `Redirect URI` 字段中。
 *   - 然后选择您想要使用的范围。
 *     - **REST Web Services** (`rest_webservices`) - 访问 REST Web Services。
 *     - **RESTlets**(`restlets`) - 访问 RESTLets。
 *     - **SuiteAnalytics Connect** (`suiteanalytics_connect`) - 访问 SuiteAnalytics Connect。
 *   - 添加您想要使用的任何策略。
 *     - 应用程序徽标（可选）（在用户被要求授予您的应用程序访问权限时显示）。- 同意屏幕
 *     - 应用程序使用条款（可选）- 包含您应用程序使用条款的 PDF 文件。- 同意屏幕
 *     - 应用程序隐私政策（可选）- 包含您应用程序隐私政策的 PDF 文件。- 同意屏幕
 *   - OAuth 2.0 同意策略偏好 - 此设置决定用户是每次登录时被要求授予您的应用程序访问权限，还是仅在第一次登录时或从不。
 *   - **保存** 集成记录。
 *   - 集成记录将用于生成提供程序的 `clientId` 和 `clientSecret`。**保存生成的值以备后用**
 *
 * #### 回调 URL
 *
 * :::tip
 * 在集成记录中设置 Redirect URI 时，您必须使用 `https` 协议。
 * 否则，尝试登录时会收到错误（_INVALID_LOGIN_ATTEMPT_）。
 * 如果您在本地测试，可以使用像 [ngrok](https://ngrok.com/) 这样的服务来创建到本地主机的安全隧道。
 * :::
 *
 * ```
 * https://example.com/api/auth/callback/netsuite
 * ```
 *
 * :::tip
 * 我们的 `userinfo` 需要由一个 suitelet 或 RESTLet URL 组成，该 URL 提供有关用户的信息。这必须非常快，握手配置文件收集执行不能花费太长时间。
 * 最好的选择是首先使用 `N/runtime` 模块获取基本信息。- 下面是一个 RESTLet 的示例。确保部署并启用对“所有角色”的访问。
 * :::
 *
 * #### 示例 RESTLet 回调处理程序
 * 确保部署并使用任何 URI 使用的外部 RESTLet URL。
 *
 * ```js
 * * /**
 * * @NApiVersion 2.1
 * * @NScriptType Restlet
 * *\/
 * define(["N/runtime"], /**
 *  @param{runtime} runtimee
 * \/ (runtime) => {
 *  /**
 *   * 定义当 GET 请求发送到 RESTlet 时执行的函数。
 *   * @param {Object} requestParams - 来自 HTTP 请求 URL 的参数；作为对象传递的参数（适用于所有支持的内容类型）
 *   * @returns {string | Object} HTTP 响应体；当请求 Content-Type 为 'text/plain' 时返回字符串；当请求 Content-Type 为 'application/json' 或 'application/xml' 时返回对象
 *   * @since 2015.2
 *   *\/
 *   const get = (requestParams) => {
 *     let userObject = runtime.getCurrentUser();
 *
 *     try {
 *       log.debug({ title: "接收到的负载:", details: requestParams });
 *
 *       const { id, name, role, location, email, contact } = userObject;
 *
 *       log.audit({ title: "当前用户运行", details: name });
 *
 *       let user = {
 *         id,
 *         name,
 *         role,
 *         location,
 *         email,
 *         contact,
 *       };
 *
 *       log.debug({ title: "返回用户", details: user });
 *
 *       return JSON.stringify(user);
 *     } catch (e) {
 *       log.error({ title: "获取当前用户时出错:", details: e });
 *     }
 *   };
 *
 *   return {
 *     get,
 *   };
 * );
 * ```
 *
 * > **注意**：上面是返回基本运行时信息的示例。确保创建一个新的脚本记录和部署记录。保存部署记录后。我们将获得我们的 RESTLet 的 URL。
 *
 * ### 配置
 *
 * ```ts
 * import { Auth } from "@auth/core"
 * import Netsuite from "@auth/core/providers/netsuite"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *       NetSuite({
 *         accountID: NETSUITE_ACCOUNT_ID, // 示例：TSTDRV1234567 或生产环境的 81555，以及沙盒账户的 1234567-SB1 不是 "_" 使用 "-"。
 *        // 使用 N/runtime 模块返回当前用户。此 URL 可以是一个 suitelet 或 RESTlet（推荐）
 *        // 使用 getCurrentUser(); 因此我们在 profile 回调中匹配从此 RESTlet 返回的模式。（必需）
 *         userinfo: "https://1234567.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=123&deploy=1",
 *       })
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [NetSuite - 创建集成记录（OAuth 2.0）](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157771733782.html#Related-Topics)
 * - [NetSuite - 授权 OAuth 请求](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
 * - [NetSuite - 配置 OAuth 角色](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157771510070.html#Set-Up-OAuth-2.0-Roles)
 * - [了解更多关于 NetSuite OAuth 2.0](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_157769826287.html#OAuth-2.0)
 *
 * ### 注意事项
 *
 * :::tip
 * 确保 `userinfo` 匹配 profile 回调的返回类型，以确保用户会话被正确读取。
 * 要为您的情况覆盖默认值，请查看[自定义内置 OAuth 提供程序](https://authjs.dev/guides/providers/custom-provider#override-default-options)。
 * :::
 *
 */
export default function NetSuite<P extends NetSuiteProfile>(
  config: OAuthUserConfig<P> & OAuthNetSuiteOptions
): OAuthConfig<P> {
  const { accountID } = config

  return {
    id: "netsuite",
    name: "NetSuite",
    type: "oauth",
    checks: ["state"],
    authorization: {
      url: `https://${accountID}.app.netsuite.com/app/login/oauth2/authorize.nl`,
      params: { scope: "restlets rest_webservices" },
    },
    token: `https://${accountID}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token`,
    profile(profile) {
      // This is the default runtime.getCurrentUser() object returned from the RESTlet or SUITELet
      return {
        id: profile.id.toString(),
        name: profile.name,
        email: profile.email,
        image: null,
      }
    },
    style: { logo: "/netsuite.svg", bg: "#181a1b", text: "#fbfbfb" },
    options: config,
  }
}
