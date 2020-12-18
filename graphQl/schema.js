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
    radius: Int! 
    profilePic: String
    gender: String
    accountType: String
  }

  type Rating{
    fun: Float!
    crowd: Float!
    ratioInput: Float!
    difficultyGettingIn: Float!
    difficultyGettingDrink: Float!
  }

  type customBusinessData{
    address: String
    phoneNumber: String
    rating: Int
  }

  type photoData{
    asset_id: String
    public_id: String
    url: String,
    secure_url: String,
    original_filename: String
  }

  
  

  type Business{
    _id: ID!
    placeId: String!
    category: [Category]
    name: String!
    createdBy: User!
    rating: Rating! 
    totalUserCountRating: Int!
    ageInterval: String!,
    ratioType: String!
    customData: customBusinessData
    uploadedPhotos: [photoData]
    googleBusiness: googleBusinessData  
  }

  type closeTimeData{
    day: String
    time: String
  }

  type openTimeData{
    day: String
    time: String
  }

  type periodData{
    close: closeTimeData
    open: openTimeData
  }

  type openingHourData{
    open_now: String
    periods: [periodData]
  }

  type reviewData{
    author_name: String,
    author_url: String,
    language: String,
    profile_photo_url: String,
    rating: Float,
    relative_time_description: String,
    text: String,
    time: Int
  }

  type googleBusinessData{
    business_status: String
    formatted_address: String
    formatted_phone_number: String
    name: String
    place_id: String
    opening_hours: openingHourData
    rating: Float
    reviews: [reviewData]
    vicinity: String,
    user_ratings_total: Int,
    url: String,
    types: [String]
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
    accountType: String
    profilePic: String
    gender: String
  }

  input businessInputData{
    placeId: String!
    category: String
    name: String!
    rating: ratingInput!
    ageInterval: String!
    photoReference: String!
    googleRating: Float!
    address: String!
    priceLevel: Int!
    ratioType: String!
  }

  input ratingInput{
    fun: Float!
    crowd: Float!
    ratioInput: Float!
    difficultyGettingIn: Float!
    difficultyGettingDrink: Float!
  }

  type Vibe{
    crowdedPlace: Boolean!
    ageInterval: String!
    nightLife: Boolean!
    barType: String
    user: User!
  }

  input vibeInputData{
    crowdedPlace: Boolean!
    ageInterval: String!
    nightLife: Boolean!
    barType: String
  }

  input categoryInputData{
    title: String!
    imageUrl: String!
    type: String!
  }

  type updateUserData{
    user : User!
    isPasswordChange: Boolean!
  }

  type RootMutation {
    createUser(userInput: UserInputData) : AuthData!
    updateUser(userInput: UserInputData) :updateUserData!
    createPost(postInput: postInputData) : Post!
    updatePosts(id: ID!, postInput: postInputData!): Post!
    createBusiness(businessInput: businessInputData) : Business!
    updateBusiness(businessInput: businessInputData) : Business!
    setVibe(vibeInput: vibeInputData): Vibe!
    updateVibe(vibeInput: vibeInputData): Vibe!
    updateRadius(radius: Int!): User!
    addRating(rating: ratingInput!, businessId: String!): Rating!
    createCategory(category: categoryInputData, id: String!): Category!
    deleteBusiness(placeId: String!): Boolean!
    deleteCategory(categoryId: String!): Boolean!
  }

  type Category{
    title: String!
    type: String!
    imageUrl: String!
    _id: ID!
  }

  type PostData{
    posts: [Post!]!
    totalPosts: Int!
  }

  type AuthData{
    token: String!
    user: User!
  }

  input filterInputData{
    pageNo: Int,
    filter: String
    added: Boolean
  }

  input searchInputData{
    searchValue: String
    filter: String
    added: Boolean
  }

  type RootQuery{
    login(email: String!, password: String!): AuthData!
    checkUserAvailable(email: String!): Boolean!
    posts: PostData!
    singlePost(id: ID!): Post!
    allBusinesses: [Business!]!
    getAllBusiness(filterInput: filterInputData): [Business]
    getSearchResults( searchInput: searchInputData ) : [Business]
    getCategories: [Category!]!
    getVibe: Vibe
    getUser: User!
    getSingleBusiness(placeId: String!): Business!
    getCategory( id: ID! ): Category!
  }
  schema {
    query: RootQuery 
    mutation: RootMutation
  }
`)