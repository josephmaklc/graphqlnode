const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Sample data to start with
const cars = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Corolla',
    year: 1991
  },
  {
    id: '2',
    make: 'Volkswagen',
    model: 'Jetta',
    year: 2001
  },
  {
    id: '3',
    make: 'Honda',
    model: 'CRV',
    year: 2009
  },
  {
    id: '4',
    make: 'Toyota',
    model: 'Highlander',
    year: 2022
  },

];

// Define the schema using GraphQL schema language
const schema = buildSchema(`
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
`);

// Define resolvers for the schema fields
const root = {
  // Resolver for fetching all cars
  cars: () => cars,
  
  // Resolver for fetching a single book by ID
  car: ({ id }) => cars.find(car => car.id === id),
  
  // Resolver for searching cars
  searchCars: ({ query }) => {
    const searchTerm = query.toLowerCase();
    return cars.filter(
      car =>
        car.make.toLowerCase().includes(searchTerm) ||
        car.model.toLowerCase().includes(searchTerm)
    );
  },

  // Mutation resolvers
  addCar: ({ input }) => {
    const newCar = {
      id: String(cars.length + 1),
      ...input
    }
    cars.push(newCar);
    return newCar;
  },

  updateCar: ({ id, input }) => {
    const carIndex = cars.findIndex(car => car.id === id);
    if (carIndex === -1) return null;

    const updatedCar = {
      ...cars[carIndex],
      ...input
    }
    cars[carIndex] = updatedCar;

    return updatedCar;
  },

  deleteCar: ({ id }) => {
    const carIndex = cars.findIndex(car => car.id === id);
    if (carIndex === -1) return false;

    cars.splice(carIndex, 1);
    return true;
  }
};

// Create an Express app
const app = express();

// Set up the GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  // Enable the GraphiQL interface for testing
  graphiql: true,
}));

app.get('/', (req, res) => {
  res.send('Welcome to graphQL demo! Go to /graphql to use the GraphQL API. See the readme for more info.');
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/graphql`);
});
