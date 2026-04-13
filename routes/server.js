/*Implement Core CRUD Operations
Build RESTful endpoints for each resource type:

Ensure all routes follow RESTful conventions and return appropriate HTTP status codes*/

/*Add Basic Error Handling
Implement proper error responses throughout your API:

Handle database connection errors gracefully
Return appropriate HTTP status codes (400, 404, 500, etc.)
Provide meaningful error messages in JSON format
Include validation error handling for required fields and data types
*/

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');
const { db, Zoo, Animal, Attraction, Zookeeper, User } = require('../database/setup');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

//Import Middleware
const { requireAuth, testConnection, loggingMiddleware, errorHandler, notFoundHandler } = require('../middleware/middleware.js');

//Apply Middleware
app.use(express.json());
app.use(cors());
app.use(loggingMiddleware);

//Test Database Connection
testConnection();

//Root Endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to the Zoo API!',
        version: '1.0.0',
        endpoints: {
            zoos: {
                getZoos: 'GET /zoos',
                getZooById: 'GET /zoos/:id',
                createZoo: 'POST /zoos (with authentication)',
                updateZoo: 'PUT /zoos/:id (with authentication)',
                deleteZoo: 'DELETE /zoos/:id (with authentication)'
            },
            animals: {
                getAnimals: 'GET /animals',
                getAnimalById: 'GET /animals/:id',
                createAnimal: 'POST /animals (with authentication)',
                updateAnimal: 'PUT /animals/:id (with authentication)',
                deleteAnimal: 'DELETE /animals/:id (with authentication)'
            },
            attractions: {
                getAttractions: 'GET /attractions',
                getAttractionById: 'GET /attractions/:id',
                createAttraction: 'POST /attractions (with authentication)',
                updateAttraction: 'PUT /attractions/:id (with authentication)',
                deleteAttraction: 'DELETE /attractions/:id (with authentication)'
            },
            zookeepers: {
                getZookeepers: 'GET /zookeepers (with authentication)',
                getZookeeperById: 'GET /zookeepers/:id (with authentication)',
                createZookeeper: 'POST /zookeepers (with authentication)',
                updateZookeeper: 'PUT /zookeepers/:id (with authentication)',
                deleteZookeeper: 'DELETE /zookeepers/:id (with authentication)'
            },
            users: {
                register: 'POST /users/register',
                login: 'POST /users/login',
                logout: 'POST /users/logout (with authentication)',
                getUsers: 'GET /users (with authentication)',
                deleteUser: 'DELETE /users/:id (with authentication)'
            }
        }
    });
});

//ZOO ENDPOINTS
// GET /zoos - Get all zoos
app.get('/zoos', async (req, res) => {
    try {
        const zoos = await Zoo.findAll();
        res.status(200).json({
            success: true,
            count: zoos.length,
            data: zoos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to retrieve zoos'
        });
    }
});

// GET /zoos/:id - Get zoo by ID
app.get('/zoos/:id', async (req, res) => {
    try {
        const zoo = await Zoo.findByPk(req.params.id, {
            include: [
                { association: 'animals' },
                { association: 'attractions' },
                { association: 'zookeepers' }
            ]
        });
        
        if (!zoo) {
            return res.status(404).json({
                success: false,
                error: 'Zoo not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: zoo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to retrieve zoo'
        });
    }
});

// POST /zoos - Create a new zoo (requires authentication)
app.post('/zoos', requireAuth, async (req, res) => {
    try {
        const { zoo_name, zoo_location, zoo_admission_price, zoo_parking_available } = req.body;
        
        // Validation
        if (!zoo_name || !zoo_location || zoo_admission_price === undefined) {
            return res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'zoo_name, zoo_location, and zoo_admission_price are required'
            });
        }
        
        const newZoo = await Zoo.create({
            zoo_name,
            zoo_location,
            zoo_admission_price,
            zoo_parking_available: zoo_parking_available || false,
            userId: req.user.id
        });
        
        res.status(201).json({
            success: true,
            message: 'Zoo created successfully',
            data: newZoo
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'Zoo name or location already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to create zoo'
        });
    }
});

// PUT /zoos/:id - Update a zoo (requires authentication)
app.put('/zoos/:id', requireAuth, async (req, res) => {
    try {
        const zoo = await Zoo.findByPk(req.params.id);
        
        if (!zoo) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Zoo not found'
            });
        }
        
        const { zoo_name, zoo_location, zoo_admission_price, zoo_parking_available } = req.body;
        
        await zoo.update({
            zoo_name: zoo_name || zoo.zoo_name,
            zoo_location: zoo_location || zoo.zoo_location,
            zoo_admission_price: zoo_admission_price !== undefined ? zoo_admission_price : zoo.zoo_admission_price,
            zoo_parking_available: zoo_parking_available !== undefined ? zoo_parking_available : zoo.zoo_parking_available
        });
        
        res.status(200).json({
            success: true,
            message: 'Zoo updated successfully',
            data: zoo
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'Zoo name or location already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to update zoo'
        });
    }
});

// DELETE /zoos/:id - Delete a zoo (requires authentication)
app.delete('/zoos/:id', requireAuth, async (req, res) => {
    try {
        const zoo = await Zoo.findByPk(req.params.id);
        
        if (!zoo) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Zoo not found'
            });
        }
        
        await zoo.destroy();
        
        res.status(200).json({
            success: true,
            message: 'Zoo deleted successfully',
            data: zoo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to delete zoo'
        });
    }
});

// ANIMAL ENDPOINTS
// GET /animals - Get all animals
app.get('/animals', async (req, res) => {
    try {
        const animals = await Animal.findAll();
        res.status(200).json({
            success: true,
            count: animals.length,
            data: animals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to retrieve animals'
        });
    }
});

// GET /animals/:id - Get animal by ID
app.get('/animals/:id', async (req, res) => {
    try {
        const animal = await Animal.findByPk(req.params.id, {
            include: [{ association: 'zoo' }]
        });
        
        if (!animal) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Animal not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: animal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to retrieve animal'
        });
    }
});

// POST /animals - Create a new animal (requires authentication)
app.post('/animals', requireAuth, async (req, res) => {
    try {
        const { region_name, animal_name, animal_species, animal_quantity, zooId } = req.body;
        
        // Validation
        if (!region_name || !animal_name || !animal_species) {
            return res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'region_name, animal_name, and animal_species are required'
            });
        }
        
        const newAnimal = await Animal.create({
            region_name,
            animal_name,
            animal_species,
            animal_quantity: animal_quantity || 0,
            zooId
        });
        
        res.status(201).json({
            success: true,
            message: 'Animal created successfully',
            data: newAnimal
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'Animal name already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to create animal'
        });
    }
});

// PUT /animals/:id - Update an animal (requires authentication)
app.put('/animals/:id', requireAuth, async (req, res) => {
    try {
        const animal = await Animal.findByPk(req.params.id);
        
        if (!animal) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Animal not found'
            });
        }
        
        const { region_name, animal_name, animal_species, animal_quantity } = req.body;
        
        await animal.update({
            region_name: region_name || animal.region_name,
            animal_name: animal_name || animal.animal_name,
            animal_species: animal_species || animal.animal_species,
            animal_quantity: animal_quantity !== undefined ? animal_quantity : animal.animal_quantity
        });
        
        res.status(200).json({
            success: true,
            message: 'Animal updated successfully',
            data: animal
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'Animal name already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to update animal'
        });
    }
});

// DELETE /animals/:id - Delete an animal (requires authentication)
app.delete('/animals/:id', requireAuth, async (req, res) => {
    try {
        const animal = await Animal.findByPk(req.params.id);
        
        if (!animal) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Animal not found'
            });
        }
        
        await animal.destroy();
        
        res.status(200).json({
            success: true,
            message: 'Animal deleted successfully',
            data: animal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to delete animal'
        });
    }
});

//ATTRACTION ENDPOINTS
// GET /attractions - Get all attractions
app.get('/attractions', async (req, res) => {
    try {
        const attractions = await Attraction.findAll();
        res.status(200).json({
            success: true,
            count: attractions.length,
            data: attractions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to retrieve attractions'
        });
    }
});

// GET /attractions/:id - Get attraction by ID
app.get('/attractions/:id', async (req, res) => {
    try {
        const attraction = await Attraction.findByPk(req.params.id, {
            include: [{ association: 'zoo' }]
        });
        
        if (!attraction) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Attraction not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: attraction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to retrieve attraction'
        });
    }
});

// POST /attractions - Create a new attraction (requires authentication)
app.post('/attractions', requireAuth, async (req, res) => {
    try {
        const { attraction_name, attraction_type, attraction_price, zooId } = req.body;
        
        // Validation
        if (!attraction_name || !attraction_type || attraction_price === undefined) {
            return res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'attraction_name, attraction_type, and attraction_price are required'
            });
        }
        
        const newAttraction = await Attraction.create({
            attraction_name,
            attraction_type,
            attraction_price,
            zooId
        });
        
        res.status(201).json({
            success: true,
            message: 'Attraction created successfully',
            data: newAttraction
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'Attraction name already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to create attraction'
        });
    }
});

// PUT /attractions/:id - Update an attraction (requires authentication)
app.put('/attractions/:id', requireAuth, async (req, res) => {
    try {
        const attraction = await Attraction.findByPk(req.params.id);
        
        if (!attraction) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Attraction not found'
            });
        }
        
        const { attraction_name, attraction_type, attraction_price } = req.body;
        
        await attraction.update({
            attraction_name: attraction_name || attraction.attraction_name,
            attraction_type: attraction_type || attraction.attraction_type,
            attraction_price: attraction_price !== undefined ? attraction_price : attraction.attraction_price
        });
        
        res.status(200).json({
            success: true,
            message: 'Attraction updated successfully',
            data: attraction
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'Attraction name already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to update attraction'
        });
    }
});

// DELETE /attractions/:id - Delete an attraction (requires authentication)
app.delete('/attractions/:id', requireAuth, async (req, res) => {
    try {
        const attraction = await Attraction.findByPk(req.params.id);
        
        if (!attraction) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Attraction not found'
            });
        }
        
        await attraction.destroy();
        
        res.status(200).json({
            success: true,
            message: 'Attraction deleted successfully',
            data: attraction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to delete attraction'
        });
    }
});

//ZOOKEEPER ENDPOINTS
// GET /zookeepers - Get all zookeepers (requires authentication)
app.get('/zookeepers', requireAuth, async (req, res) => {
    try {
        const zookeepers = await Zookeeper.findAll();
        res.status(200).json({
            success: true,
            count: zookeepers.length,
            data: zookeepers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to retrieve zookeepers'
        });
    }
});

// GET /zookeepers/:id - Get zookeeper by ID (requires authentication)
app.get('/zookeepers/:id', requireAuth, async (req, res) => {
    try {
        const zookeeper = await Zookeeper.findByPk(req.params.id, {
            include: [{ association: 'zoo' }]
        });
        
        if (!zookeeper) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Zookeeper not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: zookeeper
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to retrieve zookeeper'
        });
    }
});

// POST /zookeepers - Create a new zookeeper (requires authentication)
app.post('/zookeepers', requireAuth, async (req, res) => {
    try {
        const { zookeeper_name, zookeeper_attraction, zookeeper_animals, animal_health_status, animal_food_status, animal_enclosure_status, zooId } = req.body;
        
        // Validation
        if (!zookeeper_name || !zookeeper_attraction || !zookeeper_animals) {
            return res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'zookeeper_name, zookeeper_attraction, and zookeeper_animals are required'
            });
        }
        
        const newZookeeper = await Zookeeper.create({
            zookeeper_name,
            zookeeper_attraction,
            zookeeper_animals,
            animal_health_status: animal_health_status || 'Good',
            animal_food_status: animal_food_status || 'Fed',
            animal_enclosure_status: animal_enclosure_status !== undefined ? animal_enclosure_status : true,
            zooId
        });
        
        res.status(201).json({
            success: true,
            message: 'Zookeeper created successfully',
            data: newZookeeper
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'Zookeeper name already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to create zookeeper'
        });
    }
});

// PUT /zookeepers/:id - Update a zookeeper (requires authentication)
app.put('/zookeepers/:id', requireAuth, async (req, res) => {
    try {
        const zookeeper = await Zookeeper.findByPk(req.params.id);
        
        if (!zookeeper) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Zookeeper not found'
            });
        }
        
        const { zookeeper_name, zookeeper_attraction, zookeeper_animals, animal_health_status, animal_food_status, animal_enclosure_status } = req.body;
        
        await zookeeper.update({
            zookeeper_name: zookeeper_name || zookeeper.zookeeper_name,
            zookeeper_attraction: zookeeper_attraction || zookeeper.zookeeper_attraction,
            zookeeper_animals: zookeeper_animals || zookeeper.zookeeper_animals,
            animal_health_status: animal_health_status || zookeeper.animal_health_status,
            animal_food_status: animal_food_status || zookeeper.animal_food_status,
            animal_enclosure_status: animal_enclosure_status !== undefined ? animal_enclosure_status : zookeeper.animal_enclosure_status
        });
        
        res.status(200).json({
            success: true,
            message: 'Zookeeper updated successfully',
            data: zookeeper
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'Zookeeper name already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to update zookeeper'
        });
    }
});

// DELETE /zookeepers/:id - Delete a zookeeper (requires authentication)
app.delete('/zookeepers/:id', requireAuth, async (req, res) => {
    try {
        const zookeeper = await Zookeeper.findByPk(req.params.id);
        
        if (!zookeeper) {
            return res.status(404).json({
                success: false,
                error: 'NotFound',
                message: 'Zookeeper not found'
            });
        }
        
        await zookeeper.destroy();
        
        res.status(200).json({
            success: true,
            message: 'Zookeeper deleted successfully',
            data: zookeeper
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to delete zookeeper'
        });
    }
});

//USER ENDPOINTS
// POST /users/register - Register new user
app.post('/users/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        
        // Validate input
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ 
                success: false,
                error: 'ValidationError',
                message: 'All fields are required: username, email, password, firstName, lastName' 
            });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({ 
            where: { 
                [Sequelize.Op.or]: [
                    { email: email },
                    { username: username }
                ]
            } 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                error: 'ValidationError',
                message: 'User with this email or username already exists' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName
        });
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName
            }
        });
        
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ 
            success: false,
            error: 'ServerError',
            message: 'Failed to register user'
        });
    }
});

// POST /users/login - User login
app.post('/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'ValidationError',
                message: 'Username and password are required' 
            });
        }
        
        // Find user
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: 'AuthenticationError',
                message: 'Invalid username or password' 
            });
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false,
                error: 'AuthenticationError',
                message: 'Invalid username or password' 
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
        
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ 
            success: false,
            error: 'ServerError',
            message: 'Failed to login'
        });
    }
});

// POST /users/logout - User logout (requires authentication)
app.post('/users/logout', requireAuth, (req, res) => {
    // JWT tokens are stateless, logout is handled on the client side
    res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
});

// GET /users - Get all users (requires authentication)
app.get('/users', requireAuth, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to retrieve users'
        });
    }
});

// DELETE /users/:id - Delete a user (requires authentication)
app.delete('/users/:id', requireAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                message: 'The requested user could not be found'
            });
        }

        await user.destroy();
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DatabaseError',
            message: 'Failed to delete user'
        });
    }
});

//Error Handling Middleware
app.use(errorHandler);
app.use(notFoundHandler);

// Export app for testing
module.exports = app;

// Start server only if this file is run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
    });
}