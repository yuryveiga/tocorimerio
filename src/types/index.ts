import { Json } from "@/integrations/supabase/types";

export type PricingTier = {
  min_people: number;
  max_people: number | null;
  price_per_person: number;
};

export type LovableTour = {
  id: string;
  title: string;
  short_description: string;
  price: number;
  duration: string;
  max_group_size: number;
  image_url: string;
  is_featured: boolean;
  category: string;
  is_active: boolean;
  sort_order: number;
  itinerary_json?: { time: string; description: string }[];
  has_morning?: boolean;
  has_afternoon?: boolean;
  has_night?: boolean;
  allows_private?: boolean;
  allows_open?: boolean;
  included_json?: { icon: string; text: string }[];
  faq_json?: { q: string; a: string }[];
  slug?: string;
  title_en?: string;
  title_es?: string;
  short_description_en?: string;
  short_description_es?: string;
  category_en?: string;
  category_es?: string;
  itinerary_json_en?: { time: string; description: string }[];
  itinerary_json_es?: { time: string; description: string }[];
  included_json_en?: { icon: string; text: string }[];
  included_json_es?: { icon: string; text: string }[];
  faq_json_en?: { q: string; a: string }[];
  faq_json_es?: { q: string; a: string }[];
  images_json?: string[];
  difficulty?: string;
  difficulty_en?: string;
  difficulty_es?: string;
  highlights_json?: { icon: string; text: string }[];
  highlights_json_en?: { icon: string; text: string }[];
  highlights_json_es?: { icon: string; text: string }[];
  meeting_point_address?: string;
  meeting_point_address_en?: string;
  meeting_point_address_es?: string;
  youtube_video_url?: string;
  external_url?: string;
  carousel_images_json?: string[];
  pricing_model?: 'fixed' | 'dynamic' | 'group' | 'custom' | 'tiered';
  price_1_person?: number;
  price_2_people?: number;
  price_3_6_people?: number;
  price_7_19_people?: number;
  available_days?: string[];
  use_custom_options?: boolean;
  custom_options_json?: { title: string; price: number; positive_notices: string[]; negative_notices: string[] }[];
  bares_diurnos?: string;
  bares_noturnos?: string;
  tiered_pricing_json?: PricingTier[];
};

export type LovablePage = {
  id: string;
  title: string;
  href: string;
  content?: string;
  is_visible: boolean;
  sort_order: number;
};

export type LovableSiteImage = {
  id: string;
  key: string;
  image_url: string;
  label: string;
};

export type LovableSocialMedia = {
  id: string;
  platform: string;
  url: string;
  icon_name: string;
  is_active: boolean;
  sort_order: number;
  show_in_header?: boolean;
};

export type LovableSale = {
  id: string;
  tour_id: string;
  tour_title: string;
  tour_slug: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  quantity: number;
  total_price: number;
  selected_date: string;
  selected_period: string;
  is_private: boolean;
  is_paid: boolean;
  is_cancelled?: boolean;
  is_archived?: boolean;
  passengers_json?: { name: string; dob: string }[];
  currency?: string;
  provider?: string;
  created_at: string;
};

export type LovableBlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  title_en?: string;
  title_es?: string;
  content_en?: string;
  content_es?: string;
  excerpt_en?: string;
  excerpt_es?: string;
};

export type LovableSiteSetting = {
  id: string;
  key: string;
  value: string;
  site_title_en?: string;
  site_title_es?: string;
  site_description_en?: string;
  site_description_es?: string;
};

export type LovableProfile = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export type LovableMatch = {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string;
  price: number;
  available_spots: number;
  sold_count: number;
  status: string;
  slug: string;
  high_demand?: boolean;
  stadium?: string;
  description_pt?: string;
  description_en?: string;
  description_es?: string;
  image_url?: string;
  competition?: string;
  home_team_logo?: string;
  away_team_logo?: string;
  includes_guide?: boolean;
  includes_ticket?: boolean;
  includes_transfer?: boolean;
  custom_options_json?: { title: string; price: number }[];
  price_premium?: number;
  included_json?: { text: string }[];
  not_included_json?: { text: string }[];
  bring_json?: { text: string }[];
  dont_bring_json?: { text: string }[];
  attention_json?: { text: string }[];
  not_suitable_json?: { text: string }[];
};

export interface SiteSettingsData {
  site_title?: string;
  site_description?: string;
  [key: string]: string | undefined;
}
