# 🧾 FinTrackr Backend

Backend for **FinTrackr**, a modern finance tracking application built using **Node.js**, **TypeScript**, **Express**, and **Prisma**.  The backend is fully containerized using **Docker** for seamless development and production deployment.

---

## 📑 Table of Contents

- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Installation & Development](#-installation--development)
- [Production Setup](#-production-setup)
- [Database (Prisma)](#-database-prisma)
- [NPM Scripts](#-npm-scripts)
- [Quick Start](#-quick-start)
- [Notes](#-notes)
- [License](#-license)

---

## ⚙️ Prerequisites

Ensure the following tools are installed on your system:

- **Node.js** (v20 or above)
- **Docker**
- **Docker Compose**
- **Git** *(optional, for cloning the repository)*

---

## 🧩 Project Structure

This project follows a **feature-based architecture** to ensure scalability, maintainability, and clear separation of concerns.  Each major folder inside `src/` represents a specific domain or responsibility of the backend.
```
FinTrackr-Backend/
├── docker-compose.yml # Docker Compose setup for containerized environment
└── backend/
├── Dockerfile         # Dockerfile for backend service
├── package.json       # Project dependencies and scripts
├── package-lock.json  # Dependency lock file
├── tsconfig.json      # TypeScript configuration
├── .env               # Environment variables
├── .gitignore         # Git ignore file
│
├── prisma/            # Database schema and migration configuration
│ ├── dev.db           # Local development SQLite database (or Postgres URL in .env)
│ ├── schema.prisma    # Prisma ORM schema definition
│ └── migrations/      # Database migration history
│ └── 20251023125814_init/
│ ├── migration.sql    # SQL migration file
│ └── migration_lock.toml
│
├── src/               # Main source code directory
│ ├── config/          # Configuration files (e.g., DB, server setup)
│ ├── controllers/     # Route handlers and business logic entry points
│ ├── middleware/      # Express middlewares (auth checks, validation, etc.)
│ ├── models/          # Prisma models or data-layer logic
│ ├── routes/          # API route definitions
│ ├── services/        # Core application services / reusable logic
│ ├── utils/           # Helper and utility functions
│ ├── tests/           # Test files (unit/integration)
│ └── server.ts        # Main entry point — initializes and starts Express app
│
└── README.md          # Documentation for backend setup
```
---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` folder with the following configuration:
```
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/fintrackr"
JWT_SECRET="yourSecretKey"
```

> 📝 **Note:**  
> - Replace `user` and `password` with your actual PostgreSQL credentials.  
> - Set a strong, unique value for `JWT_SECRET`.  
> - The database URL should match your local or Docker-based PostgreSQL instance.

---

## 🧑‍💻 Installation & Development

   ### 1️⃣ Clone the Repository

    
    git clone https://github.com/SRIKANTHSK30/FinTrackr-Backend.git
    cd FinTrackr-Backend

   ### 2️⃣ Verify Project Layout

    FinTrackr-Backend/backend/

   ### 3️⃣ Start the Backend using Docker Compose

    docker compose up --build
---
## 🚀 Production Setup

When deploying to a production environment:

### 1️⃣ Build the Docker Image

    docker compose build

### 2️⃣ Run the Compiled Backend

    docker compose run backend npm run start
---
## 🗄️ Database (Prisma)

FinTrackr Backend uses Prisma ORM for managing the PostgreSQL database.

   ### 🔧 Generate Prisma Client

     docker compose run backend npm run prisma:generate

  ### 🔄 Apply Migrations

    docker compose run backend npm run prisma:migrate


> ⚠️ Always run migrations before starting the server in a new environment.This ensures your database schema stays up-to-date with your Prisma schema.
---
## 📜 NPM Scripts
**Script Description**
```
npm run dev               #Starts the development server with Nodemon
npm run build	          #Compiles TypeScript into JavaScript (dist/)
npm run start	          #Starts the compiled backend for production
npm run prisma:generate	  #Generates Prisma client files
npm run prisma:migrate	  #Runs Prisma database migrations
```
---

## ⚡ Quick Start
###  Development Environment
    docker compose up --build


### Access the backend API at :
    http://localhost:5000
---

## 🌐 Production Environment

    docker compose build
    docker compose run backend npm run start
---
## 📝 Notes

- The .env file must exist and include valid environment variables.

- Docker volumes allow for live development with hot reload.

- Use compiled JavaScript (dist/) in production for best performance.

- Ensure PostgreSQL (or your chosen DB) is running before applying migrations.

- To connect to the DB outside Docker, ensure your local ports are correctly mapped.
---
## 📘 Example API Flow

**User Authentication – JWT-based login and signup routes.**

**Expense Tracking – CRUD APIs for transactions.**

**Analytics – Aggregated financial statistics fetched using Prisma queries.**

> (Optional: you can document your routes later here for developers joining the project.)
--- 
## 📦 Docker Commands Summary
**Command	Description**

     docker compose up --build	          #Build and start the containers
     docker compose down	              #Stop and remove containers
     docker compose logs -f	              #View live container logs
     docker exec -it <container_name> sh  #Access container shell
---
## 🧰 Tech Stack

- Node.js — Server runtime

- TypeScript — Type safety and modern JS features

- Express.js — Web framework

- Prisma — ORM for database interaction

- PostgreSQL — Database

- Docker — Containerization

- JWT — Secure authentication