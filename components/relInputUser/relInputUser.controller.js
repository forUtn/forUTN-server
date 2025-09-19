const router = require('express').Router();
const error = require('../../bin/error');
const {
  RelInputUser
} = require('../../database');


router.get('/', async (req, res) => {
  try {
    const profileRoutes = await RelInputUser.findAll(); 
    res.status(200).json(profileRoutes);  
  } catch (err) {
    error(res, 400, 'Error en el GET REL INPUT USER', err);
  }
});


module.exports = router;