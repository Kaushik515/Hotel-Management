# 🏨 Hotel Management Backend API

> Production-ready Express + MongoDB backend for hotel discovery, authentication, room availability, and bookings.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

---

## ✨ Highlights

- 🔐 JWT authentication with HTTP-only cookie sessions
- 👥 Role-aware route protection (user/admin)
- 🏙️ Hotels API with city/type/price filters
- 🛏️ Room availability checks with date overlap prevention
- 📦 Booking lifecycle: create, list, cancel
- 🌐 CORS + credentials support for frontend integration
- 🌱 Seed script for realistic demo inventory

## 🧰 Tech Stack

| Layer | Tools |
|---|---|
| Runtime | Node.js |
| Server | Express |
| Database | MongoDB + Mongoose |
| Auth | JWT, bcryptjs |
| Middleware | cookie-parser, cors |

## 📁 Project Structure

```text
Hotel-Management/
├── controllers/    # business logic
├── models/         # mongoose schemas
├── routes/         # REST endpoints
├── utils/          # helpers + middleware
├── index.js        # server bootstrap
└── seedData.js     # demo data seeding
```

## ⚙️ Environment Variables

Create `.env` in this folder:

```env
MONGO=your_mongodb_connection_string
JWT=your_jwt_secret
PORT=5000
CLIENT_URL=http://localhost:3000
```

## 🚀 Quick Start

```bash
npm install
npm run seed
npm start
```

API Base URL: `http://localhost:5000/api`

## 📜 Scripts

- `npm start` — start API server
- `npm run seed` — seed hotels/rooms and repair legacy image refs

## 🌱 Seeding Behavior

When you run `npm run seed`, it:

- Adds 20+ hotels across multiple cities
- Creates room inventories per hotel
- Skips already-existing hotels (idempotent)
- Repairs old placeholder image references

## 🔌 Core Endpoints

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
- `POST /bookings` *(auth required)*
- `GET /bookings/user/:id` *(owner/admin)*
- `PUT /bookings/:bookingId/cancel` *(auth required)*

## 🔄 Request Flow

1. Client calls `/api/...`
2. Route maps request to controller
3. Controller validates payload + auth context
4. Mongoose reads/writes MongoDB
5. Error middleware returns consistent JSON format

## 🛡️ Booking Integrity

- Dates are normalized to UTC-midnight
- Availability updates use conflict-aware atomic checks
- If one room conflicts, related updates are rolled back
- Overlap conflicts return `409`

## ❗ Error Response Format

```json
{
  "success": false,
  "status": 400,
  "message": "Error description"
}
```

## 🧪 Quick API Checks

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_user","email":"demo_user@test.com","password":"Pass@1234","country":"India","city":"Goa","phone":"9999999999"}'
```

### Login

```bash
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_user","password":"Pass@1234"}'
```

### Featured city counts

```bash
curl "http://localhost:5000/api/hotels/countByCity?cities=Goa,Mumbai,Manali"
```

## 🧯 Troubleshooting

- **Port conflict**: change `PORT` in `.env`
- **CORS blocked**: ensure `CLIENT_URL` matches frontend origin
- **Auth cookie missing**: confirm frontend sends credentials
- **Mongo errors**: verify `MONGO` URI + IP access rules

## 🚢 Deployment Notes

- Set `CLIENT_URL` to deployed frontend URL
- Use a strong `JWT` secret (32+ chars)
- Enable HTTPS for secure cookie behavior
- Restrict MongoDB network access

## ✅ Production Checklist

- [ ] Secure production `.env` values
- [ ] Lock down CORS origins
- [ ] Avoid sensitive logs
- [ ] Do not run seed on production unintentionally
- [ ] Backup/restore plan for MongoDB

---

### 📌 Current Status

Backend is integrated, conflict-safe for bookings, and ready to pair with the frontend app.