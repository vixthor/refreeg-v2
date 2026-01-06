import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get("parentId");
  const entityType = searchParams.get("entityType");

  if (!parentId) {
    return NextResponse.json({ error: "parentId required" }, { status: 400 });
  }

  try {
    const isPetition = entityType === "petition";
    const table = isPetition ? "petition_comments" : "comments";

    const { data: replies, error } = await supabase
      .from(table)
      .select(`*, user:profiles(full_name, profile_photo, username)`)
      .eq("parent_id", parentId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const repliesWithCounts = await Promise.all(
      (replies || []).map(async (reply) => {
        const { count } = await supabase
          .from(table)
          .select("*", { count: "exact" })
          .eq("parent_id", reply.id);

        return {
          ...reply,
          replies_count: count || 0,
        };
      })
    );

    return NextResponse.json(repliesWithCounts);
  } catch (error) {
    console.error("Failed to fetch replies:", error);
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 }
    );
  }
}
