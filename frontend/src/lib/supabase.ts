import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Complaint = {
  id: string;
  created_at: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  ward?: string;
  street?: string;
  category: string;
  severity: "minor" | "serious" | "critical";
  description?: string;
  image_url?: string;
  lang: string;
  elo_rating: number;
  votes_count: number;
  is_resolved: boolean;
  resolved_at?: string;
};
