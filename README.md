# Trip Manager

A NestJS-based RESTful API for managing and searching trips between different airports

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Testing](#testing)

## Project Structure

```
trip-manager/
├── src/
│   ├── apis/                   # External API integrations
│   │   ├── apis.module.ts
│   │   └── trips-api/           # Trips API service
│   │       └── trips-api.service.ts
│   ├── common/                 # Shared resources
│   │   ├── airports/            # Airport datas
│   │   │   └── available.ts
│   │   ├── dtos/                # Common DTOs
│   │   │   └── pagination.dto.ts
│   │   ├── enums/               # Enumerations
│   │   │   ├── sorting-strategy.enum.ts
│   │   │   └── trip-typology.enum.ts
│   │   ├── interfaces/          # TypeScript interfaces
│   │   │   └── trip.interface.ts
│   │   └── types/              # Type definitions
│   │       └── airport.ts
│   ├── trips/                  # Trips module
│   │   ├── dtos/                # Trip DTOs
│   │   │   ├── find-all-trips.dto.ts
│   │   │   ├── find-many-trips.dto.ts
│   │   │   └── save-trip.dto.ts
│   │   ├── entities/             # Trip entities
│   │   │   └── trip.entity.ts
│   │   ├── trips.controller.ts  # REST controller
│   │   ├── trips.module.ts      # Module definition
│   │   ├── trips-search.service.ts  # Search logic
│   │   ├── trips-storage.service.ts # Storage logic
│   │   └── *.spec.ts            # Unit tests
│   ├── app.module.ts            # Root module
│   └── main.ts                  # Application entry point
├── Dockerfile                  # Docker configuration
├── package.json                # Dependencies and scripts
├── pnpm-lock.yaml              # Lock file
├── tsconfig.json               # TypeScript configuration
├── nest-cli.json               # NestJS CLI configuration
├── eslint.config.mjs           # ESLint configuration
├── .env.example                # Example environment variables
└── .prettierrc                 # Prettier configuration
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v22 or higher
- **pnpm**: Latest version (or use `corepack enable`)
- **Docker**: (optional, for containerized deployment)

## Local Development

### 1. Clone the Repository

```bash
git clone <repository-url>
cd trip-manager
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory based on the provided `.env.example`

```bash
cp .env.example .env
```

### 4. Run the Application in development mode
```bash
pnpm run start:dev
```

## Docker Deployment

### 1. Environment Configuration

Create a `.env` file in the root directory based on the provided `.env.example`

```bash
cp .env.example .env
```

### 2. Build the Docker Image

```bash
docker build -t trip-manager:latest .
```

### 3. Run the Docker Container

```bash
docker run -d -p 3000:3000 trip-manager:latest
```

## API Documentation

Once the application is running, visit `http://localhost:3000/docs` to access the interactive Swagger documentation.

## Testing

The project includes unit tests with Jest. To run the tests, use the following command:

```bash
pnpm run test
```
