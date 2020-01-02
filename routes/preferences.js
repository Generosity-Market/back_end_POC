const express = require('express');
const router = express.Router();

const { updatePreferences } = require('../controllers/preferences');

/**
 * Preferences Routes (For Users, Causes, and Organizations)
 */

// TODO: WIP Update Preferences Route
router.put('/:id/edit', updatePreferences);

module.exports = router;
