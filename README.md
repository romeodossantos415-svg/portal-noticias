# Portal de Notícias — CMS próprio (Next.js + Supabase)

Portal jornalístico completo com site público responsivo e painel administrativo em `/admin`, banco de dados Postgres (Supabase), autenticação, RBAC verificado no servidor, agendamento, histórico de versões, biblioteca de mídia com otimização, destaques por arrastar-e-soltar, menus/categorias/páginas dinâmicos, personalização visual, publicidade, colunistas, vídeos/podcasts, página de links, SEO (sitemap, RSS, JSON-LD NewsArticle, Open Graph).

Manual do proprietário: [`docs/MANUAL-DO-PROPRIETARIO.md`](docs/MANUAL-DO-PROPRIETARIO.md).

## Arquitetura

| Camada | Tecnologia |
|---|---|
| Frontend / SSR | Next.js 16 (App Router, Server Components, Server Actions), Tailwind CSS 4 |
| Banco de dados | Supabase Postgres (projeto `portal-noticias`, região São Paulo) |
| Autenticação | Supabase Auth (e-mail/senha, convite por e-mail, recuperação de senha) |
| Autorização | RBAC: papéis + permissões por usuário (+ escopo por categoria), aplicado por **Row Level Security** no Postgres e re-verificado nas Server Actions |
| Arquivos | Supabase Storage (bucket `media`), otimização com `sharp` (WebP, máx. 2000 px) |
| Agendamento | `pg_cron` (a cada minuto) publica matérias agendadas |
| Editor | TipTap (negrito, títulos, listas, citações, links, imagens, YouTube) |
| Cache | ISR (60 s) + `revalidatePath` após cada ação administrativa |

Esquema: 20 tabelas em `public` (profiles, permissions, role_permissions, user_permissions, categories, columnists, media, media_folders, articles, article_versions, tags, article_tags, featured_slots, featured_items, pages, menus, menu_items, site_settings, shows, episodes, ads, link_buttons, activity_log). Migrations aplicadas no projeto Supabase (ver histórico em Database → Migrations).

## Rodando localmente

```bash
npm install
cp .env.local.example .env.local   # preencha as variáveis
npm run dev
```

Variáveis de ambiente:

| Variável | Onde obter |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem (chave `anon`) |
| `SUPABASE_SERVICE_ROLE_KEY` | idem (chave `service_role`) — **somente servidor**; necessária para criar/convidar/excluir usuários pelo painel |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (ex.: `https://seudominio.com.br`) |

## Deploy (Vercel recomendado)

1. Importe este repositório na Vercel.
2. Configure as 4 variáveis acima.
3. Em Supabase → Authentication → URL Configuration, defina **Site URL** = URL do site e adicione em **Redirect URLs**: `https://seudominio.com.br/admin/redefinir` e `https://seudominio.com.br/admin/auth/callback`.
4. (Opcional) Supabase → Authentication → Providers → Email: ative *Leaked password protection*.
5. Aponte o domínio na Vercel.

## Primeiro acesso

O **primeiro usuário** criado no Auth vira automaticamente **Administrador master** (trigger `handle_new_user`). Já existe um master criado para `romeodossantos415@gmail.com`; troque a senha em **Meu perfil** ou via "Esqueci minha senha".

## Segurança

- Senhas com hash (bcrypt) pelo Supabase Auth; cookies HttpOnly; proxy protege `/admin`.
- Toda tabela tem RLS. Permissões verificadas por `has_permission(perm, categoria)` no banco **e** nas Server Actions.
- Limite de tentativas de login (5 em 15 min por IP+e-mail) + rate limit do Supabase.
- Registro de atividades (`activity_log`) com quem/o quê/quando.
- Revogação de sessões e bloqueio de contas pelo painel.
- 2FA: pode ser ativado no Supabase Auth (MFA/TOTP); a UI de inscrição não está incluída nesta versão.

## Testes realizados

Testes de autorização executados diretamente no banco com os claims JWT de cada perfil (o mesmo caminho que a aplicação usa):

- Jornalista cria rascunho ✔ · não consegue publicar ✔ · envia para revisão ✔
- Colaborador não edita matéria de outro ✔
- Editor publica/aprova ✔ · define destaques ✔ · não altera perfis de usuário ✔ · não vê log ✔
- Permissão personalizada "publicar somente em Política" ✔ (bloqueado em Economia ✔)
- Anônimo lê publicadas ✔ · não vê rascunhos ✔ · não insere ✔
- Histórico de versões automático ✔ · agendamento + cron ✔ · busca full-text ✔ · master acesso total ✔
- `next build` de produção ✔ · `tsc` sem erros ✔

## Dependências externas / configuração adicional

- **Supabase** (plano gratuito ok para começar; backups automáticos diários a partir do plano Pro).
- **Vercel** (ou outro host Node.js) para o Next.js; CDN de imagens via `next/image`.
- **E-mails** de convite/recuperação: Supabase envia por padrão com limite baixo; para produção configure SMTP próprio em Authentication → SMTP.
- **Google Search Console / Analytics / AdSense**: preencher em Configurações.
- **Domínio e SSL**: na Vercel.
