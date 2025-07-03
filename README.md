Movies API with Express.js and MySQL

Project Overview:
"This repository hosts a robust RESTful API built with Node.js and the Express.js framework, designed to manage movie data stored in a MySQL database. It provides comprehensive CRUD (Create, Read, Update, Delete) operations for movie records, alongside search functionality and integration with the OMDb API for movie poster retrieval. The project emphasizes clean architecture, secure practices, and maintainable code, showcasing core backend development and API design principles."

This application was developed as part of a university assignment, providing hands-on experience with full-stack development concepts and modern software engineering practices.

Key Features
Movie Data Management:

Retrieve lists of movies (GET /movies).

Search movies by primaryTitle with partial matching (GET /movies/search?title={searchTerm}).

Retrieve full details of a specific movie by its IMDb ID (GET /movies/data/:tconst).

Add new movie records (only primaryTitle and startYear are required from the user; other fields are intelligently auto-generated or defaulted by the API) (POST /movies).

Update existing movie details by IMDb ID (PUT /movies/:tconst).

Delete movie records by IMDb ID (DELETE /movies/:tconst).

Movie Poster Integration:

Fetch movie poster URLs, titles, and years from the OMDb API based on IMDb ID (GET /movies/poster/:tconst).

User Authentication:

User registration with secure password hashing (POST /users/register).

User login with JWT-based authentication via HttpOnly cookies (POST /users/login).

Protected route for fetching user profile (GET /profile).

API Documentation:

Interactive API documentation powered by Swagger UI, accessible at /api-docs.

Modular Architecture: Organized codebase with clear separation of concerns (routes, middleware, database configuration, views).

Technologies Used
Backend:

Node.js: JavaScript runtime environment.

Express.js: Fast, unopinionated, minimalist web framework for Node.js.

Knex.js: SQL query builder for programmatic database interactions and SQL injection prevention.

MySQL: Relational database for persistent data storage.

mysql2: High-performance MySQL client for Node.js, used by Knex.js.

Axios: Promise-based HTTP client for making external API calls (e.g., to OMDb).

dotenv: Loads environment variables from a .env file for secure credential management.

helmet: Express.js middleware for setting various HTTP headers to enhance security.

cors: Express.js middleware for enabling Cross-Origin Resource Sharing.

cookie-parser: Middleware for parsing cookies attached to the client request object.

bcrypt: Library for securely hashing user passwords.

jsonwebtoken (JWT): For creating and verifying JSON Web Tokens for user authentication.

Frontend:

Jade (Pug): High-performance templating engine for server-side rendering of HTML views.

HTML/CSS/JavaScript: Standard web technologies for the client-side interface.

Tailwind CSS (via CDN): Utility-first CSS framework for rapid styling.

Development Tools:

Git: Distributed version control system used for tracking changes and collaboration.

GitHub: Web-based platform for version control and collaboration using Git.

Swagger UI: Interactive API documentation generator.

Insomnia: Desktop API client for testing API endpoints.

JSON Lint: Tool for validating JSON syntax.

Setup and Installation
Follow these steps to get the Movies API application up and running on your local machine.

Prerequisites

Node.js and npm: Download and install Node.js LTS. npm is included with Node.js.

MySQL Server: A running MySQL database instance. You can use a Docker container.

1. Clone the Repository

First, clone this GitHub repository to your local machine:

git clone https://github.com/your-username/Movies-API-Express.git # Replace with your actual repo URL
cd Movies-API-Express

2. Install Node.js Dependencies

Navigate to the project's root directory and install all required Node.js packages:

npm install

3. Configure MySQL Database

a.  Create the Database and Tables:
Access your MySQL server (e.g., via MySQL Workbench, mysql command-line client, or phpMyAdmin) and execute the following SQL script to create the movies database and its necessary tables (basics and users):

```sql
CREATE DATABASE IF NOT EXISTS `movies` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `movies`;

DROP TABLE IF EXISTS `basics`;
CREATE TABLE `basics` (
  `tconst` varchar(255) NOT NULL,
  `titleType` varchar(255) NOT NULL,
  `primaryTitle` varchar(255) NOT NULL,
  `originalTitle` varchar(255) NOT NULL,
  `isAdult` int(11) NOT NULL,
  `startYear` varchar(255) NOT NULL,
  `endYear` varchar(255) NOT NULL,
  `runtimeMinutes` varchar(255) NOT NULL,
  `genres` varchar(255) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tconst` (`tconst`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create users table for authentication
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Insert sample movie data
LOCK TABLES `basics` WRITE;
/*!40000 ALTER TABLE `basics` DISABLE KEYS */;
INSERT INTO `basics` (`tconst`, `titleType`, `primaryTitle`, `originalTitle`, `isAdult`, `startYear`, `endYear`, `runtimeMinutes`, `genres`) VALUES
('tt0035423','movie','Kate & Leopold','Kate & Leopold',0,'2001','','118','Comedy,Fantasy,Romance'),
('tt0069049','movie','The Other Side of the Wind','The Other Side of the Wind',0,'2018','','122','Drama'),
('tt0097106','movie','A Tale of Springtime','Conte de printemps',0,'1990','','108','Comedy,Drama,Romance'),
('tt0097910','movie','Moon 44','Moon 44',0,'1990','','98','Action,Sci-Fi,Thriller'),
('tt0098532','movie','The Match Factory Girl','Tulitikkutehtaan tyttö',0,'1990','','69','Comedy,Crime,Drama'),
('tt0098966','movie','Three Men and a Little Lady','3 Men and a Little Lady',0,'1990','','104','Comedy,Drama,Family'),
('tt0098967','movie','Boiling Point','3-4 x jûgatsu',0,'1990','','96','Action,Comedy,Crime'),
('tt0098987','movie','The Adventures of Ford Fairlane','The Adventures of Ford Fairlane',0,'1990','','104','Action,Adventure,Comedy'),
('tt0098999','movie','Agneepath','Agneepath',0,'1990','','174','Action,Crime,Drama'),
('tt0099005','movie','Air America','Air America',0,'1990','','113','Action,Comedy,War');
/*!40000 ALTER TABLE `basics` ENABLE KEYS */;
UNLOCK TABLES;
```

b.  Create .env file:
In the root directory of your project, create a file named .env.

c.  Add Environment Variables:
Add your MySQL database connection details and a JWT secret to this .env file. Replace placeholders with your actual credentials.

```
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_root_password
MYSQL_DATABASE=movies
JWT_SECRET=your_super_secret_jwt_key
OMDB_API_KEY=96da0a71 # Your OMDb API Key
```
**Note:** Replace `your_mysql_root_password` and `your_super_secret_jwt_key` with strong, secure values. The `OMDB_API_KEY` is currently hardcoded in `index.js`, but it's best practice to move it to `.env` for production.

4. Create Necessary Directories

Ensure the following directories exist in your project root:

images: This folder will store movie posters fetched by the API.

mkdir images

docs: This folder contains the OpenAPI specification.

mkdir docs

Inside docs, ensure openapi.json is present with the latest API definition.

5. Run the Application

From your project's root directory, start the Express application:

node app.js

You should see a message in your console indicating that the server is listening, typically on port 3000.

Usage
Once the application is running, you can interact with it via:

Web Interface: Open your web browser and navigate to http://localhost:3000. This frontend provides forms for searching movies, fetching posters, and basic CRUD operations.

API Documentation (Swagger UI): Access the interactive API documentation at http://localhost:3000/api-docs. Here, you can explore all API endpoints, understand their parameters and responses, and test them directly.

API Client (e.g., Insomnia, Postman): Use an API client to send direct HTTP requests to your endpoints for more granular testing and development.

Version Control
This project utilizes Git for version control, hosted on GitHub. The commit history reflects the iterative development process, showcasing feature additions, bug fixes, and architectural refinements. This approach ensures traceability, facilitates collaboration, and demonstrates best practices in software development workflows.

Future Enhancements
Enhanced Authentication & Authorization: Implement robust authorization middleware for all protected routes (e.g., POST, PUT, DELETE /movies), ensuring only authenticated and authorized users can perform these actions. Explore using Bearer tokens in the Authorization header for API calls, which is a common and often more secure practice for APIs compared to cookies.

Comprehensive Data Validation: Implement more rigorous input validation on the backend (e.g., validating startYear as a valid year format, runtimeMinutes as numeric, genres against a predefined list).

Pagination: Implement pagination for the /movies endpoint to handle large datasets efficiently.

Error Handling Refinements: Provide more generic error messages to the client in production, while logging detailed errors internally for debugging.

Frontend Improvements: Develop a more dynamic and interactive frontend, potentially using a JavaScript framework like React, to enhance the user experience.

HTTPS Deployment: Configure the application for HTTPS using a Certificate Authority like Let's Encrypt for secure production deployment.

Containerization: Containerize the application using Docker for easier deployment and environment consistency.
