# EVote UI

Простой frontend для дипломного проекта электронной системы голосования.

Стек:

- Vue 3
- Vite
- TypeScript
- Vue Router
- REST API Spring Boot
- JWT Bearer Authorization

## Запуск

```bash
npm install
npm run dev
```

Обычно приложение откроется на:

```text
http://localhost:5173
```

## Подключение к backend

Создай файл `.env` рядом с `package.json`:

```bash
cp .env .env
```

Пример `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_API_PREFIX=/api/v1
VITE_USE_MOCKS=false
```

Если у тебя backend endpoints начинаются с `/api/auth/login`, а не `/api/v1/auth/login`, поставь:

```env
VITE_API_PREFIX=/api
```

## Где находится интеграция

Основные файлы:

```text
src/api/config.ts          # базовый URL backend и prefix API
src/api/http.ts            # общий fetch-клиент, Bearer token, refresh token
src/api/tokenStorage.ts    # хранение accessToken/refreshToken
src/api/authApi.ts         # login/register/logout/me
src/api/electionApi.ts     # список голосований, детали, создание, голосование, результаты
src/api/userApi.ts         # пользователи, роли, блокировка
src/api/auditApi.ts        # журнал аудита
src/api/integrityApi.ts    # integrity/blockchain
src/api/normalizers.ts     # адаптация DTO backend к UI-моделям
src/store/auth.ts          # состояние авторизации
```

## Ожидаемые endpoints

По умолчанию frontend ожидает такие endpoints:

```text
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/register
GET  /api/v1/users/me

GET  /api/v1/elections
GET  /api/v1/elections/{id}
GET  /api/v1/elections/{id}/options
POST /api/v1/elections
POST /api/v1/elections/{id}/start
POST /api/v1/elections/{id}/finish
POST /api/v1/elections/{id}/votes
GET  /api/v1/elections/{id}/results

GET   /api/v1/users
PATCH /api/v1/users/{id}/role
PATCH /api/v1/users/{id}/block
PATCH /api/v1/users/{id}/unblock

GET  /api/v1/audit
GET  /api/v1/integrity/records
POST /api/v1/integrity/check
GET  /api/v1/blockchain/records
```

Важно: при отправке голоса frontend отправляет только `optionId`. `userId` не отправляется, потому что backend должен брать пользователя из JWT.

## Режим моков

Если backend временно не готов, можно включить старые моковые данные:

```env
VITE_USE_MOCKS=true
```
