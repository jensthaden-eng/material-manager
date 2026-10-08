/* THADEN MATERIAL V128 – Supabase Login
   Dieses Script wird NACH dem bestehenden index.html-Script eingebunden. */
(async function(){
  const SUPABASE_URL="https://qspgaueygcmcxbkbscfn.supabase.co";
  const SUPABASE_KEY="sb_publishable_4C-rY5PdKl5yWv7wChEu_g_Mi9fbTBj";

  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
  function ensureSupabase(){
    return new Promise((resolve,reject)=>{
      if(window.supabase){resolve();return}
      const s=document.createElement("script");
      s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload=resolve;s.onerror=()=>reject(new Error("Supabase-Bibliothek konnte nicht geladen werden."));
      document.head.appendChild(s);
    });
  }
  await ensureSupabase();
  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  let authUnlocked=false, currentUser=null, currentProfile=null, employeeId="", entered="", busy=false;

  const lock=document.getElementById("lock");
  if(!lock)return;

  lock.innerHTML=`
    <div class="card pinbox">
      <h2 class="pin-title" id="v128Title">Wer nutzt die App?</h2>
      <div id="v128Chooser">
        <label for="v128Employee" style="text-align:left">Mitarbeiter</label>
        <select id="v128Employee"><option value="">Wird geladen …</option></select>
        <button class="primary" style="width:100%;margin-top:12px" id="v128Next">Weiter →</button>
      </div>
      <div id="v128Pin" style="display:none">
        <div id="v128Name" class="muted" style="margin-bottom:10px"></div>
        <div id="v128Dots" class="pin-dots">○ ○ ○ ○ ○ ○</div>
        <div id="v128Error" class="error"></div>
        <div class="numpad">
          ${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-n="${n}">${n}</button>`).join("")}
          <button class="ghost" id="v128Clear">⌫</button><button data-n="0">0</button><button class="primary" id="v128Ok">OK</button>
        </div>
        <button class="ghost" style="width:100%;margin-top:12px" id="v128Back">← Mitarbeiter wechseln</button>
      </div>
      <div id="v128Change" style="display:none">
        <div class="muted" style="margin-bottom:12px">Bitte lege deine persönliche PIN fest.</div>
        <label for="v128New1" style="text-align:left">Neue PIN (6 Ziffern)</label>
        <input id="v128New1" inputmode="numeric" autocomplete="new-password" maxlength="6" type="password" placeholder="••••••">
        <label for="v128New2" style="text-align:left">PIN wiederholen</label>
        <input id="v128New2" inputmode="numeric" autocomplete="new-password" maxlength="6" type="password" placeholder="••••••">
        <div id="v128ChangeError" class="error"></div>
        <button class="primary" style="width:100%;margin-top:12px" id="v128Save">PIN speichern →</button>
      </div>
    </div>`;

  const $=id=>document.getElementById(id);
  const dots=()=>{$("v128Dots").textContent=[0,1,2,3,4,5].map(i=>i<entered.length?"●":"○").join(" ")};
  const err=t=>{$("v128Error").textContent=t||""};

  // Überschreibt die bestehende show()-Funktion nur für den geschützten Startbildschirm.
  const oldShow=window.show;
  window.show=function(id){
    if(id==="home" && !authUnlocked)return;
    if(typeof oldShow==="function")oldShow(id);
  };

  function setBusy(v){busy=v;$("v128Ok").disabled=v}
  function choose(){
    employeeId=$("v128Employee").value;
    if(!employeeId){err("Bitte zuerst einen Mitarbeiter auswählen.");return}
    $("v128Name").textContent=$("v128Employee").selectedOptions[0]?.textContent||"";
    $("v128Title").textContent="PIN eingeben";
    $("v128Chooser").style.display="none";$("v128Pin").style.display="block";entered="";dots();err("");
  }
  $("v128Next").onclick=choose;
  $("v128Back").onclick=()=>{
    employeeId="";entered="";dots();err("");
    $("v128Pin").style.display="none";$("v128Change").style.display="none";$("v128Chooser").style.display="block";$("v128Title").textContent="Wer nutzt die App?";
  };
  document.querySelectorAll("#v128Pin [data-n]").forEach(b=>b.onclick=()=>{
    if(busy||entered.length>=6)return;
    entered+=b.dataset.n;dots();
    if(entered.length===6)setTimeout(login,180);
  });
  $("v128Clear").onclick=()=>{if(entered.length){entered=entered.slice(0,-1);dots()}};
  $("v128Ok").onclick=login;

  async function loadEmployees(){
    try{
      const {data,error}=await sb.functions.invoke("employee-public-list",{body:{}});
      if(error)throw error;
      const list=Array.isArray(data?.employees)?data.employees:[];
      $("v128Employee").innerHTML='<option value="">Bitte auswählen …</option>'+
        list.map(e=>`<option value="${esc(e.id)}">${esc(e.full_name)}</option>`).join("");
      if(!list.length)$("v128Employee").innerHTML='<option value="">Keine aktiven Mitarbeiter</option>';
    }catch(e){
      console.error(e);
      $("v128Employee").innerHTML='<option value="">Mitarbeiter konnten nicht geladen werden</option>';
      err("Mitarbeiterliste konnte nicht geladen werden.");
    }
  }

  async function login(){
    if(busy||entered.length!==6){if(entered.length!==6)err("Bitte 6 Ziffern eingeben.");return}
    setBusy(true);err("Anmeldung läuft …");
    try{
      const {data,error}=await sb.functions.invoke("employee-login",{body:{user_id:employeeId,pin:entered}});
      if(error||!data?.session)throw error||new Error("Anmeldung fehlgeschlagen.");
      const sessionResult=await sb.auth.setSession(data.session);
      if(sessionResult.error)throw sessionResult.error;
      currentUser=data.user||data.session.user;
      const {data:profile,error:pe}=await sb.from("profiles").select("id,full_name,role,must_change_pin,active").eq("id",currentUser.id).single();
      if(pe||!profile?.active)throw pe||new Error("Benutzer ist nicht aktiv.");
      currentProfile=profile;entered="";dots();err("");
      if(profile.must_change_pin){
        $("v128Pin").style.display="none";$("v128Change").style.display="block";$("v128Title").textContent="Persönliche PIN festlegen";
      }else{
        authUnlocked=true;
        setTimeout(()=>window.show("home"),200);
      }
    }catch(e){
      console.error(e);err("PIN oder Mitarbeiter ist falsch.");entered="";dots();
    }finally{setBusy(false)}
  }

  $("v128Save").onclick=async()=>{
    const a=$("v128New1").value.trim(),b=$("v128New2").value.trim();
    $("v128ChangeError").textContent="";
    if(!/^\d{6}$/.test(a)){ $("v128ChangeError").textContent="Bitte genau 6 Ziffern eingeben.";return }
    if(a!==b){$("v128ChangeError").textContent="Die PINs stimmen nicht überein.";return}
    try{
      const {error}=await sb.auth.updateUser({password:a}); if(error)throw error;
      const {error:pe}=await sb.from("profiles").update({must_change_pin:false}).eq("id",currentUser.id); if(pe)throw pe;
      await sb.from("security_events").insert({user_id:currentUser.id,event_type:"pin_changed",description:"Persönliche PIN bei der ersten Anmeldung geändert."});
      currentProfile.must_change_pin=false;authUnlocked=true;
      $("v128New1").value="";$("v128New2").value="";
      setTimeout(()=>window.show("home"),200);
    }catch(e){$("v128ChangeError").textContent=e.message||"PIN konnte nicht gespeichert werden."}
  };

  // PC-Tastatur
  document.addEventListener("keydown",e=>{
    if(!document.getElementById("lock")?.classList.contains("active")||authUnlocked)return;
    if(/^\d$/.test(e.key)&&$("v128Pin").style.display!=="none"){e.preventDefault();document.querySelector(`#v128Pin [data-n="${e.key}"]`)?.click()}
    if(e.key==="Backspace"&&$("v128Pin").style.display!=="none"){$("v128Clear").click()}
    if(e.key==="Enter"){$("v128Chooser").style.display!=="none"?choose():login()}
  });

  // Bestehende lokale PIN-Einstellungen werden nicht mehr verwendet.
  // Abmelden kann über die neue Funktion im Einstellungsbereich ergänzt werden.
  const session=await sb.auth.getSession();
  if(session.data?.session){
    currentUser=session.data.session.user;
    const {data:p}=await sb.from("profiles").select("id,full_name,role,must_change_pin,active").eq("id",currentUser.id).single();
    if(p?.active){
      currentProfile=p;
      if(p.must_change_pin){
        $("v128Chooser").style.display="none";$("v128Change").style.display="block";$("v128Title").textContent="Persönliche PIN festlegen";
      }else{authUnlocked=true;window.show("home");return}
    }
  }
  await loadEmployees();
})();