# THADEN MATERIAL – Mitarbeiter-Login

Diese Version trennt die App von der Mitarbeiterverwaltung. GitHub Pages bleibt das Frontend; Supabase übernimmt Authentifizierung, Mitarbeiterdaten und Sicherheitsprotokoll.

## Einmalige Einrichtung
1. Supabase-Projekt anlegen.
2. `supabase/schema.sql` im SQL Editor ausführen.
3. Einen ersten Admin-Benutzer in Supabase Auth anlegen.
4. Die UUID des Admin-Benutzers in `supabase/bootstrap-admin.sql` einsetzen und ausführen.
5. Die Edge Functions unter `supabase/functions/` deployen. Sie brauchen serverseitig `SUPABASE_SERVICE_ROLE_KEY`; diesen Schlüssel niemals in `index.html` eintragen.
6. In `supabase-config.js` die Supabase Project URL und den Publishable Key eintragen.
7. Den Ordnerinhalt nach GitHub Pages hochladen.

Die Browser-App verwendet ausschließlich URL + Publishable Key. Supabase empfiehlt dafür RLS; geheime Service-/Secret-Keys dürfen nicht im Browser liegen.
