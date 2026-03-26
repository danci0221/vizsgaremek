const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Meglévő kereső:
router.get('/search', searchController.globalSearch);

// ÚJ VÉGPONT AZ ELŐZMÉNYEKNEK:
router.post('/search/history', searchController.saveSearchHistory);

module.exports = router;