const db = require('../config/db');

exports.getAllProjects = async (req, res) => {
    try {
        // Get projects where user is owner or member
        const query = `
            SELECT p.*, u.username as owner_name 
            FROM pm_projects p 
            JOIN pm_users u ON p.owner_id = u.id
            LEFT JOIN pm_project_members pm ON p.id = pm.project_id
            WHERE p.owner_id = $1 OR pm.user_id = $2
            GROUP BY p.id, u.username
        `;
        const { rows: projects } = await db.query(query, [req.user.id, req.user.id]);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createProject = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) return res.status(400).json({ message: 'Name is required' });

        const { rows: result } = await db.query(
            'INSERT INTO pm_projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING id',
            [name, description, req.user.id]
        );
        const projectId = result[0].id;

        // Add owner as a member with 'admin' role
        await db.query(
            'INSERT INTO pm_project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
            [projectId, req.user.id, 'admin']
        );

        // Create default columns
        const defaultColumns = ['To Do', 'In Progress', 'Done'];
        for (let i = 0; i < defaultColumns.length; i++) {
            await db.query(
                'INSERT INTO pm_columns (project_id, name, order_index) VALUES ($1, $2, $3)',
                [projectId, defaultColumns[i], i]
            );
        }

        res.status(201).json({ message: 'Project created', projectId: projectId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProjectDetails = async (req, res) => {
    try {
        const { rows: project } = await db.query('SELECT * FROM pm_projects WHERE id = $1', [req.params.id]);
        if (project.length === 0) return res.status(404).json({ message: 'Project not found' });

        // Check access
        const { rows: member } = await db.query(
            'SELECT * FROM pm_project_members WHERE project_id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );

        if (member.length === 0 && project[0].owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { rows: columns } = await db.query('SELECT * FROM pm_columns WHERE project_id = $1 ORDER BY order_index', [req.params.id]);
        const { rows: tasks } = await db.query(`
            SELECT t.*, u.username as assignee_name 
            FROM pm_tasks t 
            LEFT JOIN pm_users u ON t.assignee_id = u.id 
            WHERE t.project_id = $1
        `, [req.params.id]);

        res.json({ project: project[0], columns, tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
