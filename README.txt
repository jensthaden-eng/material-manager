THADEN MATERIAL – V128 Login-Paket

Dieses Paket enthält:
1. v128-login.js
   - neue Anmeldung „Wer nutzt die App?“
   - Mitarbeiterauswahl
   - 6-stellige PIN
   - erste Anmeldung erzwingt persönliche PIN
   - Supabase Auth + security_events
   - v127 Materialverwaltung bleibt unangetastet

2. supabase/functions/employee-public-list/index.ts
   - liefert nur aktive Mitarbeiter (ID + Name)

3. supabase/functions/employee-login/index.ts
   - authentifiziert die ausgewählte Person über Supabase Auth
   - benötigt keinen Service-Role-Key im Browser

WICHTIG:
- Die vorhandene index.html wird absichtlich NICHT komplett ersetzt.
- Zuerst die beiden Edge Functions in Supabase anlegen und deployen.
- Danach v128-login.js in den GitHub-Root hochladen.
- Anschließend in index.html direkt vor </body> diese Zeile einfügen:
  <script src="./v128-login.js"></script>

Die bestehende v127 bleibt damit als Sicherheitsnetz erhalten.
