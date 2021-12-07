const router = require('express').Router();
const { Sequelize, QueryTypes, Op } = require('sequelize');
const error = require('../../bin/error');

const {
    Input,
    RelInputUser,
    File,
    Calification,
    sequelize
} = require('../../database');

router.get('/', async (req, res) => {
    try {
        const inputs = await Input.findAll();
        res.status(200).json(inputs);
    } catch (error) {
        error(res, 400, 'Error en el get INPUTS', err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        var inputs = await Input.findByPk(req.params.id);
        let coments = [];
        let urlFiles = [];
        let relFiles = [];
        if (inputs) {
            if (inputs.identradapadre == 0) {
                const comentarios = await Input.findAll({
                    attributes: ['contenido', 'idusuario', 'identrada'],
                    where: {
                        identradapadre: inputs.identrada
                    }
                });

                for (var i = 0; i < comentarios.length; i++) {
                    let a = comentarios[i]

                    const upvotes = await Calification.count({
                        where: {
                            identrada: a.identrada,
                            tipoclasificacion: "U"
                        }
                    });
                    const downvotes = await Calification.count({
                        where: {
                            identrada: a.identrada,
                            tipoclasificacion: "D"
                        }
                    });

                    console.log(upvotes, downvotes)
                    coments.push({
                        contenido: a.contenido,
                        usuario: a.idusuario,
                        upvotes: upvotes,
                        downvotes: downvotes
                    });
                }

                /* comentarios.forEach(a => {
                }); */


                console.log(coments)
                const relEntradaArchivos = await RelInputUser.findAll({
                    where: {
                        identrada: inputs.identrada
                    }
                });

                relEntradaArchivos.forEach(a => {
                    relFiles.push(a.idarchivo);
                });
                const files = await File.findAll({
                    where: {
                        idarchivo: relFiles
                    }
                });
                files.forEach(a => {
                    urlFiles.push(a.urlfile);
                })
            }
            res.status(200).json({ response: 'OK', message: inputs, comentarios: coments, archivos: urlFiles });
        }
        else error(res, 400, 'error en el get by id input', e)
    } catch (err) {
        console.log(err);
        error(res, 400, 'Error en el get inputs by id', err);
    }
});


router.post('/', async (req, res) => {
    try {
        console.log(req)
        //archivos => [4,3,5,6]
        const { identradapadre, idusuario, idmateria, contenido, archivos, titulo } = req.body;
        const inputCreated = await Input.create({
            idusuario,
            idmateria,
            identradapadre,
            contenido,
            titulo
        });
        archivos.forEach(async id => {
            await RelInputUser.create({
                idarchivo: id,
                identrada: inputCreated.identrada,
            });
        })
        res.status(200).json({
            response: 'OK',
            message: inputCreated,
        });
    } catch (e) {
        error(res, 400, 'error en el post input', e)
    }
});


router.delete('/:id', async (req, res) => {
    try {
        var idFiles = [];
        const identrada = req.params.id;
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
            message: 'Eliminado',
        });
    } catch (e) {
        error(res, 400, 'error en el borrado de Publicacion', e)
    }
});



//Modificar un POST O COMENTARIO
router.put('/', async (req, res) => {
    try {
        const { identrada, identradapadre, idusuario, idmateria, contenido, titulo } = req.body;
        const inputCreated = await Input.update({
            idusuario,
            titulo,
            idmateria,
            identradapadre,
            contenido,
        },
            {
                where:
                {
                    identrada
                }
            });

        res.status(200).json({
            response: 'OK',
            message: 'Publicacion creada',
        });
    } catch (e) {
        error(res, 400, 'error en el update input', e)
    }
});

//Modulo de busqueda, se DEBERA mejorar, tomarlo con pinzas
router.post('/search', async (req, res) => {

    try {
        const { texto } = req.body;
        const publicaciones = await Input.findAll({
            where: {
                titulo: {
                    [Sequelize.Op.iLike]: "%" + texto + "%"
                }
            }
        })
        res.status(200).json({
            response: 'OK',
            message: publicaciones,
        });
    } catch (e) {
        error(res, 400, 'error en el search', e)
    }
});

module.exports = router;
//Modulo de busqueda, se DEBERA mejorar, tomarlo con pinzas
router.post('/search', async(req, res) => {

    try{
        const { texto } = req.body;
        const publicaciones = await Input.findAll({
            where: {
                titulo:{
                    [Sequelize.Op.iLike]: "%"+texto+"%"
                }
            }
        })
        res.status(200).json({
            response: 'OK',
            message:publicaciones,
        });
    }catch(e){
        error(res,400,'error en el search', e)
    }
});

module.exports = router;
