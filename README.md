# 🎫 Ticketing System

A comprehensive full-stack ticketing system built with Spring Boot and Next.js, designed for IT support and customer service scenarios.

## 🚀 Features

### ✅ Must-Have Features (Implemented)

#### 1. Authentication & Authorization
- ✅ Login and logout functionality
- ✅ Role-based access control (User, Admin, Support Agent)
- ✅ JWT-based authentication
- ✅ Secure password handling

#### 2. User Dashboard
- ✅ Create new tickets with subject, description, and priority
- ✅ View personal tickets and their current status
- ✅ Add comments to tickets
- ✅ Track ticket status (Open, In Progress, Resolved, Closed)
- ✅ View complete ticket history with comments

#### 3. Ticket Management
- ✅ Complete ticket lifecycle: Open → In Progress → Resolved → Closed
- ✅ Ticket reassignment capabilities
- ✅ Comment threads with timestamps and user information
- ✅ Track ticket owner and assignee

#### 4. Admin Panel
- ✅ Complete user management (add/remove users)
- ✅ Role assignment (Admin, Support Agent, User)
- ✅ View and manage all tickets
- ✅ Force reassign or resolve/close any ticket
- ✅ Monitor ticket statuses across all users

#### 5. Access Control
- ✅ Admins can manage users and override tickets
- ✅ Support agents can be assigned tickets, add comments, and change statuses
- ✅ Regular users can only manage their own tickets

### 🌟 Good-to-Have Features (Implemented)

#### 1. Search & Filter
- ✅ Search tickets by subject, status, priority, or user
- ✅ Filter tickets by status or assigned agent
- ✅ Advanced filtering options

#### 2. Ticket Prioritization
- ✅ Priority levels (Low, Medium, High, Urgent)
- ✅ Sort and filter tickets based on priority
- ✅ Priority-based visual indicators

#### 3. Enhanced UI/UX
- ✅ Responsive design with Tailwind CSS
- ✅ Modern, clean interface
- ✅ Real-time status updates
- ✅ Toast notifications for user feedback

## 🛠️ Tech Stack

### Backend
- **Java/Spring Boot** - REST API and business logic
- **PostgreSQL** - Database for data persistence
- **Spring Security** - Authentication and authorization
- **JWT** - Token-based authentication
- **Spring Data JPA** - Database operations

### Frontend
- **Next.js 14** - React-based framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling
- **React Toastify** - Notifications

## 📋 Prerequisites

- **Java 17+**
- **Node.js 18+**
- **PostgreSQL 12+**
- **Maven 3.6+**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/1234-ad/ticketing-system.git
cd ticketing-system
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE ticketing_db;
```

2. Update database credentials in `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ticketing_db
    username: your_username
    password: your_password
```

### 3. Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend will start on `http://localhost:3000`

### 5. Environment Variables

#### Backend (`application.yml`)
```yaml
app:
  jwt:
    secret: your-secret-key
    expiration: 86400000 # 24 hours
  
  cors:
    allowed-origins: http://localhost:3000

spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
```

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## 👥 Default Users

The system creates default users on first startup:

- **Admin User**
  - Email: `admin@ticketing.com`
  - Password: `admin123`
  - Role: Admin

- **Support Agent**
  - Email: `agent@ticketing.com`
  - Password: `agent123`
  - Role: Support Agent

- **Regular User**
  - Email: `user@ticketing.com`
  - Password: `user123`
  - Role: User

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

### Tickets
- `GET /api/tickets` - Get all tickets (Admin/Support Agent)
- `GET /api/tickets/my` - Get user's tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/{id}` - Get ticket details
- `PATCH /api/tickets/{id}/status` - Update ticket status
- `PATCH /api/tickets/{id}/assign` - Assign ticket

### Comments
- `GET /api/tickets/{id}/comments` - Get ticket comments
- `POST /api/tickets/{id}/comments` - Add comment

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user

## 🎨 UI Components

### Role-Based Navigation
- **Users**: Dashboard, My Tickets, Create Ticket
- **Support Agents**: Dashboard, My Tickets, All Tickets, Create Ticket
- **Admins**: Dashboard, My Tickets, All Tickets, Create Ticket, Admin Panel

### Status Indicators
- 🟢 **Open** - New tickets awaiting attention
- 🟡 **In Progress** - Tickets being worked on
- 🔵 **Resolved** - Tickets marked as resolved
- ⚫ **Closed** - Completed tickets

### Priority Levels
- 🔴 **Urgent** - Critical issues requiring immediate attention
- 🟠 **High** - Important issues
- 🟡 **Medium** - Standard priority
- ⚪ **Low** - Minor issues

## 🧪 Testing

### Backend Testing
```bash
cd backend
mvn test
```

### Frontend Testing
```bash
cd frontend
npm run test
```

## 📦 Deployment

### Backend Deployment
1. Build the JAR file:
```bash
mvn clean package
```

2. Run the application:
```bash
java -jar target/ticketing-system-1.0.0.jar
```

### Frontend Deployment
1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
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

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/1234-ad/ticketing-system/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- [ ] Email notifications for ticket updates
- [ ] File attachments for tickets
- [ ] Ticket rating system
- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] Integration with external systems
- [ ] Automated ticket assignment
- [ ] SLA management
- [ ] Knowledge base integration

---

**Built with ❤️ by the Development Team**