const express = require('express');
const router = express.Router();
const genresController = require('../../controllers/apis/genreController');

router.get('/', genresController.list);
router.get('/:id', genresController.detail);
router.get('/name/:name', genresController.byName);

module.exports = router;