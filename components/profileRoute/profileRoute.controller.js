const router = require('express').Router();


const error = require('../../bin/error');
const {
  ProfileRoute
} = require('../../database');


router.get('/', async (req, res) => {
  try {
    const profileRoutes = await ProfileRoute.findAll(); 
    res.status(200).json(profileRoutes);  
  } catch (err) {
    error(res, 400, 'Error en el GET PROFILE ROUTE', err);
  }
});


module.exports = router;