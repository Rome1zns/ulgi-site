# Sunlife — Мектеп әлеуметтік желісі

Sunlife — мектеп оқушылары мен мұғалімдеріне арналған әлеуметтік желі.
Сәттерді бөліс, сыныптастарыңмен сөйлес, AI-көмекшімен оқы.

## Стек

| Слой | Технология |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Database | Supabase Postgres |
| Auth | Supabase Auth (email/password; phone-as-email формат) |
| Realtime | Supabase Realtime (comments, likes, ai_messages) |
| Media | Cloudinary (фото/видео — до 100MB) |
| AI | OpenAI API (gpt-4o-mini) |
| UI | Tailwind CSS 4, shadcn/ui, lucide-react |
| Locale | Казахский (`lib/locale/kk.ts`) |

## Быстрый старт

### 1. Supabase проект

1. Создай проект на [supabase.com](https://supabase.com)
2. В **SQL Editor** прогони миграции по порядку:
   - `supabase/migrations/0001_initial_schema.sql` — таблицы и типы
   - `supabase/migrations/0002_rls_policies.sql` — RLS и триггеры счётчиков
   - `supabase/migrations/0003_realtime.sql` — публикация Realtime
3. **Authentication** → Providers → Email → включи, отключи «Confirm email»
4. Скопируй URL и ключи из **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Cloudinary (медиа)

1. Зарегистрируйся на [cloudinary.com](https://cloudinary.com)
2. В Dashboard скопируй **Cloud Name**, **API Key**, **API Secret**
3. Settings → Upload → Upload presets → Add upload preset:
   - Signing Mode: **Unsigned**
   - Folder: `ulgi`
   - Имя пресета (например `ulgi_media`)

Технические имена `ulgi` для Cloudinary можно оставить как есть, если проект уже использует эти пути в медиа-логике.

### 3. OpenAI API Key

Создай ключ на [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

### 4. Environment Variables

```bash
cp .env.local.example .env.local
```

Заполни:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ulgi_media
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_SCHOOL_NAME=Sunlife мектебі
```

### 5. Запуск

```bash
npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000).

### 6. Первый админ

1. Зарегистрируйся через `/register`
2. В Supabase Dashboard → **Table Editor** → `profiles` → найди свою строку
3. Поменяй `role` на `admin`
4. Теперь `/admin` доступен

## Deploy Sunlife Copy to Netlify

Эта Sunlife-копия предназначена для деплоя на Netlify Free, не на Vercel.

### Build settings

- Build command: `npm run build`
- Publish directory: `.next`
- Node version: `20`

### Environment variables

Добавь в Netlify Site Settings → Environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_SCHOOL_NAME=Sunlife мектебі
```

`NEXT_PUBLIC_APP_URL` можно не задавать: на Netlify приложение умеет брать production URL из встроенных переменных `URL` / `DEPLOY_PRIME_URL`. Если хочешь явно зафиксировать canonical URL, можешь добавить `NEXT_PUBLIC_APP_URL` вручную уже после создания Netlify site.

### Recommended safe workflow

Чтобы не привязать Sunlife-копию к исходному GitHub/Vercel-проекту, safest path такой:

```bash
npx netlify login
npx netlify link
npx netlify deploy --build --prod
```

1. Сначала создай **отдельный новый site/project в Netlify dashboard** для Sunlife.
2. Добавь туда environment variables из списка выше.
3. Только потом выполни `npx netlify link` в этой папке и выбери новый Sunlife site.
4. После привязки запусти production deploy.

### Optional Git-connected workflow

Если ты заранее создал **отдельный GitHub repo именно для Sunlife-копии**, тогда можно использовать и Git-integrated сценарий:

```bash
npx netlify login
npx netlify init
npx netlify deploy --build --prod
```

Не используй `netlify init` против текущего `origin`, если он всё ещё указывает на исходный репозиторий: так можно случайно связать новый Netlify site с оригинальным проектом.

Если хочешь импортировать переменные через CLI, не импортируй `.env.local` вслепую, если там `NEXT_PUBLIC_APP_URL=http://localhost:3000`. Либо убери эту строку из импортируемого файла, либо добавь production URL отдельно после создания сайта.

## Оригинальный Vercel-деплой

`vercel.json` и связанные настройки не удалялись, чтобы не затронуть исходный сайт. Для Sunlife-копии Vercel использовать не нужно.

## Структура проекта

```
app/
├── (auth)/          — логин, регистрация, complete-profile
├── (main)/          — feed, posts, announcements, assistant, profile
├── (admin)/         — панель (посты, юзеры, модерация, объявления)
└── api/
    ├── ai/          — /caption, /moderate, /chat (Supabase auth)
    └── media/       — /delete (Cloudinary через service-role auth)

lib/
├── supabase/
│   ├── client.ts       — браузерный клиент
│   ├── server.ts       — SSR клиент (Server Components)
│   ├── admin.ts        — service role (API routes)
│   ├── verify-request.ts — Bearer JWT auth для /api/*
│   └── queries/        — posts, comments, likes, announcements, follows, profiles, ai-chats
├── contexts/auth-context.tsx — useAuth() + profile
├── cloudinary/         — upload, optimizeUrl
├── openai/             — client, prompts
├── locale/kk.ts        — все UI строки на казахском
└── constants.ts

components/
├── auth/            — phone-input, auth-guard, admin-guard
├── feed/            — post-card, post-actions, post-menu, comment-thread, pinned-announcement
├── create/          — post-composer, media-uploader, ai-caption-button
├── assistant/       — chat-window, chat-list, message-bubble
├── profile/         — follow-button, edit-profile-dialog, profile-owner-actions
├── layout/          — sidebar, bottom-nav
└── ui/              — shadcn/ui

proxy.ts             — Supabase session refresh + redirects (Next 16 API)
supabase/migrations/ — 0001 schema, 0002 RLS, 0003 realtime
```

## Таблицы Postgres

| Таблица | Описание |
|---|---|
| `profiles` | Профиль (связан с `auth.users.id`) |
| `posts` | Посты |
| `comments` | Комментарии (+Realtime) |
| `likes` | Лайки (+Realtime, UNIQUE(post_id, user_id)) |
| `announcements` | Объявления школы |
| `follows` | Подписки (UNIQUE(follower_id, following_id)) |
| `ai_chats` | AI-чаты помощника Аки |
| `ai_messages` | Сообщения в AI-чате (+Realtime) |

Счётчики `likes_count`, `comments_count`, `followers_count`, `following_count` обновляются триггерами БД — клиент ничего не инкрементирует вручную.
