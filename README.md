# 📝 Blog API (Monorepo)

A full-featured blogging API built with **Node.js**, **Express**, **PostgreSQL**, and **Prisma ORM**, structured as a monorepo with both an **admin** and **user-facing** frontend.

This project is part of [The Odin Project's Node.js curriculum](https://www.theodinproject.com/lessons/node-path-nodejs-blog-api), showcasing RESTful API design, modern database integration, and clean backend architecture.

## 🚀 Features

- RESTful API with full CRUD functionality for:
  - **Posts**
  - **Comments**
  - **Users** (Create, Read, Update only)
- Clean, modular backend with Express
- PostgreSQL database access via **Prisma**
- Form validation and error handling
- Monorepo with:
  - `backend/` (Node.js + Express + Prisma)
  - `user-frontend/` (user-facing blog UI)
  - `blogger-frontend/` (CMS/admin dashboard)


## 🧱 Tech Stack

### Backend
- **Node.js**
- **Express.js**
- **PostgreSQL**
- **Prisma ORM**
- **dotenv**
- **bcrypt/uuid**
- **JWT passwport strategy**
- **CORS**

### Frontend libraries
- **React**
- **Tailwind**
- **Shadcn/UI**
- **Lucide-react**

## 📁 Project Structure

blog-API/
│
├── backend/              # Express backend with Prisma + PostgreSQL
│   ├── controllers/      # Request handlers
│   ├── db/               # Prisma/SQL queries
│   ├── routes/           # Route definitions
│   ├── prisma/           # Prisma schema and migrations
│   ├── app.js            # Express app setup
│   └── .env              # Environment variables
│
├── blogger-frontend/     # React + Tailwind + Shadcn/UI Admin dashboard
│
├── frontend-user/        # React + Tailwind + Shadcn/UI Public-facing blog frontend
│
└── README.md             # Project overview

## 🧪 Example API Endpoints

### Users
- `GET /api/v1/users` — Fetch all users
- `GET /api/v1/users/:id` — Fetch user by ID
- `POST /api/v1/users` — Register a new user
- `PUT /api/v1/users/:id` — Update user details
- `DELETE /api/v1/users/:id` — Delete user

### Posts
- `GET /api/v1/posts` — List all posts
- `GET /api/v1/posts/:id` — View a single post
- `POST /api/v1/posts` — Create a post
- `PUT /api/v1/posts/:id` — Edit a post
- `DELETE /api/v1/posts/:id` — Delete a post

### Comments
- `GET /api/v1/posts/:postId/comments` — Get comments on a post
- `POST /api/v1/posts/:postId/comments` — Add a comment
- `PUT /api/v1/posts/:postId/comments` — Edit a comment
- `DELETE /api/v1/comments/:id` — Delete a comment

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Prisma CLI](https://www.prisma.io/)

### Setup (Backend)

```bash
# Clone the repo
git clone https://github.com/jonorl/blog-API.git
cd blog-API

# Navigate to backend
cd backend

# Install dependencies
npm install

# Set up database and run migrations
npx prisma migrate dev --name init

# Start the server
node --watch app.js
````

Server runs at: `http://localhost:3000`

## 🎯 Learning Goals

* Build and organize a monorepo project
* Design and implement RESTful APIs with Express
* Model relational data using Prisma and PostgreSQL
* Validate inputs and handle errors gracefully
* Implement user authentication and session management
* Support role-based authorization (admin/user)
* Prepare and deploy full-stack apps (Netlify + Koyeb)

🚀 Deployment

* Frontend: Netlify --> https://users-frontend.netlify.app/
* Backend + PostgreSQL: Koyeb --> https://bold-corabella-jonorl-a167c351.koyeb.app/

## 👨‍💻 Author

**Jonathan Orlowski**
[GitHub](https://github.com/jonorl)
[LinkedIn](https://www.linkedin.com/in/jonathan-orlowski-58910b21/)

> 📚 This project is part of [The Odin Project](https://www.theodinproject.com/), a free and open-source curriculum for aspiring full-stack web developers.