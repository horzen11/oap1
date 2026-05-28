# Лабораторна робота №4 — Інтеграція фронтенду з бекендом

## Тема
Інтеграція фронтенд-частини вебзастосунку з бекенд-API для сервісу заявок на обладнання.

Проєкт зроблено на основі ЛР1–ЛР3. У ЛР4 додано окремий TypeScript frontend, який працює з Express + SQLite backend через `fetch()`.

## Що реалізовано для рівня «задовільно»

- Backend і frontend запускаються окремими процесами на різних портах.
- Backend працює на `http://localhost:3000`.
- Frontend працює на `http://127.0.0.1:5173` або `http://localhost:5173`.
- Frontend отримує реальні дані з API через `fetch()`.
- Реалізовано читання списку заявок:

```http
GET /api/v1/requests
```

- Реалізовано перегляд деталей заявки:

```http
GET /api/v1/requests/:id
```

- У UI є стани:
  - `loading` — завантаження;
  - `success` — дані отримано;
  - `empty` — даних немає;
  - `error` — помилка завантаження.
- CORS налаштований для конкретних frontend origin, не просто `*`.

## Що реалізовано для рівня «добре»

- Додано CRUD-операції через UI:

```http
POST /api/v1/requests
PUT /api/v1/requests/:id
DELETE /api/v1/requests/:id
```

- На frontend є форма створення та редагування заявки.
- Є клієнтська валідація:
  - код обладнання — 3–12 цифр;
  - користувач обовʼязковий;
  - дати обовʼязкові;
  - дата завершення не може бути раніше дати початку;
  - коментар — 5–500 символів.
- Усі HTTP-запити винесено в окремий файл:

```text
frontend/src/apiClient.ts
```

- `apiClient` централізовано обробляє:
  - `response.ok`;
  - JSON;
  - `204 No Content`;
  - помилки 400/404/500;
  - помилки мережі та CORS.
- Після створення, редагування або видалення список оновлюється автоматично.
- Перед видаленням є підтвердження.
- Під час запиту форма блокується, щоб не створювати дублікати.

## Що реалізовано для рівня «відмінно»

- Frontend написаний на TypeScript.
- DTO типізовані у файлі:

```text
frontend/src/dtos.ts
```

- API має версійність:

```text
/api/v1/...
```

- Старі маршрути `/api/...` залишено для сумісності з ЛР3.
- Реалізовано timeout через `AbortController` у `apiClient`.
- UI коректно показує ситуації:
  - backend вимкнений;
  - CORS/мережа не працює;
  - backend повернув 400;
  - backend повернув 404;
  - backend повернув 500.
- У README описано сценарії перевірки.

## Структура проєкту

```text
src/                    backend Express + TypeScript
frontend/               frontend Vite + TypeScript
frontend/src/config.ts  базовий URL API
frontend/src/dtos.ts    типи DTO
frontend/src/apiClient.ts централізований fetch-клієнт
frontend/src/main.ts    логіка UI
frontend/src/styles.css стилі frontend
```

## Запуск backend

У корені проєкту:

```bash
npm install
npm run seed
npm run dev
```

Backend буде доступний за адресою:

```text
http://localhost:3000
```

Перевірка:

```http
GET http://localhost:3000/health
```

Очікувана відповідь:

```json
{
  "ok": true
}
```

## Запуск frontend

У папці `frontend`:

```bash
npm install
npm run dev
```

Frontend буде доступний за адресою:

```text
http://127.0.0.1:5173
```

або:

```text
http://localhost:5173
```

## CORS

У backend дозволені такі frontend origin:

```text
http://localhost:5173
http://127.0.0.1:5173
http://localhost:5500
http://127.0.0.1:5500
```

Дозволені методи:

```text
GET, POST, PUT, PATCH, DELETE, OPTIONS
```

Дозволені заголовки:

```text
Content-Type, Authorization
```

## API endpoints для перевірки

### Отримати список заявок

```bash
curl http://localhost:3000/api/v1/requests
```

### Отримати одну заявку

```bash
curl http://localhost:3000/api/v1/requests/REQUEST_ID
```

### Створити заявку

Спочатку отримати користувачів:

```bash
curl http://localhost:3000/api/v1/users
```

Потім підставити реальний `userId`:

```bash
curl -X POST http://localhost:3000/api/v1/requests \
  -H "Content-Type: application/json" \
  -d '{"itemCode":"7777","userId":"USER_ID","dateFrom":"2026-05-27","dateTo":"2026-05-28","comment":"Тестова заявка з frontend integration","status":"New"}'
```

### Оновити заявку

```bash
curl -X PUT http://localhost:3000/api/v1/requests/REQUEST_ID \
  -H "Content-Type: application/json" \
  -d '{"itemCode":"8888","userId":"USER_ID","dateFrom":"2026-05-27","dateTo":"2026-05-29","comment":"Оновлена заявка","status":"Approved"}'
```

### Видалити заявку

```bash
curl -X DELETE http://localhost:3000/api/v1/requests/REQUEST_ID
```

Очікуваний статус:

```text
204 No Content
```

## Перевірка помилок

### 400 Bad Request

Невалідне тіло запиту:

```bash
curl -X POST http://localhost:3000/api/v1/requests \
  -H "Content-Type: application/json" \
  -d '{"itemCode":"1","userId":"","dateFrom":"bad","dateTo":"bad","comment":"no","status":"Wrong"}'
```

Очікувано: backend повертає `400` і список помилок валідації.

### 404 Not Found

```bash
curl http://localhost:3000/api/v1/requests/not-existing-id
```

Очікувано: `404`, заявка не знайдена.

### Network/CORS error

1. Запустити frontend.
2. Не запускати backend.
3. Відкрити frontend.
4. UI покаже повідомлення, що API недоступне.

## Правила сумісності DTO

1. У версії `/api/v1` не можна перейменовувати або видаляти поля, які вже використовує frontend.
2. Нові поля можна додавати як необовʼязкові, щоб старий frontend не ламався.
3. Якщо потрібно змінити структуру відповіді несумісно, треба створити нову версію API, наприклад `/api/v2`.

## Контракти DTO

### RequestResponseDto

```ts
{
  id: string;
  itemCode: string;
  userId: string;
  userName: string;
  dateFrom: string;
  dateTo: string;
  comment: string;
  status: "New" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
}
```

### CreateRequestRequestDto

```ts
{
  itemCode: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
  comment: string;
  status: "New" | "Approved" | "Rejected";
}
```

## Git tag

Фінальну версію потрібно позначити тегом:

```bash
git tag 0.4.0
git push origin 0.4.0
```
