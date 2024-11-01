import gql from 'graphql-tag';

export const userSchema = gql`
  enum Role {
    DOCTOR
    PATIENT
    HOSPITAL
    UNDEFINED
  }

  type User {
    id: ID!
    externalId: String!
    email: String!
    role: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type UserCollection implements Collection {
    totalCount: Int
    pageInfo: PageInfo
    items: [User]
  }

  input UserInput {
    id: String!
    externalId: String!
    email: String!
    role: Role!
  }

  type Mutation {
    createUser(user: UserInput!): Void
  }
`;
