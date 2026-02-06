const db = require('../config/db');

exports.getAllProjects = async (req, res) => {
    try {
        // Get projects where user is owner or member
        const query = `
            SELECT p.*, u.username as owner_name 
            FROM projects p 
            JOIN users u ON p.owner_id = u.id
            LEFT JOIN project_members pm ON p.id = pm.project_id
            WHERE p.owner_id = ? OR pm.user_id = ?
            GROUP BY p.id
        `;
        const [projects] = await db.query(query, [req.user.id, req.user.id]);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createProject = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) return res.status(400).json({ message: 'Name is required' });

        const [result] = await db.query(
            'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)',
            [name, description, req.user.id]
        );

        // Add owner as a member with 'admin' role
        await db.query(
            'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
            [result.insertId, req.user.id, 'admin']
        );

        // Create default columns
        const defaultColumns = ['To Do', 'In Progress', 'Done'];
        for (let i = 0; i < defaultColumns.length; i++) {
            await db.query(
                'INSERT INTO columns (project_id, name, order_index) VALUES (?, ?, ?)',
                [result.insertId, defaultColumns[i], i]
            );
        }

        res.status(201).json({ message: 'Project created', projectId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProjectDetails = async (req, res) => {
    try {
        const [project] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        if (project.length === 0) return res.status(404).json({ message: 'Project not found' });

        // Check access
        const [member] = await db.query(
            'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (member.length === 0 && project[0].owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [columns] = await db.query('SELECT * FROM columns WHERE project_id = ? ORDER BY order_index', [req.params.id]);
        const [tasks] = await db.query(`
            SELECT t.*, u.username as assignee_name 
            FROM tasks t 
            LEFT JOIN users u ON t.assignee_id = u.id 
            WHERE t.project_id = ?
        `, [req.params.id]);

        res.json({ project: project[0], columns, tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
