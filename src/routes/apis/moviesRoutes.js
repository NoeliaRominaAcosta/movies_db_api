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
    .post('/create', moviesController.create)
    .put('/update/:id', moviesController.update)
    .delete('/delete/:id', moviesController.destroy)

module.exports = router;