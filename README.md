# Úlgi / Sunlife School Social Network

Школьная социальная сеть для учеников, учителей и администрации. Проект объединяет ленту постов, профили, объявления, медиа, модерацию и AI-помощника внутри закрытого школьного пространства.

## Для кого

Платформа рассчитана на школу, которой нужен свой безопасный цифровой канал: новости, общение, публикации учеников, объявления администрации и учебный AI-помощник на казахском языке.

## Ключевые функции

- регистрация и авторизация через Supabase Auth;
- профили учеников и учителей;
- лента постов с фото/видео;
- комментарии, лайки и realtime-обновления;
- объявления и закрепленные сообщения;
- AI-помощник для учебных вопросов;
- Cloudinary upload/delete для медиа;
- admin-панель для управления пользователями, постами и объявлениями;
- RLS-политики и миграции Supabase.

## Стек

- Next.js 16 App Router;
- React и TypeScript strict;
- Supabase Postgres, Auth, Realtime и RLS;
- Cloudinary;
- OpenAI API;
- Tailwind CSS 4;
- shadcn/ui и lucide-react;
- Netlify/Vercel-ready конфигурация.

## Архитектура

Приложение разделено на app routes, UI-компоненты и сервисные модули:

- `app/(auth)` — логин, регистрация и заполнение профиля;
- `app/(main)` — feed, posts, announcements, assistant, profile;
- `app/(admin)` — админские сценарии;
- `app/api/ai` — caption, moderation и chat;
- `app/api/media` — удаление Cloudinary-медиа;
- `lib/supabase` — browser/server/admin clients и queries;
- `supabase/migrations` — схема, RLS и Realtime.

## Локальный запуск

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Открыть приложение: `http://localhost:3000`.

## Переменные окружения

Используйте `.env.local.example` как шаблон. Нужны:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_SCHOOL_NAME=
```

Реальные ключи не должны попадать в git.

## Deploy

Для Netlify:

- build command: `npm run build`;
- publish directory: `.next`;
- Node version: `20`;
- все env variables задаются в настройках сайта.

## Статус

MVP школьной социальной сети с Supabase backend, медиа, realtime и AI-функциями. Перед production стоит провести аудит ролей, RLS-политик и лимитов Cloudinary/OpenAI.

## Что демонстрирует в портфолио

- full-stack Next.js приложение;
- работу с Supabase Auth, Postgres, RLS и Realtime;
- медиа-инфраструктуру через Cloudinary;
- AI-функции в продукте, а не отдельный demo-widget;
- продуктовую упаковку для EdTech/SchoolTech.
