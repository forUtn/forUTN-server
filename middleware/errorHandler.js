/**
 * Manejador centralizado de errores
 */

const logger = require('./logger');

/**
 * Tipos de errores personalizados
 */
class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, details = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Recurso') {
        super(`${resource} no encontrado`, 404, 'NOT_FOUND');
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(message, 409, 'CONFLICT');
    }
}

class DatabaseError extends AppError {
    constructor(message, originalError = null) {
        super(message, 500, 'DATABASE_ERROR');
        this.originalError = originalError;
    }
}

/**
 * Manejo de errores de Sequelize
 */
const handleSequelizeError = (error) => {
    if (error.name === 'SequelizeValidationError') {
        const details = error.errors.map(err => ({
            campo: err.path,
            mensaje: err.message,
            valorRecibido: err.value
        }));
        return new ValidationError('Error de validación de datos', details);
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path || 'campo';
        return new ConflictError(`Ya existe un registro con ese ${field}`);
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return new ValidationError('Referencia a recurso inexistente');
    }

    if (error.name === 'SequelizeConnectionError') {
        return new DatabaseError('Error de conexión a la base de datos');
    }

    // Error genérico de Sequelize
    return new DatabaseError('Error en la operación de base de datos', error);
};

/**
 * Middleware de manejo de errores global
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log del error
    if (err.isOperational) {
        logger.warn(`Error operacional: ${err.message}`, {
            statusCode: err.statusCode,
            errorCode: err.errorCode,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
    } else {
        logger.error(`Error no manejado: ${err.message}`, {
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            body: req.body,
            params: req.params,
            query: req.query
        });
    }

    // Manejo específico de errores de Sequelize
    if (err.name && err.name.startsWith('Sequelize')) {
        error = handleSequelizeError(err);
    }

    // Error de validación de express-validator (ya manejado en middleware de validación)
    if (err.type === 'entity.parse.failed') {
        error = new ValidationError('Formato JSON inválido');
    }

    // Error de límite de tamaño de archivo
    if (err.code === 'LIMIT_FILE_SIZE') {
        error = new ValidationError('Archivo demasiado grande');
    }

    // Error de tipo MIME no permitido
    if (err.code === 'FILETYPE_NOT_ALLOWED') {
        error = new ValidationError('Tipo de archivo no permitido');
    }

    // Si no es un error operacional, convertirlo a error interno del servidor
    if (!error.isOperational) {
        error = new AppError('Algo salió mal', 500, 'INTERNAL_SERVER_ERROR');
    }

    // Respuesta de error estándar
    const errorResponse = {
        success: false,
        error: {
            message: error.message,
            code: error.errorCode || 'UNKNOWN_ERROR',
            ...(error.details && { details: error.details })
        },
        timestamp: new Date().toISOString()
    };

    // En desarrollo, incluir stack trace
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error.stack = error.stack;
    }

    res.status(error.statusCode || 500).json(errorResponse);
};

/**
 * Middleware para capturar rutas no encontradas
 */
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Ruta ${req.originalUrl} no encontrada`);
    next(error);
};

/**
 * Wrapper para funciones async - evita try/catch repetitivos
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Función helper para lanzar errores fácilmente
 */
const throwError = (message, statusCode = 500, errorCode = null) => {
    throw new AppError(message, statusCode, errorCode);
};

module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    errorHandler,
    notFoundHandler,
    asyncHandler,
    throwError
};
