import { cache } from "react";
import { createClient } from "./server";

export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
});
