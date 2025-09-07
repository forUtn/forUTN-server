const { body, query, param, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Datos de entrada inválidos',
                code: 'VALIDATION_ERROR',
                details: errors.array().map(error => ({
                    campo: error.path,
                    mensaje: error.msg,
                    valorRecibido: error.value
                }))
            },
            timestamp: new Date().toISOString()
        });
    }
    next();
};

/**
 * Validaciones para Posts/Entradas
 */
const validatePost = [
    body('titulo')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Título debe tener entre 5 y 200 caracteres')
        .custom((value) => {
            if (!value || value.trim().length === 0) {
                throw new Error('El título no puede estar vacío');
            }
            return true;
        }),
    
    body('contenido')
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Contenido debe tener entre 10 y 5000 caracteres')
        .custom((value) => {
            if (!value || value.trim().length === 0) {
                throw new Error('El contenido no puede estar vacío');
            }
            return true;
        }),
    
    body('idmateria')
        .isInt({ gt: 0 })
        .withMessage('ID de materia debe ser un número entero positivo'),
    
    body('etiquetas')
        .optional()
        .isArray({ max: 10 })
        .withMessage('Máximo 10 etiquetas permitidas')
        .custom((etiquetas) => {
            if (etiquetas && etiquetas.length > 0) {
                for (const etiqueta of etiquetas) {
                    if (typeof etiqueta !== 'string' || etiqueta.length > 30) {
                        throw new Error('Cada etiqueta debe ser texto de máximo 30 caracteres');
                    }
                }
            }
            return true;
        }),

    handleValidationErrors
];

/**
 * Validaciones para Comentarios
 */
const validateComment = [
    body('contenido')
        .trim()
        .isLength({ min: 5, max: 1000 })
        .withMessage('Comentario debe tener entre 5 y 1000 caracteres')
        .custom((value) => {
            if (!value || value.trim().length === 0) {
                throw new Error('El comentario no puede estar vacío');
            }
            return true;
        }),
    
    param('postId')
        .isInt({ gt: 0 })
        .withMessage('ID del post debe ser un número entero positivo'),

    handleValidationErrors
];

/**
 * Validaciones para Usuario
 */
const validateUser = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username solo puede contener letras, números y guiones bajos'),
    
    body('mail')
        .trim()
        .isEmail()
        .withMessage('Email debe tener formato válido')
        .normalizeEmail(),
    
    body('pwd')
        .isLength({ min: 8 })
        .withMessage('Password debe tener al menos 8 caracteres'),
    
    body('idcarrera')
        .isInt({ gt: 0 })
        .withMessage('ID de carrera debe ser un número entero positivo'),

    handleValidationErrors
];

/**
 * Validaciones para Calificaciones
 */
const validateRating = [
    body('tipoclasificacion')
        .isIn(['U', 'D'])
        .withMessage('Tipo de clasificación debe ser U (upvote) o D (downvote)'),
    
    param('identrada')
        .isInt({ gt: 0 })
        .withMessage('ID de entrada debe ser un número entero positivo'),

    handleValidationErrors
];

/**
 * Validaciones para Búsqueda
 */
const validateSearch = [
    query('q')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Término de búsqueda debe tener entre 2 y 100 caracteres'),
    
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Página debe ser un número entero mayor a 0'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Límite debe ser entre 1 y 50'),
    
    query('materia')
        .optional()
        .isInt({ gt: 0 })
        .withMessage('ID de materia debe ser un número entero positivo'),

    handleValidationErrors
];

/**
 * Validaciones para IDs en parámetros
 */
const validateId = (paramName = 'id') => [
    param(paramName)
        .isInt({ gt: 0 })
        .withMessage(`${paramName} debe ser un número entero positivo`),
    
    handleValidationErrors
];

/**
 * Sanitización básica de contenido HTML
 */
const sanitizeContent = (req, res, next) => {
    if (req.body.contenido) {
        // Remover tags HTML básicos y scripts peligrosos
        req.body.contenido = req.body.contenido
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+="[^"]*"/gi, '');
    }
    
    if (req.body.titulo) {
        req.body.titulo = req.body.titulo
            .replace(/<[^>]*>/g, '') // Remover todos los tags HTML
            .trim();
    }
    
    next();
};

module.exports = {
    validatePost,
    validateComment,
    validateUser,
    validateRating,
    validateSearch,
    validateId,
    sanitizeContent,
    handleValidationErrors
};
