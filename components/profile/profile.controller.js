const router = require('express').Router();

const error = require('../../bin/error');
const {
  Profile
} = require('../../database');


router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.findAll(); 
    res.status(200).json(profiles);  
  } catch (err) {
    error(res, 400, 'Error en el GET PROFILE', err);
  }
});


module.exports = router;