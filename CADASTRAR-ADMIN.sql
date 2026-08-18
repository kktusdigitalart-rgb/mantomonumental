-- Depois de criar o usuário administrador no Supabase Authentication > Users,
-- substitua o texto abaixo pelo UUID real do usuário e execute no SQL Editor.

insert into public.manto_admins (user_id)
values ('COLE-O-UUID-DO-USUARIO-AQUI')
on conflict (user_id) do nothing;
