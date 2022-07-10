const checkId = (id) => {
    if (isNaN(id)) {
        response = {
          ok: false,
          meta: {
            status: 400,
          },
          msg: "numero id incorrecto"
        };
        return response
      }//si no es un numero lo que recibo por parametro
      return false //de lo contrario retorna false
}
module.exports = {
    checkId
}