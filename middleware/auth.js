const jwt = require('jsonwebtoken');
const { User, Profile } = require('../database');
const constants = require('../constants');

/**
 * Middleware de autenticación JWT
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                error: 'Token de acceso requerido',
                code: 'NO_TOKEN'
            });
        }

        const decoded = jwt.verify(token, constants.JWT_SECRET);
        
        // Verificar que el usuario aún existe y está activo
        const user = await User.findByPk(decoded.idusuario, {
            include: [{
                model: Profile,
                as: 'perfil',
                attributes: ['nombreperfil', 'rol']
            }]
        });

        if (!user || !user.activo) {
            return res.status(403).json({ 
                error: 'Usuario no encontrado o inactivo',
                code: 'INVALID_USER'
            });
        }

        // Actualizar fecha de último acceso
        await user.update({ fecha_ultimo_acceso: new Date() });

        req.user = {
            idusuario: user.idusuario,
            username: user.username,
            email: user.email,
            idcarrera: user.idcarrera,
            idperfil: user.idperfil,
            rol: user.perfil?.rol || 'usuario',
            nombreperfil: user.perfil?.nombreperfil
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ 
                error: 'Token inválido',
                code: 'INVALID_TOKEN'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ 
                error: 'Token expirado',
                code: 'EXPIRED_TOKEN'
            });
        }

        console.error('Error en autenticación:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            code: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Middleware de autorización por roles
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Usuario no autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }

        const userRole = req.user.rol;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                error: 'Permisos insuficientes',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: allowedRoles,
                current: userRole
            });
        }

        next();
    };
};

/**
 * Middleware para verificar que el usuario puede acceder a su propio contenido
 */
const requireOwnership = (getResourceUserId) => {
    return async (req, res, next) => {
        try {
            const resourceUserId = await getResourceUserId(req);
            
            if (req.user.idusuario !== resourceUserId && req.user.rol !== 'admin') {
                return res.status(403).json({ 
                    error: 'No tienes permisos para acceder a este recurso',
                    code: 'OWNERSHIP_REQUIRED'
                });
            }

            next();
        } catch (error) {
            console.error('Error verificando ownership:', error);
            return res.status(500).json({ 
                error: 'Error interno del servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    };
};

/**
 * Middleware opcional de autenticación (para rutas que funcionan con o sin auth)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, constants.JWT_SECRET);
        const user = await User.findByPk(decoded.idusuario, {
            include: [{
                model: Profile,
                as: 'perfil',
                attributes: ['nombreperfil', 'rol']
            }]
        });

        if (user && user.activo) {
            req.user = {
                idusuario: user.idusuario,
                username: user.username,
                email: user.email,
                idcarrera: user.idcarrera,
                idperfil: user.idperfil,
                rol: user.perfil?.rol || 'usuario',
                nombreperfil: user.perfil?.nombreperfil
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        // En auth opcional, ignoramos errores de token y continuamos sin auth
        req.user = null;
        next();
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    requireOwnership,
    optionalAuth
};
