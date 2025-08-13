const winston = require('winston');
const path = require('path');

/**
 * Configuración de niveles de log personalizados
 */
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

/**
 * Configuración de colores para la consola
 */
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    http: 'magenta',
    debug: 'gray'
};

winston.addColors(colors);

/**
 * Formato personalizado para logs
 */
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

/**
 * Formato para consola
 */
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
        let logMessage = `${timestamp} [${level}]: ${message}`;
        
        if (stack) {
            logMessage += `\n${stack}`;
        }
        
        if (Object.keys(meta).length > 0) {
            logMessage += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return logMessage;
    })
);

/**
 * Determinar nivel de log basado en el entorno
 */
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'info';
};

/**
 * Configuración de transports
 */
const transports = [
    // Consola - siempre activa
    new winston.transports.Console({
        level: level(),
        format: consoleFormat
    }),
    
    // Archivo para errores
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 10485760, // 10MB
        maxFiles: 5
    }),
    
    // Archivo para todos los logs
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/combined.log'),
        format: logFormat,
        maxsize: 10485760, // 10MB
        maxFiles: 10
    })
];

/**
 * Crear instancia del logger
 */
const logger = winston.createLogger({
    level: level(),
    levels,
    format: logFormat,
    transports,
    exitOnError: false
});

/**
 * Middleware para logging de requests HTTP
 */
const httpLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log de request
    logger.http(`${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentLength: req.get('Content-Length'),
        ...(req.body && Object.keys(req.body).length > 0 && { 
            body: req.body 
        })
    });

    // Interceptar el final de la response
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'error' : 'http';
        
        logger[logLevel](`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            contentLength: res.get('Content-Length'),
            responseTime: duration,
            ip: req.ip
        });
    });

    next();
};

/**
 * Helpers para logging estructurado
 */
const logHelpers = {
    /**
     * Log de operación exitosa
     */
    success: (message, data = {}) => {
        logger.info(`✅ ${message}`, { 
            success: true,
            ...data 
        });
    },

    /**
     * Log de operación de base de datos
     */
    database: (operation, table, data = {}) => {
        logger.debug(`🗄️  Database ${operation} on ${table}`, {
            operation,
            table,
            ...data
        });
    },

    /**
     * Log de validación
     */
    validation: (message, errors = []) => {
        logger.warn(`⚠️  Validation: ${message}`, {
            validationErrors: errors
        });
    },

    /**
     * Log de autenticación/autorización
     */
    security: (message, userId = null, data = {}) => {
        logger.info(`🔐 Security: ${message}`, {
            userId,
            timestamp: new Date().toISOString(),
            ...data
        });
    },

    /**
     * Log de performance
     */
    performance: (operation, duration, data = {}) => {
        const level = duration > 1000 ? 'warn' : 'debug';
        logger[level](`⏱️  Performance: ${operation} took ${duration}ms`, {
            operation,
            duration,
            ...data
        });
    },

    /**
     * Log de archivo/upload
     */
    file: (action, filename, data = {}) => {
        logger.info(`📁 File ${action}: ${filename}`, {
            action,
            filename,
            ...data
        });
    }
};

// Crear directorio de logs si no existe
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

module.exports = {
    ...logger,
    ...logHelpers,
    httpLogger
};
