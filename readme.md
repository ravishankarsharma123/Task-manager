# Task Manager API

A robust task management API built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Task CRUD operations
- Email notifications
- File upload support
- Secure cookie handling
- Input validation
- Environment variable configuration

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Task-manager
```

2. Install dependencies:

```bash
npm install
```

3. Environment Setup:
   - Copy the `.env.sample` file to create a new `.env` file:
   ```bash
   cp .env.sample .env
   ```
   - Update the `.env` file with your configuration:
     - MongoDB connection string
     - JWT secret
     - Email service credentials
     - Other required environment variables

## Running the Application

### Development Mode

To run the application in development mode with hot-reload:

```bash
npm run dev
```

The server will start on the configured port (default: 3000) with nodemon for automatic reloading during development.

## Project Structure

```
Task-manager/
├── src/             # Source code
├── public/          # Static files
├── .env.sample      # Sample environment variables
├── .env            # Environment variables (create this)
├── package.json    # Project dependencies and scripts
└── README.md      # Project documentation
```

## Dependencies

Main dependencies used in this project:

- express: Web framework
- mongoose: MongoDB ODM
- bcryptjs: Password hashing
- jsonwebtoken: JWT authentication
- nodemailer & mailgen: Email handling
- multer: File upload handling
- cookie-parser: Cookie handling
- cors: Cross-Origin Resource Sharing
- dotenv: Environment variable management
- express-validator: Input validation

## Development Dependencies

- nodemon: Development server with hot reload
- prettier: Code formatting

## Environment Variables

Make sure to set up the following environment variables in your `.env` file:

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `PORT`: Server port (default: 3000)
- Email configuration:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USERNAME`
  - `SMTP_PASSWORD`
  - Other required email settings

## API Documentation

(Add your API endpoints documentation here)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
