import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import express from 'express';
import http from 'http';
import cors from 'cors';

// ----------------------------------------------------
// This is a Apollo Server implementation
//
// In a new directory, run the following commands to set up:
// npm init -y
// npm install @apollo/server express graphql cors body-parser
// Copy this file to the new directory and run:
//
// node server_apollo.js
// Then navigate to http://localhost:4000/graphql
// ----------------------------------------------------

const cars = [
  { id: '1', make: 'Toyota', model: 'Corolla', year: 1991 },
  { id: '2', make: 'Volkswagen', model: 'Jetta', year: 2001 },
  { id: '3', make: 'Honda', model: 'CRV', year: 2009 },
  { id: '4', make: 'Toyota', model: 'Highlander', year: 2022 },
];

// Define the schema using GraphQL schema language
const typeDefs = `
# A car has a make, model, and year
  type Car {
    id: ID!
    make: String!
    model: String!
    year: Int
  }

  # The "Query" type is the root of all GraphQL queries
  type Query {
    # Get all cars
    cars: [Car!]!
    # Get a specific book by ID
    car(id: ID!): Car
    # Search books by title or author
    searchCars(query: String!): [Car!]!
  }

  # Input type for adding/updating car
  input CarInput {
    make: String
    model: String
    year: Int
  }

  type Mutation {
    # Add a new car
    addCar(input: CarInput!): Car!
    # Update an existing car
    updateCar(id: ID!, input: CarInput!): Car
    # Delete a car
    deleteCar(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    cars: () => cars,
    car: (parent, { id }) => cars.find(car => car.id === id),
    searchCars: (parent, { query }) => {
      const searchTerm = query.toLowerCase();
      return cars.filter(
        car =>
          car.make.toLowerCase().includes(searchTerm) ||
          car.model.toLowerCase().includes(searchTerm)
      );
    },
  },

  Mutation: {
    addCar: (parent, { input }) => {
      const newCar = {
        id: String(cars.length + 1),
        ...input
      }
      cars.push(newCar);
      return newCar;
    },

    updateCar: (parent, { id, input }) => {
      const carIndex = cars.findIndex(car => car.id === id);
      if (carIndex === -1) return null;

      const updatedCar = {
        ...cars[carIndex],
        ...input
      }
      cars[carIndex] = updatedCar;

      return updatedCar;
    },

    deleteCar: (parent, { id }) => {
      const carIndex = cars.findIndex(car => car.id === id);
      if (carIndex === -1) return false;

      cars.splice(carIndex, 1);
      return true;
    },
  }
};

// ----------------------------------------------------
// Setup and Start Apollo Server with Express
// ----------------------------------------------------

async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = 4000;

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  
  app.use(express.json());

  app.use(cors());

  app.use(
    '/graphql',
    expressMiddleware(server),
  );

  app.get('/', (req, res) => {
    res.send('Welcome to the Apollo Server demo! Go to /graphql to use the GraphQL API.');
  });
  
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));

  console.log(`Apollo Server ready at http://localhost:${PORT}/graphql`);
}

startApolloServer();