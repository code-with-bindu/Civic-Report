# 📡 API Documentation — Civic Issue Reporting Platform

Base URL: `http://localhost:5000/api`

---

## Authentication

### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```
**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJI..."
  }
}
```

### POST `/auth/login`
**Request Body:**
```json
{ "email": "john@example.com", "password": "password123" }
```
**Response (200):** Same shape as register response.

### GET `/auth/me`
Get current user profile. **Requires:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": { "_id": "...", "name": "John Doe", "email": "john@example.com", "role": "user" }
}
```

---

## Tickets — User

All ticket routes require `Authorization: Bearer <token>`.

### POST `/tickets`
Create a new ticket. **Content-Type:** `multipart/form-data`

| Field       | Type   | Required | Notes                                |
|-------------|--------|----------|--------------------------------------|
| title       | string | Yes      | Max 200 characters                   |
| description | string | Yes      | Max 2000 characters                  |
| category    | string | Yes      | Road, Water, Electricity, Garbage, Other |
| location    | string | Yes      |                                      |
| media       | file[] | No       | Up to 5 files, 10 MB each            |

**Response (201):**
```json
{ "success": true, "data": { "_id": "...", "title": "...", "status": "Submitted", ... } }
```

### GET `/tickets/my`
Get all tickets created by the logged-in user.

**Response (200):**
```json
{ "success": true, "count": 5, "data": [ { ... }, ... ] }
```

### GET `/tickets/:id`
Get a single ticket by ID (owner or admin).

### PUT `/tickets/:id`
Update a ticket (owner only, not if Resolved). **Content-Type:** `multipart/form-data`. Same fields as create.

### DELETE `/tickets/:id`
Delete own ticket.

---

## Tickets — Admin

All admin routes require `role: admin`.

### GET `/tickets/admin/all`
Get all tickets with optional filters.

| Query Param | Type   | Description           |
|-------------|--------|-----------------------|
| category    | string | Filter by category    |
| status      | string | Filter by status      |
| page        | number | Page number (default 1)|
| limit       | number | Per page (default 20) |

**Response (200):**
```json
{ "success": true, "count": 10, "total": 50, "page": 1, "pages": 5, "data": [...] }
```

### GET `/tickets/admin/analytics`
Get dashboard analytics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "submitted": 30,
    "inProgress": 25,
    "resolved": 40,
    "rejected": 5,
    "byCategory": { "Road": 30, "Water": 20, "Electricity": 15, "Garbage": 25, "Other": 10 }
  }
}
```

### PUT `/tickets/admin/:id/status`
Update ticket status.
```json
{ "status": "In Progress" }
```

### POST `/tickets/admin/:id/notes`
Add a progress note.
```json
{ "note": "Road repair crew dispatched." }
```

### DELETE `/tickets/admin/:id`
Delete any ticket (admin).

---

## Error Responses
All errors follow this format:
```json
{ "success": false, "message": "Error description" }
```

| Status | Meaning                  |
|--------|--------------------------|
| 400    | Bad request / validation |
| 401    | Unauthorized             |
| 403    | Forbidden (role)         |
| 404    | Not found                |
| 500    | Server error             |
