# API Documentation

Base URL: `/api/v1`

## Authentication
- `POST /auth/login` - Authenticate via Clerk or local credentials
- `GET /auth/me` - Get current session user profile

## Collaboration & Events
- `POST /collaboration/events` - Publish a new event
- `GET /collaboration/events` - List upcoming events
- `POST /collaboration/events/:id/register` - RSVP to an event
- `POST /collaboration/events/:id/checkin` - Verify an attendee ticket
- `POST /ai/event-planner` - Generate AI event plan

## Projects & Tasks
- `POST /projects` - Create a department-scoped project
- `GET /projects` - List visible projects
- `POST /tasks` - Create a task within a sprint/project
- `PATCH /tasks/:id/status` - Move a task across the Kanban board

## Members & Departments
- `GET /members` - List all society members
- `POST /members` - Onboard a new member
- `GET /departments` - List active departments

## General Response Format
Most endpoints return a standardized JSON wrapper:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional context string"
}
```
