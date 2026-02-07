# Collaborative Project Management System

A full-stack web application for managing group projects, tasks, and collaboration. Built with Node.js, MySQL, and Vanilla JavaScript.

## Features

- **User Authentication**: Secure registration and login (JWT-based).
- **Project Management**: Create and manage multiple projects.
- **Kanban Board**: Drag-and-drop task management with columns (To Do, In Progress, Done).
- **Task Details**: Assign tasks, set due dates, and add descriptions.
- **Collaboration**: Comment on tasks to collaborate with team members.
- **Responsive Design**: Modern, premium UI/UX.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (SPA architecture).
- **Backend**: Node.js, Express.js.
- **Database**: MySQL.
- **Authentication**: bcrypt, jsonwebtoken.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- [MySQL](https://www.mysql.com/) Server

## Installation & Setup

1.  **Clone the repository** (or download the source code):
    ```bash
    git clone <repository-url>
    cd Collaborative Project Management
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Database Setup**:
    *   Ensure your MySQL server is running.
    *   Run the schema script to create the database and tables:
        ```bash
        mysql -u root -p < database/schema.sql
        ```
        *Alternatively, copy the contents of `database/schema.sql` and run it in your MySQL client.*

4.  **Environment Configuration**:
    *   Open `.env` in the root directory.
    *   Update the configuration to match your MySQL credentials:
        ```env
        PORT=5000
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=your_password
        DB_NAME=project_management_db
        JWT_SECRET=supersecretkey123
        ```

## Running the Application

Start the backend server (which also serves the frontend):

```bash
node backend/server.js
```

The server will start on port 5000.
Open your browser and navigate to: **[http://localhost:5000](http://localhost:5000)**

## Project Structure

```
├── backend/            # Express.js API & Server logic
│   ├── config/         # Database connection
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth middleware
│   ├── routes/         # API routes
│   └── server.js       # Entry point
├── frontend/           # Static frontend assets
│   ├── app.js          # Core application logic
│   ├── index.html      # Main HTML file
│   └── styles.css      # CSS styles
├── database/           # SQL scripts
│   └── schema.sql      # Database schema
└── .env                # Environment variables
```

## License

This project is open source.
