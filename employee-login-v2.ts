import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const reply=(v:unknown,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{...cors,"Content-Type":"application/json"}});
const enc=(x:Uint8Array)=>btoa(String.fromCharCode(...x));
const dec=(x:string)=>Uint8Array.from(atob(x),c=>c.charCodeAt(0));
async function hash(pin:string,salt:Uint8Array){const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(pin),"PBKDF2",false,["deriveBits"]);return new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:210000,hash:"SHA-256"},k,256))}
function same(a:Uint8Array,b:Uint8Array){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a[i]^b[i];return d===0}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return reply({error:"Method not allowed"},405);
 const url=Deno.env.get("SUPABASE_URL"), key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!key)return reply({error:"Serverkonfiguration fehlt."},500);
 let b:any;try{b=await req.json()}catch{return reply({error:"Ungültige Anfrage."},400)}
 if(typeof b.user_id!=="string"||!/^\d{4}$/.test(b.pin??""))return reply({error:"Mitarbeiter und vierstellige PIN prüfen."},400);
 const db=createClient(url,key,{auth:{persistSession:false}});
 const {data:p,error}=await db.from("profiles").select("id,full_name,role,active,pin_hash,pin_salt,pin_initialized").eq("id",b.user_id).maybeSingle();
 if(error||!p||p.active===false)return reply({error:"Ungültige Anmeldung."},401);
 if(b.action==="initialize"){
  const start=Deno.env.get("APP_START_PIN");
  if(!start||!/^\d{4}$/.test(start))return reply({error:"Start-PIN ist serverseitig nicht eingerichtet."},500);
  if(p.pin_initialized)return reply({error:"Persönliche PIN ist bereits eingerichtet."},409);
  if(b.pin!==start)return reply({error:"Start-PIN ist falsch."},401);
  if(!/^\d{4}$/.test(b.new_pin??""))return reply({error:"Neue PIN muss vier Ziffern haben."},400);
  const salt=crypto.getRandomValues(new Uint8Array(16)), h=await hash(b.new_pin,salt);
  const {error:e}=await db.from("profiles").update({pin_hash:enc(h),pin_salt:enc(salt),pin_initialized:true,must_change_pin:false}).eq("id",b.user_id);
  if(e)return reply({error:"PIN konnte nicht gespeichert werden."},500);
  return reply({ok:true,message:"Persönliche PIN eingerichtet."});
 }
 if(b.action==="change"){
  if(!p.pin_initialized||!p.pin_hash||!p.pin_salt)return reply({error:"Bitte zuerst persönliche PIN einrichten."},409);
  if(!same(await hash(b.pin,dec(p.pin_salt)),dec(p.pin_hash)))return reply({error:"Aktuelle PIN ist falsch."},401);
  if(!/^\d{4}$/.test(b.new_pin??""))return reply({error:"Neue PIN muss vier Ziffern haben."},400);
  const salt=crypto.getRandomValues(new Uint8Array(16)), h=await hash(b.new_pin,salt);
  const {error:e}=await db.from("profiles").update({pin_hash:enc(h),pin_salt:enc(salt)}).eq("id",b.user_id);
  if(e)return reply({error:"PIN konnte nicht geändert werden."},500);
  return reply({ok:true,message:"PIN geändert."});
 }
 if(!p.pin_initialized||!p.pin_hash||!p.pin_salt)return reply({error:"Bitte zuerst mit dem Start-PIN eine persönliche PIN einrichten.",needs_setup:true},409);
 if(!same(await hash(b.pin,dec(p.pin_salt)),dec(p.pin_hash)))return reply({error:"Ungültige Anmeldung."},401);
 return reply({ok:true,user:{id:p.id,full_name:p.full_name,role:p.role}});
});