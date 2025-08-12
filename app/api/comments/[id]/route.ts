import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Comment } from "@/types/common-types";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First await the params
    const { id: commentId } = params;
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify comment ownership
    const { data: comment, error: checkError } = await supabase
      .from("comments")
      .select("user_id")
      .eq('id', commentId)
      .single();

    if (checkError) throw checkError;
    if (comment.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this comment" },
        { status: 403 }
      );
    }

    // Delete all replies first
    await supabase
      .from("comments")
      .delete()
      .eq('parent_id', commentId);

    // Then delete the comment
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
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
    // First await the params
    const { id: commentId } = params;
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const { data: updatedComment, error } = await supabase
      .from("comments")
      .update({
        content,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', user.id)
      .select(`
        *,
        user:profiles(full_name, profile_photo)
      `)
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