const express = require('express');
const router = express.Router();

const { createComment, editComment } = require('../controllers/comments');

// TODO: Create new comment
router.post('/causes/:causeID/donations/:donationID', createComment);

// TODO: Edit a comment
router.put('/:id/edit', editComment);

module.exports = router;
