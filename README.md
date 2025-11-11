# Belote Backend

A multiplayer Belote card game backend built with Node.js, TypeScript, Express, Socket.io, PostgreSQL, and Redis following Clean Architecture and Domain-Driven Design principles.

## 🎯 Features

- **Domain-Driven Design** - Clean separation of concerns with domain, application, infrastructure, and presentation layers
- **Real-time Multiplayer** - WebSocket-based game communication using Socket.io
- **Type-Safe** - Full TypeScript implementation with strict typing
- **Authentication** - JWT-based authentication with refresh tokens
- **ELO Rating System** - Player ranking and matchmaking
- **Persistent Game State** - PostgreSQL for game data, Redis for session management
- **Comprehensive Testing** - Unit, integration, and E2E tests

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Docker** >= 20.x
- **Docker Compose** >= 2.x

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aleksandar-transformian/belote-backend.git
cd belote-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

The `.env` file contains all necessary configuration:

```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_NAME=belote_db
DATABASE_USER=belote_user
DATABASE_PASSWORD=belote_password_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# ... (see .env.example for full configuration)
```

### 4. Start Docker Services

Start PostgreSQL and Redis containers:

```bash
npm run docker:up
```

This will:
- Start PostgreSQL on port 5433
- Start Redis on port 6379
- Automatically initialize the database schema from `init-db.sql`

To view Docker logs:
```bash
npm run docker:logs
```

To stop Docker services:
```bash
npm run docker:down
```

### 5. Build the Project

Compile TypeScript to JavaScript:

```bash
npm run build
```

### 6. Run the Application

**Development mode** (with hot-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:3000`

## 🧪 Running Tests

### Run All Tests

```bash
npm test
```

This command runs all tests with coverage reporting.

### Run Specific Test Suites

**Unit Tests Only:**
```bash
npm run test:unit
```

**Integration Tests Only:**
```bash
npm run test:integration
```

**E2E Tests Only:**
```bash
npm run test:e2e
```

### Watch Mode

Run tests in watch mode (auto-rerun on file changes):

```bash
npm run test:watch
```

### Test Coverage

Test coverage is automatically generated when running `npm test`. View the coverage report:

```bash
# Coverage summary is shown in terminal
# Detailed HTML report is in: coverage/lcov-report/index.html
```

Current test coverage:
- **20 unit tests** passing
- Coverage focused on domain layer value objects and entities

## 📁 Project Structure

```
belote-backend/
├── src/
│   ├── domain/                 # Domain layer (entities, value objects)
│   │   ├── entities/          # Domain entities (User, Game, Card)
│   │   ├── value-objects/     # Value objects (UserId, Email, Suit, etc.)
│   │   ├── repositories/      # Repository interfaces
│   │   └── types/             # Domain types and enums
│   ├── application/           # Application layer (use cases)
│   ├── infrastructure/        # Infrastructure layer
│   │   ├── config/           # Configuration management
│   │   └── database/         # Database connection and migrations
│   ├── presentation/          # Presentation layer (routes, controllers)
│   ├── shared/               # Shared utilities
│   │   └── utils/           # Logger, helpers
│   └── index.ts              # Application entry point
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── e2e/                  # End-to-end tests
├── init-db.sql               # Database schema initialization
├── docker-compose.yml        # Docker services configuration
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest testing configuration
└── package.json             # Project dependencies and scripts

```

## 🏗️ Architecture

This project follows **Clean Architecture** and **Domain-Driven Design** principles:

### Domain Layer
- **Entities**: Core business objects (User, Game, Card)
- **Value Objects**: Immutable objects representing domain concepts (Email, UserId, Suit, Rank)
- **Repository Interfaces**: Data access abstractions

### Application Layer
- **Use Cases**: Business logic orchestration
- **DTOs**: Data transfer objects

### Infrastructure Layer
- **Database**: PostgreSQL repositories
- **Cache**: Redis session management
- **External Services**: Third-party integrations

### Presentation Layer
- **REST API**: Express routes and controllers
- **WebSocket**: Socket.io real-time communication

## 🎮 Game Rules - Belote

Belote is a 4-player trick-taking card game played in teams of 2:

- **Deck**: 32 cards (7, 8, 9, 10, J, Q, K, A in 4 suits)
- **Teams**: 2 teams of 2 players
- **Objective**: Score 151 match points to win
- **Trump Cards**: Special values when trump suit is declared
- **Declarations**: Bonus points for sequences and sets

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run all tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run test:e2e` | Run E2E tests only |
| `npm run lint` | Lint code with ESLint |
| `npm run lint:fix` | Fix linting issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run docker:up` | Start Docker services |
| `npm run docker:down` | Stop Docker services |
| `npm run docker:logs` | View Docker logs |

## 🔧 Development Tools

- **TypeScript** - Type safety and better development experience
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **ts-jest** - TypeScript support for Jest
- **Nodemon** - Auto-restart on file changes
- **Docker** - Containerized development environment

## 🌐 API Endpoints

### Health Check
```
GET /health
```

### Authentication (Coming in Phase 2)
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Games (Coming in Phase 3)
```
GET    /api/v1/games
POST   /api/v1/games
GET    /api/v1/games/:id
DELETE /api/v1/games/:id
```

## 🔌 WebSocket Events (Coming in Phase 4)

### Client → Server
- `game:join` - Join a game
- `game:leave` - Leave a game
- `game:bid` - Make a bid
- `game:play-card` - Play a card

### Server → Client
- `game:started` - Game has started
- `game:player-joined` - Player joined
- `game:player-left` - Player left
- `game:bid-made` - Bid was made
- `game:card-played` - Card was played
- `game:round-ended` - Round ended
- `game:game-ended` - Game ended

## 📊 Database Schema

### Tables
- **users** - User accounts with ELO ratings
- **games** - Game instances with team compositions
- **game_rounds** - Individual rounds within games
- **player_hands** - Player card hands (game state)
- **bids** - Bidding history

See `init-db.sql` for complete schema definition.

## 🔐 Security

- Password hashing with bcrypt (10 rounds)
- JWT authentication with access and refresh tokens
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- Input validation with Joi

## 🚧 Roadmap

- [x] **Phase 0**: Project setup and infrastructure
- [x] **Phase 1**: Core domain and database setup
- [ ] **Phase 2**: Authentication and user management
- [ ] **Phase 3**: Game logic and repository implementations
- [ ] **Phase 4**: WebSocket real-time communication
- [ ] **Phase 5**: Matchmaking and ELO system
- [ ] **Phase 6**: Production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Team

## 🙏 Acknowledgments

- Belote game rules and traditional gameplay
- Clean Architecture by Robert C. Martin
- Domain-Driven Design by Eric Evans
