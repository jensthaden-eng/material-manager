-- Nach dem Anlegen des ersten Admin-Benutzers im Supabase Auth-Bereich ausführen.
-- UUID des Admin-Auth-Benutzers einsetzen.
insert into public.employees(auth_user_id,name,login_email,role,must_change_password)
values ('DEINE-ADMIN-UUID','Admin','admin@thaden-material.local','admin',false);
