const router = require('express').Router();
require('dotenv').config();
const {Sequelize, QueryTypes, Op} = require('sequelize');
const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();
const updateStrategy = multer({ storage: inMemoryStorage}).any('images');
const uploadFilesToAzure = require('../../helpers/uploadFilesToAzure');
const error = require('../../bin/error');
const {
    File
} = require('../../database')

router.get('/', async (req, res) => {
    try {
     
    } catch (error) {
        console.log("Error en el GET FILES",error);
    }
});


async function insertFileToDb(myFile){
    try{
        //p = pdf , i = image 
        const op = myFile.name.split(-3).includes('pdf') ? 'p' : 'i';
        const file = await File.create({
            tipo: op,
            urlfile : myFile.urlFile,
        });
        return {
            idarchivo : file.idarchivo,
            tipo : file.tipo,
            urlfile: file.urlfile
        }
    }catch(e){
        return e;
    }
};

//Por dios que alguien me mate
async function toDb(list){
    const promises = list.map(insertFileToDb);
    return await Promise.all(promises);
}

router.post('/upload', updateStrategy , async (req, res) => {
    try{
        const files = await uploadFilesToAzure(req.files);
        const listFiles = await toDb(files);
        res.status(200).json({
            response: 'OK',
            message: 'SUBIDA EXITOSA',
            listFiles,
        });
    }catch(e){
        error(res, 400, 'Error en la subida de imagenes', e);
    }
});



module.exports = router;