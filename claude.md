Функціональна специфікація — Team Hub
Версія 1.0 Для команди 3 dev + 1 designer Vercel + Azure DevOps

Мета: створити легкий web-додаток, який об'єднає BIO команди та live KPI з Azure Boards в одному місці. Менеджер більше не збирає звіти вручну, команда бачить свій потік, стейкхолдери отримують прозорість.

1. Контекст і проблема
Зараз KPI (Cycle Time, Blocked %, Throughput) живуть в Azure DevOps Analytics, їх треба витягувати вручну. BIO команди зберігається в різних документах. Немає єдиного хабу. Команда працює по Kanban на платформі GOSS, 95% блокерів від вендора.

2. Ролі користувачів
Роль	Доступ	Основні дії
Admin (PM)	Повний	Створює профілі, завантажує фото, налаштовує інтеграцію Azure, керує користувачами
Member	Обмежений	Переглядає дашборд, редагує свій BIO
Viewer (стейкхолдер)	Тільки читання	Переглядає /team та публічний дашборд
3. Функціональні вимоги
FR-01: Реєстрація та авторизація
Вхід через email + password (NextAuth.js Credentials Provider). Перший зареєстрований користувач автоматично стає Admin.
Admin створює акаунти для 3 dev і дизайнера через інвайт-лінк.
Сесія 7 днів, зберігається в JWT.
FR-02: Профілі команди
Admin панель /admin/profiles: форма з полями — Ім'я, Роль (Backend/Frontend/Designer), Фото (upload до Vercel Blob), Коротке BIO (markdown), Стек технологій (теги), LinkedIn, GitHub, Дата старту.
Публічна сторінка /team — грід з картками, клік відкриває повний профіль.
Member може редагувати тільки свій BIO і фото.
FR-03: Дашборд KPI
Головна сторінка /dashboard після логіну.

Віджет	Опис	Джерело
Cycle Time	Середній час Active → Done за 14 днів	Azure DevOps Analytics
Lead Time	Ready for Dev → Done	Analytics
Throughput	Кількість User Stories в PRD / тиждень	Work Items API
Blocked %	Час в Blocked / Cycle Time	Work Item History
Vendor Blocked	Кількість з Blocked Reason = Vendor-GOSS	Custom field
PR Review Time	Середній час PR в статусі Active	Git Pull Requests API
WIP Age	Вік задач в Active зараз	Current query
Фільтри зверху: період 7/14/30 днів, по учаснику (Assignee).

FR-04: Інтеграція з Azure DevOps
Сторінка /admin/integration: поля Organization, Project, PAT Token.
PAT зберігається в Vercel Environment Variables (зашифровано), не в БД.
Синхронізація: Vercel Cron Job кожні 15 хв викликає /api/sync, який тягне дані через @azure/devops-node-api і кешує в Postgres.
Обробка помилок: якщо токен expired — показати банер Admin.
FR-05: Адмін панель
Управління користувачами, профілями, інтеграцією, перегляд логів синхронізації.
4. Модель даних (Postgres)
users (id, email, password_hash, role, created_at)
team_profiles (id, user_id, name, role_title, photo_url, bio_md, stack_tags[], linkedin, github, start_date)
azure_settings (id, org, project, pat_encrypted, last_sync_at)
kpi_cache (id, metric_name, period, value_json, updated_at)
5. Архітектура та стек
Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
Backend: Next.js API Routes (serverless)
Auth: NextAuth.js
DB: Vercel Postgres (Neon free tier) або для MVP — Vercel KV
Storage: Vercel Blob для фото
Інтеграція: azure-devops-node-api v12
Хостинг: Vercel Hobby (free)

6. Нефункціональні вимоги
Час завантаження дашборду < 2 сек (дані з кешу)
Mobile-first адаптивність
Ліміти Vercel free: 100GB bandwidth, функції до 10с — враховано через кеш
Безпека: PAT ніколи не віддається на клієнт, тільки server-side
7. CI/CD — GitHub Actions + Vercel
# .github/workflows/ci.yml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
Деплой: підключити Vercel Git Integration — кожен push в main автоматично деплоїться. Preview для PR.

8. User Stories для розробки
ID	Story	Acceptance Criteria
US-01	Як Admin, я хочу додати профіль розробника з фото	Фото завантажується, відображається на /team, можна редагувати
US-02	Як Member, я хочу бачити свій Cycle Time	На дашборді є мій фільтр, дані з Azure за останні 14 днів
US-03	Як Admin, я хочу підключити Azure DevOps через PAT	Після збереження PAT, /api/sync повертає 200 і заповнює kpi_cache
US-04	Як Viewer, я хочу бачити Throughput без логіну	Публічний /dashboard/public показує тільки агреговані метрики
US-05	Як PM, я хочу бачити Vendor Blocked %	Віджет показує % і список задач з причиною Vendor-GOSS
9. MVP Roadmap — 4 тижні
Тиждень 1: Auth + CRUD профілів + /team
Тиждень 2: Інтеграція Azure DevOps, PAT, базова синхронізація
Тиждень 3: Дашборд з 4 KPI (Cycle, Lead, Throughput, Blocked)
Тиждень 4: Vercel деплой, Cron, полірування UI
10. Ризики та мітигація
Ризик	Мітигація
PAT expires кожні 90 днів	Нагадування в адмінці за 7 днів, інструкція оновлення
Vercel free ліміт функцій	Кешувати KPI на 15 хв, не робити live запити з браузера
Azure API rate limit	Використовувати Analytics Views, batch запити
Підготовлено для Project Manager Ninja. Готово до передачі розробникам.