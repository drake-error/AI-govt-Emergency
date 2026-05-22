import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { computeElo } from "@/lib/elo";

export async function POST(req: NextRequest) {
  const { worse_id, better_id } = await req.json();

  if (!worse_id || !better_id) {
    return NextResponse.json({ error: "Both complaint IDs required" }, { status: 400 });
  }

  try {
    // Fetch both complaints
    const { data: complaints, error: fetchErr } = await supabase
      .from("citizen_complaints")
      .select("id, elo_rating, votes_count")
      .in("id", [worse_id, better_id]);

    if (fetchErr || !complaints || complaints.length < 2) {
      // Memory store fallback: just return success
      return NextResponse.json({ success: true, mode: "memory" });
    }

    const worse = complaints.find((c) => c.id === worse_id)!;
    const better = complaints.find((c) => c.id === better_id)!;
    const { newWinner, newLoser } = computeElo(worse.elo_rating, better.elo_rating);

    // Update both records
    await Promise.all([
      supabase
        .from("citizen_complaints")
        .update({ elo_rating: newWinner, votes_count: worse.votes_count + 1 })
        .eq("id", worse_id),
      supabase
        .from("citizen_complaints")
        .update({ elo_rating: newLoser, votes_count: better.votes_count + 1 })
        .eq("id", better_id),
      supabase.from("citizen_votes").insert([{ worse_id, better_id }]),
    ]);

    return NextResponse.json({ success: true, newWorseElo: newWinner, newBetterElo: newLoser });
  } catch {
    return NextResponse.json({ success: true, mode: "fallback" });
  }
}
