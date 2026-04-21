import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const {
      action,
      referrer_id,
      referee_email,
      referee_id,
      utm_source,
      utm_medium,
      utm_campaign,
    } = await req.json();

    if (action === "create") {
      const { data, error } = await supabaseClient
        .from("referrals_v1")
        .insert({
          referrer_id_v1: referrer_id,
          referee_email_v1: referee_email,
          registered_v1: false,
          utm_source_v1: utm_source,
          utm_medium_v1: utm_medium,
          utm_campaign_v1: utm_campaign,
        })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "complete") {
      let query = supabaseClient
        .from("referrals_v1")
        .update({
          registered_v1: true,
          referee_id_v1: referee_id,
          reward_v1: "5_pts_v1",
        })
        .eq("referee_email_v1", referee_email)
        .eq("registered_v1", false);

      if (referrer_id) {
        query = query.eq("referrer_id_v1", referrer_id);
      }

      const { data, error } = await query.select();

      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
