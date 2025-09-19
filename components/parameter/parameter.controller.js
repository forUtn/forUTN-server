const router = require('express').Router();

const error = require('../../bin/error');
const {
  Parameter
} = require('../../database');


router.get('/', async (req, res) => {
  try {
    const parameters = await Parameter.findAll(); 
    res.status(200).json(parameters);  
  } catch (err) {
    return error(res, 400, 'Error en el GET PARAMETERS', err);
  }
});


module.exports = router;