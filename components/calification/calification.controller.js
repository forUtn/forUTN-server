const router = require('express').Router();

const {
  Calification,
  Input
} = require('../../database');
const error = require('../../bin/error');


router.get('/', async (req, res) => {
  try {
    const califications = await Calification.findAll(); 
    res.status(200).json(califications);  
  } catch (error) {
    error(res,400,'error en el get  calification', error);
  }
});

//Calificaciones por id publicacion
router.get('/:id', async (req, res) => {
  try {
    const califications = await Calification.findAll({
      where: {
        identrada : req.params.id
      }
    }); 
    res.status(200).json(califications);  
  } catch (error) {
    error(res,400,'error en el get calification by id', error);
  }
});


router.post('/', async (req, res) => {
  try {
    const { identrada, idusuario, tipoclasificacion } = req.body;
        
    const calificationExist = await Calification.findAll({
      where:{
        identrada,
        idusuario
      }
    });

    const myLike = await Input.findByPk(identrada);

    if(parseInt(myLike.idusuario) === parseInt(idusuario)) {
      return res.status(200).json({
        response: 'No permitido',
        message: 'No puedes calificar tu propio contenido'
      });
    }

    if(calificationExist[0])
    {
      if(calificationExist[0].tipoclasificacion === tipoclasificacion) {
        await Calification.destroy({
          where:{
            identrada,
            idusuario
          }
        });

        return res.status(200).json({
          response: 'OK',
          message:'Calificacion eliminada ya que existia una previamente'
        });
      }
      await Calification.update({
        tipoclasificacion
      },
      {
        where:{
          identrada,
          idusuario
        }
      }
      );

      return res.status(200).json({
        response: 'OK',
        message:'Calificacion updateada porque que existia su opuesto'
      }); 
    }

    await Calification.create({
      identrada,
      idusuario,
      tipoclasificacion
    });

    return res.status(200).json({
      response: 'OK',
      message:'Calificacion creada, no existia calificacion'
    });          
  } catch (e) {
    error(res,400,'error en el post calification', e);
  }
});


module.exports = router;