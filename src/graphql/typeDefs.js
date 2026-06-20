export const typeDefs = `#graphql
  enum TaskStatus {
    pending
    in_progress
    completed
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
    tasks(status: TaskStatus, limit: Int, offset: Int): [Task!]!
    task(id: ID!): Task
    taskCounts: TaskCounts!
  }

  type Mutation {
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
