const express = require('express');
const router = express.Router();
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/serviceCategory');
const auth = require('../middleware/auth');

// GET /api/service-categories - Get active categories (public)
router.get('/', getCategories);

// POST /api/service-categories - Create category (admin)
router.post('/', auth(['admin']), createCategory);

// PUT /api/service-categories/:id - Update category (admin)
router.put('/:id', auth(['admin']), updateCategory);

// DELETE /api/service-categories/:id - Delete category (admin)
router.delete('/:id', auth(['admin']), deleteCategory);

module.exports = router;