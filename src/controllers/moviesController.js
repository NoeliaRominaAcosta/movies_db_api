const path = require("path");
const db = require("../database/models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require("moment");
/* const fetch = require("node-fetch");
 */

const getURLBase = (req = request) => req.protocol + '://' + req.get('host');

const moviesController = {
  list: (req, res) => {
    db.Movie.findAll({
      include: ["genre"],
    }).then((movies) => {
      res.render("moviesList.ejs", { movies });
    });
  },
  detail: (req, res) => {
    db.Movie.findByPk(req.params.id, {
      include: ["genre"],
    }).then((movie) => {
      res.render("moviesDetail.ejs", { movie });
    });
  },
  new: (req, res) => {
    db.Movie.findAll({
      order: [["release_date", "DESC"]],
      limit: 5,
    }).then((movies) => {
      res.render("newestMovies", { movies });
    });
  },
  recomended: (req, res) => {
    db.Movie.findAll({
      include: ["genre"],
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    }).then((movies) => {
      res.render("recommendedMovies.ejs", { movies });
    });
  },
  search: async (req, res) => {
    let result;
    result = await db.Movie.findOne({
      where: {
        title: req.query.title,
      },
    });
    if (result) {
      //si encuentra pelicula en la base propia
      return res.render("moviesDetail", {
        movie: result,
      });
    }else {
      //lo busca en la api de terceros
      let response = await fetch(
        `http://www.omdbapi.com/?t=${req.query.title}&apikey=c0a59bf`
      ); //url
      let result = await response.json(); //devuelve info parseada porque no lo muestra en crudo
     
      if(result){//si se obtiene una pelicula de la base, voy a guardarla en la mia
        let movie = await fetch(getURLBase(req) + '/apis/movies',{
            method : 'post',
            body : JSON.stringify({
                title : 'test',
                rating : 8,
                release_date : 2/2/1999,
                genre_id : 1
            }),//esto esta en la documentacion npm fetch post json
            headers : {'Content-Type' : 'application/json'}
        })
        return res.send(movie)
      }
    }
  },

  add: function (req, res) {
    let promGenres = Genres.findAll();
    let promActors = Actors.findAll();

    Promise.all([promGenres, promActors])
      .then(([allGenres, allActors]) => {
        return res.render(path.resolve(__dirname, "..", "views", "moviesAdd"), {
          allGenres,
          allActors,
        });
      })
      .catch((error) => res.send(error));
  },
  create:  async (req, res) =>{
    const {title,awards,rating,release_date,length,genre_id} = req.body;
   try {
    let genres = await db.Genre.findAll();
    let genresIds = genres.map(genre => genre.id);
   
    if(!genresIds.includes(+genres_id)){
        let error = new Error('ID de genero inexistente');
        error.status = 404;
        throw error
    }
   let newMovie = await db.Movie.create({
      title,
      rating,
      awards,
      release_date,
      length,
      genre_id,
    })
      if(newMovie){
        response = {
            ok : true,
            meta : {
                status : 200,
                url : getURL(req) + '/' + newMovie.id
            },
            data : newMovie
        }
        return res.status(200).json(response)
      }
   } catch (error) {
    console.log(error);
    let response = {
      ok: false,
      meta: {
        status: 500,
      },
      msg: error.message ? error.message : "Comuniquese con el administrador",
    };
    return res.status(500).json(response);

   }
   
  },
  edit: function (req, res) {
    let movieId = req.params.id;
    let promMovies = Movies.findByPk(movieId, { include: ["genre", "actors"] });
    let promGenres = Genres.findAll();
    let promActors = Actors.findAll();
    Promise.all([promMovies, promGenres, promActors])
      .then(([Movie, allGenres, allActors]) => {
        Movie.release_date = moment(Movie.release_date).format("L");
        return res.render(
          path.resolve(__dirname, "..", "views", "moviesEdit"),
          { Movie, allGenres, allActors }
        );
      })
      .catch((error) => res.send(error));
  },
  update: function (req, res) {
    let movieId = req.params.id;
    Movies.update(
      {
        title: req.body.title,
        rating: req.body.rating,
        awards: req.body.awards,
        release_date: req.body.release_date,
        length: req.body.length,
        genre_id: req.body.genre_id,
      },
      {
        where: { id: movieId },
      }
    )
      .then(() => {
        return res.redirect("/movies");
      })
      .catch((error) => res.send(error));
  },
  delete: function (req, res) {
    let movieId = req.params.id;
    Movies.findByPk(movieId)
      .then((Movie) => {
        return res.render(
          path.resolve(__dirname, "..", "views", "moviesDelete"),
          { Movie }
        );
      })
      .catch((error) => res.send(error));
  },
  destroy: function (req, res) {
    let movieId = req.params.id;
    Movies.destroy({ where: { id: movieId }, force: true }) // force: true es para asegurar que se ejecute la acción
      .then(() => {
        return res.redirect("/movies");
      })
      .catch((error) => res.send(error));
  },
};

module.exports = moviesController;
