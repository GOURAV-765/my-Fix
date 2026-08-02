# Backend - Society Management Portal

A robust REST API built with Express, TypeScript, and Prisma ORM.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT, Clerk Webhooks integration
- **Validation**: Zod + custom express middlewares

## Architecture
The backend follows a strict **Controller-Service-Repository** pattern using TypeScript classes:
- **Controllers**: Handle HTTP requests, responses, and payload extraction.
- **Services**: Contain core business logic, permissions checks, and AI integrations (Gemini).
- **Prisma Schema**: Enforces database constraints and multi-tenancy (`societyId`).

## Setup
1. Copy `.env.example` to `.env` (Set `DATABASE_URL`, `JWT_SECRET`, etc.)
2. `npm install`
3. `npx prisma db push` or `npx prisma migrate dev`
4. `npm run dev`
