/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Bungie</b> 集成。</span>
 * <a href="https://bungie.net/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/bungie.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/bungie
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 为您的页面添加 Bungie 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/bungie
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Bungie from "@auth/core/providers/bungie"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Bungie({
 *       clientId: BUNGIE_CLIENT_ID,
 *       clientSecret: BUNGIE_CLIENT_SECRET,
 *       headers: { "X-API-Key": BUNGIE_API_KEY },
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Bungie OAuth 文档](https://github.com/Bungie-net/api/wiki/OAuth-Documentation)
 *
 * ## 配置
 *
 * :::tip
 * Bungie 要求所有网站运行 HTTPS（包括本地开发实例）。
 * :::
 *
 * :::tip
 * Bungie 不允许使用 localhost 作为网站 URL，而是需要使用 https://127.0.0.1:3000
 * :::
 *
 * 访问 https://www.bungie.net/en/Application 并填写必要信息：
 *
 * - 应用名称
 * - 应用状态
 * - 网站
 * - OAuth 客户端类型
 *   - 机密
 * - 重定向 URL
 *   - https://localhost:3000/api/auth/callback/bungie
 * - 范围
 *   - `访问您的 Bungie.net 通知、会员资格及最近的 Bungie.Net 论坛活动等项目。`
 * - Origin 头
 *
 * 以下指南可能有所帮助：
 *
 * - [如何为 Next.js 应用设置本地 HTTPS](https://medium.com/@anMagpie/secure-your-local-development-server-with-https-next-js-81ac6b8b3d68)
 *
 * #@example server
 *
 * 您需要编辑您的 hosts 文件并将您的站点指向 `127.0.0.1`
 *
 * [如何编辑我的 hosts 文件？](https://phoenixnap.com/kb/how-to-edit-hosts-file-in-windows-mac-or-linux)
 *
 * 在 Windows 上（以管理员身份运行 PowerShell）
 *
 * ```ps
 * Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "127.0.0.1`tdev.example.com" -Force
 * ```
 *
 * ```
 * 127.0.0.1 dev.example.com
 * ```
 *
 * ### 创建证书
 *
 * 使用 openssl 为 localhost 创建证书很简单。只需在终端中输入以下命令。输出将是两个文件：localhost.key 和 localhost.crt。
 *
 * ```bash
 * openssl req -x509 -out localhost.crt -keyout localhost.key \
 *   -newkey rsa:2048 -nodes -sha256 \
 *   -subj "/CN=localhost" -extensions EXT -config <( \
 *    printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
 * ```
 *
 * :::tip
 * **Windows**
 *
 * OpenSSL 可执行文件随 [Git](https://git-scm.com/download/win]9) 为 Windows 分发。
 * 安装后，您可以在 `C:/Program Files/Git/mingw64/bin` 中找到 openssl.exe 文件，如果尚未完成，可以将其添加到系统 PATH 环境变量中。
 *
 * 添加环境变量 `OPENSSL_CONF=C:/Program Files/Git/mingw64/ssl/openssl.cnf`
 *
 * ```bash
 *  req -x509 -out localhost.crt -keyout localhost.key \
 *   -newkey rsa:2048 -nodes -sha256 \
 *   -subj "/CN=localhost"
 * ```
 *
 * :::
 *
 * 创建目录 `certificates` 并放置 `localhost.key` 和 `localhost.crt`
 *
 * 您可以在项目的根目录中创建一个 `server.js` 并使用 `node server.js` 运行它以在本地测试 Bungie 登录集成：
 *
 * ```js
 * const { createServer } = require("https")
 * const { parse } = require("url")
 * const next = require("next")
 * const fs = require("fs")
 *
 * const dev = process.env.NODE_ENV !== "production"
 * const app = next({ dev })
 * const handle = app.getRequestHandler()
 *
 * const httpsOptions = {
 *   key: fs.readFileSync("./certificates/localhost.key"),
 *   cert: fs.readFileSync("./certificates/localhost.crt"),
 * }
 *
 * app.prepare().then(() => {
 *   createServer(httpsOptions, (req, res) => {
 *     const parsedUrl = parse(req.url, true)
 *     handle(req, res, parsedUrl)
 *   }).listen(3000, (err) => {
 *     if (err) throw err
 *     console.log("> Ready on https://localhost:3000")
 *   })
 * })
 * ```
 *
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Bungie 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Bungie 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/bungie.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担任何责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function Bungie(
  options: OAuthUserConfig<Record<string, any>>
): OAuthConfig<Record<string, any>> {
  return {
    id: "bungie",
    name: "Bungie",
    type: "oauth",
    authorization: "https://www.bungie.net/en/OAuth/Authorize?reauth=true",
    token: "https://www.bungie.net/platform/app/oauth/token/",
    userinfo:
      "https://www.bungie.net/platform/User/GetBungieAccount/{membershipId}/254/",
    profile(profile) {
      const { bungieNetUser: user } = profile.Response

      return {
        id: user.membershipId,
        name: user.displayName,
        email: null,
        image: `https://www.bungie.net${
          user.profilePicturePath.startsWith("/") ? "" : "/"
        }${user.profilePicturePath}`,
      }
    },
    options,
  }
}
