const { db, Zoo, Animal, Attraction, Zookeeper, User} = require('./setup');

//Initialize Database and Sync Models
async function initializeDatabase() {
    try {
        await db.authenticate();
        console.log('Database connection established successfully');

        await db.sync({ force: false }); // Set to true to drop and recreate tables on every run
        console.log('Database synchronized successfully');

        //Creating sample data
        const existingUsers = await User.findAll();
        if (existingUsers.length === 0) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('password123', 10);

            // Create sample users
            const users = await User.bulkCreate([
                {
                    username: 'zoomgr1',
                    email: 'manager1@savannazoo.com',
                    password: hashedPassword,
                    firstName: 'John',
                    lastName: 'Smith'
                },
                {
                    username: 'zoomgr2',
                    email: 'manager2@wildlifezoo.com',
                    password: hashedPassword,
                    firstName: 'Emily',
                    lastName: 'Johnson'
                }
            ]);

            // Create sample zoos
            const zoos = await Zoo.bulkCreate([
                {
                    zoo_name: 'Savanna Wildlife Zoo',
                    zoo_location: 'Kenya',
                    zoo_admission_price: 25.50,
                    zoo_parking_available: true,
                    userId: users[0].id
                },
                {
                    zoo_name: 'Tropical Rainforest Zoo',
                    zoo_location: 'Brazil',
                    zoo_admission_price: 30.00,
                    zoo_parking_available: true,
                    userId: users[1].id
                }
            ]);

            // Create sample animals
            await Animal.bulkCreate([
                {
                    region_name: 'African Savanna',
                    animal_name: 'Simba',
                    animal_species: 'Lion',
                    animal_quantity: 3,
                    zooId: zoos[0].id
                },
                {
                    region_name: 'African Savanna',
                    animal_name: 'Giraffe Family',
                    animal_species: 'Giraffe',
                    animal_quantity: 5,
                    zooId: zoos[0].id
                },
                {
                    region_name: 'African Savanna',
                    animal_name: 'Zebra Herd',
                    animal_species: 'Zebra',
                    animal_quantity: 8,
                    zooId: zoos[0].id
                },
                {
                    region_name: 'Amazon Rainforest',
                    animal_name: 'Jaguar Pride',
                    animal_species: 'Jaguar',
                    animal_quantity: 2,
                    zooId: zoos[1].id
                },
                {
                    region_name: 'Amazon Rainforest',
                    animal_name: 'Macaw Flock',
                    animal_species: 'Macaw',
                    animal_quantity: 12,
                    zooId: zoos[1].id
                }
            ]);

            // Create sample attractions
            await Attraction.bulkCreate([
                {
                    attraction_name: 'Lion Feeding Show',
                    attraction_type: 'Live Show',
                    attraction_price: 15.00,
                    zooId: zoos[0].id
                },
                {
                    attraction_name: 'Safari Jeep Tour',
                    attraction_type: 'Tour',
                    attraction_price: 35.00,
                    zooId: zoos[0].id
                },
                {
                    attraction_name: 'Jungle Canopy Walk',
                    attraction_type: 'Experience',
                    attraction_price: 25.00,
                    zooId: zoos[1].id
                },
                {
                    attraction_name: 'Anaconda Encounter',
                    attraction_type: 'Educational Talk',
                    attraction_price: 10.00,
                    zooId: zoos[1].id
                }
            ]);

            // Create sample zookeepers
            await Zookeeper.bulkCreate([
                {
                    zookeeper_name: 'Marcus Thompson',
                    zookeeper_attraction: 'Lion Feeding Show',
                    zookeeper_animals: 'Lions, Zebras',
                    animal_health_status: 'Excellent',
                    animal_food_status: 'Well-fed',
                    animal_enclosure_status: true,
                    zooId: zoos[0].id
                },
                {
                    zookeeper_name: 'Lisa Garcia',
                    zookeeper_attraction: 'Safari Jeep Tour',
                    zookeeper_animals: 'Giraffes, Zebras, Lions',
                    animal_health_status: 'Good',
                    animal_food_status: 'Well-fed',
                    animal_enclosure_status: true,
                    zooId: zoos[0].id
                },
                {
                    zookeeper_name: 'Carlos Rodriguez',
                    zookeeper_attraction: 'Jungle Canopy Walk',
                    zookeeper_animals: 'Jaguars, Macaws',
                    animal_health_status: 'Excellent',
                    animal_food_status: 'Well-fed',
                    animal_enclosure_status: true,
                    zooId: zoos[1].id
                },
                {
                    zookeeper_name: 'Priya Patel',
                    zookeeper_attraction: 'Anaconda Encounter',
                    zookeeper_animals: 'Snakes, Reptiles',
                    animal_health_status: 'Good',
                    animal_food_status: 'Well-fed',
                    animal_enclosure_status: true,
                    zooId: zoos[1].id
                }
            ]);

            console.log('Sample data created successfully.');
        }
        
    } catch (error) {
        console.error('Unable to connect to database:', error);
    }
}

initializeDatabase();