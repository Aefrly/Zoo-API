const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

//Initialize database connection
const db = new Sequelize({
    dialect: 'sqlite',
    storage: `database/${process.env.DB_NAME}` || 'zoo.db',
    logging: false
});

//Zoo Model
const Zoo = db.define('Zoo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true
    },
    zoo_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    zoo_location: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    zoo_admission_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    zoo_parking_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
});

//Animal Model
const Animal = db.define('Animal', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true
    },
    region_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    animal_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    animal_species: {
        type: DataTypes.STRING,
        allowNull: false
    },
    animal_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
});

//Attraction Model
const Attraction = db.define('Attraction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true
    },
    attraction_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    attraction_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    attraction_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

//Zookeeper Model
const Zookeeper = db.define('Zookeeper', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    zookeeper_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    zookeeper_attraction: {
        type: DataTypes.STRING,
        allowNull: false
    },
    zookeeper_animals: {
        type: DataTypes.STRING,
        allowNull: false
    },
    animal_health_status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    animal_food_status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    animal_enclosure_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
});

//User Model
const User = db.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('visitor', 'keeper', 'admin'),
        allowNull: false,
        defaultValue: 'visitor'
    }
});

//Define Relationships
Zoo.hasMany(Animal, { foreignKey: 'zooId', as: 'animals' });
Animal.belongsTo(Zoo, { foreignKey: 'zooId', as: 'zoo' });

Zoo.hasMany(Attraction, { foreignKey: 'zooId', as: 'attractions' });
Attraction.belongsTo(Zoo, { foreignKey: 'zooId', as: 'zoo' });

Zoo.hasMany(Zookeeper, { foreignKey: 'zooId', as: 'zookeepers' });
Zookeeper.belongsTo(Zoo, { foreignKey: 'zooId', as: 'zoo' });

User.hasMany(Zoo, { foreignKey: 'userId', as: 'zoos' });
Zoo.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

module.exports = {
    db,
    Zoo,
    Animal,
    Attraction,
    Zookeeper,
    User
};