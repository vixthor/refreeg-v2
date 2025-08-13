import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { causeId, content, parentId } = await request.json();
  if (!causeId || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        cause_id: causeId,
        user_id: user.id,
        content,
        parent_id: parentId || null,
        is_edited: false
      })
      .select(`
        *,
        user:profiles(full_name, profile_photo)
      `)
      .single();

    if (error) throw error;
    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const causeId = searchParams.get("causeId");
  
  if (!causeId) return NextResponse.json({ error: "causeId required" }, { status: 400 });

  try {
    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        user:profiles(full_name, profile_photo),
        replies:comments(count)
      `)
      .eq("cause_id", causeId)
      .is("parent_id", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}