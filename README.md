# Zoo-API

A comprehensive REST API for managing zoo operations, animals, attractions, and staff, built with Node.js, Express, and SQLite.

## Features

- User authentication and role-based access control (visitor, keeper, admin)
- JWT-based authentication
- Complete CRUD operations for:
  - Zoos
  - Animals
  - Attractions
  - Zookeepers
  - Users
- RESTful API design with proper HTTP status codes
- SQLite database with Sequelize ORM
- Comprehensive error handling and validation
- Full test coverage with Jest and Supertest

## API Endpoints

### Authentication & Users
- `POST /users/register` - Register a new user
- `POST /users/login` - Login user and get JWT token
- `POST /users/logout` - Logout user (requires authentication)
- `GET /users` - Get all users (requires authentication)
- `DELETE /users/:id` - Delete a user (requires authentication)

### Zoos
- `GET /zoos` - Get all zoos
- `GET /zoos/:id` - Get zoo by ID with related animals, attractions, and zookeepers
- `POST /zoos` - Create new zoo (requires authentication)
- `PUT /zoos/:id` - Update zoo (requires authentication)
- `DELETE /zoos/:id` - Delete zoo (requires authentication)

### Animals
- `GET /animals` - Get all animals
- `GET /animals/:id` - Get animal by ID
- `POST /animals` - Create new animal (requires authentication)
- `PUT /animals/:id` - Update animal (requires authentication)
- `DELETE /animals/:id` - Delete animal (requires authentication)

### Attractions
- `GET /attractions` - Get all attractions
- `GET /attractions/:id` - Get attraction by ID
- `POST /attractions` - Create new attraction (requires authentication)
- `PUT /attractions/:id` - Update attraction (requires authentication)
- `DELETE /attractions/:id` - Delete attraction (requires authentication)

### Zookeepers
- `GET /zookeepers` - Get all zookeepers (requires authentication)
- `GET /zookeepers/:id` - Get zookeeper by ID (requires authentication)
- `POST /zookeepers` - Create new zookeeper (requires authentication)
- `PUT /zookeepers/:id` - Update zookeeper (requires authentication)
- `DELETE /zookeepers/:id` - Delete zookeeper (requires authentication)

### Utility
- `GET /` - API documentation and endpoint listing

## Local Development

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your_secret_key_here
   DB_NAME=zoo.db
   ```

3. Seed the database with sample data:
   ```bash
   npm run seed
   ```

4. Start the server:
   ```bash
   npm start
   ```

The API will be available at `http://localhost:3000`

### Sample Users
The database includes sample users for testing:
- **zoomgr1** / password123 (John Smith, Admin)
- **zoomgr2** / password123 (Emily Johnson, Keeper)
- **visitor1** / password123 (Tourist Guest, Visitor)

## API Usage Examples

### Register a User
```bash
POST /users/register
Content-Type: application/json

{
  "username": "newkeeper",
  "email": "keeper@zoo.com",
  "password": "securepass123",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

### Login
```bash
POST /users/login
Content-Type: application/json

{
  "username": "newkeeper",
  "password": "securepass123"
}
```

Response includes JWT token:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "newkeeper",
    "email": "keeper@zoo.com",
    "firstName": "Jane",
    "lastName": "Doe"
  }
}
```

### Create a Zoo (requires authentication)
```bash
POST /zoos
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "zoo_name": "Desert Safari Zoo",
  "zoo_location": "Arizona, USA",
  "zoo_admission_price": 28.99,
  "zoo_parking_available": true
}
```

### Create an Animal (requires authentication)
```bash
POST /animals
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "region_name": "African Desert",
  "animal_name": "Mufasa",
  "animal_species": "Lion",
  "animal_quantity": 2,
  "zooId": 1
}
```

### Create an Attraction (requires authentication)
```bash
POST /attractions
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "attraction_name": "Big Cat Feeding Show",
  "attraction_type": "Educational Show",
  "attraction_price": 12.50,
  "zooId": 1
}
```

### Create a Zookeeper (requires authentication)
```bash
POST /zookeepers
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "zookeeper_name": "Alex Rodriguez",
  "zookeeper_attraction": "Big Cat Feeding Show",
  "zookeeper_animals": "Lions, Tigers, Leopards",
  "animal_health_status": "Excellent",
  "animal_food_status": "Well-fed",
  "zooId": 1
}
```

## Testing

Run the complete test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Tests include coverage for:
- All CRUD operations per resource type
- Authentication and authorization
- Error handling and validation
- 404 responses for non-existent resources
- Duplicate prevention
- Database constraints

## Database Models

### User
- id (Integer, Primary Key)
- username (String, Unique)
- email (String, Unique)
- password (String, hashed)
- firstName (String)
- lastName (String)
- role (Enum: 'visitor', 'keeper', 'admin')

### Zoo
- id (Integer, Primary Key)
- zoo_name (String, Unique)
- zoo_location (String, Unique)
- zoo_admission_price (Decimal)
- zoo_parking_available (Boolean)
- userId (Foreign Key to User)

### Animal
- id (Integer, Primary Key)
- region_name (String)
- animal_name (String, Unique)
- animal_species (String)
- animal_quantity (Integer)
- zooId (Foreign Key to Zoo)

### Attraction
- id (Integer, Primary Key)
- attraction_name (String, Unique)
- attraction_type (String)
- attraction_price (Decimal)
- zooId (Foreign Key to Zoo)

### Zookeeper
- id (Integer, Primary Key)
- zookeeper_name (String, Unique)
- zookeeper_attraction (String)
- zookeeper_animals (String)
- animal_health_status (String)
- animal_food_status (String)
- animal_enclosure_status (Boolean)
- zooId (Foreign Key to Zoo)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `JWT_SECRET` | Secret key for JWT tokens | (required) |
| `DB_NAME` | SQLite database file name | zoo.db |

## Deployment

This API is ready to deploy to cloud platforms like Render or Heroku. Remember to:

1. Set all required environment variables in your platform
2. Use a strong, secure JWT_SECRET in production
3. Set `NODE_ENV=production`
4. For persistent production databases, consider migrating from SQLite to PostgreSQL
5. Implement rate limiting for production deployments

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common status codes:
- `200` - Successful GET/PUT/DELETE
- `201` - Successful POST (resource created)
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid authentication)
- `404` - Resource not found
- `500` - Server error

## Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Testing**: Jest and Supertest
- **Environment Variables**: dotenv