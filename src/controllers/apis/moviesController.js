const path = require("path");
const db = require("../../database/models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const {checkId} = require('../../helpers')
const {request} = require('express');

/* devuelve la url en que estoy parada. del obj request usa protocole 
que devuelve http y devuelve el host el originalUrl es /movies /*/

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
    //chequeo si es un id. esto está en el helper
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
  recomended: async (req, res) => {
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
    const {title, rating,awards,release_date, length, genre_id}=req.body
   try {
    let genres = await db.Genre.findAll()
    let genresIds = genres.map(genre => genre.id)
    if(!genresIds.includes(+genre_id)){
      let error = new Error('id de genero inexistente')
      error.status = 404;//le doy instancia al error
      throw error//arrojo el error
    }
    let newMovie = await db.Movie.create({
      title: title.trim(), 
      rating,
      awards, 
      release_date,
      length, 
      genre_id, //que no supere el numero de id presentes
    })
    if(newMovie){
      response = {
        ok: true,
        meta: {
          status: 200,
          url : getURL(req) + newMovie + '/' + newMovie.id //al hacer click te lleva al detalle de pelicula
        },
        data: newMovie
      };
      return res.status(200).json(response);
    }
    
   } catch (error) {
    console.log(error);
    let errors = [];
    if(error.errors){//lo mapea solo si existe
      errors = error.errors.map(error =>{
        return {
          path : error.path,
          msg : error.message,
          value: error.value
        }
        /* 
        esto pertenece a la fomra en que por consolapor el validator en el modelo y muestra los errores con los valores
         path message value que vienen en el objeto para mostrarlo en la respuesta */
      })
    }
   
    let response = {
      ok: false,
      meta: {
        status: 500,
      },
      msg: error.message ? error.message : "Comuniquese con el administrador",
      errors
    };
    return res.status(500).json(response);
   }
  },
  update: async (req, res)=> {
   if(!req.params.id){
    let error = new Error('ID requerido');
    error.status = 404;
    throw error
   }
    //chequeo si es un id
    if(checkId(req.params.id)){
      return res.status(400).json(checkId(req.params.id));
     }
     const {title, rating,awards,release_date, length, genre_id}=req.body

    try {
      let movies = await db.Movie.findAll()
      let moviesIds = movies.map(movie => movie.id)
      if(!moviesIds.includes(+req.params.id)){
        let error = new Error('id de pelicula inexistente')
        error.status = 404;//le doy instancia al error
        throw error//arrojo el error
      }
    let statusUpdate = await  db.Movie.update(
        {
          title: title.trim(),
          rating,
          awards,
          release_date,
          length: length,
          genre_id,
        },
        {
          where: { id: req.params.id },
        }
      )
     if(statusUpdate[0] === 1){//la respuesta es 1 si es true y llega la info, devuelve 0 si es false
     let response = {
        ok: true,
        meta: {
          status: 201,
        },
        msg: "los cambios se hicieron con exito"
      }
      return res.status(201).json(response)
     }else{
      let response = {
        ok: true,
        meta: {
          status: 200,
        },
        msg: "no se realizaron cambios"
      }
      return res.status(200).json(response)
     }
    
    } catch (error) {
      console.log(error);
    let errors = [];
    if(error.errors){
      errors = error.errors.map(error =>{
        return {
          path : error.path,
          msg : error.message,
          value: error.value
        }
        /* 
        esto pertenece a la fomra en que por consola muestra los errores con los valores
         path message value que vienen en el objeto para mostrarlo en la respuesta */
      })
    }
   
    let response = {
      ok: false,
      meta: {
        status: 500,
      },
      msg: error.message ? error.message : "Comuniquese con el administrador",
      errors
    };
    return res.status(500).json(response);
   }
     
     
  },
  destroy: async (req, res)=>{
    try {

      let movies = await db.Movie.findAll()
      let moviesIds = movies.map(movie => movie.id)
      if(!moviesIds.includes(+req.params.id)){
        let error = new Error('id de pelicula inexistente')
        error.status = 404;//le doy instancia al error
        throw error//arrojo el error
      }
      let statusDestroy = await db.Movie.destroy(
        { where: { id: req.params.id }, force: false })

        if(statusDestroy){
          let response = {
            ok: true,
            meta: {
              status: 100,
            },
            msg: "eliminada con exito",
            statusDestroy
          }
          return res.status(100).json(response)
        }else{
          let response = {
            ok: true,
            meta: {
              status: 200,
            },
            msg: "no se hicieron cambios",
            statusDestroy
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
};

module.exports = moviesController;
