import { createClient } from 'npm:@supabase/supabase-js@2';
export const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'};
export function adminClient(){ return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {auth:{autoRefreshToken:false,persistSession:false}}); }
export async function requireAdmin(req:Request){
  const token=(req.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');
  if(!token) throw new Error('Nicht angemeldet.');
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {global:{headers:{Authorization:`Bearer ${token}`}}});
  const {data:{user},error}=await userClient.auth.getUser(); if(error||!user) throw new Error('Nicht angemeldet.');
  const admin=adminClient(); const {data:profile}=await admin.from('employees').select('role').eq('auth_user_id',user.id).maybeSingle();
  if(profile?.role!=='admin') throw new Error('Admin-Rechte erforderlich.');
  return {admin,user};
}
