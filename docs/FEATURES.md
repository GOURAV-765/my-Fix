# Core Features

## Multi-Tenant Data Isolation
The entire database schema revolves around `Society`. A single instance of this application can host multiple isolated societies without data leakage.

## Department-Level Privacy (RBAC)
Instead of global access, Projects and Tasks are strictly bound to Departments. Members can only view Projects and Tasks that belong to their own Department, ensuring focused workflows.

## AI Event Planner
Integrated with Google Gemini 1.5 Flash. Society Core Admins can enter a basic event title and description, and the AI will auto-generate:
- A structured minute-by-minute itinerary.
- An estimated event budget breakdown (Catering, Marketing, Logistics).
- Potential risk factors and marketing strategies.

## QR Code Ticketing & Check-in
Members can RSVP to events to generate a unique digital Ticket Pass (QR Code / 8-digit PIN). Organizers use the portal to verify these codes at the venue, switching attendee status to `isCheckedIn`.

## Kanban Tasks & Sprints
A built-in Trello-style board for organizing Projects into Sprints and Tasks. Features drag-and-drop-like state changes (TODO -> IN_PROGRESS -> IN_REVIEW -> DONE).

## Complaints & Feedback
Members can submit anonymous or public complaints. Administrators can update the status of these complaints (e.g., RESOLVED), bringing transparency to society governance.
