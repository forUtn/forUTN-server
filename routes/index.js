const router = require('express').Router();

const userController = require('../components/user/user.controller');
const calificationController = require('../components/calification/calification.controller');
const fileController = require('../components/file/file.controller');
const careerController = require('../components/career/career.controller');
const logController = require('../components/log/log.controller');
const parameterController = require('../components/parameter/parameter.controller');
const profileController = require('../components/profile/profile.controller');
const profileRouteController = require('../components/profileRoute/profileRoute.controller');
const relInputUserController = require('../components/relInputUser/relInputUser.controller');
const inputUserController = require('../components/input/input.controller');
const subjectController = require('../components/subject/subject.controller');




router.use('/users', userController);
router.use('/califications', calificationController);
router.use('/files', fileController);
router.use('/careers', careerController);
router.use('/logs', logController);
router.use('/parameters', parameterController);
router.use('/profiles', profileController);
router.use('/profileRoutes', profileRouteController);
router.use('/relInputUsers', relInputUserController);
router.use('/inputs', inputUserController);
router.use('/subjects', subjectController);

// Health Check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ForUTN Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the ForUTN API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

module.exports = router;
