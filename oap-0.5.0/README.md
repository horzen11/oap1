# ОАП ЛР5 — Уразливості і захист

Проєкт виконано на основі ЛР4. Додано сценарії безпеки для рівня **відмінно**:

1. SQL Injection — параметризовані SQLite-запити.
2. XSS — безпечний рендер через DOM API і `textContent`.
3. IDOR — демо-авторизація через `X-Demo-UserId` і перевірка власника заявки.
4. Security Misconfiguration — security headers, строгіший CORS, єдиний формат помилок.

## Запуск бекенда

```powershell
npm install
npm run seed
npm run dev
```

Бекенд: `http://localhost:3000`

## Запуск фронтенда

```powershell
cd frontend
npm install
npm run dev
```

Фронтенд: `http://localhost:5173`

## Перевірка

Основний звіт: `REPORT.md`

Готові запити для перевірки:

```text
security-tests/lab5-security-checks.http
```

## Тег здачі

```powershell
git tag -f 1.0.0
git push origin 1.0.0 --force
```
