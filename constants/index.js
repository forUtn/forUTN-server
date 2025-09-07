require("dotenv").config();

const constants = {
    // Base de datos
    ENV: process.env.NODE_ENV || 'development',
    DB_USER: process.env.DB_USER,
    DB_PWD: process.env.DB_PWD,
    DB_PORT: process.env.DB_PORT || 5432,
    DB_HOST: process.env.DB_HOST,
    DB_DBNAME: process.env.DB_DBNAME,
    
    // Azure Storage
    AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
    
    // JWT y Seguridad
    JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    
    // Paginación
    DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
    MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE) || 50,
    
    // Archivos
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,txt').split(','),
    
    // Validaciones
    MIN_POST_CONTENT_LENGTH: parseInt(process.env.MIN_POST_CONTENT_LENGTH) || 10,
    MAX_POST_CONTENT_LENGTH: parseInt(process.env.MAX_POST_CONTENT_LENGTH) || 5000,
    MIN_TITLE_LENGTH: parseInt(process.env.MIN_TITLE_LENGTH) || 5,
    MAX_TITLE_LENGTH: parseInt(process.env.MAX_TITLE_LENGTH) || 200,
    
    // Features flags
    ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    ENABLE_REDIS_CACHE: process.env.ENABLE_REDIS_CACHE === 'true',
    ENABLE_SEARCH_ANALYTICS: process.env.ENABLE_SEARCH_ANALYTICS === 'true'
};

module.exports = constants;
