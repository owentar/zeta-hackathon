# Zeta Hackathon Project

This is a monorepo containing a full-stack TypeScript application with React frontend and Express backend.

## Project Structure

- `apps/frontend`: React application with TypeScript and Tailwind CSS
- `apps/backend`: Express server with TypeScript

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start development servers:

```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run dev:frontend
npm run dev:backend
```

## Deployment

- Frontend: Deploys to Vercel
- Backend: Deploys to Render

## Available Scripts

- `npm run dev`: Start both frontend and backend in development mode
- `npm run dev:frontend`: Start only frontend in development mode
- `npm run dev:backend`: Start only backend in development mode
- `npm run build`: Build all applications
- `npm run test`: Run tests across all applications
