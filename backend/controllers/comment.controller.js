const db = require('../config/db');

exports.addComment = async (req, res) => {
    try {
        const { task_id, content } = req.body;
        if (!task_id || !content) return res.status(400).json({ message: 'Task ID and content required' });

        await db.query(
            'INSERT INTO pm_comments (task_id, user_id, content) VALUES ($1, $2, $3)',
            [task_id, req.user.id, content]
        );

        res.status(201).json({ message: 'Comment added' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTaskComments = async (req, res) => {
    try {
        const { rows: comments } = await db.query(`
            SELECT c.*, u.username 
            FROM pm_comments c 
            JOIN pm_users u ON c.user_id = u.id 
            WHERE c.task_id = $1 
            ORDER BY c.created_at ASC
        `, [req.params.taskId]);

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
