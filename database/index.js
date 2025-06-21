const Sequelize = require('sequelize');
const constants = require('../constants');

//Stablish conecction
const sequelize = new Sequelize(
    `postgres://${constants.DB_USER}:${constants.DB_PWD}@${constants.DB_HOST}:${constants.DB_PORT}/${constants.DB_DBNAME}`,
    {
        dialectOptions : {
            ssl : false
        }    
    }
);


//Creating the models for db.
const UserModel = require('../components/user/user.model');
const CalificationModel = require('../components/calification/calification.model');
const CareerModel = require('../components/career/career.model');
const FileModel = require('../components/file/file.model');
const InputModel = require('../components/input/input.model');
const LogModel = require('../components/log/log.model');
const ParameterModel = require('../components/parameter/parameter.model');
const ProfileModel = require('../components/profile/profile.model');
const RelInputUserModel = require('../components/relInputUser/relInputUser.model');
const ProfileRouteModel = require('../components/profileRoute/profileRoute.model');
const SubjectModel = require('../components/subject/subject.model');


const User = UserModel(sequelize, Sequelize);
const Calification = CalificationModel(sequelize, Sequelize);
const Career = CareerModel(sequelize, Sequelize);
const File = FileModel(sequelize, Sequelize);
const Input = InputModel(sequelize, Sequelize);
const Log = LogModel(sequelize, Sequelize);
const Parameter = ParameterModel(sequelize, Sequelize);
const Profile = ProfileModel(sequelize, Sequelize);
const ProfileRoute = ProfileRouteModel(sequelize, Sequelize);
const RelInputUser = RelInputUserModel(sequelize, Sequelize);
const Subject = SubjectModel(sequelize, Sequelize);

sequelize.sync({ force : false}).then(() => {
    console.log("*----------------------Tablas sincronizadas------------------------*");
});


module.exports = {
    sequelize,
    User,
    Calification,
    Career,
    File,
    Input,
    Log,
    Parameter,
    Profile,
    ProfileRoute,
    RelInputUser,
    Subject
}
