# Medebna - Event and Room Booking App (Backend)

Welcome to the backend repository for Medebna, Akillo's premier event and room booking application. This document provides all the information you need to set up, run, and contribute to the backend development.

## Contact Information
- **Backend Engineer**: Abeseom Solomon
- **Email**: abeselomsolomongetahun@gmail.com
- **Telegram**: @Abeselom_Solomon

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Setup & Installation](#setup--installation)
4. [Running the Application](#running-the-application)
5. [API Documentation](#api-documentation)
6. [Environment Variables](#environment-variables)
7. [Project Structure](#project-structure)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Contributing](#contributing)

## Project Overview
Medebna is a comprehensive booking platform that enables users to:
- Book event spaces
- Reserve hotel rooms
- Rent vehicles
- Process payments
- Manage bookings and reservations

The backend is built with Node.js, Express, and MongoDB, using a modern architecture with clear separation of concerns.

## Prerequisites
- Node.js v18+
- MongoDB (local or cloud instance)
- Docker (optional)
- npm
- Git

## Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/akillo/medebna-backend.git
cd medebna-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file based on the example:
```bash
cp example.env .env
```
Edit the `.env` file with your specific configuration.

### 4. Initialize the database
```bash
node initDatabase.js
```

## Running the Application

### Without Docker
```bash
npm run dev
```
The server will run on http://localhost:5000

### With Docker
```bash
# Build the Docker image
make build

# Start containers
make up

# View logs
make logs

# Stop containers
make down
```

## API Documentation
Medebna uses Swagger for API documentation. After starting the server:

1. Access Swagger UI at: http://localhost:5000/docs
2. Explore available endpoints
3. Test API calls directly from the interface

Key API categories:
- Authentication
- Hotel management
- Event management
- Car rental
- Payment processing
- Cart management

## Environment Variables
| Variable              | Description                             | Example Value                           |
|-----------------------|-----------------------------------------|-----------------------------------------|
| `MONGODB_URI`         | MongoDB connection string               | `mongodb://localhost:27017/booking`     |
| `JWT_SECRET`          | Secret for JWT token signing           | `your_jwt_secret_here`                 |
| `ACCESS_TOKEN_SECRET` | Secret for access tokens               | `your_access_token_secret`             |
| `REFRESH_TOKEN_SECRET`| Secret for refresh tokens              | `your_refresh_token_secret`            |
| `CALLBACK_URL`        | Payment callback URL                   | `http://localhost:3000/auth/callback`  |
| `PORT`                | Server port                            | `5000`                                 |
| `CHAPA_PRIVATE_KEY`   | Chapa payment API key                  | `your_chapa_api_key`                   |

## Project Structure
```
├── config/             # Configuration files
├── controller/         # Business logic handlers
├── model/              # Database models
├── middleware/         # Express middleware
├── routes/             # API route definitions
├── services/           # Business services
├── utils/              # Utility functions
├── index.js            # Application entry point
├── initDatabase.js     # Database initialization
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker orchestration
└── Makefile            # Development shortcuts
```

## Testing
Currently, the project doesn't include automated tests. To test functionality:

1. Use the Swagger UI at http://localhost:5000/docs
2. Test endpoints with Postman or curl
3. Verify database changes after operations

## Deployment
For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start index.js --name "medebna-backend"
   ```
3. Configure a reverse proxy (Nginx or Apache)
4. Set up SSL/TLS encryption
5. Implement proper monitoring and logging

