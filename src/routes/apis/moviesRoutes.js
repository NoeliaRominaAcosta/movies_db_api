const express = require('express');
const router = express.Router();
const moviesController = require('../../controllers/apis/moviesController');

// llega como /api/movies
router
    .get('/', moviesController.list)
    .get('/new', moviesController.new)
    .get('/recommended', moviesController.recomended)
    .get('/:id', moviesController.detail)
// CRUD
    .post('/', moviesController.create)
    .put('/:id?', moviesController.update)
    .delete('/:id', moviesController.destroy)

module.exports = router;