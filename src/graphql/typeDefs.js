export const typeDefs = `#graphql
  enum TaskStatus {
    pending
    in_progress
    completed
  }

  type User {
    id: ID!
    email: String!
    countryCode: String!
    countryName: String!
    isVerified: Boolean!
    createdAt: String!
  }

  type Country {
    code: String!
    name: String!
    capital: String
  }

  type Weather {
    countryCode: String!
    countryName: String!
    location: String!
    temperatureC: Float!
    humidity: Int!
    windSpeedKmh: Float!
    condition: String!
    observedAt: String!
    source: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    createdAt: String!
    updatedAt: String!
  }

  type TaskCounts {
    all: Int!
    pending: Int!
    in_progress: Int!
    completed: Int!
  }

  type Query {
    me: User!
    countries: [Country!]!
    weather: Weather!
    tasks(status: TaskStatus, limit: Int, offset: Int): [Task!]!
    task(id: ID!): Task
    taskCounts: TaskCounts!
  }

  type Mutation {
    signup(email: String!, password: String!, countryCode: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createTask(title: String!, description: String): Task!
    updateTask(
      id: ID!
      title: String
      description: String
      status: TaskStatus
    ): Task!
    deleteTask(id: ID!): Boolean!
  }
`;
