# Society Management Portal

A full-stack, multi-tenant portal designed to streamline operations for IEEE organizational units, university societies, and tech communities.

This platform replaces fragmented Google Sheets, Discord bots, and messy Notion boards with a single, unified source of truth.

## Project Structure
- **/frontend**: React 19, Vite, Tailwind CSS, TypeScript
- **/backend**: Node.js, Express, Prisma ORM, PostgreSQL, TypeScript
- **/docs**: Detailed documentation on API endpoints and core features

## Quick Start

### Backend
1. `cd backend`
2. Configure `.env` (Use `.env.example` as a template)
3. `npm install`
4. `npx prisma migrate dev --name init`
5. `npm run seed`
6. `npm run dev`

### Frontend
1. `cd frontend`
2. Configure `.env`
3. `npm install`
4. `npm run dev`

## Core Technologies
- **Auth**: Clerk (Frontend) + JWT verification (Backend)
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Midnight Zinc Dark Theme, Lucide Icons, React Hook Form
- **AI**: Gemini 1.5 Flash (Event Planner)