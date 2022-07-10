const path = require("path");
const db = require("../../database/models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const {checkId} = require('../../helpers')

//Aqui tienen otra forma de llamar a cada uno de los modelos

const getURL = (req = request) => req.protocol + '://' + req.get('host') + req.originalUrl;
const moviesController = {
  list: async(req, res) => {
    try {
    let movies = await db.Movie.findAll({
        include: ["genre"],
      })
      let response = {
        ok: true, //para luego verificar con if ok si llega la info
        meta: {
          status: 200,
          total: movies.length, //devuelve un array
        },
        data: movies,
      }; //devuelve un objeto
      return res.status(200).json(response);
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
  detail: async(req, res) => {
   if(checkId(req.params.id)){
    return res.status(400).json(checkId(req.params.id));
   }
   try {
    let movie = await db.Movie.findByPk(req.params.id,{
      include : ['genre']
    });
    let response;
    if(!movie){
      response = {
        ok : false,
        meta : {
          status : 404
        },
        msg : "no se encuentra la pelicula con ese ID"
      }
      return res.status(404).json(response)
    }
    response = {
      ok: true, //para luego verificar con if ok si llega la info
      meta: {
        status: 200,
      },
      data: movie 
    };
    return res.status(200).json(response);
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
  new: async(req, res) => {

    try {
      let movies = await db.Movie.findAll({
        order: [["release_date", "DESC"]],
        limit: +req.query.limit ||5, 
        /* el req query permite que en la peticion envie el parametro
         de limit por un lado y el numero por otro en thunder  query parameters */
      })
      response = {
        ok: true, //para luego verificar con if ok si llega la info
        meta: {
          status: 200,
          total : movies.length
        },
        data: movies
      };
      return res.status(200).json(response);
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
  recomended: (req, res) => {
   try {
    let movies = await  db.Movie.findAll({
      include: ["genre"],
      where: {
        rating: { 
          [db.Sequelize.Op.gte]: +req.query.rating || 8
        },
        /* el req query permite que en la peticion envie el parametro
         de rating por un lado y el numero por otro en thunder query parameters*/
      },
      order: [["rating", "DESC"]],
    })
    response = {
      ok: true, //para luego verificar con if ok si llega la info
      meta: {
        status: 200,
        total : movies.length
      },
      data: movies
    };
    return res.status(200).json(response);
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
  //Aqui dispongo las rutas para trabajar con el CRUD

  create: async (req, res) =>{
   try {
    let movie = await db.Movie.create({
      title: req.body.title,
      rating: req.body.rating,
      awards: req.body.awards,
      release_date: req.body.release_date,
      length: req.body.length,
      genre_id: req.body.genre_id,
    })
    
    
   } catch (error) {
    console.log(error);
   }
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
