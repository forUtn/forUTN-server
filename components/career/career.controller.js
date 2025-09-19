const router = require('express').Router();
const error = require('../../bin/error');


const {
  Career, Subject
} = require('../../database');


router.get('/', async (req, res) => {
  try {
    const carrers = await Career.findAll();
    res.status(200).json(carrers);          
  } catch (err) {
    error(res, 400, 'Error en el get carreras', err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    var career = await Career.findByPk(req.params.id);
    if(career) {
      const subjects = await Subject.findAll({
        where: {
          idcarrera : career.idcarrera
        }
      });
            
      var primerAnio = subjects.filter(materia => materia.anio === 1);
      var segundoAnio = subjects.filter(materia => materia.anio === 2); 
      var tercerAnio = subjects.filter(materia => materia.anio === 3);
      var cuartoAnio = subjects.filter(materia => materia.anio === 4);
      var quintoAnio = subjects.filter(materia => materia.anio === 5);
      var anios = [primerAnio, segundoAnio, tercerAnio, cuartoAnio, quintoAnio];
      res.status(200).json({ response:'OK', career, anios });
    }
    else res.status(404).json({ response: 'ERROR', message: 'Empty' });
  } catch (err) {
    error(res, 400, 'Error en el get carreras by id', err);
  }
});


module.exports = router;