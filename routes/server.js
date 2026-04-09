/*Implement Core CRUD Operations
Build RESTful endpoints for each resource type:

Create GET routes to retrieve all items and individual items by ID
Implement POST routes to create new resources with proper validation
Build PUT routes to update existing resources
Add DELETE routes to remove resources
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
const { db, Zoo, Animal, Attraction, Zookeeper, User } = require('./database/setup');
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
                createZoo: 'POST /zoos (with authentication)',
                updateZoo: 'PUT /zoos/:id (with authentication)',
                deleteZoo: 'DELETE /zoos/:id (with authentication)'
            },
            animals: {
                getAnimals: 'GET /animals',
                createAnimal: 'POST /animals (with authentication)',
                updateAnimal: 'PUT /animals/:id (with authentication)',
                deleteAnimal: 'DELETE /animals/:id (with authentication)'
            },
            attractions: {
                getAttractions: 'GET /attractions',
                createAttraction: 'POST /attractions (with authentication)',
                updateAttraction: 'PUT /attractions/:id (with authentication)',
                deleteAttraction: 'DELETE /attractions/:id (with authentication)'
            },
            zookeepers: {
                getZookeepers: 'GET /zookeepers',
                createZookeeper: 'POST /zookeepers (with authentication)',
                updateZookeeper: 'PUT /zookeepers/:id (with authentication)',
                deleteZookeeper: 'DELETE /zookeepers/:id (with authentication)'
            },
            users: {
                register: 'POST /users/register',
                login: 'POST /users/login',
                logout: 'POST /users/logout (with authentication)',
                getUsers: 'GET /users (with authentication)'
            }
        }
    });
});

//Error Handling Middleware
app.use(errorHandler);
app.use(notFoundHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});