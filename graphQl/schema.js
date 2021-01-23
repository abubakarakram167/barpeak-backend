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
    radius: Int! 
    profilePic: String
    gender: String
    accountType: String
    phoneNumber: String
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

  type customBusiness{
    address: String
    phoneNo: String
    rating: Float
    latitude: Float
    longitude: Float
  }

  type location{
    type: String
    coordinates:[Float]
  }
  

  type Business{
    _id: ID!
    placeId: String
    category: [Category]
    name: String!
    createdBy: User!
    rating: Rating! 
    totalUserCountRating: Int!
    ageInterval: String!,
    customData: customBusiness
    uploadedPhotos: [photoData]
    customBusiness: Boolean
    googleBusiness: googleBusinessData
    addedByAdmin: Boolean
    location: location  
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
  
  input UserInputData {
    email: String!
    firstName: String!
    lastName: String!
    dob: String 
    accountType: String
    profilePic: String
    gender: String,
    phoneNumber: String!
    password: String
  }

  input UpdateUserInputData {
    existingEmail: String!
    newEmail: String!
    firstName: String!
    lastName: String!
    dob: String 
    profilePic: String
    gender: String
  }

  input businessInputData{
    id: String
    category: String
    name: String!
    rating: ratingInput!
    ageInterval: String!
    customBusiness: Boolean
    customData: customBusinessInput
    photos: String
  }
  
  input customBusinessInput{
    address: String
    phoneNo: String
    rating: Float
    latitude: Float
    longitude: Float
  }

  input ratingInput{
    fun: Float!
    crowd: Float!
    ratioInput: Float!
    difficultyGettingIn: Float!
    difficultyGettingDrink: Float!
  }

  type Vibe{
    fun: String!
    party: String!
    barOrNightClub: String!
    crowdLevel: String!
    ageDemographic: String!
    vibeCategory: String!
    selectedCategories: String   
  }

  input vibeInputData{
    fun: String!
    party: String!
    barOrNightClub: String!
    crowdLevel: String!
    ageDemographic: String!
    vibeCategory: String!
    selectedCategories: String!   
  }

  input categoryInputData{
    title: String!
    imageUrl: String!
    type: String!
  }

  type updateUserData{
    user : User!
    isSameEmail: Boolean!
  }

  type RootMutation {
    createUser(userInput: UserInputData) : AuthData!
    updateUser(userInput: UpdateUserInputData ) :updateUserData!
    createBusiness(businessInput: businessInputData) : Business!
    updateBusiness(businessInput: businessInputData) : Business!
    setVibe(vibeInput: vibeInputData): Vibe!
    updateVibe(vibeInput: vibeInputData): Vibe!
    updateRadius(radius: Int!): User!
    addRating(rating: ratingInput!, businessId: String!): Rating!
    createCategory(category: categoryInputData, id: String!): Category!
    deleteBusiness(id: String!): Boolean!
    deleteCategory(categoryId: String!): Boolean!
    addNotCategorizeBusiness( placeId: String! ): Boolean!
    addToFavourites(id: String, addOrRemove: String): [Business]
    getUserByAppleIdAndUpdateEmail(email: String, appleId: String): User
  }

  type Category{
    title: String!
    type: String!
    imageUrl: String!
    _id: ID!
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

  type dashboardData{
    totalBusiness: Int
    totalUsers: Int
    totalCategories: Int
  }

  input locationInputData{
    latitude: Float
    longitude: Float
    radius: Int
  }
  type exactTimeRating{
    rating: Rating,
    getExactTime: String
  }

  type RootQuery{
    login(email: String!): AuthData!
    adminLogin(email: String!, password: String!): AuthData!
    checkUserAvailable(email: String!): Boolean!
    allBusinesses: [Business!]!
    getNearByLocationBusiness(locationInput: locationInputData): [ Business]
    getAllBusiness(filterInput: filterInputData): [Business]
    getSearchResults( searchInput: searchInputData ) : [Business]
    getCategories: [Category!]!
    getVibe: Vibe
    getUser: User!
    getSingleBusiness(id: String!): Business!
    getCategory( id: ID! ): Category!
    getDashboardData: dashboardData!
    searchByUser(searchValue: String): [Business]
    getFavouriteEstablishments: [Business]
    getUserByPhoneNumber(phoneNumber: String!): User
    getCurrentDayExactTimeRating(businessId: String!): exactTimeRating
  }
  schema {
    query: RootQuery 
    mutation: RootMutation
  }
`)