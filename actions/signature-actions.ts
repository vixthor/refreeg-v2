"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Signature,
  SignatureWithPetition,
  SignatureFormData,
} from "@/types";
import { sendPetitionGoalReachedEmail } from "@/services/mail";

/**
 * Check if a user has already signed a petition
 * @param petitionId - The ID of the petition to check
 * @param userId - The ID of the user to check
 */
export async function checkUserSignature(
  petitionId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("signatures")
    .select("id")
    .eq("petition_id", petitionId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No signature found
      return false;
    }
    console.error("Error checking user signature:", error);
    return false;
  }

  return !!data; // Return true if signature exists
}

/**
 * Create a new signature for a petition
 * Note: Signatures can continue even after the petition goal is reached.
 * There are no restrictions based on the number of signatures vs goal.
 * @param petitionId - The ID of the petition to sign
 */
export async function createSignature(
  petitionId: string,
  userId: string | null,
  signatureData: SignatureFormData
): Promise<Signature> {
  const supabase = await createClient();

  // If user is logged in, check if they've already signed
  if (userId) {
    const hasSigned = await checkUserSignature(petitionId, userId);
    if (hasSigned) {
      throw new Error("You have already signed this petition");
    }
  }

  // Ensure a user (by name and email) signs only once
  const { count: existingCount, error: existingError } = await supabase
    .from("signatures")
    .select("id", { count: "exact", head: true })
    .eq("petition_id", petitionId)
    .eq("email", signatureData.email)
    .eq("name", signatureData.name);

  if (existingError) {
    console.error("Error checking existing signature:", existingError);
  }
  if ((existingCount || 0) > 0) {
    throw new Error(
      "A signature with this name and email has already been recorded for this petition."
    );
  }

  const { data, error } = await supabase
    .from("signatures")
    .insert({
      petition_id: petitionId,
      ...(userId ? { user_id: userId } : {}),
      amount:
        signatureData?.amount === undefined || signatureData?.amount === null
          ? 1
          : typeof signatureData.amount === "string"
          ? Number.parseFloat(signatureData.amount)
          : signatureData.amount,
      name:
        String(signatureData.isAnonymous).toLocaleLowerCase() === "true"
          ? "Anonymous"
          : signatureData.name,
      email: signatureData.email,
      message: signatureData.message || null,
      is_anonymous: signatureData.isAnonymous,
      status: "completed", // For now, all signatures are immediately completed
    })
    .select()
    .single();

  if (error) {
    // Handle unique violation (user already signed) gracefully
    if ((error as any)?.code === "23505") {
      throw new Error("You have already signed this petition");
    }
    console.error("Error creating signature:", error);
    throw error;
  }

  revalidatePath(`/petitions/${petitionId}`);
  revalidatePath("/petitions");
  revalidatePath("/");
  if (userId) {
    revalidatePath("/dashboard/signatures");
  }

  // Check if this signature caused the petition to reach its goal
  await checkAndSendPetitionGoalReachedEmail(petitionId);

  return data as Signature;
}

/**
 * Check if a petition has reached its goal and send notification if so
 * @param petitionId - The ID of the petition to check
 */
async function checkAndSendPetitionGoalReachedEmail(petitionId: string) {
  const supabase = await createClient();

  // Get the petition details including goal
  const { data: petition, error: petitionError } = await supabase
    .from("petitions")
    .select("id, goal, user_id")
    .eq("id", petitionId)
    .single();

  if (petitionError) {
    console.error("Error fetching petition for goal check:", petitionError);
    return;
  }

  if (!petition) {
    console.warn("Petition not found for goal check");
    return;
  }

  // Get the total signatures amount for this petition
  const { data: signatures, error: signaturesError } = await supabase
    .from("signatures")
    .select("amount")
    .eq("petition_id", petitionId);

  if (signaturesError) {
    console.error("Error fetching signatures for goal check:", signaturesError);
    return;
  }

  // Calculate total amount
  const totalAmount = signatures.reduce(
    (sum, sig) => sum + (sig.amount || 0),
    0
  );

  // Check if goal is reached (only if goal is defined and greater than 0)
  if (petition.goal && petition.goal > 0 && totalAmount >= petition.goal) {
    // Get creator's email
    const { data: creatorProfile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", petition.user_id)
      .single();

    if (profileError) {
      console.error("Error fetching creator profile:", profileError);
      return;
    }

    if (creatorProfile?.email && creatorProfile?.full_name) {
      try {
        const { data: petitionWithTitle } = await supabase
          .from("petitions")
          .select("title")
          .eq("id", petitionId)
          .single();

        const petitionTitle = petitionWithTitle?.title || "Your Petition";
        const petitionUrl = `${
          process.env.NEXT_PUBLIC_APP_URL || "https://www.refreeg.com"
        }/petitions/${petitionId}`;

        await sendPetitionGoalReachedEmail(
          creatorProfile.email,
          creatorProfile.full_name,
          petitionTitle,
          petitionUrl,
          totalAmount,
          petition.goal
        );
        console.log(
          `Petition goal reached notification sent to creator for petition ${petitionId}`
        );
      } catch (emailError) {
        console.error(
          "Failed to send petition goal reached email:",
          emailError
        );
      }
    }
  }
}

/**
 * List signatures for a petition
 * @param petitionId - The ID of the petition to list signatures for
 */
export async function listSignaturesForPetition(
  petitionId: string
): Promise<Signature[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("signatures")
    .select("*")
    .eq("petition_id", petitionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error listing signatures:", error);
    throw error;
  }

  return data as Signature[];
}

/**
 * List signatures for a user
 * @param userId - The ID of the user to list signatures for
 */
export async function listUserSignatures(
  userId: string,
  timeframe: "all" | "recent" = "all"
): Promise<SignatureWithPetition[]> {
  const supabase = await createClient();

  let query = supabase
    .from("signatures")
    .select(
      `
      *,
      petitions:petition_id (
        title,
        category
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (timeframe === "recent") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query = query.gte("created_at", thirtyDaysAgo.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing user signatures:", error);
    throw error;
  }
  return data.map((item) => ({
    ...item,
    petition: {
      title: item.petitions?.title || "Unknown Petition",
      category: item.petitions?.category || "Unknown",
    },
  })) as SignatureWithPetition[];
}
