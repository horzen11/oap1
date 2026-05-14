# Лабораторна робота №2 — Backend без БД

Тема наскрізного проєкту: **реєстр заявок на обладнання**.

Проєкт реалізує HTTP REST API на Node.js + Express + TypeScript без використання бази даних. Дані зберігаються в оперативній памʼяті через `Map`, тому після перезапуску сервера вони очищуються.

## Реалізовані вимоги

- REST API з JSON-обміном.
- Сутності:
  - `users` — користувачі;
  - `requests` — заявки на обладнання.
- CRUD для кожної сутності:
  - `GET /api/<entity>`
  - `GET /api/<entity>/:id`
  - `POST /api/<entity>`
  - `PUT /api/<entity>/:id`
  - `DELETE /api/<entity>/:id`
- Додатково: `PATCH /api/requests/:id` для часткового оновлення.
- DTO для створення, оновлення та відповіді.
- Валідація тіла запиту і query-параметрів.
- Єдиний формат помилок.
- Централізований error-handler.
- Логування кожного запиту: метод, шлях, статус, час виконання.
- Фільтрація, пагінація та сортування списків через query params.
- Старий фронтенд з лабораторної №1 збережено в папці `public`.

## Структура

```text
src/
  app.ts
  server.ts
  routes/
  controllers/
  services/
  repositories/
  dtos/
  models/
  middleware/
  errors/
  utils/
public/
  index.html
  styles.css
  app.js
```

## Запуск

```bash
npm install
npm run dev
```

Сервер запускається на:

```text
http://localhost:3000
```

Перевірка працездатності:

```bash
curl -i http://localhost:3000/health
```

## Формат помилки

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "field": "email",
        "message": "email must be valid"
      }
    ]
  }
}
```

## Приклади запитів curl

### 1. Створити користувача

```bash
curl -i -X POST http://localhost:3000/api/users   -H "Content-Type: application/json"   -d "{"fullName":"Sonia Ivanenko","email":"sonia@example.com","role":"Student"}"
```

Очікувано: `201 Created`. Скопіюйте `id` користувача з відповіді для наступних запитів.

### 2. Отримати список користувачів

```bash
curl -i "http://localhost:3000/api/users?page=1&pageSize=10&sortBy=fullName&sortDir=asc"
```

Очікувано: `200 OK` і JSON з `items`, `total`, `page`, `pageSize`.

### 3. Створити заявку

Замініть `USER_ID` на `id` створеного користувача.

```bash
curl -i -X POST http://localhost:3000/api/requests   -H "Content-Type: application/json"   -d "{"itemCode":"12345","userId":"USER_ID","dateFrom":"2026-05-12","dateTo":"2026-05-15","comment":"Need laptop for laboratory work","status":"New"}"
```

Очікувано: `201 Created`.

### 4. Отримати заявки з фільтрацією, пагінацією та сортуванням

```bash
curl -i "http://localhost:3000/api/requests?status=New&page=1&pageSize=10&sortBy=dateFrom&sortDir=desc"
```

Очікувано: `200 OK`.

### 5. Оновити заявку повністю

Замініть `REQUEST_ID` і `USER_ID`.

```bash
curl -i -X PUT http://localhost:3000/api/requests/REQUEST_ID   -H "Content-Type: application/json"   -d "{"itemCode":"12345","userId":"USER_ID","dateFrom":"2026-05-13","dateTo":"2026-05-16","comment":"Updated request comment","status":"Approved"}"
```

Очікувано: `200 OK`.

### 6. Частково оновити статус заявки

```bash
curl -i -X PATCH http://localhost:3000/api/requests/REQUEST_ID   -H "Content-Type: application/json"   -d "{"status":"Rejected"}"
```

Очікувано: `200 OK`.

### 7. Помилка валідації 400

```bash
curl -i -X POST http://localhost:3000/api/users   -H "Content-Type: application/json"   -d "{"fullName":"A","email":"wrong-email","role":"Unknown"}"
```

Очікувано: `400 Bad Request`.

### 8. Помилка 404

```bash
curl -i http://localhost:3000/api/users/not-existing-id
```

Очікувано: `404 Not Found`.

### 9. Видалити заявку

```bash
curl -i -X DELETE http://localhost:3000/api/requests/REQUEST_ID
```

Очікувано: `204 No Content`.

## Команди якості

```bash
npm run build
npm run lint
npm run format
```

## Версія

Остаточна версія для здачі позначена в `package.json` як `0.2.0`. Для Git можна створити тег:

```bash
git tag 0.2.0
git push origin 0.2.0
```
