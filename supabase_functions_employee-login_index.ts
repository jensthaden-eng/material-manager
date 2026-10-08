import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { user_id, pin } = await req.json();

    if (!user_id || !/^\d{6}$/.test(String(pin ?? ""))) {
      return new Response(JSON.stringify({ error: "Ungültige Anmeldung." }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile, error: pe } = await admin
      .from("profiles")
      .select("id,active")
      .eq("id", user_id)
      .single();

    if (pe || !profile?.active) {
      return new Response(JSON.stringify({ error: "Ungültige Anmeldung." }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    // Die E-Mail des Auth-Benutzers wird serverseitig ermittelt.
    let email = "";
    let page = 1;
    while (!email) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      const u = data.users.find(x => x.id === user_id);
      if (u?.email) email = u.email;
      if (data.users.length < 1000) break;
      page++;
    }

    if (!email) {
      return new Response(JSON.stringify({ error: "Ungültige Anmeldung." }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    const publicClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data:login, error:le } = await publicClient.auth.signInWithPassword({
      email,
      password: String(pin)
    });

    if (le || !login.session) {
      return new Response(JSON.stringify({ error: "Ungültige Anmeldung." }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      session: login.session,
      user: login.user
    }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Anmeldung fehlgeschlagen." }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});