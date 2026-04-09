const request = require('supertest');
const { db, Zoo, Animal, Attraction, Zookeeper, User } = require('../database/setup');
const app = require('../routes/server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Test database setup
let testToken;
let testUserId;
let testZooId;
let testAnimalId;
let testAttractionId;
let testZokeeperId;

// Sync database before tests
beforeAll(async () => {
    try {
        await db.sync({ force: true });
        
        // Create a test user for authentication
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        const testUser = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: hashedPassword,
            firstName: 'Test',
            lastName: 'User'
        });
        
        testUserId = testUser.id;
        testToken = jwt.sign(
            { id: testUser.id, username: testUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    } catch (error) {
        console.error('Setup error:', error);
    }
});

// Clean up after tests
afterAll(async () => {
    try {
        await db.close();
    } catch (error) {
        console.error('Cleanup error:', error);
    }
});

//ZOO ENDPOINT TESTS
describe('Zoo Endpoints', () => {
    
    test('POST /zoos - Create a zoo with authentication', async () => {
        const res = await request(app)
            .post('/zoos')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                zoo_name: 'San Diego Zoo',
                zoo_location: 'San Diego, California',
                zoo_admission_price: 22.99,
                zoo_parking_available: true
            });
        
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.zoo_name).toBe('San Diego Zoo');
        testZooId = res.body.data.id;
    });

    test('POST /zoos - Reject without authentication', async () => {
        const res = await request(app)
            .post('/zoos')
            .send({
                zoo_name: 'Another Zoo',
                zoo_location: 'Another Location',
                zoo_admission_price: 20.00
            });
        
        expect(res.status).toBe(401);
        expect(res.body.error).toBeDefined();
    });

    test('POST /zoos - Validate required fields', async () => {
        const res = await request(app)
            .post('/zoos')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                zoo_name: 'Incomplete Zoo'
                // Missing required fields
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('GET /zoos - Retrieve all zoos', async () => {
        const res = await request(app).get('/zoos');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    test('GET /zoos/:id - Retrieve zoo by ID', async () => {
        const res = await request(app).get(`/zoos/${testZooId}`);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(testZooId);
    });

    test('GET /zoos/:id - Return 404 for non-existent zoo', async () => {
        const res = await request(app).get('/zoos/99999');
        
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    test('PUT /zoos/:id - Update a zoo', async () => {
        const res = await request(app)
            .put(`/zoos/${testZooId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                zoo_admission_price: 24.99
            });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.zoo_admission_price).toBe(24.99);
    });

    test('DELETE /zoos/:id - Delete a zoo', async () => {
        // Create a zoo to delete
        const createRes = await request(app)
            .post('/zoos')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                zoo_name: 'Zoo to Delete',
                zoo_location: 'Deletion Location',
                zoo_admission_price: 15.00
            });
        
        const zooIdToDelete = createRes.body.data.id;
        
        const deleteRes = await request(app)
            .delete(`/zoos/${zooIdToDelete}`)
            .set('Authorization', `Bearer ${testToken}`);
        
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.success).toBe(true);
    });
});

//ANIMAL ENDPOINT TESTS
describe('Animal Endpoints', () => {
    
    test('POST /animals - Create an animal with authentication', async () => {
        const res = await request(app)
            .post('/animals')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                region_name: 'African Savanna',
                animal_name: 'Simba the Lion',
                animal_species: 'Lion',
                animal_quantity: 5,
                zooId: testZooId
            });
        
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.animal_species).toBe('Lion');
        testAnimalId = res.body.data.id;
    });

    test('POST /animals - Validate required fields', async () => {
        const res = await request(app)
            .post('/animals')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                region_name: 'African Savanna'
                // Missing animal_name and animal_species
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('GET /animals - Retrieve all animals', async () => {
        const res = await request(app).get('/animals');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET /animals/:id - Retrieve animal by ID', async () => {
        const res = await request(app).get(`/animals/${testAnimalId}`);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(testAnimalId);
    });

    test('GET /animals/:id - Return 404 for non-existent animal', async () => {
        const res = await request(app).get('/animals/99999');
        
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    test('PUT /animals/:id - Update an animal', async () => {
        const res = await request(app)
            .put(`/animals/${testAnimalId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                animal_quantity: 8
            });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.animal_quantity).toBe(8);
    });

    test('DELETE /animals/:id - Delete an animal', async () => {
        // Create an animal to delete
        const createRes = await request(app)
            .post('/animals')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                region_name: 'Test Region',
                animal_name: 'Animal to Delete',
                animal_species: 'Test Species',
                animal_quantity: 1
            });
        
        const animalIdToDelete = createRes.body.data.id;
        
        const deleteRes = await request(app)
            .delete(`/animals/${animalIdToDelete}`)
            .set('Authorization', `Bearer ${testToken}`);
        
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.success).toBe(true);
    });
});

//ATTRACTION ENDPOINT TESTS
describe('Attraction Endpoints', () => {
    
    test('POST /attractions - Create an attraction with authentication', async () => {
        const res = await request(app)
            .post('/attractions')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                attraction_name: 'Lion Feeding Show',
                attraction_type: 'Educational Show',
                attraction_price: 5.99,
                zooId: testZooId
            });
        
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.attraction_name).toBe('Lion Feeding Show');
        testAttractionId = res.body.data.id;
    });

    test('POST /attractions - Validate required fields', async () => {
        const res = await request(app)
            .post('/attractions')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                attraction_name: 'Incomplete Show'
                // Missing attraction_type and attraction_price
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('GET /attractions - Retrieve all attractions', async () => {
        const res = await request(app).get('/attractions');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET /attractions/:id - Retrieve attraction by ID', async () => {
        const res = await request(app).get(`/attractions/${testAttractionId}`);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(testAttractionId);
    });

    test('PUT /attractions/:id - Update an attraction', async () => {
        const res = await request(app)
            .put(`/attractions/${testAttractionId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                attraction_price: 7.99
            });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.attraction_price).toBe(7.99);
    });

    test('DELETE /attractions/:id - Delete an attraction', async () => {
        // Create an attraction to delete
        const createRes = await request(app)
            .post('/attractions')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                attraction_name: 'Attraction to Delete',
                attraction_type: 'Show',
                attraction_price: 3.00
            });
        
        const attractionIdToDelete = createRes.body.data.id;
        
        const deleteRes = await request(app)
            .delete(`/attractions/${attractionIdToDelete}`)
            .set('Authorization', `Bearer ${testToken}`);
        
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.success).toBe(true);
    });
});

//ZOOKEEPER ENDPOINT TESTS
describe('Zookeeper Endpoints', () => {
    
    test('POST /zookeepers - Create a zookeeper with authentication', async () => {
        const res = await request(app)
            .post('/zookeepers')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                zookeeper_name: 'John Smith',
                zookeeper_attraction: 'Lion Enclosure',
                zookeeper_animals: 'Lions, Tigers',
                animal_health_status: 'Excellent',
                animal_food_status: 'Well-fed',
                zooId: testZooId
            });
        
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.zookeeper_name).toBe('John Smith');
        testZokeeperId = res.body.data.id;
    });

    test('GET /zookeepers - Require authentication', async () => {
        const res = await request(app).get('/zookeepers');
        
        expect(res.status).toBe(401);
        expect(res.body.error).toBeDefined();
    });

    test('GET /zookeepers - Retrieve all zookeepers with authentication', async () => {
        const res = await request(app)
            .get('/zookeepers')
            .set('Authorization', `Bearer ${testToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET /zookeepers/:id - Retrieve zookeeper by ID', async () => {
        const res = await request(app)
            .get(`/zookeepers/${testZokeeperId}`)
            .set('Authorization', `Bearer ${testToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(testZokeeperId);
    });

    test('PUT /zookeepers/:id - Update a zookeeper', async () => {
        const res = await request(app)
            .put(`/zookeepers/${testZokeeperId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                animal_health_status: 'Good'
            });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.animal_health_status).toBe('Good');
    });

    test('DELETE /zookeepers/:id - Delete a zookeeper', async () => {
        // Create a zookeeper to delete
        const createRes = await request(app)
            .post('/zookeepers')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
                zookeeper_name: 'Zookeeper to Delete',
                zookeeper_attraction: 'Test Area',
                zookeeper_animals: 'Test Animals'
            });
        
        const zookenperIdToDelete = createRes.body.data.id;
        
        const deleteRes = await request(app)
            .delete(`/zookeepers/${zookenperIdToDelete}`)
            .set('Authorization', `Bearer ${testToken}`);
        
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.success).toBe(true);
    });
});

//USER ENDPOINT TESTS
describe('User Endpoints', () => {
    
    test('POST /users/register - Register a new user', async () => {
        const res = await request(app)
            .post('/users/register')
            .send({
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'securepassword123',
                firstName: 'New',
                lastName: 'User'
            });
        
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.username).toBe('newuser');
    });

    test('POST /users/register - Validate required fields', async () => {
        const res = await request(app)
            .post('/users/register')
            .send({
                username: 'incompleteuser'
                // Missing other required fields
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('POST /users/register - Prevent duplicate usernames', async () => {
        // First registration
        await request(app)
            .post('/users/register')
            .send({
                username: 'duplicateuser',
                email: 'duplicate1@example.com',
                password: 'password123',
                firstName: 'Duplicate',
                lastName: 'User'
            });

        // Attempt duplicate
        const res = await request(app)
            .post('/users/register')
            .send({
                username: 'duplicateuser',
                email: 'duplicate2@example.com',
                password: 'password123',
                firstName: 'Another',
                lastName: 'User'
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('POST /users/login - Login with valid credentials', async () => {
        const res = await request(app)
            .post('/users/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.username).toBe('testuser');
    });

    test('POST /users/login - Reject invalid password', async () => {
        const res = await request(app)
            .post('/users/login')
            .send({
                username: 'testuser',
                password: 'wrongpassword'
            });
        
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test('POST /users/login - Reject non-existent user', async () => {
        const res = await request(app)
            .post('/users/login')
            .send({
                username: 'nonexistentuser',
                password: 'anypassword'
            });
        
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test('POST /users/logout - Logout requires authentication', async () => {
        const res = await request(app)
            .post('/users/logout')
            .set('Authorization', `Bearer ${testToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('GET /users - Retrieve all users with authentication', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${testToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET /users - Require authentication', async () => {
        const res = await request(app).get('/users');
        
        expect(res.status).toBe(401);
        expect(res.body.error).toBeDefined();
    });
});

//ROOT ENDPOINT TEST
describe('Root Endpoint', () => {
    
    test('GET / - Returns API documentation', async () => {
        const res = await request(app).get('/');
        
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Welcome to the Zoo API!');
        expect(res.body.endpoints).toBeDefined();
    });
});