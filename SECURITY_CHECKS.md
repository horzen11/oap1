# Security checks for Lab 05

## Demo users

- `demo-user-1` — owns requests `1001` and `3003` after seed.
- `demo-user-2` — owns request `2002` after seed.

Run before checks:

```bash
npm install
npm run seed
npm run dev
```

## 401 without X-Demo-UserId

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/requests" -UseBasicParsing
```

Expected: 401.

## 200 with X-Demo-UserId

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/requests" -Headers @{"X-Demo-UserId"="demo-user-1"} -UseBasicParsing
```

Expected: 200 and only own requests.

## SQLi check

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/requests/search-safe?q=' OR 1=1 --" -Headers @{"X-Demo-UserId"="demo-user-1"} -UseBasicParsing
```

Expected: safe response, no SQL crash, no foreign data leak.

## Headers check

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
```

Check response headers:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: no-referrer
