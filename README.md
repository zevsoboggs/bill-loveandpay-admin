# bill-loveandpay-admin

Админ-панель платформы **Love&Pay Billing** (Refine + Ant Design).

Управление клиентами-реселлерами, депозитами (USDT), **распределением депозита
между системами СБП и PromptPay**, транзакциями, белыми IP, заявками на карты и ledger.

## Стек
React · Vite · Refine · Ant Design

## Локальный запуск
```bash
npm install
npm run dev            # http://localhost:5173
```
API берётся из `VITE_API_URL` (`.env` для дева, `.env.production` для прод-сборки).

## Деплой
Vercel (root = этот репозиторий, framework Vite). `.env.production` уже указывает
на `https://api.bill.loveandpay.io`. SPA-роутинг настроен в `vercel.json`.
