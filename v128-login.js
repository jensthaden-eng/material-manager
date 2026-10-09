/* THADEN MATERIAL V128 – Supabase Mitarbeiter-Login
   Läuft als Ergänzung zur bestehenden v127 index.html.
   Keine Service-Role-/Secret-Key-Daten im Browser.
*/
(function () {
  const SUPABASE_URL = "https://qspgaueygcmcxbkbscfn.supabase.co";
  const SUPABASE_KEY = atob("c2JfcHVibGlzaGFibGVfNEMtclk1UGRLbDV5V3Y3d0NoRXVfZ19NaTlmYlRCag==");
  const state = {
    selectedEmployeeId: "",
    profile: null,
    authReady: false,
    entered: ""
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.supabase) return resolve();
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function css() {
    if (document.getElementById("tm-v128-login-css")) return;
    const s = document.createElement("style");
    s.id = "tm-v128-login-css";
    s.textContent = `
      .tm-login-kicker{display:inline-block;background:#101820;color:#fff;border-radius:999px;padding:7px 12px;font-size:11px;letter-spacing:2px;font-weight:900;margin-bottom:12px}
      .tm-login-who{color:#ff6b00;font-size:29px;margin:0 0 5px;text-shadow:0 1px 0 #fff}
      .tm-login-sub{margin:0 0 16px;color:#697680;font-size:14px}
      .tm-login-select,.tm-login-input{width:100%;padding:13px 14px;border:2px solid #d8dee3;border-radius:11px;font-size:17px;background:#fff}
      .tm-login-select:focus,.tm-login-input:focus{border-color:#ff6b00;outline:none;box-shadow:0 0 0 3px #ff6b0022}
      .tm-login-load{text-align:left;color:#697680;font-size:12px;margin:8px 2px 16px}
      .tm-login-error{color:#b00020;min-height:22px;margin:8px 0;font-weight:700}
      .tm-pin-label{display:block;font-weight:700;margin:12px 0 6px}
      .tm-force-card .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
      .tm-force-card .primary{background:#ff6b00;color:#fff}
    `;
    document.head.appendChild(s);
  }

  function replaceLock() {
    const lock = document.getElementById("lock");
    if (!lock) return;
    lock.innerHTML = `
      <div class="card pinbox">
        <div class="tm-login-kicker">THADEN MATERIAL</div>
        <h2 class="tm-login-who">Wer nutzt die App?</h2>
        <p class="tm-login-sub">Mitarbeiter auswählen und mit persönlicher PIN anmelden.</p>
        <label class="tm-pin-label" for="tmEmployeeSelect">Mitarbeiter</label>
        <select id="tmEmployeeSelect" class="tm-login-select">
          <option value="">Mitarbeiter wird geladen …</option>
        </select>
        <div id="tmEmployeeLoad" class="tm-login-load">Mitarbeiterliste wird geladen …</div>
        <h2 class="pin-title">PIN eingeben</h2>
        <div id="pinDots" class="pin-dots">○ ○ ○ ○</div>
        <div id="pinError" class="tm-login-error"></div>
        <div class="numpad">
          <button onclick="pin('1')">1</button><button onclick="pin('2')">2</button><button onclick="pin('3')">3</button>
          <button onclick="pin('4')">4</button><button onclick="pin('5')">5</button><button onclick="pin('6')">6</button>
          <button onclick="pin('7')">7</button><button onclick="pin('8')">8</button><button onclick="pin('9')">9</button>
          <button class="ghost" onclick="pinClear()">⌫</button><button onclick="pin('0')">0</button><button class="primary" onclick="pinOk()">OK</button>
        </div>
      </div>`;
    document.getElementById("tmEmployeeSelect").addEventListener("change", function () {
      state.selectedEmployeeId = this.value;
      state.entered = "";
      updateDots();
      const e = document.getElementById("pinError");
      if (e) e.textContent = "";
    });
  }

  function addForcePinScreen() {
    if (document.getElementById("tmForcePin")) return;
    const sec = document.createElement("section");
    sec.id = "tmForcePin";
    sec.className = "screen";
    sec.innerHTML = `
      <div class="card pinbox tm-force-card">
        <div class="tm-login-kicker">ERSTE ANMELDUNG</div>
        <h2 class="tm-login-who">Persönliche PIN festlegen</h2>
        <p class="tm-login-sub">Bitte die Start-PIN durch deine persönliche 4-stellige PIN ersetzen.</p>
        <label class="tm-pin-label" for="tmFirstPin">Neue PIN</label>
        <input id="tmFirstPin" class="tm-login-input" inputmode="numeric" autocomplete="new-password" maxlength="4" type="password" placeholder="4 Ziffern">
        <label class="tm-pin-label" for="tmFirstPin2">PIN wiederholen</label>
        <input id="tmFirstPin2" class="tm-login-input" inputmode="numeric" autocomplete="new-password" maxlength="4" type="password" placeholder="4 Ziffern">
        <div id="tmFirstPinError" class="tm-login-error"></div>
        <div class="actions"><button class="primary" onclick="tmFinishFirstPin()">PIN speichern & weiter</button></div>
      </div>`;
    document.querySelector(".wrap").insertBefore(sec, document.getElementById("home"));
  }

  function updateDots() {
    const d = document.getElementById("pinDots");
    if (d) d.textContent = [0,1,2,3].map(i => i < state.entered.length ? "●" : "○").join(" ");
  }

  window.pin = function (x) {
    if (state.entered.length >= 4) return;
    state.entered += String(x);
    updateDots();
    if (state.entered.length === 4) setTimeout(window.pinOk, 180);
  };

  window.pinClear = function () {
    state.entered = state.entered.slice(0, -1);
    updateDots();
  };

  window.pinOk = async function () {
    const err = document.getElementById("pinError");
    if (!state.selectedEmployeeId) {
      if (err) err.textContent = "Bitte zuerst einen Mitarbeiter auswählen.";
      return;
    }
    if (state.entered.length !== 4) {
      if (err) err.textContent = "Bitte 4 Ziffern eingeben.";
      return;
    }
    if (err) err.textContent = "Anmeldung wird geprüft …";
    try {
      const { data, error } = await window.tmSupabase.functions.invoke("employee-login", {
        body: { user_id: state.selectedEmployeeId, pin: state.entered }
      });
      if (error || !data || !data.session) throw new Error("login");
      const { error: sessionError } = await window.tmSupabase.auth.setSession(data.session);
      if (sessionError) throw sessionError;
      const { data: profile, error: profileError } = await window.tmSupabase
        .from("profiles")
        .select("id,full_name,role,must_change_pin,active")
        .eq("id", state.selectedEmployeeId)
        .single();
      if (profileError || !profile || !profile.active) throw new Error("profile");
      state.profile = profile;
      state.authReady = true;
      state.entered = "";
      updateDots();
      if (profile.must_change_pin) {
        document.querySelectorAll(".screen").forEach(x => x.classList.remove("active"));
        document.getElementById("tmForcePin").classList.add("active");
        window.scrollTo(0,0);
      } else {
        unlocked = true;
        show("home");
      }
    } catch (e) {
      console.error(e);
      state.entered = "";
      updateDots();
      if (err) err.textContent = "Falsche PIN";
    }
  };

  window.tmFinishFirstPin = async function () {
    const p = document.getElementById("tmFirstPin").value.trim();
    const q = document.getElementById("tmFirstPin2").value.trim();
    const err = document.getElementById("tmFirstPinError");
    if (!/^\d{4}$/.test(p)) { err.textContent = "Bitte genau 4 Ziffern eingeben."; return; }
    if (p !== q) { err.textContent = "Die PINs stimmen nicht überein."; return; }
    try {
      const { error } = await window.tmSupabase.auth.updateUser({ password: p });
      if (error) throw error;
      const id = state.profile.id;
      const { error: pe } = await window.tmSupabase.from("profiles").update({ must_change_pin:false }).eq("id", id);
      if (pe) throw pe;
      await window.tmSupabase.from("security_events").insert({
        user_id:id,
        event_type:"pin_changed",
        description:"Start-PIN wurde durch persönliche PIN ersetzt."
      });
      state.profile.must_change_pin = false;
      err.textContent = "";
      document.getElementById("tmFirstPin").value = "";
      document.getElementById("tmFirstPin2").value = "";
      unlocked = true;
      show("home");
    } catch (e) {
      console.error(e);
      err.textContent = "PIN konnte nicht gespeichert werden.";
    }
  };

  async function loadEmployees() {
    const select = document.getElementById("tmEmployeeSelect");
    const msg = document.getElementById("tmEmployeeLoad");
    try {
      const { data, error } = await window.tmSupabase.functions.invoke("employee-list", { body: {} });
      if (error || !data || !Array.isArray(data.employees)) throw new Error("list");
      const employees = data.employees.filter(x => x && x.id);
      if (!employees.length) {
        select.innerHTML = '<option value="">Keine aktiven Mitarbeiter</option>';
        state.selectedEmployeeId = "";
        msg.textContent = "Noch keine aktiven Mitarbeiter vorhanden.";
        return;
      }
      if (employees.length === 1) {
        // Bei genau einem Mitarbeiter keinen Platzhalter anzeigen: iOS Safari
        // lässt sonst gelegentlich den Platzhalter optisch ausgewählt.
        const employee = employees[0];
        select.innerHTML = '';
        const option = document.createElement("option");
        option.value = String(employee.id);
        option.textContent = employee.full_name || "Mitarbeiter";
        select.appendChild(option);
        select.selectedIndex = 0;
        select.value = String(employee.id);
        state.selectedEmployeeId = String(employee.id);
        msg.textContent = "Angemeldet als Auswahl: " + (employee.full_name || "Mitarbeiter") + ".";
      } else {
        select.innerHTML = '<option value="">Bitte auswählen …</option>' +
          employees.map(x => '<option value="' + escapeHtml(String(x.id)) + '">' + escapeHtml(x.full_name || "Mitarbeiter") + '</option>').join("");
        state.selectedEmployeeId = "";
        msg.textContent = employees.length + " Mitarbeiter verfügbar.";
      }
    } catch (e) {
      console.error(e);
      msg.textContent = "Mitarbeiterliste konnte nicht geladen werden.";
    }
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  async function restoreSession() {
    try {
      const { data } = await window.tmSupabase.auth.getSession();
      if (!data || !data.session) return;
      const uid = data.session.user.id;
      const { data: profile } = await window.tmSupabase.from("profiles")
        .select("id,full_name,role,must_change_pin,active").eq("id", uid).single();
      if (!profile || !profile.active) return;
      state.profile = profile;
      state.selectedEmployeeId = uid;
      state.authReady = true;
      unlocked = true;
      if (profile.must_change_pin) {
        document.querySelectorAll(".screen").forEach(x => x.classList.remove("active"));
        document.getElementById("tmForcePin").classList.add("active");
      } else {
        show("home");
      }
    } catch (e) { console.warn("Session restore:", e); }
  }

  window.tmChangePin = async function () {
    const input = document.getElementById("newPin");
    if (!input) return;
    const p = input.value.trim();
    if (!/^\d{4}$/.test(p)) { alert("Bitte genau 4 Ziffern eingeben."); return; }
    try {
      const { error } = await window.tmSupabase.auth.updateUser({ password:p });
      if (error) throw error;
      await window.tmSupabase.from("profiles").update({must_change_pin:false}).eq("id", state.profile?.id || "");
      await window.tmSupabase.from("security_events").insert({
        user_id:state.profile?.id,event_type:"pin_changed",description:"Persönliche PIN geändert."
      });
      input.value = "";
      alert("PIN gespeichert.");
    } catch (e) { alert("PIN konnte nicht gespeichert werden."); }
  };

  async function init() {
    css();
    await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
    window.tmSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    replaceLock();
    addForcePinScreen();
    const oldChange = window.changePin;
    window.changePin = window.tmChangePin;
    await loadEmployees();
    await restoreSession();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
