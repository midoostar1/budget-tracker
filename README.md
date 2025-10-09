# Transaction Management System

A full-stack application for managing financial transactions with a REST API backend and mobile frontend.

## Features

- ✅ REST API with OpenAPI documentation
- ✅ Transaction CRUD operations
- ✅ Category management
- ✅ Zod validation with Decimal support for amounts
- ✅ Unit tests
- ✅ Mobile screens optimized for one-hand entry

## Setup

```bash
npm install
```

## Running the Backend

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

OpenAPI documentation: `http://localhost:3000/api-docs`

## Running Tests

```bash
npm test
```

## API Endpoints

- `POST /transactions` - Create a transaction
- `GET /transactions` - List transactions (paginated)
- `PATCH /transactions/:id` - Update a transaction
- `DELETE /transactions/:id` - Delete a transaction
- `GET /categories` - List categories
- `POST /categories` - Create a category

## Mobile App

Located in `/mobile` directory. See mobile/README.md for setup instructions.