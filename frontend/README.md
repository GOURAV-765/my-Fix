# Frontend - Society Management Portal

The frontend application is built with modern React (v19) and Vite, featuring a premium "Midnight Zinc" dark mode aesthetic.

## Tech Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **State/Data Fetching**: React Context + Custom Hooks, Axios
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Clerk

## Key Directories
- `/src/components`: Reusable UI components (Layout, Animations, Navbars)
- `/src/context`: Global state (Auth, Theme, Department selection)
- `/src/pages`: Major feature pages (Dashboard, Members, Projects, Events, Complaints)
- `/src/services`: API client wrapper

## Setup
1. Copy `.env.example` to `.env` and fill in your `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL`.
2. `npm install`
3. `npm run dev`
