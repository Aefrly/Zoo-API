# Zoo-API

Install necessary dependencies (Express, Sequelize, SQLite, etc.)

Design Database Schema
Create your relational database with at least 3 resource types:

Set up Sequelize models for each resource type in your database/models directory
Define proper relationships between your models using foreign keys
Include appropriate data types, constraints, and validations for each field
Create a database setup script that initializes your tables and relationships
Create a setup command in your package.json.

Seed Database
Write a seed script that populates your database with realistic sample data for all resource types with proper relationships. Make the seed script easily runnable by adding a seed command to your package.json.
💡 Sample Data and AI Usage: AI is exceptionally good at creating sample data for your database. You should use a generative AI tool to create enough realistic data for your system!

Implement Core CRUD Operations
Build RESTful endpoints for each resource type:

Create GET routes to retrieve all items and individual items by ID
Implement POST routes to create new resources with proper validation
Build PUT routes to update existing resources
Add DELETE routes to remove resources
Ensure all routes follow RESTful conventions and return appropriate HTTP status codes

Create Basic Middleware
Implement essential middleware functions:

Add express.json() middleware for parsing JSON requests
Create basic logging middleware to track API requests
Implement error handling middleware to catch and format errors
Add any custom middleware needed for your specific API functionality

Add Basic Error Handling
Implement proper error responses throughout your API:

Handle database connection errors gracefully
Return appropriate HTTP status codes (400, 404, 500, etc.)
Provide meaningful error messages in JSON format
Include validation error handling for required fields and data types


Write Initial Unit Tests
Create basic tests for critical functionality:

Set up a testing framework (Jest and Supertest)
Write tests for at least one CRUD operation per resource type
Include tests for both successful operations and error conditions
Ensure your tests can run independently and don't interfere with your development database

Test Your Complete API
Using Postman, verify all functionality for your MVP works correctly and that errors are handled correctly.

Document Your API
Create clear documentation for your endpoints:

Update your README.md with setup instructions and project overview. Be sure to document your CRUD endpoints in the README with HTTP method, URL, required parameters, response format, and how to set up and run the application locally.
Create a Postman API documentation that includes example requests and responses for each CRUD endpoints.

Submit Your Work
Submit the following:

A link to your GitHub repository that contains all of the code for your MVP REST API.
A public link to the Postman documentation for your CRUD endpoints.