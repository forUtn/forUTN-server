const Input = require('./input.model');
const User = require('../user/user.model');
const Subject = require('../subject/subject.model');
const Calification = require('../calification/calification.model');
const { asyncHandler, NotFoundError, ValidationError, ConflictError } = require('../../middleware/errorHandler');
const logger = require('../../middleware/logger');
const { Op } = require('sequelize');

/**
 * Servicio mejorado para manejo de Posts y Comentarios
 */
class InputService {
    
    /**
     * Obtener posts con paginación y filtros
     */
    static async getPosts(options = {}) {
        const {
            page = 1,
            limit = 10,
            idmateria,
            orderBy = 'recent',
            includeStats = true,
            search
        } = options;

        const offset = (page - 1) * limit;
        
        // Configurar order
        let order = [['fechacreacion', 'DESC']];
        if (orderBy === 'popular') {
            order = [['puntuacion', 'DESC'], ['fechacreacion', 'DESC']];
        }

        // Configurar where
        const where = {
            identradapadre: 0,
            activo: true
        };

        if (idmateria) {
            where.idmateria = idmateria;
        }

        if (search) {
            where[Op.or] = [
                { titulo: { [Op.iLike]: `%${search}%` } },
                { contenido: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Configurar includes
        const include = [
            {
                model: User,
                as: 'usuario',
                attributes: ['idusuario', 'username', 'idcarrera']
            },
            {
                model: Subject,
                as: 'materia',
                attributes: ['idmateria', 'nombre']
            }
        ];

        // Configurar attributes con stats si se requiere
        let attributes = ['*'];
        if (includeStats) {
            attributes = {
                include: [
                    [
                        Input.sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM calification
                            WHERE calification.identrada = Input.identrada
                            AND calification.tipoclasificacion = 'U'
                        )`),
                        'upvotes'
                    ],
                    [
                        Input.sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM calification
                            WHERE calification.identrada = Input.identrada
                            AND calification.tipoclasificacion = 'D'
                        )`),
                        'downvotes'
                    ],
                    [
                        Input.sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM input AS comments
                            WHERE comments.identradapadre = Input.identrada
                            AND comments.activo = true
                        )`),
                        'comentarios'
                    ]
                ]
            };
        }

        const { count, rows } = await Input.findAndCountAll({
            where,
            include,
            attributes,
            order,
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });

        logger.database('SELECT', 'Input', { 
            operation: 'getPosts',
            filters: { page, limit, idmateria, search },
            resultsCount: rows.length
        });

        return {
            posts: rows.map(post => post.toSafeJSON()),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        };
    }

    /**
     * Obtener un post específico con sus comentarios
     */
    static async getPostWithComments(identrada, userId = null) {
        const post = await Input.findOne({
            where: {
                identrada,
                identradapadre: 0,
                activo: true
            },
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['idusuario', 'username', 'idcarrera']
                },
                {
                    model: Subject,
                    as: 'materia',
                    attributes: ['idmateria', 'nombre']
                }
            ],
            attributes: {
                include: [
                    [
                        Input.sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM calification
                            WHERE calification.identrada = Input.identrada
                            AND calification.tipoclasificacion = 'U'
                        )`),
                        'upvotes'
                    ],
                    [
                        Input.sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM calification
                            WHERE calification.identrada = Input.identrada
                            AND calification.tipoclasificacion = 'D'
                        )`),
                        'downvotes'
                    ]
                ]
            }
        });

        if (!post) {
            throw new NotFoundError('Post no encontrado');
        }

        // Obtener comentarios
        const comments = await Input.findAll({
            where: {
                identradapadre: identrada,
                activo: true
            },
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['idusuario', 'username', 'idcarrera']
                }
            ],
            attributes: {
                include: [
                    [
                        Input.sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM calification
                            WHERE calification.identrada = Input.identrada
                            AND calification.tipoclasificacion = 'U'
                        )`),
                        'upvotes'
                    ],
                    [
                        Input.sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM calification
                            WHERE calification.identrada = Input.identrada
                            AND calification.tipoclasificacion = 'D'
                        )`),
                        'downvotes'
                    ]
                ]
            },
            order: [['fechacreacion', 'ASC']]
        });

        // Si hay usuario logueado, obtener sus votos
        let userVotes = {};
        if (userId) {
            const votes = await Calification.findAll({
                where: {
                    idusuario: userId,
                    identrada: {
                        [Op.in]: [identrada, ...comments.map(c => c.identrada)]
                    }
                }
            });

            userVotes = votes.reduce((acc, vote) => {
                acc[vote.identrada] = vote.tipoclasificacion;
                return acc;
            }, {});
        }

        logger.database('SELECT', 'Input', { 
            operation: 'getPostWithComments',
            postId: identrada,
            commentsCount: comments.length
        });

        return {
            post: {
                ...post.toSafeJSON(),
                userVote: userVotes[identrada] || null
            },
            comments: comments.map(comment => ({
                ...comment.toSafeJSON(),
                userVote: userVotes[comment.identrada] || null
            }))
        };
    }

    /**
     * Crear un nuevo post
     */
    static async createPost(postData, userId) {
        const { titulo, contenido, idmateria, etiquetas } = postData;

        // Verificar que la materia existe
        const subject = await Subject.findByPk(idmateria);
        if (!subject) {
            throw new NotFoundError('Materia no encontrada');
        }

        const post = await Input.create({
            titulo: titulo.trim(),
            contenido: contenido.trim(),
            idmateria,
            idusuario: userId,
            identradapadre: 0,
            etiquetas: etiquetas || []
        });

        logger.success('Post creado exitosamente', {
            postId: post.identrada,
            userId,
            titulo: post.titulo
        });

        return await this.getPostWithComments(post.identrada, userId);
    }

    /**
     * Crear un comentario
     */
    static async createComment(commentData, userId) {
        const { contenido, identradapadre } = commentData;

        // Verificar que el post padre existe
        const parentPost = await Input.findOne({
            where: {
                identrada: identradapadre,
                identradapadre: 0, // Solo se puede comentar en posts principales
                activo: true
            }
        });

        if (!parentPost) {
            throw new NotFoundError('Post padre no encontrado');
        }

        const comment = await Input.create({
            contenido: contenido.trim(),
            idusuario: userId,
            identradapadre,
            idmateria: parentPost.idmateria // Heredar materia del post padre
        });

        logger.success('Comentario creado exitosamente', {
            commentId: comment.identrada,
            parentPostId: identradapadre,
            userId
        });

        return comment.toSafeJSON();
    }

    /**
     * Actualizar post o comentario
     */
    static async updateEntry(identrada, updateData, userId) {
        const entry = await Input.findOne({
            where: {
                identrada,
                idusuario: userId, // Solo el autor puede editar
                activo: true
            }
        });

        if (!entry) {
            throw new NotFoundError('Entrada no encontrada o no autorizada');
        }

        // Validar datos según tipo de entrada
        if (entry.isPost()) {
            if (!updateData.titulo || updateData.titulo.trim().length === 0) {
                throw new ValidationError('Los posts deben tener título');
            }
            entry.titulo = updateData.titulo.trim();
        }

        if (updateData.contenido) {
            entry.contenido = updateData.contenido.trim();
        }

        if (updateData.etiquetas && entry.isPost()) {
            entry.etiquetas = updateData.etiquetas;
        }

        await entry.save();

        logger.success('Entrada actualizada exitosamente', {
            entryId: identrada,
            type: entry.isPost() ? 'post' : 'comment',
            userId
        });

        return entry.toSafeJSON();
    }

    /**
     * Eliminar entrada (soft delete)
     */
    static async deleteEntry(identrada, userId) {
        const entry = await Input.findOne({
            where: {
                identrada,
                idusuario: userId, // Solo el autor puede eliminar
                activo: true
            }
        });

        if (!entry) {
            throw new NotFoundError('Entrada no encontrada o no autorizada');
        }

        entry.activo = false;
        await entry.save();

        logger.success('Entrada eliminada exitosamente', {
            entryId: identrada,
            type: entry.isPost() ? 'post' : 'comment',
            userId
        });

        return { message: 'Entrada eliminada exitosamente' };
    }

    /**
     * Buscar posts y comentarios
     */
    static async searchEntries(searchTerm, options = {}) {
        const {
            page = 1,
            limit = 10,
            idmateria,
            type = 'all' // 'posts', 'comments', 'all'
        } = options;

        const offset = (page - 1) * limit;
        
        const where = {
            activo: true,
            [Op.or]: [
                { titulo: { [Op.iLike]: `%${searchTerm}%` } },
                { contenido: { [Op.iLike]: `%${searchTerm}%` } }
            ]
        };

        if (type === 'posts') {
            where.identradapadre = 0;
        } else if (type === 'comments') {
            where.identradapadre = { [Op.gt]: 0 };
        }

        if (idmateria) {
            where.idmateria = idmateria;
        }

        const { count, rows } = await Input.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['idusuario', 'username']
                },
                {
                    model: Subject,
                    as: 'materia',
                    attributes: ['idmateria', 'nombre']
                }
            ],
            order: [['fechacreacion', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });

        logger.database('SEARCH', 'Input', { 
            searchTerm,
            resultsCount: rows.length,
            filters: { type, idmateria }
        });

        return {
            results: rows.map(entry => entry.toSafeJSON()),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        };
    }
}

module.exports = InputService;
