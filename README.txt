TROMMEL APP – PIN-LOGIN TESTPAKET

Dateien:
- supabase-pin-login.sql: zusätzliche Spalten für gehashte persönliche PINs
- employee-login-v2.ts: Edge Function für Ersteinrichtung, Login und PIN-Wechsel

WICHTIG: Dies ist noch keine fertige App-Version. Die bestehende index.html ist bewusst nicht ersetzt worden; die Frontend-Integration und End-to-End-Tests stehen noch aus.

Einrichtung:
1. Sichere den aktuellen Code der Edge Function employee-login.
2. Führe supabase-pin-login.sql im SQL Editor des richtigen Supabase-Projekts aus.
3. Ersetze den Code der Edge Function employee-login mit employee-login-v2.ts und deploye sie.
4. Prüfe Edge Function Secrets: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY.
5. Lege APP_START_PIN als Edge Function Secret mit einer vierstelligen Ziffernfolge an. Niemals Service-Role-Schlüssel in die App schreiben.
6. API-Aufrufe:
   Ersteinrichtung: {"action":"initialize","user_id":"PROFILE-ID","pin":"START-PIN","new_pin":"NEUE-PIN"}
   Login: {"user_id":"PROFILE-ID","pin":"PERSÖNLICHE-PIN"}
   PIN ändern: {"action":"change","user_id":"PROFILE-ID","pin":"AKTUELLE-PIN","new_pin":"NEUE-PIN"}

Sicherheitshinweis:
Vierstellige PINs haben nur 10.000 Möglichkeiten. Vor produktivem Einsatz sind Rate-Limiting/temporäre Sperren erforderlich. Diese Funktion prüft PINs, erstellt aber keine Supabase-Auth-Session. Datenzugriffe müssen weiterhin durch RLS geschützt bleiben.
