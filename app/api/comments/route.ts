import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { causeId, content, parentId, entityType } = await request.json();
  
  if (!causeId || !content || typeof content !== "string" || content.trim().length === 0 || content.length > 2000) {
    return NextResponse.json({ error: "Content must be provided and not exceed 2000 characters" }, { status: 400 });
  }

  try {
    const isPetition = entityType === "petition";
    const table = isPetition ? "petition_comments" : "comments";
    const idColumn = isPetition ? "petition_id" : "cause_id";

    const { data: comment, error } = await supabase
      .from(table)
      .insert({
        [idColumn]: causeId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId || null,
        is_edited: false,
      })
      .select(`
        *,
        user:profiles(id, full_name, profile_photo, username)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create comment" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const causeId = searchParams.get("causeId");
  const entityType = searchParams.get("entityType");

  if (!causeId)
    return NextResponse.json({ error: "causeId required" }, { status: 400 });

  try {
    const isPetition = entityType === "petition";
    const table = isPetition ? "petition_comments" : "comments";
    const idColumn = isPetition ? "petition_id" : "cause_id";

    const { data: comments, error } = await supabase
      .from(table)
      .select(`
        *,
        user:profiles(id, full_name, profile_photo, username)
      `)
      .eq(idColumn, causeId)
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
