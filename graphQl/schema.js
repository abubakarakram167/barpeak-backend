const { buildSchema }  = require('graphql'); 

module.exports = buildSchema(`
  
  type Text{
    text: String!
    views: Int!
  }

  type User{
    _id: ID!
    firstName: String!
    lastName: String!
    email: String!
    password: String
    dob: String!
    posts: [Post!]! 
  }

  type Business{
    _id: ID!
    placeId: String!
    category: String!
    title: String!
    createdBy: User!
    profile: businessProfile! 
  }

  type businessProfile {
    expensive: Boolean
    crowded: Boolean
  }

  type Post{
    _id: ID! 
    title: String!
    content: String!
    imageUrl: String!
    creator:  User!
    createdAt: String!
    updatedAt: String!
  }

  input postInputData{
    title: String!
    content: String!
    imageUrl: String!
  }

  input UserInputData {
    email: String!
    firstName: String!
    lastName: String!
    password: String!
    dob: String 
    accountType: String!
  }

  input businessInputData{
    placeId: String!
    category: String!
    title: String!
    crowded: Boolean!
    expensive: Boolean!
  }

  type Vibe{
    crowdedPlace: Boolean!
    expensivePlace: Boolean!
    isPartner: Boolean!
    barOrRestaurant: String!
    user: User!
  }

  input vibeInputData{
    crowdedPlace: Boolean!
    expensivePlace: Boolean!
    isPartner: Boolean!
    barOrRestaurant: String!
  }

  type RootMutation {
    createUser(userInput: UserInputData) : AuthData!
    createPost(postInput: postInputData) : Post!
    updatePosts(id: ID!, postInput: postInputData!): Post!
    createBusiness(businessInput: businessInputData) : Business!
    setVibe(vibeInput: vibeInputData): Vibe!
    updateUibe(vibeInput: vibeInputData): Vibe!
  }

  type PostData{
    posts: [Post!]!
    totalPosts: Int!
  }

  type AuthData{
    token: String!
    userId: String!
  }

  type RootQuery{
    login(email: String!, password: String!): AuthData!
    checkUserAvailable(email: String!): Boolean!
    posts: PostData!
    singlePost(id: ID!): Post!
    allBusinesses: [Business!]!
    getVibe: Vibe
  }
  schema {
    query: RootQuery 
    mutation: RootMutation
  }
`)