# User Management System Backend

## Description
This repository contains the backend code for an Admin Panel, featuring user authentication and real-time chat functionality. The backend is built using Node.js, Express.js, MongoDB, Socket.io, and other relevant technologies.

## Features
- **User Registration:** Endpoint for user registration with secure password hashing.
- **Authentication:** Token-based authentication system for secure user access.
- **User Profile Management:** CRUD operations for user profiles, including updating details and password.
- **Role-Based Access Control (RBAC):** Implementation of RBAC to manage user roles and permissions.

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Socket.io
- JSON Web Tokens (JWT) for authentication
- Other relevant technologies

## Setup
1. Clone the repository:
``` bash
git clone https://github.com/jatinnsharma/backendStarter.git
cd backend
```
2. Install dependencies:
    
``` bash
npm install
```
3. Set up environment variables:
- Create a `.env` file in the root directory, and include necessary environment variables by copying the contents of `.env.example`.


4. Run the server:

```bash
npm start
```