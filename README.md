# Zeta Hackathon Project

This is a monorepo containing a full-stack TypeScript application with React frontend and Express backend.

## Project Structure

- `apps/frontend`: React application with TypeScript and Tailwind CSS
- `apps/backend`: Express server with TypeScript

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Yarn (v4)

## Setup

1. Install dependencies:

```bash
yarn
```

2. Start development servers:

```bash
# Start both frontend and backend
yarn dev

# Or start them separately
yarn dev:frontend
yarn dev:backend
```

## Deployment

- Frontend: Deploys to Vercel
- Backend: Deploys to Render

## Available Scripts

- `yarn dev`: Start both frontend and backend in development mode
- `yarn dev:frontend`: Start only frontend in development mode
- `yarn dev:backend`: Start only backend in development mode
- `yarn build`: Build all applications
- `yarn test`: Run tests across all applications
