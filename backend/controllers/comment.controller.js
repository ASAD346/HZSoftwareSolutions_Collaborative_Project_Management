const db = require('../config/db');

exports.addComment = async (req, res) => {
    try {
        const { task_id, content } = req.body;
        if (!task_id || !content) return res.status(400).json({ message: 'Task ID and content required' });

        await db.query(
            'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
            [task_id, req.user.id, content]
        );

        res.status(201).json({ message: 'Comment added' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTaskComments = async (req, res) => {
    try {
        const [comments] = await db.query(`
            SELECT c.*, u.username 
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.task_id = ? 
            ORDER BY c.created_at ASC
        `, [req.params.taskId]);

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
