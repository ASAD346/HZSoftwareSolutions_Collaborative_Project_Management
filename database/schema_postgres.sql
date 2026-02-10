-- Postgres Schema for Collaborative Project Management (Prefixed)

CREATE TABLE IF NOT EXISTS pm_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pm_projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES pm_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pm_project_members (
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES pm_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES pm_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pm_columns (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    order_index INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES pm_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pm_tasks (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    column_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assignee_id INT,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES pm_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (column_id) REFERENCES pm_columns(id) ON DELETE SET NULL,
    FOREIGN KEY (assignee_id) REFERENCES pm_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pm_comments (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES pm_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES pm_users(id) ON DELETE CASCADE
);
