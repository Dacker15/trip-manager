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
│   ├── auth/                      # Authentication module
│   │   ├── dtos/
│   │   │   ├── auth-response.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── sign-up.dto.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── interfaces/
│   │   │   └── jwt-payload.interface.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.decorator.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.service.spec.ts
│   │   └── logged-user.decorator.ts
│   ├── common/                    # Shared resources
│   │   ├── airports/
│   │   │   └── available.ts
│   │   ├── dtos/
│   │   │   └── pagination.dto.ts
│   │   ├── enums/
│   │   │   ├── sorting-strategy.enum.ts
│   │   │   └── trip-typology.enum.ts
│   │   ├── interfaces/
│   │   │   ├── trip.interface.ts
│   │   │   └── user.interface.ts
│   │   └── types/
│   │       └── airport.ts
│   ├── providers/                 # Infrastructure providers
│   │   ├── database/
│   │   │   ├── entities/
│   │   │   │   ├── index.ts
│   │   │   │   ├── saved-trip.entity.ts
│   │   │   │   └── user.entity.ts
│   │   │   └── typeorm.config.ts
│   │   ├── trips-api/
│   │   │   └── trips-api.service.ts
│   │   └── providers.module.ts
│   ├── trips/                     # Trips module
│   │   ├── dtos/
│   │   │   ├── find-all-trips.dto.ts
│   │   │   ├── find-many-trips.dto.ts
│   │   │   └── save-trip.dto.ts
│   │   ├── entities/
│   │   │   └── trip.entity.ts
│   │   ├── trips.controller.ts
│   │   ├── trips.module.ts
│   │   ├── trips-search.service.ts
│   │   ├── trips-search.service.spec.ts
│   │   ├── trips-storage.service.ts
│   │   └── trips-storage.service.spec.ts
│   ├── app.module.ts              # Root module
│   └── main.ts                    # Application entry point
├── typeorm/                       # TypeORM CLI
│   ├── migrations/
│   │   └── 1769032257368-first-migration.ts
│   └── typeorm.cli.ts
├── docker-compose.yml             # Docker Compose configuration
├── Dockerfile                     # Docker image definition
├── package.json                   # Dependencies and scripts
├── pnpm-lock.yaml                 # Lock file
├── pnpm-workspace.yaml            # PNPM workspace configuration
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.build.json            # TypeScript build configuration
├── nest-cli.json                  # NestJS CLI configuration
├── eslint.config.mjs              # ESLint configuration
└── README.md                      # Project documentation
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

### 4. Database Setup

Ensure you have a PostgreSQL database running. You can use Docker to quickly set up a PostgreSQL instance:

```bash
docker run --name trip-manager-db -v ./postgres-data:/var/lib/postgresql/data --env-file .env -p 5432:5432 -d postgres:18-alpine
```
### 5. Run Database Migrations

```bash
pnpm run migration:run
```

### 5. Run the Application in development mode
```bash
pnpm run start:dev
```

## Docker Deployment

### 1. Environment Configuration

Create a `.env` file in the root directory based on the provided `.env.example`

```bash
cp .env.example .env
```

### 2. Build with Docker Compose

```bash
docker compose up -d
```

## API Documentation

Once the application is running, visit `http://localhost:3000/docs` to access the interactive Swagger documentation.

## Testing

The project includes unit tests with Jest. To run the tests, use the following command:

```bash
pnpm run test
```
