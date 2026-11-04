export type UserRole = "master" | "admin" | "editor" | "author" | "contributor";
export type AccountStatus = "active" | "blocked" | "pending";
export type ArticleStatus = "draft" | "review" | "scheduled" | "published" | "archived";

export const ROLE_LABELS: Record<UserRole, string> = {
  master: "Administrador master",
  admin: "Administrador",
  editor: "Editor",
  author: "Jornalista / Autor",
  contributor: "Colaborador",
};

export const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Rascunho",
  review: "Em revisão",
  scheduled: "Agendada",
  published: "Publicada",
  archived: "Arquivada",
};

export interface Profile {
  id: string;
  full_name: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  status: AccountStatus;
  social_links: Record<string, string>;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  show_on_home: boolean;
  home_layout: string;
  home_limit: number;
}

export interface Columnist {
  id: string;
  profile_id: string | null;
  name: string;
  slug: string;
  photo_url: string | null;
  bio: string | null;
  specialty: string | null;
  social_links: Record<string, string>;
  sort_order: number;
  is_active: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  cover_caption: string | null;
  cover_credit: string | null;
  cover_alt: string | null;
  category_id: string | null;
  author_id: string | null;
  columnist_id: string | null;
  status: ArticleStatus;
  published_at: string | null;
  scheduled_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  is_sponsored: boolean;
  sponsor_name: string | null;
  reading_time: number;
  view_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  author?: Pick<Profile, "id" | "full_name" | "avatar_url" | "username"> | null;
  columnist?: Columnist | null;
}

export interface FeaturedSlot {
  key: string;
  label: string;
  description: string | null;
  max_items: number;
  is_active: boolean;
  style: string;
  sort_order: number;
}

export interface FeaturedItem {
  id: string;
  slot_key: string;
  article_id: string;
  sort_order: number;
  custom_title: string | null;
  article?: Article;
}

export interface MenuItem {
  id: string;
  menu_key: string;
  parent_id: string | null;
  label: string;
  type: "link" | "category" | "page" | "home";
  url: string | null;
  category_id: string | null;
  page_id: string | null;
  sort_order: number;
  is_visible: boolean;
  open_new_tab: boolean;
  href?: string;
  children?: MenuItem[];
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  blocks: PageBlock[];
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  is_system: boolean;
  show_in_footer: boolean;
  sort_order: number;
  updated_at: string;
}

export type PageBlock =
  | { id: string; type: "heading"; text: string; level?: 1 | 2 | 3 }
  | { id: string; type: "text"; html: string }
  | { id: string; type: "image"; url: string; caption?: string; alt?: string }
  | { id: string; type: "banner"; title: string; subtitle?: string; image_url?: string; cta_label?: string; cta_url?: string }
  | { id: string; type: "columns"; items: { title: string; html: string }[] }
  | { id: string; type: "team"; members: { name: string; role: string; photo_url?: string }[] }
  | { id: string; type: "embed"; url: string };

export interface Media {
  id: string;
  folder_id: string | null;
  storage_path: string;
  url: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
  credit: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Show {
  id: string;
  name: string;
  slug: string;
  type: "video" | "podcast";
  description: string | null;
  cover_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Episode {
  id: string;
  show_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  type: "video" | "audio";
  embed_url: string | null;
  audio_url: string | null;
  cover_url: string | null;
  guest_name: string | null;
  duration_seconds: number | null;
  published_at: string | null;
  is_published: boolean;
  show?: Show | null;
}

export type AdPosition =
  | "top"
  | "between_headlines"
  | "between_sections"
  | "sidebar"
  | "in_article"
  | "article_end"
  | "footer";

export const AD_POSITION_LABELS: Record<AdPosition, string> = {
  top: "Topo do site",
  between_headlines: "Entre as manchetes",
  between_sections: "Entre blocos de notícias",
  sidebar: "Barra lateral",
  in_article: "Dentro das matérias",
  article_end: "Final das matérias",
  footer: "Rodapé",
};

export interface Ad {
  id: string;
  name: string;
  position: AdPosition;
  image_url: string | null;
  link_url: string | null;
  html_code: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  sort_order: number;
  impressions: number;
  clicks: number;
}

export interface LinkButton {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  style: string;
  sort_order: number;
  is_active: boolean;
}

export interface SiteSettings {
  identity: {
    name: string;
    tagline: string;
    logo_url: string | null;
    logo_dark_url: string | null;
    favicon_url: string | null;
    description: string;
  };
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    font_heading: string;
    font_body: string;
    heading_scale: number;
    headline_style: "serif" | "sans";
    radius: string;
  };
  header: { show_search: boolean; show_social: boolean; show_date: boolean; sticky: boolean; cta_label: string; cta_url: string };
  ticker: { enabled: boolean; label: string; speed: number };
  footer: { about: string; contact_email: string; contact_phone: string; address: string; copyright: string; expediente: string };
  social: Record<string, string>;
  home_layout: { blocks: HomeBlock[] };
  seo: { default_title: string; title_template: string; default_description: string; google_site_verification: string; ga_measurement_id: string; adsense_client: string };
  links_page: { enabled: boolean; title: string; subtitle: string; avatar_url: string | null; show_latest_articles: number };
}

export type HomeBlock =
  | { type: "ticker" }
  | { type: "hero" }
  | { type: "highlights" }
  | { type: "categories" }
  | { type: "category"; category_id: string; layout?: string; limit?: number }
  | { type: "columnists" }
  | { type: "audiovisual" }
  | { type: "latest" }
  | { type: "ad"; position: AdPosition }
  | { type: "banner" };

export const HOME_BLOCK_LABELS: Record<HomeBlock["type"], string> = {
  ticker: "Faixa de últimas notícias",
  hero: "Manchetes principais",
  highlights: "Chamadas em destaque",
  categories: "Blocos por editoria (todas ativas)",
  category: "Bloco de uma editoria específica",
  columnists: "Colunistas e opinião",
  audiovisual: "Vídeos e podcasts",
  latest: "Últimas notícias (lista)",
  ad: "Espaço publicitário",
  banner: "Chamada especial (banner editorial)",
};

export type ActionState = { error?: string; success?: string };
