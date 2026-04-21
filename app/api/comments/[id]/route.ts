import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Comment } from "@/types/common-types";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: commentId } = params;
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPetition = entityType === "petition";
    const table = isPetition ? "petition_comments" : "comments";

    const { data: comment, error: fetchError } = await supabase
      .from(table)
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this comment" },
        { status: 403 }
      );
    }

    // Explicit child deletion was removed here since it only goes one level deep.
    // Ensure ON DELETE CASCADE is set up on your Database tables!
    // -> ALTER TABLE comments ADD CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE;
    
    const { error } = await supabase.from(table).delete().eq("id", commentId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: commentId } = params;
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || typeof content !== "string" || content.trim().length === 0 || content.length > 2000) {
      return NextResponse.json(
        { error: "Content must be provided and not exceed 2000 characters" },
        { status: 400 }
      );
    }

    const isPetition = entityType === "petition";
    const table = isPetition ? "petition_comments" : "comments";

    const { data: comment, error: fetchError } = await supabase
      .from(table)
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to edit this comment" },
        { status: 403 }
      );
    }

    const { data: updatedComment, error } = await supabase
      .from(table)
      .update({
        content: content.trim(),
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .select(`*, user:profiles(id, full_name, profile_photo, username)`)
      .single();

    if (error) throw error;

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}
