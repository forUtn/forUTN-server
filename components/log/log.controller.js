const router = require('express').Router();

const {
  Log
} = require('../../database');


router.get('/', async (req, res) => {
  try {
    const logs = await Log.findAll(); 
    res.status(200).json(logs);  
  } catch (error) {
    error(res, 400, 'Error en el get logs', error);
  }
});


module.exports = router;