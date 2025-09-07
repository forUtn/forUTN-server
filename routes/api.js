const express = require('express');
const router = express.Router();

// Importar controladores existentes
const inputController = require('../components/input/input.controller');
const userController = require('../components/user/user.controller');
const calificationController = require('../components/calification/calification.controller');
const subjectController = require('../components/subject/subject.controller');
const fileController = require('../components/file/file.controller');

// Middleware de logging si existe
try {
    const { httpLogger } = require('../middleware/logger');
    router.use(httpLogger);
} catch (error) {
    // Logger middleware no disponible, continuar sin él
}

/**
 * RUTAS PARA POSTS (INPUT)
 */

// GET /api/posts - Obtener lista de posts
router.get('/posts', inputController.getAll);

// GET /api/posts/:id - Obtener post específico
router.get('/posts/:id', inputController.getById);

// POST /api/posts - Crear nuevo post
router.post('/posts', inputController.create);

// PUT /api/posts/:id - Actualizar post
router.put('/posts/:id', inputController.update);

// DELETE /api/posts/:id - Eliminar post
router.delete('/posts/:id', inputController.delete);

// GET /api/posts/search/:search - Buscar posts
router.get('/posts/search/:search', inputController.search);

/**
 * RUTAS PARA USUARIOS
 */

// GET /api/users - Obtener usuarios
router.get('/users', userController.getAll);

// GET /api/users/:id - Obtener usuario específico
router.get('/users/:id', userController.getById);

// POST /api/users - Crear usuario
router.post('/users', userController.create);

// PUT /api/users/:id - Actualizar usuario
router.put('/users/:id', userController.update);

// DELETE /api/users/:id - Eliminar usuario
router.delete('/users/:id', userController.delete);

/**
 * RUTAS PARA CALIFICACIONES (VOTOS)
 */

// GET /api/califications - Obtener calificaciones
router.get('/califications', calificationController.getAll);

// POST /api/califications - Crear/actualizar calificación
router.post('/califications', calificationController.create);

// PUT /api/califications/:id - Actualizar calificación
router.put('/califications/:id', calificationController.update);

// DELETE /api/califications/:id - Eliminar calificación
router.delete('/califications/:id', calificationController.delete);

/**
 * RUTAS PARA MATERIAS (SUBJECTS)
 */

// GET /api/subjects - Obtener materias
router.get('/subjects', subjectController.getAll);

// GET /api/subjects/:id - Obtener materia específica
router.get('/subjects/:id', subjectController.getById);

// POST /api/subjects - Crear materia
router.post('/subjects', subjectController.create);

// PUT /api/subjects/:id - Actualizar materia
router.put('/subjects/:id', subjectController.update);

// DELETE /api/subjects/:id - Eliminar materia
router.delete('/subjects/:id', subjectController.delete);

/**
 * RUTAS PARA ARCHIVOS
 */

// GET /api/files - Obtener archivos
router.get('/files', fileController.getAll);

// GET /api/files/:id - Obtener archivo específico
router.get('/files/:id', fileController.getById);

// POST /api/files - Subir archivo
router.post('/files', fileController.create);

// DELETE /api/files/:id - Eliminar archivo
router.delete('/files/:id', fileController.delete);

/**
 * RUTAS DE SALUD Y ESTADO
 */

// GET /api/health - Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'ForUTN API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// GET /api/status - Status detallado
router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            service: 'ForUTN Server',
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        }
    });
});

module.exports = router;
