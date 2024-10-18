import gql from 'graphql-tag';

const typeDefs = gql`
    type Query {
        me: User
    }

    input UserInput {
        username: String!
        email: String!
        password: String!
    }

    input BookInput {
        authors: [String]
        description: String!
        bookId: String!
        image: String
        link: String
        title: String!
    }

    type User {
        _id: ID
        username: String
        email: String
        bookCount: Int
        savedBooks: [Book]
        }

    type Book {
        bookId: ID
        authors: [String]
        description: String
        title: String
        image: String
        link: String
    }
    type Auth {
        token: ID!
        user: User
    }    


    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(input: UserInput!): Auth
        saveBook(input: BookInput!): User
        removeBook(bookId: String!): User
    }


    `;

    export default typeDefs;