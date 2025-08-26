#!/bin/bash

# Ticketing System Setup Script
# This script helps set up the development environment

set -e

echo "🎫 Ticketing System Setup"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Java
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed. Please install Java 17 or higher."
        exit 1
    fi
    
    java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$java_version" -lt 17 ]; then
        print_error "Java 17 or higher is required. Current version: $java_version"
        exit 1
    fi
    print_status "Java $java_version found ✓"
    
    # Check Maven
    if ! command -v mvn &> /dev/null; then
        print_error "Maven is not installed. Please install Maven 3.6 or higher."
        exit 1
    fi
    print_status "Maven found ✓"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js 18 or higher is required. Current version: $node_version"
        exit 1
    fi
    print_status "Node.js v$(node -v) found ✓"
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL client not found. Make sure PostgreSQL is installed and running."
    else
        print_status "PostgreSQL client found ✓"
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_status "Docker found ✓"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker not found. Docker setup will be skipped."
        DOCKER_AVAILABLE=false
    fi
}

# Setup database
setup_database() {
    print_step "Setting up database..."
    
    read -p "Do you want to create the database? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter PostgreSQL username (default: postgres): " db_user
        db_user=${db_user:-postgres}
        
        read -p "Enter PostgreSQL password: " -s db_password
        echo
        
        read -p "Enter database name (default: ticketing_db): " db_name
        db_name=${db_name:-ticketing_db}
        
        # Create database
        PGPASSWORD=$db_password createdb -h localhost -U $db_user $db_name 2>/dev/null || print_warning "Database might already exist"
        
        print_status "Database setup completed ✓"
    else
        print_warning "Database setup skipped. Make sure to create 'ticketing_db' database manually."
    fi
}

# Setup backend
setup_backend() {
    print_step "Setting up backend..."
    
    cd backend
    
    # Install dependencies and build
    print_status "Installing Maven dependencies..."
    mvn clean install -DskipTests
    
    print_status "Backend setup completed ✓"
    cd ..
}

# Setup frontend
setup_frontend() {
    print_step "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing npm dependencies..."
    npm install
    
    # Create environment file
    if [ ! -f .env.local ]; then
        cp .env.example .env.local
        print_status "Created .env.local file ✓"
    else
        print_warning ".env.local already exists"
    fi
    
    print_status "Frontend setup completed ✓"
    cd ..
}

# Docker setup
setup_docker() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_step "Setting up Docker environment..."
        
        read -p "Do you want to start the application with Docker? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Starting services with Docker Compose..."
            docker-compose up -d
            
            print_status "Waiting for services to be ready..."
            sleep 30
            
            print_status "Docker setup completed ✓"
            print_status "Application is running at:"
            print_status "  Frontend: http://localhost:3000"
            print_status "  Backend:  http://localhost:8080"
            return
        fi
    fi
}

# Manual startup instructions
show_startup_instructions() {
    print_step "Setup completed! 🎉"
    echo
    print_status "To start the application manually:"
    echo
    echo "1. Start the backend:"
    echo "   cd backend"
    echo "   mvn spring-boot:run"
    echo
    echo "2. In another terminal, start the frontend:"
    echo "   cd frontend"
    echo "   npm run dev"
    echo
    print_status "Default login credentials:"
    echo "  Admin:         admin@ticketing.com / admin123"
    echo "  Support Agent: agent@ticketing.com / agent123"
    echo "  User:          user@ticketing.com / user123"
    echo
    print_status "Application URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8080"
    echo "  API Docs: http://localhost:8080/swagger-ui.html"
}

# Main execution
main() {
    check_prerequisites
    setup_database
    setup_backend
    setup_frontend
    setup_docker
    
    if [ "$?" -eq 0 ]; then
        show_startup_instructions
    fi
}

# Run main function
main "$@"