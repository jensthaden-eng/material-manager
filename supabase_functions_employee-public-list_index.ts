import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data, error } = await supabase
      .from("profiles")
      .select("id,full_name")
      .eq("active", true)
      .order("full_name");
    if (error) throw error;
    return new Response(JSON.stringify({ employees: data ?? [] }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Mitarbeiterliste konnte nicht geladen werden." }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});