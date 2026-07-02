# API Reference

Base URL: `https://your-service.onrender.com/api`

Authentication: All authenticated routes require a JWT cookie (`token`). The server sets this cookie on login.

---

## Auth

### POST `/auth/register`
Create a new account.

```json
{
  "email": "student@university.edu.ng",
  "password": "password123",
  "fullName": "Ada Lovelace",
  "role": "student"
}
```

### POST `/auth/login`
```json
{ "email": "...", "password": "..." }
```
Returns user object + sets httpOnly cookie.

### POST `/auth/logout`
Clears the JWT cookie.

### GET `/auth/me`
Returns the current authenticated user.

### POST `/auth/forgot-password`
Sends password reset email.

### POST `/auth/reset-password`
```json
{ "token": "...", "newPassword": "newpassword123" }
```

---

## Projects

### GET `/projects`
Public. Browse and search projects.

Query params: `q`, `department`, `year`, `page`, `limit`

### GET `/projects/:id`
Public. Single project details.

### POST `/projects/upload`
Auth required. Multipart form with `file` field (DOCX or PDF, max 20MB).

Returns extracted fields for review:
```json
{
  "tempFileId": "uuid.docx",
  "fields": { "title": "...", "abstract": "...", "authorName": "...", "department": "...", "year": 2024 },
  "departments": [...],
  "suggestedDepartmentId": "uuid"
}
```

### POST `/projects/confirm`
Auth required. Saves the project with generated embedding.

```json
{
  "tempFileId": "uuid.docx",
  "title": "...",
  "abstract": "...",
  "authorName": "...",
  "departmentId": "uuid",
  "year": 2024,
  "originalFileName": "project.docx",
  "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "fileSize": 123456
}
```

### GET `/projects/my/list`
Auth required. Current user's uploaded projects.

### GET `/projects/:id/download`
Public. Downloads the uploaded project document when available.

---

## Similarity

### POST `/similarity/check`
Public. Authenticated users also get the check saved to their history.

```json
{
  "title": "AI-based attendance system",
  "abstract": "...",
  "threshold": 0.5
}
```

Returns ranked results with cosine similarity scores (0–1).

### GET `/similarity/history`
Auth required. Current user's check history.

### GET `/similarity/:id`
Auth required. Full details of a specific check.

---

## Departments

### GET `/departments`
Public. Active departments only.

### GET `/departments/all`
Admin only. All departments.

### POST `/departments`
Admin only. Create department.

### PATCH `/departments/:id`
Admin only. Update department.

### DELETE `/departments/:id`
Admin only. Soft delete (deactivate).

---

## Admin

### GET `/admin/stats`
Admin only. Dashboard statistics.

### GET `/admin/users`
Admin only. Paginated user list. Query: `page`, `limit`, `role`, `isActive`, `search`.

### PATCH `/admin/users/:id`
Admin only. Update role or active status.

### DELETE `/admin/users/:id`
Admin only. Deactivate user.

### GET `/admin/projects`
Admin only. All projects including deleted.

### DELETE `/admin/projects/:id`
Admin only. Soft delete project.

### GET `/admin/similarity-logs`
Admin only. All similarity check logs. Query: `page`, `limit`, `userId`, `query`.

### POST `/admin/departments`
### PATCH `/admin/departments/:id`

---

## Health

### GET `/health`
No auth. Returns server status and whether the embedding model is loaded.
