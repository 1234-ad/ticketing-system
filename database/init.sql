-- Ticketing System Database Initialization Script
-- This script creates the database and initial data

-- Create database (run this separately if needed)
-- CREATE DATABASE ticketing_db;

-- Connect to the database
\c ticketing_db;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created automatically by Spring Boot JPA
-- This script is for reference and manual setup if needed

-- Sample data will be inserted by the application on startup
-- Default users:
-- 1. Admin: admin@ticketing.com / admin123
-- 2. Support Agent: agent@ticketing.com / agent123  
-- 3. User: user@ticketing.com / user123

-- You can also manually insert test data:

-- INSERT INTO users (username, email, password, first_name, last_name, role, created_at, updated_at) VALUES
-- ('admin', 'admin@ticketing.com', '$2a$10$encrypted_password', 'Admin', 'User', 'ADMIN', NOW(), NOW()),
-- ('agent', 'agent@ticketing.com', '$2a$10$encrypted_password', 'Support', 'Agent', 'SUPPORT_AGENT', NOW(), NOW()),
-- ('user', 'user@ticketing.com', '$2a$10$encrypted_password', 'Regular', 'User', 'USER', NOW(), NOW());

-- Sample tickets (will be created through the application)
-- INSERT INTO tickets (subject, description, status, priority, created_by_id, created_at, updated_at) VALUES
-- ('Login Issue', 'Cannot login to the system', 'OPEN', 'HIGH', 3, NOW(), NOW()),
-- ('Feature Request', 'Need dark mode support', 'OPEN', 'MEDIUM', 3, NOW(), NOW());

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON attachments(ticket_id);

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON DATABASE ticketing_db TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;