# Лабораторна робота №3 — SQLite, схема даних, CRUD

## Тема
Розширення REST API для сервісу заявок на обладнання. У ЛР №3 дані зберігаються не в `Map`, а в SQLite.

## Запуск

```bash
npm install
npm run dev
```

Сервер запускається на:

```text
http://localhost:3000
```

Перевірка:

```http
GET http://localhost:3000/health
```

## Seed

Щоб заповнити БД тестовими даними:

```bash
npm run seed
```

## Де зберігається база

SQLite-файл створюється автоматично:

```text
data/app.db
```

Файл БД не додається в GitHub. У `.gitignore` додано:

```text
data/
*.db
*.db-journal
```

## Схема БД

### Users
Користувачі системи.

Поля:
- `id TEXT PRIMARY KEY`
- `fullName TEXT NOT NULL`
- `email TEXT NOT NULL UNIQUE`
- `role TEXT NOT NULL CHECK (role IN ('Student', 'Teacher', 'Admin'))`
- `createdAt TEXT NOT NULL`

### Requests
Заявки на обладнання.

Поля:
- `id TEXT PRIMARY KEY`
- `itemCode TEXT NOT NULL CHECK`
- `userId TEXT NOT NULL`
- `dateFrom TEXT NOT NULL`
- `dateTo TEXT NOT NULL`
- `comment TEXT NOT NULL CHECK`
- `status TEXT NOT NULL CHECK (status IN ('New', 'Approved', 'Rejected'))`
- `createdAt TEXT NOT NULL`
- `updatedAt TEXT NOT NULL`

Зв'язок:

```text
Users 1:N Requests
Requests.userId -> Users.id
ON DELETE CASCADE
```

### RequestComments
Коментарі до заявок.

Поля:
- `id TEXT PRIMARY KEY`
- `requestId TEXT NOT NULL`
- `userId TEXT NOT NULL`
- `body TEXT NOT NULL CHECK`
- `createdAt TEXT NOT NULL`
- `updatedAt TEXT NOT NULL`

Зв'язки:

```text
Requests 1:N RequestComments
RequestComments.requestId -> Requests.id
ON DELETE CASCADE

Users 1:N RequestComments
RequestComments.userId -> Users.id
ON DELETE RESTRICT
```

## Міграції

Міграції зберігаються у папці:

```text
src/migrations/
```

Файли:

```text
001_init.sql
002_requests.sql
003_request_comments.sql
004_add_indexes.sql
```

Також створюється таблиця:

```text
schema_migrations
```

Вона зберігає список застосованих міграцій, тому при повторному запуску виконуються тільки нові SQL-файли.

## Основні endpoints

### Users

```http
GET /api/users
GET /api/users/:id
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
```

### Requests

```http
GET /api/requests
GET /api/requests/:id
POST /api/requests
PUT /api/requests/:id
PATCH /api/requests/:id
DELETE /api/requests/:id
```

### RequestComments

```http
GET /api/request-comments
GET /api/request-comments/:id
GET /api/request-comments/by-request/:requestId
POST /api/request-comments
PUT /api/request-comments/:id
PATCH /api/request-comments/:id
DELETE /api/request-comments/:id
```

## JOIN endpoint

```http
GET /api/requests/with-users
```

Повертає заявки разом з даними користувача.

Також можна фільтрувати:

```http
GET /api/requests/with-users?status=Approved
```

## Агрегація

```http
GET /api/requests/stats/by-status
```

Повертає кількість заявок за статусами через `COUNT(*)`.

## Сортування, фільтрація, пагінація

Приклади:

```http
GET /api/requests?status=New
GET /api/requests?search=ноутбук
GET /api/requests?sortBy=createdAt&sortDir=desc
GET /api/requests?page=1&pageSize=5
```

## Приклади запитів

### Створити користувача

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Софія Шевцова","email":"sofia@example.com","role":"Student"}'
```

### Отримати користувачів

```bash
curl http://localhost:3000/api/users
```

### Створити заявку

```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{"itemCode":"1001","userId":"USER_ID","dateFrom":"2026-05-20","dateTo":"2026-05-21","comment":"Потрібен ноутбук для лабораторної","status":"New"}'
```

### WHERE + ORDER BY + LIMIT

```http
GET /api/requests?status=New&sortBy=createdAt&sortDir=desc&page=1&pageSize=5
```

## HTTP-коди

- `200 OK` — успішне отримання або оновлення
- `201 Created` — створено новий запис
- `204 No Content` — запис видалено
- `400 Bad Request` — некоректне тіло запиту або порушення CHECK/NOT NULL/FK
- `404 Not Found` — ресурс не знайдено
- `409 Conflict` — порушення UNIQUE, наприклад дубль email
- `500 Internal Server Error` — неочікувана помилка сервера

## SQL Injection демонстрація

Для навчальної демонстрації додано endpoint:

```http
GET /api/requests/search-unsafe?q=test
```

У ньому SQL формується через рядкову конкатенацію:

```sql
WHERE r.itemCode LIKE '%${q}%'
```

Це небезпечно, бо користувацький ввід стає частиною SQL-коду. Наприклад, поганий ввід може змінити логіку `WHERE` і повернути зайві дані. У цій лабораторній це спеціально не виправляється, бо параметризовані запити будуть у наступній темі.

## Що реалізовано

- SQLite підключено до бекенду
- База створюється у `data/app.db`
- Реалізовано міграції
- Є таблиця `schema_migrations`
- Є 3 основні таблиці: `Users`, `Requests`, `RequestComments`
- Реалізовано FOREIGN KEY, NOT NULL, UNIQUE, CHECK
- CRUD для 3 сутностей
- Seed-скрипт
- JOIN endpoint
- Aggregation endpoint з `COUNT(*)`
- Централізована обробка помилок
- Логування запитів і SQL у dev-режимі
- Демонстраційний unsafe search для пояснення SQL Injection
