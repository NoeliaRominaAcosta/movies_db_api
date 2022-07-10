const db = require("../../database/models");
const sequelize = db.sequelize;
const {Op} = require('sequelize')
const {checkId} = require('../../helpers')
const genresController = {
  list: async (req, res) => {
    try {
      let genres = await db.Genre.findAll(); //espera que devuelva esta consulta
      let response = {
        ok: true, //para luego verificar con if ok si llega la info
        meta: {
          status: 200,
          total: genres.length,
        },
        data: genres,
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
    //mandamos la info por distintos canales
  },
  detail: async (req, res) => {
    if(checkId(req.params.id)){//checkid from helpers
      return res.status(400).json(checkId(req.params.id));
     }
    try {
      let genre = await db.Genre.findByPk(req.params.id);
      let response;
     if (!genre) {
      response = {
        ok: false,
        meta: {
          status: 400,
        },
        msg: "no hay genero disponible"
      };
      return res.status(400).json(response);
     }else{
       response = {
        ok: true, //para luego verificar con if ok si llega la info
        meta: {
          status: 200,
        },
        data: genre 
      };
      return res.status(200).json(response);
     
     }
    } catch (error) {
      console.log(error);
      let response = {
        ok: false,
        meta: {
          status: 500//el error es del servidor
        },
        msg: error.message ? error.message : "Comuniquese con el administrador",
      };
      return res.status(error.statusCode || 500).json(response);
    }
  },
  byName: async (req, res) => {
   
    try {

      let genre = await db.Genre.findOne({
        where: {
          name:{
            [Op.substring]:req.params.name
            //esto permite que el nombre no tenga que ser exacto, sino contener la palabra en cuestion
          },
        },
      }); 
      let response;
     if (!genre) {
      response = {
        ok: false,
        meta: {
          status: 404,
        },
        msg: "no hay genero disponible con el nombre: " + req.params.name
      };
      return res.status(404).json(response);
    
     }else{
      response = {
        ok: true, //para luego verificar con if ok si llega la info
        meta: {
          status: 200,
        },
        data: genre 
      };
      return res.status(200).json(response);
     
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
      return res.status(error.statusCode || 500).json(response);
    }
  },
};

module.exports = genresController;
