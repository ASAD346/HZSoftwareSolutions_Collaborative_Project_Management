# Deployment Guide: Collaborative Project Management

Your project has been updated to support deployment on **Netlify** (for Frontend & Backend API) and **Supabase** (for the PostgreSQL Database).

## 1. Database Setup (Supabase)

1.  **Create a Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Get Connection String**:
    *   Go to **Project Settings** -> **Database**.
    *   Copy the **Connection String** (Node.js style). It looks like: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`.
    *   Save this for later.
3.  **Run Migration**:
    *   Go to the **SQL Editor** in Supabase.
    *   Open `database/schema_postgres.sql` from your project files.
    *   **Note**: Tables are now prefixed with `pm_` (e.g., `pm_users`, `pm_projects`) to allow co-existence with your other projects in the same database.
    *   Copy the content and paste it into the SQL Editor.
    *   Click **Run** to create the tables.

## 2. Netlify Deployment

1.  **Connect Repository**: Log in to Netlify and choose **"Import from Git"**. Select this repository.
2.  **Configure Build Settings**:
    *   **Base directory**: `/` (leave default)
    *   **Build command**: (leave empty)
    *   **Publish directory**: `frontend`
3.  **Environment Variables**:
    *   Go to **Site configuration** -> **Environment variables**.
    *   Add `DATABASE_URL`: Paste the Supabase connection string you copied earlier.
    *   Add `JWT_SECRET`: Enter a secure random string (e.g., `my-super-secret-key-2026`).

## 3. Verify Deployment

1.  Open your deployed Netlify URL.
2.  Register a new user (this tests the database connection and Auth API).
3.  Create a project and add tasks to verify full functionality.

## Local Development
To run locally:
1.  Create a `.env` file in the root directory with:
    ```env
    DATABASE_URL=postgresql://...
    JWT_SECRET=...
    PORT=5000
    ```
2.  Run `npm start` (or `node backend/server.js`).
3.  Serve the frontend (simple way: use `Live Server` in VS Code on `frontend/index.html`).
    *   **Note**: For local dev, you might need to change `API_URL` in `frontend/app.js` back to `http://localhost:5000/api` temporarily, or proxy requests. The current code assumes `/api` relative path which works on Netlify.
