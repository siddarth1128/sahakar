// controllers/serviceCategory.js - Service category controllers for FixItNow
// Features: createCategory, getCategories (active for search), updateCategory, deleteCategory
// Security: Auth, admin for CRUD
// Connections: Models/ServiceCategory, Activity
const ServiceCategory = require('../models/ServiceCategory');
const Activity = require('../models/Activity');
const { body, validationResult } = require('express-validator');

// createCategory - Create new service category (admin)
const createCategory = [
  body('name').isLength({ min: 1, max: 50 }),
  body('description').isLength({ min: 1, max: 500 }),
  body('basePriceRange.min').isNumeric({ min: 0 }),
  body('basePriceRange.max').isNumeric({ min: 0 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, basePriceRange, icon } = req.body;

      const category = new ServiceCategory({
        name,
        description,
        basePriceRange,
        icon
      });
      await category.save();

      // Log
      await Activity.logActivity('category_created', req.user.id, { categoryId: category._id });

      res.json({ success: true, category });
    } catch (err) {
      console.error('Create Category Error:', err);
      res.status(500).json({ msg: 'Failed to create category', error: err.message });
    }
  }
];

// getCategories - Get active categories for search/booking
const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.getActiveCategories();
    res.json({ success: true, categories });
  } catch (err) {
    console.error('Get Categories Error:', err);
    res.status(500).json({ msg: 'Failed to get categories', error: err.message });
  }
};

// updateCategory - Update category (admin)
const updateCategory = [
  body('id').isMongoId(),
  body('name').optional().isLength({ min: 1, max: 50 }),
  body('description').optional().isLength({ min: 1, max: 500 }),
  body('basePriceRange.min').optional().isNumeric({ min: 0 }),
  body('basePriceRange.max').optional().isNumeric({ min: 0 }),
  body('active').optional().isBoolean(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;

      const category = await ServiceCategory.findByIdAndUpdate(id, updates, { new: true });
      if (!category) {
        return res.status(404).json({ msg: 'Category not found' });
      }

      // Log
      await Activity.logActivity('category_updated', req.user.id, { categoryId: id });

      res.json({ success: true, category });
    } catch (err) {
      console.error('Update Category Error:', err);
      res.status(500).json({ msg: 'Failed to update category', error: err.message });
    }
  }
];

// deleteCategory - Delete category (admin)
const deleteCategory = [
  body('id').isMongoId(),
  async (req, res) => {
    try {
      const { id } = req.params;

      const category = await ServiceCategory.findByIdAndDelete(id);
      if (!category) {
        return res.status(404).json({ msg: 'Category not found' });
      }

      // Log
      await Activity.logActivity('category_deleted', req.user.id, { categoryId: id });

      res.json({ success: true, msg: 'Category deleted' });
    } catch (err) {
      console.error('Delete Category Error:', err);
      res.status(500).json({ msg: 'Failed to delete category', error: err.message });
    }
  }
];

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };