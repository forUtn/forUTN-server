const express = require('express');
const InputController = require('../components/input/input.controller.enhanced');
const { httpLogger } = require('../middleware/logger');
const { errorHandler, notFoundHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Aplicar logger a todas las rutas
router.use(httpLogger);

/**
 * RUTAS PARA POSTS
 */

// GET /api/posts - Obtener lista de posts
router.get('/posts', InputController.getPosts);

// GET /api/posts/:id - Obtener post específico con comentarios
router.get('/posts/:id', InputController.getPost);

// POST /api/posts - Crear nuevo post
router.post('/posts', InputController.createPost);

// GET /api/posts/by-subject/:subjectId - Posts por materia
router.get('/posts/by-subject/:subjectId', InputController.getPostsBySubject);

/**
 * RUTAS PARA COMENTARIOS
 */

// POST /api/posts/:postId/comments - Crear comentario en un post
router.post('/posts/:postId/comments', InputController.createComment);

/**
 * RUTAS PARA EDICIÓN/ELIMINACIÓN
 */

// PUT /api/entries/:id - Actualizar post o comentario
router.put('/entries/:id', InputController.updateEntry);

// DELETE /api/entries/:id - Eliminar post o comentario
router.delete('/entries/:id', InputController.deleteEntry);

/**
 * RUTAS DE BÚSQUEDA Y FILTROS
 */

// GET /api/search - Buscar posts y comentarios
router.get('/search', InputController.searchEntries);

/**
 * RUTAS DE USUARIO
 */

// GET /api/users/:userId/posts - Posts de un usuario
router.get('/users/:userId/posts', InputController.getUserPosts);

/**
 * RUTAS DE ESTADÍSTICAS
 */

// GET /api/stats/posts - Estadísticas generales
router.get('/stats/posts', InputController.getPostsStats);

/**
 * RUTAS DE CALIFICACIONES (VOTOS)
 */

const CalificationController = require('../components/calification/calification.controller');

// POST /api/entries/:id/vote - Votar en post o comentario
router.post('/entries/:id/vote', CalificationController.toggleVote || ((req, res) => {
    res.status(501).json({
        success: false,
        error: {
            message: 'Funcionalidad de votación en desarrollo',
            code: 'NOT_IMPLEMENTED'
        }
    });
}));

// GET /api/entries/:id/votes - Obtener estadísticas de votos
router.get('/entries/:id/votes', CalificationController.getVoteStats || ((req, res) => {
    res.status(501).json({
        success: false,
        error: {
            message: 'Funcionalidad de estadísticas de votos en desarrollo',
            code: 'NOT_IMPLEMENTED'
        }
    });
}));

/**
 * RUTAS DE ARCHIVOS (ADJUNTOS)
 */

const FileController = require('../components/file/file.controller');

// POST /api/entries/:id/files - Subir archivo a una entrada
router.post('/entries/:id/files', FileController.uploadFile || ((req, res) => {
    res.status(501).json({
        success: false,
        error: {
            message: 'Funcionalidad de archivos en desarrollo',
            code: 'NOT_IMPLEMENTED'
        }
    });
}));

// GET /api/entries/:id/files - Obtener archivos de una entrada
router.get('/entries/:id/files', FileController.getFiles || ((req, res) => {
    res.status(501).json({
        success: false,
        error: {
            message: 'Funcionalidad de archivos en desarrollo',
            code: 'NOT_IMPLEMENTED'
        }
    });
}));

/**
 * RUTAS DE MATERIAS
 */

const SubjectController = require('../components/subject/subject.controller');

// GET /api/subjects - Obtener lista de materias
router.get('/subjects', SubjectController.getAll || ((req, res) => {
    res.json({
        success: true,
        data: { subjects: [] },
        message: 'Usar controlador de materias existente'
    });
}));

/**
 * MIDDLEWARE DE MANEJO DE ERRORES
 */

// Ruta no encontrada
router.use('*', notFoundHandler);

// Manejo global de errores
router.use(errorHandler);

module.exports = router;
