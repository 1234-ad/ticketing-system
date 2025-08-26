# 📁 Project Structure

This document provides an overview of the ticketing system project structure.

## 🏗️ Overall Structure

```
ticketing-system/
├── 📁 backend/                 # Spring Boot backend application
├── 📁 frontend/                # Next.js frontend application
├── 📁 database/                # Database scripts and migrations
├── 📄 docker-compose.yml       # Docker orchestration
├── 📄 setup.sh                 # Automated setup script
├── 📄 README.md                # Project documentation
└── 📄 PROJECT_STRUCTURE.md     # This file
```

## 🔧 Backend Structure (`/backend`)

```
backend/
├── 📁 src/main/java/com/ticketing/
│   ├── 📁 controller/          # REST API controllers
│   │   ├── AdminController.java
│   │   ├── AuthController.java
│   │   ├── CommentController.java
│   │   └── TicketController.java
│   ├── 📁 dto/                 # Data Transfer Objects
│   │   ├── CommentRequest.java
│   │   ├── JwtResponse.java
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   └── TicketRequest.java
│   ├── 📁 exception/           # Custom exceptions and handlers
│   │   ├── AccessDeniedException.java
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   └── UserAlreadyExistsException.java
│   ├── 📁 model/               # JPA entities
│   │   ├── Attachment.java
│   │   ├── Comment.java
│   │   ├── Priority.java
│   │   ├── Role.java
│   │   ├── Ticket.java
│   │   ├── TicketStatus.java
│   │   └── User.java
│   ├── 📁 repository/          # Data access layer
│   │   ├── AttachmentRepository.java
│   │   ├── CommentRepository.java
│   │   ├── TicketRepository.java
│   │   └── UserRepository.java
│   ├── 📁 security/            # Security configuration
│   │   ├── AuthEntryPointJwt.java
│   │   ├── AuthTokenFilter.java
│   │   ├── JwtUtils.java
│   │   └── WebSecurityConfig.java
│   ├── 📁 service/             # Business logic layer
│   │   ├── CommentService.java
│   │   ├── EmailService.java
│   │   ├── TicketService.java
│   │   ├── UserDetailsServiceImpl.java
│   │   └── UserService.java
│   └── TicketingSystemApplication.java
├── 📁 src/main/resources/
│   └── application.yml         # Application configuration
├── 📁 src/test/                # Unit and integration tests
├── 📄 pom.xml                  # Maven dependencies
└── 📄 Dockerfile               # Docker configuration
```

## 🎨 Frontend Structure (`/frontend`)

```
frontend/
├── 📁 src/
│   ├── 📁 app/                 # Next.js App Router
│   │   ├── 📁 admin/           # Admin panel pages
│   │   │   └── page.tsx
│   │   ├── 📁 auth/            # Authentication pages
│   │   │   ├── 📁 login/
│   │   │   │   └── page.tsx
│   │   │   └── 📁 register/
│   │   │       └── page.tsx
│   │   ├── 📁 dashboard/       # Dashboard page
│   │   │   └── page.tsx
│   │   ├── 📁 tickets/         # Ticket management pages
│   │   │   ├── 📁 [id]/        # Dynamic ticket detail page
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 all/         # All tickets (admin/agent)
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 create/      # Create ticket page
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx        # My tickets page
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── 📁 components/          # Reusable UI components
│   │   └── 📁 Layout/
│   │       ├── DashboardLayout.tsx
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx
│   ├── 📁 contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── 📁 services/            # API service layer
│   │   ├── adminService.ts
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   └── ticketService.ts
│   └── 📁 types/               # TypeScript type definitions
│       └── index.ts
├── 📄 .env.example             # Environment variables template
├── 📄 next.config.js           # Next.js configuration
├── 📄 package.json             # Node.js dependencies
├── 📄 postcss.config.js        # PostCSS configuration
├── 📄 tailwind.config.js       # Tailwind CSS configuration
├── 📄 tsconfig.json            # TypeScript configuration
└── 📄 Dockerfile               # Docker configuration
```

## 🗄️ Database Structure (`/database`)

```
database/
└── init.sql                    # Database initialization script
```

## 🔑 Key Components

### Backend Components

#### Controllers
- **AuthController**: Handles user authentication (login, register, logout)
- **TicketController**: Manages ticket CRUD operations and status updates
- **CommentController**: Handles ticket comments
- **AdminController**: Admin-only operations (user management, system stats)

#### Services
- **UserService**: User management and authentication logic
- **TicketService**: Core ticket business logic
- **CommentService**: Comment management
- **EmailService**: Email notifications (future enhancement)

#### Security
- **JWT-based authentication**: Stateless token-based auth
- **Role-based access control**: USER, SUPPORT_AGENT, ADMIN roles
- **Method-level security**: Secured endpoints based on roles

### Frontend Components

#### Pages
- **Home**: Landing page with feature overview
- **Auth Pages**: Login and registration forms
- **Dashboard**: Role-based dashboard with stats and recent tickets
- **Ticket Pages**: Create, view, and manage tickets
- **Admin Panel**: User management and system administration

#### Services
- **API Service**: Centralized HTTP client with interceptors
- **Auth Service**: Authentication operations
- **Ticket Service**: Ticket-related API calls
- **Admin Service**: Admin operations

#### Context
- **AuthContext**: Global authentication state management

## 🔄 Data Flow

### Authentication Flow
1. User submits credentials → AuthController
2. Validates credentials → UserService
3. Generates JWT token → JwtUtils
4. Returns token to frontend
5. Frontend stores token and updates AuthContext
6. Subsequent requests include JWT in Authorization header

### Ticket Management Flow
1. User creates ticket → TicketController
2. Validates and saves → TicketService
3. Updates database → TicketRepository
4. Returns ticket data to frontend
5. Frontend updates UI and shows success message

### Role-Based Access
- **Users**: Can only view/manage their own tickets
- **Support Agents**: Can view all tickets, update status, add comments
- **Admins**: Full system access including user management

## 🚀 Deployment Architecture

### Development
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`
- Database: `localhost:5432`

### Docker Deployment
- All services containerized
- PostgreSQL in separate container
- Network isolation with docker-compose
- Health checks for service dependencies

## 📊 Database Schema

### Core Tables
- **users**: User accounts and roles
- **tickets**: Support tickets with status and priority
- **comments**: Ticket comments and history
- **attachments**: File attachments (future enhancement)

### Relationships
- User → Tickets (one-to-many)
- User → Comments (one-to-many)
- Ticket → Comments (one-to-many)
- Ticket → Attachments (one-to-many)

## 🔧 Configuration

### Backend Configuration
- **application.yml**: Database, JWT, CORS, email settings
- **Security**: JWT secret, token expiration
- **Database**: PostgreSQL connection settings

### Frontend Configuration
- **.env.local**: API URL and environment variables
- **next.config.js**: Next.js build and runtime settings
- **tailwind.config.js**: UI styling configuration

## 🧪 Testing Strategy

### Backend Testing
- Unit tests for services and repositories
- Integration tests for controllers
- Security tests for authentication

### Frontend Testing
- Component testing with React Testing Library
- Integration testing for user flows
- E2E testing with Cypress (future enhancement)

## 📈 Future Enhancements

### Planned Features
- File attachments for tickets
- Email notifications
- Advanced reporting and analytics
- Mobile application
- Real-time updates with WebSocket

### Technical Improvements
- Caching with Redis
- Message queues for async processing
- Microservices architecture
- API rate limiting
- Comprehensive monitoring and logging

---

This structure provides a solid foundation for a scalable ticketing system with clear separation of concerns and modern development practices.