# Champions Club Backend

## Setup

```bash
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

## Available Scripts

- `npm run dev` — Start dev server with hot reload (tsx watch)
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Run compiled production server

## API Base

All endpoints are prefixed with `/api/v1`

### Health Check
`GET /api/v1/health`

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET  /api/v1/auth/me`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password/:token`
- `PATCH /api/v1/auth/change-password`

### Members
- `POST   /api/v1/members`
- `GET    /api/v1/members`
- `GET    /api/v1/members/:id`
- `PATCH  /api/v1/members/:id`
- `DELETE /api/v1/members/:id`

### Membership Plans
- `POST   /api/v1/membership-plans`
- `GET    /api/v1/membership-plans`
- `PATCH  /api/v1/membership-plans/:id`
- `DELETE /api/v1/membership-plans/:id`

### Courts
- `POST   /api/v1/courts`
- `GET    /api/v1/courts`
- `GET    /api/v1/courts/:id`
- `PATCH  /api/v1/courts/:id`
- `DELETE /api/v1/courts/:id`

### Bookings
- `POST   /api/v1/bookings`
- `GET    /api/v1/bookings`
- `GET    /api/v1/bookings/:id`
- `PATCH  /api/v1/bookings/:id`
- `POST   /api/v1/bookings/:id/cancel`
- `GET    /api/v1/bookings/availability`

### Products
- `POST   /api/v1/products`
- `GET    /api/v1/products`
- `GET    /api/v1/products/:id`
- `PATCH  /api/v1/products/:id`
- `DELETE /api/v1/products/:id`

### Orders (Shop)
- `POST   /api/v1/orders`
- `GET    /api/v1/orders`
- `GET    /api/v1/orders/:id`
- `PATCH  /api/v1/orders/:id/status`

### Cafeteria
- `GET    /api/v1/cafe/tables`
- `POST   /api/v1/cafe/tables`
- `GET    /api/v1/cafe/menu`
- `POST   /api/v1/cafe/menu`
- `POST   /api/v1/cafe/orders`
- `GET    /api/v1/cafe/orders`
- `PATCH  /api/v1/cafe/orders/:id/status`

### Finance
- `GET  /api/v1/finance/summary`
- `GET  /api/v1/finance/transactions`
- `POST /api/v1/finance/expenses`

### Employees
- `POST  /api/v1/employees`
- `GET   /api/v1/employees`
- `PATCH /api/v1/employees/:id`

### CRM (Enquiries)
- `POST  /api/v1/enquiries`
- `GET   /api/v1/enquiries`
- `PATCH /api/v1/enquiries/:id`
