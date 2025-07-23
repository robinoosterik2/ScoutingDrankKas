ScoutingDrankKas Codebase Overview
This is a full-stack web application built with Nuxt 3, designed to manage drink sales and inventory for a scouting group. Here's a detailed breakdown:

Core Technologies
Frontend: Nuxt 3 (Vue.js) with TypeScript
Backend: Node.js with Nuxt server routes
Database: MongoDB with Mongoose ODM
Styling: Tailwind CSS with dark mode support
Containerization: Docker and Docker Compose
Authentication: Custom auth system with role-based access control
Key Features
User Management
Registration and authentication
Role-based access control (admin, barkeeper, user)
User profiles and permissions
Inventory Management
Product catalog with categories
Stock level tracking
Product details and images
Order Processing
Shopping cart functionality
Order history and tracking
Sales reporting
Administration
User management
Product management
Sales analytics and reporting
System logging
Project Structure
ScoutingDrankKas/
├── app/                    # Main application code
│   ├── components/         # Reusable Vue components
│   ├── layouts/            # Page layouts
│   ├── pages/              # Application routes/views
│   ├── server/             # API routes and server logic
│   ├── utils/              # Utility functions
│   └── middleware/         # Route middleware
├── .env.*                  # Environment configurations
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Production Dockerfile
└── Dockerfile.dev          # Development Dockerfile
Development Setup
The project uses Docker for containerization with separate configurations for development and production. Key environment variables include database connection strings and authentication secrets.

Current State
Actively maintained but not the primary focus of the developer
Core functionality is implemented
Open to contributions and improvements
Some features (like admin user setup) are still in progress
Getting Started
Clone the repository
Copy 
.env.example
 to 
.env
 and configure
Run docker compose up --build to start the development environment
Access the app at http://localhost