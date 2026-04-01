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
      .select(`
        *,
        user:profiles(id, full_name, profile_photo, username)
      `)
      .eq("parent_id", parentId)
      .order("created_at", { ascending: true })
      .limit(100); // Standard pagination limit

    if (error) throw error;

    if (!replies || replies.length === 0) {
      return NextResponse.json([]);
    }

    // Fix N+1 Query: Fetch all replies to these replies in one single query
    const replyIds = replies.map((r) => r.id);
    
    // Check if any of these replies have their own replies
    const { data: nestedReplies, error: nestedError } = await supabase
      .from(table)
      .select("parent_id")
      .in("parent_id", replyIds);

    if (nestedError) throw nestedError;

    // Build a map of counts
    const countsMap = (nestedReplies || []).reduce((acc: Record<string, number>, curr) => {
      const pId = curr.parent_id as string;
      acc[pId] = (acc[pId] || 0) + 1;
      return acc;
    }, {});

    const repliesWithCounts = replies.map((reply) => ({
      ...reply,
      replies_count: countsMap[reply.id] || 0,
    }));

    return NextResponse.json(repliesWithCounts);
  } catch (error) {
    console.error("Failed to fetch replies:", error);
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 }
    );
  }
}
