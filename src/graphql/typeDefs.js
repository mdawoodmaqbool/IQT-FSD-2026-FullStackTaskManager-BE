export const typeDefs = `#graphql
  enum TaskStatus {
    pending
    in_progress
    completed
  }

  enum OtpType {
    signup
    reset_password
  }

  type User {
    id: ID!
    email: String!
    isVerified: Boolean!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type MessageResponse {
    message: String!
    email: String
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
    tasks(status: TaskStatus, limit: Int, offset: Int): [Task!]!
    task(id: ID!): Task
    taskCounts: TaskCounts!
  }

  type Mutation {
    signup(email: String!, password: String!): MessageResponse!
    verifyOtp(email: String!, code: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    resendOtp(email: String!, type: OtpType): MessageResponse!
    forgotPassword(email: String!): MessageResponse!
    resetPassword(email: String!, code: String!, password: String!): MessageResponse!
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
