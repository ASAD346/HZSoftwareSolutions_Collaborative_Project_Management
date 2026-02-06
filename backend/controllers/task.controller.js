const db = require('../config/db');

exports.createTask = async (req, res) => {
    try {
        const { project_id, column_id, title, description, assignee_id, due_date } = req.body;

        if (!project_id || !title) return res.status(400).json({ message: 'Project ID and Title are required' });

        const [result] = await db.query(
            'INSERT INTO tasks (project_id, column_id, title, description, assignee_id, due_date) VALUES (?, ?, ?, ?, ?, ?)',
            [project_id, column_id, title, description, assignee_id || null, due_date || null]
        );

        res.status(201).json({ message: 'Task created', taskId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { column_id } = req.body;
        await db.query('UPDATE tasks SET column_id = ? WHERE id = ?', [column_id, req.params.id]);
        res.json({ message: 'Task moved' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { title, description, assignee_id, due_date } = req.body;
        await db.query(
            'UPDATE tasks SET title = ?, description = ?, assignee_id = ?, due_date = ? WHERE id = ?',
            [title, description, assignee_id, due_date, req.params.id]
        );
        res.json({ message: 'Task updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
