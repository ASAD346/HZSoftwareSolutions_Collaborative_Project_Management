const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, projectController.getAllProjects);
router.post('/', auth, projectController.createProject);
router.get('/:id', auth, projectController.getProjectDetails);

module.exports = router;
