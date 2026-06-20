# TaskManager API

## Summary

This PR adds the **TaskManager** Node.js backend for the full-stack coding assessment. It provides a REST API that the Next.js frontend uses for task CRUD operations.

The API includes input validation, CORS support for the frontend, and a clear project structure with separated routes, controllers, and storage.

## Changes

### API server
- **Express app** with JSON parsing, CORS, and centralized error handling
- **Health check** at `GET /health`
- **Task CRUD** at `/api/tasks` matching the frontend contract

### Routes and controllers
- **routes/tasks.js** — maps HTTP methods to controller handlers
- **taskController.js** — validates input, calls the store, and returns JSON responses

### Data and validation
- **taskStore.js** — in-memory task storage with UUID ids and timestamps
- **validation.js** — checks title, description, and status on create/update

### Project setup
- Added `.env.example` for `PORT`, `CORS_ORIGIN`, and `NODE_ENV`
- Added `.gitignore` to exclude `.env` and `node_modules`
- Added `INITIAL_SETUP.README` with setup steps, API docs, and file overview

## API contract

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/tasks` | Fetch all tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

Task statuses: `pending`, `in_progress`, `completed`.

Error responses:

```json
{ "message": "Error details" }
```

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API port | `5000` |
| `CORS_ORIGIN` | Frontend origin | `http://localhost:3000` |
| `NODE_ENV` | Runtime environment | `development` |

## Test plan

- [ ] Copy `.env.example` to `.env`
- [ ] Run `npm install` and `npm run dev`
- [ ] Confirm `GET http://localhost:5000/health` returns `{ "status": "ok" }`
- [ ] Create a task with `POST /api/tasks`
- [ ] List tasks with `GET /api/tasks`
- [ ] Update a task with `PATCH /api/tasks/:id`
- [ ] Delete a task with `DELETE /api/tasks/:id`
- [ ] Send invalid data and confirm `400` with a `message` field
- [ ] Request a missing task id and confirm `404`
- [ ] Start the frontend and verify full CRUD from the UI

## Notes

- Tasks are stored in memory and reset when the server restarts
- CORS is limited to the origin set in `CORS_ORIGIN`
- See `INITIAL_SETUP.README` for full project structure and setup instructions
