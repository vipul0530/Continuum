\# Waymark Lab — Continuum Project Context



\## Company

\- Company: Waymark Lab (waymarklab.com)

\- Product: Continuum — SAR-7 outreach automation SaaS

\- Market: California county social services agencies (57 addressable counties, all on CalSAWS)

\- Owner: Vipul Bhavsar



\## What Continuum Does

Continuum reduces CalFresh case terminations caused by missed SAR-7 

(Semi-Annual Report) deadlines. It sends proactive multi-channel outreach 

to clients at 60, 30, 14, and 7 days before their SAR-7 due date, provides 

a mobile-friendly digital SAR-7 completion form, and gives county workers 

a real-time dashboard to track compliance and at-risk cases.



\## The Problem It Solves

\- Counties currently rely on a single CalSAWS robocall after the 11th 

&#x20; of the month — reactive and too late

\- Eligible families lose CalFresh benefits due to paperwork failure 

&#x20; not ineligibility

\- Each termination/reinstatement cycle costs \~$175 in worker time

\- A mid-size county has 500-800 avoidable terminations per month



\## Two-Sided Application



\### Side 1 — County Worker Dashboard (Admin)

\- Workers and supervisors log in (make easily connectable via their AD single sign on, Office 365 single sign on, or with user name and password.  make this configurable).

\- Shows all cases with upcoming SAR-7 due dates

\- Color coded by urgency:

&#x20; - RED: Due within 7 days or overdue

&#x20; - YELLOW: Due within 8-14 days

&#x20; - GREEN: Due in 15+ days

\- Tracks outreach history per case

\- Shows completion status in real time

\- Alerts for unresponsive cases

\- Exportable reports

\- Multi-tenant — each county sees only their own data



\### Side 2 — Client Facing (Mobile Web)

\- Client receives SMS or email with personalized tokenized link

\- Clicks link — lands on mobile-optimized web page

\- SAR-7 form pre-populated with known case information

\- Client answers questions and uploads documents via phone camera

\- Submits — worker dashboard updates in real time

\- Available in English and Spanish (additional languages later)



\## Outreach Engine

\- Scheduled background jobs run nightly against case data

\- Triggers SMS via Twilio at 60, 30, 14, 7 days before due date

\- Triggers email at same intervals

\- Escalates unresponsive cases to worker queue

\- Logs all touchpoints for compliance documentation



\## Tech Stack

\- Backend: ASP.NET Core 8 Web API (C#)

\- Frontend: React — ALWAYS use .js extensions, NEVER .jsx

\- Database: SQL Server 2022 Express Edition (local dev), Azure SQL (production)

\- ORM: Entity Framework Core

\- SMS: Twilio

\- Auth: JWT tokens for county workers, tokenized links for clients

\- Hosting: Azure App Service (production)

\- Source Control: GitHub (private repo)

\- IDE: Visual Studio Community 2026 (2) / Claude Desktop



\## Project Structure

```

C:\\Projects\\WaymarkLab\\Continuum\\

├── Continuum.API\\          # ASP.NET Core 8 Web API

├── Continuum.Web\\          # React frontend

├── Continuum.Database\\     # EF Core migrations and schema

└── CONTEXT.md              # This file

```



\## Database — Key Entities

\- Counties (tenants)

\- Cases (CalFresh cases with SAR-7 due dates)

\- Clients (case holders — name, phone, email)

\- OutreachLog (every SMS/email sent per case)

\- SARSubmissions (completed digital SAR-7 forms)

\- Workers (county staff with login access)



\## API — Key Endpoints Needed

\- GET /api/cases?countyId=\&status=\&dueDateRange=

\- GET /api/cases/{id}

\- POST /api/cases/import (CSV upload from CalSAWS export)

\- GET /api/outreach/{caseId}

\- POST /api/outreach/send

\- GET /api/sar/{token} (client facing — tokenized)

\- POST /api/sar/{token}/submit

\- GET /api/reports/summary?countyId=



\## Brand Colors

\- Primary: #1B3A6B (navy blue)

\- Accent: #2ECC71 (green)

\- Warning: #F39C12 (yellow/orange)

\- Danger: #E74C3C (red)

\- Background: #F8F9FA (light gray)



\## Important Rules

\- Always use .js extensions for React files, never .jsx

\- All code changes are made directly to files — never ask Vipul to write code

\- Multi-tenant architecture — every query must be scoped to countyId

\- Mobile-first design for client-facing forms. Make the UI highly reactive to be able to use on any screen size including a desktop, iPad, etc.  Must be very professional.  Make me say wow!

\- Professional clean UI for worker dashboard. Must be very professional.  make me say wow!

\- Never use Orange County (OC) as sample/test data

\- Use realistic California county names for test data.  Never use Orange County for any sample name or examples.

&#x20; (e.g. San Diego, Riverside, San Bernardino, Fresno)

\- Always commit changes and updates to code to GitHub at https://github.com/vipul0530/Continuum



\## Current Status

\- Project scaffolding: STARTED

\- Working on getting the database set up and there are bugs to be fixed in the code using Visual Studio Community 2026 (2).  I am unable to get things up and running. Need to work on making the UI more professional to really wow potential customers. You need to be creative with the UI and make me "wow! this is impressive!". I need to be able to load and run the site via Visual Studio.

