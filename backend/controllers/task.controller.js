const db = require('../config/db');

exports.createTask = async (req, res) => {
    try {
        const { project_id, column_id, title, description, assignee_id, due_date } = req.body;

        if (!project_id || !title) return res.status(400).json({ message: 'Project ID and Title are required' });

        const { rows: result } = await db.query(
            'INSERT INTO pm_tasks (project_id, column_id, title, description, assignee_id, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [project_id, column_id, title, description, assignee_id || null, due_date || null]
        );

        res.status(201).json({ message: 'Task created', taskId: result[0].id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { column_id } = req.body;
        await db.query('UPDATE pm_tasks SET column_id = $1 WHERE id = $2', [column_id, req.params.id]);
        res.json({ message: 'Task moved' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { title, description, assignee_id, due_date } = req.body;
        await db.query(
            'UPDATE pm_tasks SET title = $1, description = $2, assignee_id = $3, due_date = $4 WHERE id = $5',
            [title, description, assignee_id, due_date, req.params.id]
        );
        res.json({ message: 'Task updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        await db.query('DELETE FROM pm_tasks WHERE id = $1', [req.params.id]);
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
