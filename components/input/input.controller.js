const router = require('express').Router();
const { Sequelize } = require('sequelize');
const error = require('../../bin/error');

const {
  Input,
  RelInputUser,
  File,
  Calification,
  User
} = require('../../database');

router.get('/', async (req, res) => {
  try {
    const inputs = await Input.findAll();
    res.status(200).json(inputs);
  } catch (error) {
    error(res, 400, 'Error en el get INPUTS', error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    var inputs = await Input.findByPk(parseInt(req.params.id));
    let coments = [];
    let url;
    if (inputs) {
      const op = await User.findByPk(inputs.idusuario);
      if (parseInt(inputs.identradapadre) === 0) {
        const comentarios = await Input.findAll({
          attributes: ['contenido', 'idusuario', 'identrada'],
          where: {
            identradapadre: inputs.identrada
          }
        });

        for (var i = 0; i < comentarios.length; i++) {
          let a = comentarios[i];

          const upvotes = await Calification.count({
            where: {
              identrada: a.identrada,
              tipoclasificacion: 'U'
            }
          });
          const downvotes = await Calification.count({
            where: {
              identrada: a.identrada,
              tipoclasificacion: 'D'
            }
          });

          const username = await User.findByPk(a.idusuario);
          const nombreUsuario = username.username;
          coments.push({
            idcomentario: a.identrada,
            contenido: a.contenido,
            usuario: a.idusuario,
            upvotes: upvotes,
            downvotes: downvotes,
            nombreUsuario
          });
        }


        const relEntradaArchivos = await RelInputUser.findAll({
          where: {
            identrada: inputs.identrada
          }
        });

        if(relEntradaArchivos[0]?.idarchivo){
          const files = await File.findAll({
            where: {
              idarchivo: relEntradaArchivos[0].idarchivo
            }
          });
          url = files[0]?.urlfile;
        }
      }
      res.status(200).json({ response: 'OK', op: op.username, message: inputs, comentarios: coments, archivo: url });
    }
    else error(res, 400, 'error en el get by id input');
  } catch (err) {
    error(res, 400, 'Error en el get inputs by id', err);
  }
});

router.post('/', async (req, res) => {
  try {
    const { identradapadre = 0, idusuario, idmateria, cont, titulo, archivoPdf } = req.body;
    
    if (archivoPdf && archivoPdf.trim() !== '') {
      const archivoBase64 = archivoPdf;
                
      const sizeInBytes = Buffer.byteLength(archivoBase64, 'base64');
      const sizeInMB = sizeInBytes / (1024 * 1024);
                
      if (sizeInMB > 2) {
        return res.status(400).json({
          response: 'ERROR',
          message: `Archivo excede el límite de 2MB. Tamaño actual: ${sizeInMB.toFixed(2)}MB`
        });
      }
    }


    if (identradapadre === 0 && (!titulo || titulo.trim().length === 0)) {
      return error(res, 400, 'Las publicaciones principales requieren título');
    }

    // Respuesta/comentario (identradapadre > 0) puede no tener título
    // pero debe tener contenido válido
    if (identradapadre > 0 && (!cont || cont.trim().length === 0)) {
      return error(res, 400, 'Contenido vacio');
    }

    if (cont.length > 4000) {
      return error(res, 400, 'El cuerpo de la publicacion excede el limite de la longitud');
    }

    const inputCreated = await Input.create({
      idusuario,
      idmateria,
      identradapadre,
      contenido: cont,
      titulo
    });

    const archivoData = await File.create({
      urlfile: archivoPdf,
      tipo : 'p'
    });

    await RelInputUser.create({
      idarchivo: archivoData.idarchivo,
      identrada: inputCreated.identrada
    });
    res.status(200).json({
      response: 'OK',
      message: inputCreated
    });
  } catch (e) {
    error(res, 400, 'error en el post input', e);
  }
});


router.delete('/:id', async (req, res) => {
  try {
    var idFiles = [];
    const identrada = req.params.id;
    const publicacion = await Input.findByPk(identrada);

    if (!publicacion) {
      return error(res, 400, 'Id no encontrado');
    }

    const relinputsfiles = await RelInputUser.findAll({
      where: {
        identrada
      }
    });
    relinputsfiles.forEach(rel => {
      idFiles.push(rel.idarchivo);
    });

    await File.destroy({
      where: {
        idarchivo: idFiles
      }
    });

    await RelInputUser.destroy({
      where: {
        identrada
      }
    });

    await Input.destroy({
      where: {
        identrada
      }
    });

    res.status(200).json({
      response: 'OK',
      message: 'Eliminado'
    });
  } catch (e) {
    error(res, 400, 'error en el borrado de Publicacion', e);
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    let inputs = await Input.findAll({
      where: {
        idusuario : req.params.id,
        identradapadre: 0
      },
      order: [['createdAt', 'DESC']]
    });

    inputs= inputs.map(input => input.toJSON());

    for (let i = 0; i < inputs.length; i++) {
      const element = inputs[i];
      const usuario = await User.findByPk(element.idusuario);
      inputs[i].usuario = usuario.username;
    }

    res.status(200).json({ response:'OK', inputs });
  }catch (err) {
    error(res, 400, 'Error en el get materias by id', err);
  }
});

//Modificar un POST O COMENTARIO
router.put('/', async (req, res) => {
  try {
    const { identrada, identradapadre, idusuario, idmateria, contenido, titulo } = req.body;
    await Input.update({
      idusuario,
      titulo,
      idmateria,
      identradapadre,
      contenido
    },
    {
      where:
                {
                  identrada
                }
    });
    res.status(200).json({
      response: 'OK',
      message: 'Publicacion creada'
    });
  } catch (e) {
    error(res, 400, 'error en el update input', e);
  }
});

//Modulo de busqueda, se DEBERA mejorar, tomarlo con pinzas
router.post('/search', async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto || texto.length === 0) {
      return error(res, 400, 'Texto vacio');
    }
    let publicaciones = await Input.findAll({
      where: {
        titulo: {
          [Sequelize.Op.iLike]: '%' + texto + '%'
        }
      },
      order: [['createdAt', 'DESC']]
    });

    publicaciones = publicaciones.map(publicacion => publicacion.toJSON());

    for (let i = 0; i < publicaciones.length; i++) {
      const element = publicaciones[i];
      const usuario = await User.findByPk(element.idusuario);
      publicaciones[i].usuario = usuario.username;
    }

    res.status(200).json({
      response: 'OK',
      message: publicaciones
    });
  } catch (e) {
    error(res, 400, 'error en el search', e);
  }
});

module.exports = router;