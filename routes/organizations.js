const express = require('express');
const router = express.Router();

const {
    createOrg,
    getAllOrgs,
    getOrgById,
    editOrg,
} = require('../controllers/organizations');

// TODO: WIP Create an organization
router.post('/new', createOrg);

// Get all organizations
router.get('/', getAllOrgs);

// Get organization by id
router.get('/:id', getOrgById);

// TODO: Edit organization details
router.put('/:id/edit', editOrg);

module.exports = router;
