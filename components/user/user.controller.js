const router = require('express').Router();
const {Sequelize, QueryTypes, Op} = require('sequelize');


const {
    User,
    Profile
} = require('../../database')
const error = require("../../bin/error");


router.get('/', async (req, res) => {
    try {
        console.log("usuarios");
        const usuarios = await User.findAll(); 
        res.status(200).json(usuarios);  
    } catch (error) {
        console.log("Error en el GET USUARIOS",error);
    }
});


router.get('/:id', async (req, res) => {
    try {
        const users = await User.findByPk(req.params.id);
        if(users) {
            const username = await Profile.findByPk(users.idusuario);
            let data = {
                users,
                username
            }
            res.status(200).json({status: 200, message: data});
        }
        else res.status(404).json({status: 404, message: 'Empty'});
    } catch (err) {
        error(res, 400, 'Error en el get user by id', err);
    }
});

router.get('/email/:email', async (req, res) => {
    try {
        const user = await User.findAll({
            where:{
                mail:req.params.email
            }
        });
        const usuario = user[0];
        const username = await Profile.findByPk(usuario.idusuario);

        const data = {
            user : usuario,
            username: username
        }

        if(data) res.status(200).json({status:200, message:data});
        else res.status(404).json({status: 404, message: 'Empty'});
    } catch (err) {
        error(res, 400, 'Error en el get user by id', err);
    }
});



/*
idperfil => tengo que hacer cosas con eso
carrera => viene solo
username => viene solo
pwd => va a ser el uid de firebase
mail => viene solo
*/

router.post("/", async (req,res) => {
    try{
        const {idcarrera, username, pwd, mail,} = req.body;
        const profileCreated = await Profile.create({
            nombreperfil : username
        });

        const userCreated = await User.create({
            idcarrera,
            username,
            pwd,
            mail,
            idperfil : profileCreated.idperfil
        });

        res.status(200).json({
            response : 'OK',
            message: userCreated
        });

    }catch(e){
        error(res, 400, 'Error en el POST USER', err);
    }
});

module.exports = router;