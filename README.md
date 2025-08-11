> [!NOTE]
> Auth.js/NextAuth.js 项目并非由 Vercel Inc. 或其子公司提供，也不隶属于这些公司。Vercel 相关人员的任何贡献均以个人身份进行。

<p align="center">
  <br/>
  <a href="https://authjs.dev" target="_blank"><img width="96px" src="https://authjs.dev/img/logo-sm.png" /></a>
  <h3 align="center">Auth.js</h3>
  <p align="center">Authentication for the Web.</p>
  <p align="center">Open Source. Full Stack. Own Your Data.</p>
  <p align="center" style="align: center;">
    <a href="https://x.com/authjs" ><img src="https://shields.io/badge/Follow @authjs-000?logo=x&style=flat-square" alt="X (formerly known Twitter)" /></a>
    <a href="https://github.com/nextauthjs/next-auth/releases"><img src="https://img.shields.io/npm/v/next-auth/latest?style=flat-square&label=latest%20stable" alt="NPM next-auth@latest release" /></a>
    <a href="https://github.com/nextauthjs/next-auth/releases"><img src="https://img.shields.io/npm/v/next-auth/beta?style=flat-square&label=latest%20NextAuth.js v5" alt="NPM next-auth@beta release" /></a>
    <!-- TODO: Should count `@auth/core` when NextAuth.js v5 is released as stable. -->
    <a href="https://www.npmtrends.com/next-auth"><img src="https://img.shields.io/npm/dm/next-auth?style=flat-square&color=cyan" alt="Downloads" /></a>
    <a href="https://github.com/nextauthjs/next-auth/stargazers"><img src="https://img.shields.io/github/stars/nextauthjs/next-auth?style=flat-square&color=orange" alt="GitHub Stars" /></a>
    <!-- <a href="https://codecov.io/gh/nextauthjs/next-auth" ><img alt="Codecov" src="https://img.shields.io/codecov/c/github/nextauthjs/next-auth?token=o2KN5GrPsY&style=flat-square&logo=codecov"></a> -->
    <img src="https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=fff&style=flat-square" alt="TypeScript" />
  </p>
  <p align="center">
    Auth.js is a set of open-source packages that are built on standard Web APIs for authentication in modern applications with any framework on any platform in any JS runtime.
  </p>
  <p align="center">
    Need help? See <a href="https://authjs.dev">authjs.dev</a> for the documentation, or <a href="https://discord.authjs.dev">
    join our community on Discord&nbsp;
      <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg" height=12 alt="TypeScript" />
    </a>
    .
  </p>
  <p align="center">
     <kbd>Sponsored</kbd> Looking for a hosted alternative? <a href="https://go.clerk.com/5115vfK" target="_blank">Use Clerk →</a>
  </p>
</p>

## 功能特性

### 灵活易用

- 设计兼容任何 OAuth 服务，支持 2.0+ 和 OIDC
- 内置对[众多流行登录服务](https://github.com/nextauthjs/next-auth/tree/main/packages/core/src/providers)的支持
- 电子邮件/无密码认证
- 支持通行密钥/WebAuthn
- 自带数据库或无需数据库 - 可与任何后端（Active Directory、LDAP 等）实现无状态认证
- 运行时无关，随处运行！（Docker、Node.js、Serverless 等）

### 数据自主掌控

Auth.js 可搭配数据库使用，也可不依赖数据库。

- 开源解决方案让您完全掌控数据
- 内置支持 [MySQL、MariaDB、Postgres、Microsoft SQL Server、MongoDB、SQLite、GraphQL 等](https://adapters.authjs.dev)
- 完美兼容主流托管服务商的数据库

### 默认安全防护

- 提倡使用无密码登录机制
- 默认采用安全设计，鼓励保护用户数据的最佳实践
- 在POST路由（登录、登出）上使用跨站请求伪造(CSRF)令牌
- 默认cookie策略为每种cookie采用最严格的适用策略
- 使用JSON Web令牌时默认采用A256CBC-HS512算法进行加密(JWE)
- 支持标签页/窗口同步和会话轮询功能，适用于短期会话场景
- 遵循[开放Web应用安全项目](https://owasp.org)发布的最新安全指南

高级配置允许自定义以下流程：控制允许登录的账户、编解码JSON Web令牌、设置自定义cookie安全策略和会话属性，从而掌控登录权限和会话重新验证频率。

### TypeScript

Auth.js库在开发时充分考虑了类型安全性。[查阅文档](https://authjs.dev/getting-started/typescript)获取更多信息。

## 安全须知

若您发现Auth.js或相关包（如适配器）存在潜在漏洞（或不确定），请阅读我们的[安全政策](https://authjs.dev/security)后通过正规渠道联系。未经协商请勿直接提交Pull Requests/Issues/Discussions。

## 致谢

[Auth.js 的诞生离不开所有贡献者的支持。](https://authjs.dev/contributors)

<a href="https://github.com/nextauthjs/next-auth/graphs/contributors">
  <img width="500px" src="https://contrib.rocks/image?repo=nextauthjs/next-auth" />
</a>
<div>
<a href="https://vercel.com?utm_source=nextauthjs&utm_campaign=oss"></a>
</div>

### 赞助者

我们为希望为项目提供资金支持的企业和个人设立了 [OpenCollective](https://opencollective.com/nextauth)！

<!--sponsors start-->

<table>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <a href="https://clerk.com?utm_source=sponsorship&utm_medium=github&utm_campaign=authjs&utm_content=sponsor" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/49538330?s=200&v=4" alt="Clerk Logo" />
        </a><br />
        <div>Clerk</div>
        <sub>💵</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://a0.to/signup/nextauthjs" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/2824157?v=4" alt="Auth0 Logo" />
        </a><br />
        <div>Auth0</div>
        <sub>💵</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://fusionauth.io" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/41974756?s=200&v=4" alt="FusionAuth Logo" />
        </a><br />
        <div>FusionAuth</div>
        <sub>💵</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://stytch.com" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/69983493?s=200&v=4" alt="Stytch Logo" />
        </a><br />
        <div>Stytch</div>
        <sub>💵</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://prisma.io" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/17219288?s=200&v=4" alt="Prisma Logo" />
        </a><br />
        <div>Prisma</div>
        <sub>💵</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://neon.tech" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/77690634?v=4" alt="Neon Logo" />
        </a><br />
        <div>Neon</div>
        <sub>💵</sub>
      </td>
    </tr>
    <tr>
      <td align="center" valign="top">
        <a href="https://www.beyondidentity.com" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/69811361?s=200&v=4" alt="Beyond Identity Logo" />
        </a><br />
        <div>Beyond Identity</div>
        <sub>💵</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://lowdefy.com" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/47087496?s=200&v=4" alt="Lowdefy Logo" />
        </a><br />
        <div>Lowdefy</div>
        <sub>💵</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://www.descope.com" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/97479186?s=200&v=4" alt="Descope Logo" />
        </a><br />
        <div>Descope</div>
        <sub>💵</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://badass.dev" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/136839242?v=4" alt="Badass Courses Logo" />
        </a><br />
        <div>Badass Courses</div>
        <sub>💵</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/encoredev/encore" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/50438175?v=4" alt="Encore Logo" />
        </a><br />
        <div>Encore</div>
        <sub>💵</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://sent.dm/?ref=auth.js" target="_blank">
          <img width="108" src="https://avatars.githubusercontent.com/u/153308555?v=4" alt="Sent.dm Logo" />
        </a><br />
        <div>Sent.dm</div>
        <sub>💵</sub>
      </td>
    </tr>
    <tr>
      <td align="center" valign="top">
        <a href="https://arcjet.com/?ref=auth.js" target="_blank">
          <img width="108" src="https://avatars.githubusercontent.com/u/24397786?s=200&v=4" alt="Arcjet Logo" />
        </a><br />
        <div>Arcjet</div>
        <sub>💵</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://route4me.com/?ref=auth.js" target="_blank">
          <img width="108" src="https://avatars.githubusercontent.com/u/7936820?v=4" alt="Route4Me Logo" />
        </a><br />
        <div>Route4Me</div>
        <sub>💵</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://www.netlight.com/" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/1672348?s=200&v=4" alt="Netlight logo" />
        </a><br />
        <div>Netlight</div>
        <sub>☁️</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://checklyhq.com" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/25982255?s=200&v=4" alt="Checkly Logo" />
        </a><br />
        <div>Checkly</div>
        <sub>☁️</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://superblog.ai/" target="_blank">
          <img height="96" src="https://d33wubrfki0l68.cloudfront.net/cdc4a3833bd878933fcc131655878dbf226ac1c5/10cd6/images/logo_bolt_small.png" alt="superblog Logo" />
        </a><br />
        <div>superblog</div>
        <sub>☁️</sub>
      </td>
      <td align="center" valign="top">
        <a href="https://vercel.com" target="_blank">
          <img height="96" src="https://avatars.githubusercontent.com/u/14985020?s=200&v=4" alt="Vercel Logo" />
        </a><br />
        <div>Vercel</div>
        <sub>☁️</sub>
      </td>
    </tr>
  </tbody>
</table>

- 💵 资金赞助
- ☁️ 基础设施支持

<br />
<!--sponsors end-->

## 参与贡献

我们欢迎所有社区贡献！如果您希望以任何方式参与贡献，请先阅读我们的[贡献指南](https://github.com/nextauthjs/.github/blob/main/CONTRIBUTING.md)。

> [!NOTE]
> Auth.js/NextAuth.js 项目并非由 Vercel Inc. 或其子公司提供，也不与之存在任何关联。Vercel 相关人员的任何贡献均以个人名义进行。

## 许可协议

ISC...
