# Hotel Management Backend API

Production-ready Express + MongoDB backend for hotel discovery, authentication, room availability, and bookings.

## Highlights
- JWT authentication with HTTP-only cookie sessions
- Role-aware access control (user/admin guards)
- Hotel and room APIs with city and price filtering
- End-to-end booking lifecycle (create, list user bookings, cancel)
- Booking conflict prevention for overlapping dates
- CORS + credentials support for frontend integration
- Seed script for realistic demo data

## Tech Stack
- Node.js
- Express
- MongoDB + Mongoose
- JWT + bcryptjs
- cookie-parser + cors

## Project Structure
- `controllers/` business logic
- `models/` Mongoose schemas
- `routes/` REST routes
- `utils/` shared helpers
- `index.js` app bootstrap
- `seedData.js` data seeding utility

## Environment Variables
Create `.env` inside this folder:

```env
MONGO=your_mongodb_connection_string
JWT=your_jwt_secret
PORT=5000
CLIENT_URL=http://localhost:3000
```

## Install & Run
```bash
npm install
npm start
```

## Available Scripts
- `npm start` — starts API server
- `npm run seed` — seeds demo hotels/rooms and fixes legacy image references

## Seed Demo Data
```bash
npm run seed
```

What seeding does:
- Adds 20+ hotels across multiple cities
- Creates room inventories per hotel
- Skips already-existing hotels (idempotent behavior)
- Repairs old placeholder image references

## API Base URL
`http://localhost:5000/api`

## Core Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

### Hotels
- `GET /hotels`
- `GET /hotels/find/:id`
- `GET /hotels/countByCity?cities=Goa,Mumbai,Manali`
- `GET /hotels/countByType`
- `GET /hotels/room/:id`

### Rooms
- `GET /rooms`
- `GET /rooms/:id`
- `PUT /rooms/availability/:id`

### Bookings
- `POST /bookings` (auth required)
- `GET /bookings/user/:id` (owner/admin)
- `PUT /bookings/:bookingId/cancel` (auth required)

## Quick API Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_user","email":"demo_user@test.com","password":"Pass@1234","country":"India","city":"Goa","phone":"9999999999"}'
```

### Login (stores cookie)
```bash
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_user","password":"Pass@1234"}'
```

### Get featured city counts
```bash
curl "http://localhost:5000/api/hotels/countByCity?cities=Goa,Mumbai,Manali"
```

## High-Level Request Flow
1. Client sends request to `/api/...`
2. Route maps to controller action
3. Controller validates payload and auth context
4. Mongoose model reads/writes MongoDB
5. Unified error middleware returns structured JSON responses

## Booking Integrity Notes
- Incoming booking dates are normalized to UTC-midnight
- Room update uses conflict-aware atomic check
- If one selected room conflicts, prior updates in same request are rolled back
- Overlapping date requests return `409`

## Error Format
```json
{
  "success": false,
  "status": 400,
  "message": "Error description"
}
```

## Troubleshooting
- **Port in use**: change `PORT` in `.env` or stop the existing process
- **CORS blocked**: ensure frontend URL is present in `CLIENT_URL`
- **Auth not persisting**: verify frontend sends credentials and uses same API host
- **Mongo connection issues**: validate `MONGO` URI and network access rules

## Deployment Notes
- Set `CLIENT_URL` to your deployed frontend origin
- Use strong `JWT` value (32+ chars)
- Ensure HTTPS for secure cookie behavior in production
- Restrict MongoDB network access and rotate credentials

## Production Readiness Checklist
- [ ] `.env` values are production-safe
- [ ] CORS origin list is locked down
- [ ] Logs do not expose sensitive user data
- [ ] Seeding script is not run against production by mistake
- [ ] Backup/restore plan exists for MongoDB

## Security Notes
- Never commit real `.env` secrets
- Rotate JWT secret for production
- Set secure cookie handling behind HTTPS in deployment

## Current Status
This backend includes authentication hardening, booking conflict protection, improved filters, and seeded demo inventory ready for frontend use.
