const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const constants = require('../constants');

/**
 * Rate limiter general para la API
 */
const generalRateLimit = rateLimit({
    windowMs: constants.RATE_LIMIT_WINDOW_MS,
    max: constants.RATE_LIMIT_MAX_REQUESTS,
    message: {
        error: 'Demasiadas solicitudes desde esta IP',
        code: 'RATE_LIMIT_EXCEEDED',
        retry_after: Math.ceil(constants.RATE_LIMIT_WINDOW_MS / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Demasiadas solicitudes desde esta IP',
            code: 'RATE_LIMIT_EXCEEDED',
            retry_after: Math.ceil(constants.RATE_LIMIT_WINDOW_MS / 1000)
        });
    }
});

/**
 * Rate limiter estricto para login/register
 */
const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por IP
    message: {
        error: 'Demasiados intentos de autenticación',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retry_after: 15 * 60
    },
    skipSuccessfulRequests: true
});

/**
 * Rate limiter para creación de posts
 */
const postCreationRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 3, // 3 posts por minuto máximo
    message: {
        error: 'Demasiados posts creados muy rápido',
        code: 'POST_CREATION_RATE_LIMIT',
        retry_after: 60
    }
});

/**
 * Rate limiter para comentarios
 */
const commentRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // 10 comentarios por minuto máximo
    message: {
        error: 'Demasiados comentarios muy rápido',
        code: 'COMMENT_RATE_LIMIT',
        retry_after: 60
    }
});

/**
 * Rate limiter para búsquedas
 */
const searchRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // 30 búsquedas por minuto
    message: {
        error: 'Demasiadas búsquedas muy rápido',
        code: 'SEARCH_RATE_LIMIT',
        retry_after: 60
    }
});

/**
 * Slowdown para calificaciones (upvotes/downvotes)
 */
const ratingSlowDown = slowDown({
    windowMs: 60 * 1000, // 1 minuto
    delayAfter: 10, // Después de 10 requests
    delayMs: 500, // Delay de 500ms
    maxDelayMs: 2000 // Máximo 2 segundos de delay
});

/**
 * Rate limiter para subida de archivos
 */
const fileUploadRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // 20 archivos por hora
    message: {
        error: 'Demasiados archivos subidos',
        code: 'FILE_UPLOAD_RATE_LIMIT',
        retry_after: 60 * 60
    }
});

module.exports = {
    generalRateLimit,
    authRateLimit,
    postCreationRateLimit,
    commentRateLimit,
    searchRateLimit,
    ratingSlowDown,
    fileUploadRateLimit
};
