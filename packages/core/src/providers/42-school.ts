/**
 * <div class="provider" style={{backgroundColor: "#fff", display: "flex", justifyContent: "space-between", color: "#000", padding: 16}}>
 * <span>内置 <b>42School</b> 集成。</span>
 * <a href="https://api.intra.42.fr//">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/42-school.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/42-school
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface UserData {
  id: number
  email: string
  login: string
  first_name: string
  last_name: string
  usual_full_name: null | string
  usual_first_name: null | string
  url: string
  phone: "hidden" | string | null
  displayname: string
  image_url: string | null
  "staff?": boolean
  correction_point: number
  pool_month: string | null
  pool_year: string | null
  location: string | null
  wallet: number
  anonymize_date: string
  created_at: string
  updated_at: string | null
  alumni: boolean
  "is_launched?": boolean
}

export interface CursusUser {
  grade: string | null
  level: number
  skills: Array<{ id: number; name: string; level: number }>
  blackholed_at: string | null
  id: number
  begin_at: string | null
  end_at: string | null
  cursus_id: number
  has_coalition: boolean
  created_at: string
  updated_at: string | null
  user: UserData
  cursus: { id: number; created_at: string; name: string; slug: string }
}

export interface ProjectUser {
  id: number
  occurrence: number
  final_mark: number | null
  status: "in_progress" | "finished"
  "validated?": boolean | null
  current_team_id: number
  project: {
    id: number
    name: string
    slug: string
    parent_id: number | null
  }
  cursus_ids: number[]
  marked_at: string | null
  marked: boolean
  retriable_at: string | null
  created_at: string
  updated_at: string | null
}

export interface Achievement {
  id: number
  name: string
  description: string
  tier: "none" | "easy" | "medium" | "hard" | "challenge"
  kind: "scolarity" | "project" | "pedagogy" | "scolarity"
  visible: boolean
  image: string | null
  nbr_of_success: number | null
  users_url: string
}

export interface LanguagesUser {
  id: number
  language_id: number
  user_id: number
  position: number
  created_at: string
}

export interface TitlesUser {
  id: number
  user_id: number
  title_id: number
  selected: boolean
  created_at: string
  updated_at: string | null
}

export interface ExpertisesUser {
  id: number
  expertise_id: number
  interested: boolean
  value: number
  contact_me: boolean
  created_at: string
  user_id: number
}

export interface Campus {
  id: number
  name: string
  time_zone: string
  language: {
    id: number
    name: string
    identifier: string
    created_at: string
    updated_at: string | null
  }
  users_count: number
  vogsphere_id: number
  country: string
  address: string
  zip: string
  city: string
  website: string
  facebook: string
  twitter: string
  active: boolean
  email_extension: string
  default_hidden_phone: boolean
}

export interface CampusUser {
  id: number
  user_id: number
  campus_id: number
  is_primary: boolean
  created_at: string
  updated_at: string | null
}

export interface Image {
  link: string
  versions: {
    micro: string
    small: string
    medium: string
    large: string
  }
}

export interface FortyTwoProfile extends UserData, Record<string, any> {
  groups: Array<{ id: string; name: string }>
  cursus_users: CursusUser[]
  projects_users: ProjectUser[]
  languages_users: LanguagesUser[]
  achievements: Achievement[]
  titles: Array<{ id: string; name: string }>
  titles_users: TitlesUser[]
  partnerships: any[]
  patroned: any[]
  patroning: any[]
  expertises_users: ExpertisesUser[]
  roles: Array<{ id: string; name: string }>
  campus: Campus[]
  campus_users: CampusUser[]
  image: Image
  user: any | null
}

/**
 * 向您的页面添加42School登录功能。
 *
 * ### 设置
 *
 * #### 回调URL
 * ```
 * https://example.com/api/auth/callback/42-school
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import FortyTwoSchool from "@auth/core/providers/42-school"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     FortyTwoSchool({
 *       clientId: FORTY_TWO_SCHOOL_CLIENT_ID,
 *       clientSecret: FORTY_TWO_SCHOOL_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [42School OAuth文档](https://api.intra.42.fr/apidoc/guides/web_application_flow)
 *
 * ### 注意事项
 *
 *
 * :::note
 * 42在`Account`上返回一个名为`created_at`的字段，它是一个数字。参见[文档](https://api.intra.42.fr/apidoc/guides/getting_started#make-basic-requests)。如果您正在使用[适配器](https://authjs.dev/reference/core/adapters)，请确保将此字段添加到您的数据库架构中。
 * :::
 * 默认情况下，Auth.js假设42School提供者基于[OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html)规范。
 *
 * :::tip
 *
 * 42School提供者附带一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/42-school.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置OAuth提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，您可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js严格遵守规范，对于提供者与规范的任何偏差，Auth.js不承担任何责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function FortyTwo<P extends FortyTwoProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "42-school",
    name: "42 School",
    type: "oauth",
    authorization: {
      url: "https://api.intra.42.fr/oauth/authorize",
      params: { scope: "public" },
    },
    token: "https://api.intra.42.fr/oauth/token",
    userinfo: "https://api.intra.42.fr/v2/me",
    profile(profile) {
      return {
        id: profile.id.toString(),
        name: profile.usual_full_name,
        email: profile.email,
        image: profile.image.link,
      }
    },
    options,
  }
}
