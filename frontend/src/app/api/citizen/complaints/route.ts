import { NextRequest, NextResponse } from "next/server";
import { supabase, type Complaint } from "@/lib/supabase";

// In-memory fallback store (used if Supabase tables don't exist yet)
const SOUTH_INDIA_SEED: Omit<Complaint, "id" | "created_at">[] = [
  { latitude: 13.0827, longitude: 80.2707, city: "Chennai", state: "Tamil Nadu", ward: "Mylapore", street: "Luz Church Road", category: "pothole", severity: "critical", description: "Large pothole causing accidents near Luz junction", image_url: "", lang: "ta-IN", elo_rating: 1180, votes_count: 12, is_resolved: false },
  { latitude: 12.9716, longitude: 77.5946, city: "Bengaluru", state: "Karnataka", ward: "Indiranagar", street: "100 Feet Road", category: "drainage", severity: "serious", description: "Clogged drain flooding footpath every rain", image_url: "", lang: "kn-IN", elo_rating: 1140, votes_count: 9, is_resolved: false },
  { latitude: 17.3850, longitude: 78.4867, city: "Hyderabad", state: "Telangana", ward: "Banjara Hills", street: "Road No 12", category: "garbage", severity: "serious", description: "Garbage dumped near residential area for 3 days", image_url: "", lang: "te-IN", elo_rating: 1110, votes_count: 7, is_resolved: false },
  { latitude: 10.8505, longitude: 76.2711, city: "Kozhikode", state: "Kerala", ward: "Beach Road", street: "SM Street", category: "streetlight", severity: "minor", description: "5 streetlights non-functional on SM Street", image_url: "", lang: "ml-IN", elo_rating: 1050, votes_count: 5, is_resolved: false },
  { latitude: 11.0168, longitude: 76.9558, city: "Coimbatore", state: "Tamil Nadu", ward: "RS Puram", street: "Avinashi Road", category: "road", severity: "critical", description: "Road completely broken after heavy rain — vehicles avoiding this route", image_url: "", lang: "ta-IN", elo_rating: 1200, votes_count: 15, is_resolved: false },
  { latitude: 15.3173, longitude: 75.7139, city: "Hubli", state: "Karnataka", ward: "Vidyanagar", street: "PB Road", category: "encroachment", severity: "minor", description: "Shop encroaching footpath near bus stand", image_url: "", lang: "kn-IN", elo_rating: 1020, votes_count: 4, is_resolved: false },
  { latitude: 16.5062, longitude: 80.6480, city: "Vijayawada", state: "Andhra Pradesh", ward: "Benz Circle", street: "MG Road", category: "water", severity: "serious", description: "No water supply for 48 hours in ward", image_url: "", lang: "te-IN", elo_rating: 1130, votes_count: 11, is_resolved: false },
  { latitude: 9.9312, longitude: 76.2673, city: "Kochi", state: "Kerala", ward: "Ernakulam", street: "MG Road", category: "pothole", severity: "minor", description: "Multiple small potholes near boat jetty", image_url: "", lang: "ml-IN", elo_rating: 1000, votes_count: 3, is_resolved: true, resolved_at: new Date(Date.now() - 86400000 * 3).toISOString() },
];

let memoryStore: Complaint[] = SOUTH_INDIA_SEED.map((c, i) => ({
  ...c,
  id: `seed-${i + 1}`,
  created_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
}));

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "all"; // today | week | all
  const resolved = searchParams.get("resolved"); // "true" | "false" | null

  let data: Complaint[] = memoryStore;

  // Try Supabase first
  try {
    let query = supabase.from("citizen_complaints").select("*").order("created_at", { ascending: false });
    if (filter === "today") query = query.gte("created_at", new Date(Date.now() - 86400000).toISOString());
    else if (filter === "week") query = query.gte("created_at", new Date(Date.now() - 86400000 * 7).toISOString());
    if (resolved !== null) query = query.eq("is_resolved", resolved === "true");

    const { data: sbData, error } = await query;
    if (!error && sbData && sbData.length > 0) {
      data = sbData as Complaint[];
    }
  } catch {
    // Fall through to memory store
  }

  // Apply filters to memory store if Supabase failed
  if (data === memoryStore) {
    const now = Date.now();
    if (filter === "today") data = data.filter(c => new Date(c.created_at).getTime() > now - 86400000);
    else if (filter === "week") data = data.filter(c => new Date(c.created_at).getTime() > now - 86400000 * 7);
    if (resolved !== null) data = data.filter(c => c.is_resolved === (resolved === "true"));
  }

  return NextResponse.json({ complaints: data, total: data.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    latitude, longitude, city, state, ward, street,
    category, severity, description, image_url, lang
  } = body;

  if (!latitude || !longitude || !category || !severity) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const newComplaint: Complaint = {
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    city: city || "Unknown",
    state: state || "Unknown",
    ward: ward || "",
    street: street || "",
    category,
    severity,
    description: description || "",
    image_url: image_url || "",
    lang: lang || "en-IN",
    elo_rating: 1000,
    votes_count: 0,
    is_resolved: false,
  };

  // Try Supabase
  try {
    const { data, error } = await supabase
      .from("citizen_complaints")
      .insert([{ ...newComplaint, id: undefined }])
      .select()
      .single();
    if (!error && data) {
      return NextResponse.json({ complaint: data }, { status: 201 });
    }
  } catch { /* fall through */ }

  // Memory store fallback
  memoryStore.unshift(newComplaint);
  return NextResponse.json({ complaint: newComplaint }, { status: 201 });
}
