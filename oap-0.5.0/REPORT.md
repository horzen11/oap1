# Лабораторна робота №5 — Уразливості і захист

**Проєкт:** Реєстр заявок на обладнання  
**Версія здачі:** `1.0.0`  
**Рівень:** задовільно + добре + відмінно  
**Сценарії:** SQL Injection, XSS, Broken Access Control / IDOR, Security Misconfiguration.

## Що реалізовано

| Сценарій | Ризик | Наслідок | Виправлення |
|---|---|---|---|
| SQL Injection | Користувацький ввід міг стати частиною SQL-коду | Некоректна вибірка або помилка БД | Запити переведено на параметри `?`, значення передаються окремо від SQL |
| XSS | Дані користувача могли інтерпретуватись як HTML | Зміна DOM або небажане виконання вмісту | Дані виводяться через `textContent` і DOM API |
| IDOR | Користувач міг підставити чужий `id` заявки | Доступ/зміна/видалення чужої заявки | Додано `X-Demo-UserId`, перевірку власника на read/update/delete |
| Misconfiguration | Зайві dev-деталі та слабка конфігурація | Розкриття внутрішньої інформації, слабші HTTP-відповіді | Єдиний формат помилок, CORS allowlist, security headers |

---

## 1. SQL Injection

### Було

У репозиторіях використовувались SQL-рядки з ручною підстановкою значень. Для пошуку це могло дати SQLi, якщо значення з `query` потрапляло в `LIKE` як частина SQL-коду.

Файл: `src/repositories/requests.repository.ts`.

### Відтворення

Приклад проблемного вводу:

```http
GET /api/v1/requests/search-unsafe?q=' OR '1'='1
```

До виправлення такий ввід міг змінювати логіку SQL-запиту.

### Виправлення

Метод пошуку тепер використовує параметризований запит:

```ts
WHERE r.itemCode LIKE ?
   OR r.comment LIKE ?
   OR u.fullName LIKE ?
```

Значення передаються як параметри:

```ts
[like, like, like]
```

Також параметризовано `getById`, `add`, `update`, `delete`, `getWithUsers`, `getLatestByStatus`, `getFullStats`, `Users` і `RequestComments`.

### Перевірка

```http
GET /api/v1/requests/search-unsafe?q=' OR '1'='1
```

Очікувано: сервер не падає, ін’єкція не змінює структуру SQL, ввід обробляється як звичайний текст.

---

## 2. XSS

### Було

Старий варіант рендера міг формувати рядки таблиці через `innerHTML += ...`, що небезпечно для даних користувача (`comment`, `userName`).

Файли: `frontend/src/main.ts`, `public/app.js`, `app.js`.

### Відтворення

У поле коментаря можна було ввести HTML-подібний текст:

```text
<b>HTML має бути текстом</b>
```

При небезпечному рендері браузер міг інтерпретувати це як розмітку.

### Виправлення

У фронтенді використовується DOM API:

```ts
const td = document.createElement("td");
td.textContent = text;
row.appendChild(td);
```

Для endpoint-таблиці також прибрано динамічний `innerHTML` із даними. Статичний `app.innerHTML` лишився тільки для початкової розмітки без користувацьких даних.

### Перевірка

1. Створити заявку з коментарем `<b>HTML має бути текстом</b>`.
2. Відкрити список заявок.
3. Очікувано: текст показується як текст, DOM не змінюється.

---

## 3. Broken Access Control / IDOR

### Було

Заявка має власника через поле `userId`, але доступ до `GET /requests/:id`, `PUT/PATCH /requests/:id`, `DELETE /requests/:id` не був прив’язаний до поточного користувача.

### Відтворення

Користувач міг підставити чужий `id` заявки в URL.

```http
GET /api/v1/requests/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa
X-Demo-UserId: 22222222-2222-4222-8222-222222222222
```

До виправлення такий запит міг повернути чужу заявку.

### Виправлення

Додано middleware:

Файл: `src/middleware/demo-auth.middleware.ts`.

Поведінка:

- немає `X-Demo-UserId` → `401`;
- невалідний UUID → `401`;
- користувача немає в БД → `401`;
- чужий ресурс → `404`.

У `src/routes/requests.routes.ts` захищено чутливі операції:

```ts
GET /:id
POST /
PUT /:id
PATCH /:id
DELETE /:id
```

У `src/repositories/requests.repository.ts` додано перевірку власника прямо в SQL:

```sql
WHERE r.id = ? AND r.userId = ?
```

Для `UPDATE` і `DELETE` також використовується:

```sql
WHERE id = ? AND userId = ?
```

### Перевірка

Власник бачить свою заявку:

```http
GET /api/v1/requests/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa
X-Demo-UserId: 11111111-1111-4111-8111-111111111111
```

Очікувано: `200`.

Інший користувач не бачить чужу заявку:

```http
GET /api/v1/requests/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa
X-Demo-UserId: 22222222-2222-4222-8222-222222222222
```

Очікувано: `404`.

Без заголовка:

```http
GET /api/v1/requests/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa
```

Очікувано: `401`.

---

## 4. Security Misconfiguration

### Було

Потрібно було явно додати мінімальний hardening конфігурації Express: security headers, обмежений CORS, стабільні помилки.

### Виправлення

Файл: `src/app.ts`.

Додано:

```ts
app.disable("x-powered-by");
```

Security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

CORS обмежено локальними origin фронтенду:

```ts
http://localhost:5173
http://127.0.0.1:5173
http://localhost:5500
http://127.0.0.1:5500
```

Дозволено заголовок для лабораторної авторизації:

```ts
X-Demo-UserId
```

Файл: `src/middleware/error-handler.middleware.ts`.

Помилки повертаються в одному форматі:

```json
{
  "error": {
    "code": "...",
    "message": "...",
    "details": null
  }
}
```

### Перевірка

```http
GET http://localhost:3000/health
```

Очікувано в headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

---

## Як запустити

### Бекенд

```powershell
cd backend
npm install
npm run seed
npm run dev
```

Якщо папка вже відкрита саме в корені проєкту:

```powershell
npm install
npm run seed
npm run dev
```

Перевірка:

```text
http://localhost:3000/health
```

### Фронтенд

```powershell
cd frontend
npm install
npm run dev
```

Відкрити:

```text
http://localhost:5173
```

---

## Файл з перевірками

Готові HTTP-сценарії лежать тут:

```text
security-tests/lab5-security-checks.http
```

Їх можна виконувати у VS Code через REST Client або переписати в PowerShell/Postman.

---

## Команди для Git

```powershell
git add .
git commit -m "lab5 security scenarios"
git push origin main
git tag -f 1.0.0
git push origin 1.0.0 --force
```
