export type BrandFormData = {
  name: string;
  domain: string;
  keywords: string[];
  logo_url: string;
};

export type FieldErrors = {
  name?: string;
  domain?: string;
  logo_url?: string;
};

export type StatusState = "idle" | "loading" | "saving" | "success" | "error";

export type Brand = {
  id: string;
  name: string;
  domain?: string;
  keywords?: string[];
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
};

export type UserBrand = {
  id: string;
  user_id: string;
  brand_id: string;
  role: "OWNER" | "MEMBER";
  created_at?: string;
};
