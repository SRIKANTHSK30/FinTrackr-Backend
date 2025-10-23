# FinTrackr Backend API

A comprehensive personal finance tracker backend API built with Node.js, TypeScript, Express, and PostgreSQL.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Transaction Management**: Full CRUD operations for financial transactions
- **Category Management**: Organize transactions with custom categories
- **Real-time Analytics**: Dashboard with spending insights and summaries
- **RESTful API**: Well-documented REST API with Swagger/OpenAPI
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session management and performance
- **Security**: Rate limiting, CORS, Helmet, input validation
- **Testing**: Comprehensive test suite with Jest
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Docker**: Containerized application with Docker Compose

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Client    │────────▶│   API Layer  │────────▶│   Database   │
│  (React)    │◀────────│  (Express)   │◀────────│ (PostgreSQL) │
└─────────────┘         └──────────────┘         └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │    Redis     │
                        │   (Cache)    │
                        └──────────────┘
```

## 📋 Prerequisites

- Node.js 20+ LTS
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fintrackr-backend.git
   cd fintrackr-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/fintrackr?schema=public"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed the database (optional)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Docker Development

1. **Start services with Docker Compose**
   ```bash
   # Production environment
   docker-compose up -d
   
   # Development environment
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec api npx prisma migrate deploy
   ```

3. **Seed the database**
   ```bash
   docker-compose exec api npm run db:seed
   ```

## 📚 API Documentation

Once the server is running, visit:
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/v1/health

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout user |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/profile` | Get user profile |
| PUT | `/api/v1/users/profile` | Update user profile |
| DELETE | `/api/v1/users/account` | Delete user account |
| GET | `/api/v1/users/dashboard` | Get dashboard data |

### Transaction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/transactions` | Create transaction |
| GET | `/api/v1/transactions` | Get transactions (paginated) |
| GET | `/api/v1/transactions/:id` | Get specific transaction |
| PUT | `/api/v1/transactions/:id` | Update transaction |
| DELETE | `/api/v1/transactions/:id` | Delete transaction |
| GET | `/api/v1/transactions/summary` | Get transaction summary |

### Category Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/categories` | Create category |
| GET | `/api/v1/categories` | Get categories |
| GET | `/api/v1/categories/:id` | Get specific category |
| PUT | `/api/v1/categories/:id` | Update category |
| DELETE | `/api/v1/categories/:id` | Delete category |
| GET | `/api/v1/categories/:id/stats` | Get category statistics |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Production

```bash
# Build and start production containers
docker-compose up -d

# View logs
docker-compose logs -f api
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh secret | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `info` |

## 📊 Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `passwordHash` (String)
- `name` (String)
- `googleId` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Transactions Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `type` (Enum: CREDIT/DEBIT)
- `amount` (Decimal)
- `category` (String)
- `description` (Text, Optional)
- `date` (DateTime)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Categories Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `name` (String)
- `type` (Enum: INCOME/EXPENSE)
- `color` (String, Hex Color)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **Helmet**: Security headers
- **Redis Sessions**: Secure session management

## 🛠️ Development

### Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models (Prisma)
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
└── server.ts        # Application entry point

prisma/
├── schema.prisma    # Database schema
└── seed.ts         # Database seeding

tests/
├── setup.ts        # Test configuration
└── *.test.ts       # Test files
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run format     # Format code with Prettier
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please:

1. Check the [API Documentation](http://localhost:3000/api-docs)
2. Review the [Issues](https://github.com/your-username/fintrackr-backend/issues)
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Jest](https://jestjs.io/) - Testing framework
- [Docker](https://www.docker.com/) - Containerization 
