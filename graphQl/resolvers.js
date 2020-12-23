const User = require('../models/users');
const Post = require('../models/posts');
const Business = require('../models/business.js');
const Category = require('../models/Category.js');
const Vibe = require('../models/vibe');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const validator = require('validator');
const moment = require('moment');
var jwt = require('jsonwebtoken');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
  hello(){
    return {
      text: "Hello world",
      views: 123
    }
  },
  createUser: async (args, req) => {
    const { userInput } = args;
    const {email,firstName, lastName,dob, password, accountType} = userInput
    console.log("email", email)
    console.log("password", password)

    const errors = [];
    if(!validator.isEmail(email)){
      throw new Error("email is incorrect" )
    }
    if(validator.isEmpty(password) || !validator.isLength(password, {min: 5})){
      throw new Error("Password is incorrect" )
    }
    var years = moment().diff(dob, 'years');
    console.log("the years", years)
    if(years<21)
      throw new Error("Your Age must be 21 or greater.." )
    // if(errors.length){
    //    const error = new Error("Invalid input");
    //    error.code =422;
    //    error.data = errors
    //    throw error;
    // }   

    const existingUser = await User.findOne({ email })
    if(existingUser)
      throw new Error("User already exists" )
    
    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    let user = new User( {
      firstName,
      lastName,
      email,
      dob,
      password: hashedPassword,
      accountType 
    })
    const result = await user.save()
    console.log("the user", user)
    const changedUser = {...result._doc, _id: result._id.toString()}
    const token = jwt.sign(
      { 
        userId: result._id.toString(),
        email: result.email
      },
      'secretWork',
      { 'expiresIn': '1h' }
    );
    return {token, user: changedUser}

  }, 
  updateUser: async (args, req) => {
    const { userInput } = args;
    const {email,firstName, lastName,dob, password, accountType, radius, profilePic} = userInput
    console.log("email", email)
    console.log("password", password)

    const errors = [];
    if(!validator.isEmail(email)){
      errors.push({ message: "email is incorrect" })
    }
    if(validator.isEmpty(password) || !validator.isLength(password, {min: 5})){
      errors.push({ message: 'Password too short' })
    }
    if(errors.length){
       const error = new Error("Invalid input");
       error.code =422;
       error.data = errors
       throw error;
    }   

    const existingUser = await User.findOne({ email })
    if(!existingUser)
      throw new Error("User Not Found" )
    const update = 
      { 
        email,
        firstName,
        lastName,
        dob,
        profilePic
      };
    const isSamePassword = await bcrypt.compare(password, existingUser.password)
    if(!isSamePassword)
      update.password = await bcrypt.hash(password, 12);
   
    const filter = { _id: req.userId };
    console.log("usr id", req.userId)
    let updatedDoc = await User.findOneAndUpdate(filter, update, {
      new: true
    });
    
    console.log("the updated doc", updatedDoc);

    return { ...updatedDoc, 
     user: updatedDoc,
     isPasswordChange: !isSamePassword
    }

  },
  updateRadius: async({radius}, req)=> {

    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }

    let user =  await User.findById(mongoose.Types.ObjectId(req.userId));
    if(!user) 
      throw new Error("Invalid user");
    const filter = { _id: req.userId };
    let updatedDoc = await User.findOneAndUpdate(filter,{ radius }, {
      new: true
    });
    console.log("the user", updatedDoc)

    return {
      ...updatedDoc._doc,
      _id: updatedDoc._id.toString()
    }; 
      
  }
  ,
  login: async({email, password})=>{
    console.log("the email", email)
    console.log("the password", password)
    const user = await User.findOne({ email: email });
    if(!user){
      const error = new Error("Invalid Username or Password");
      error.code = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password)
    if(!isEqual){
      const error = new Error('Invalid Username or Password');
      error.code = 401;
      throw error; 
    }
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email
      },
      'secretWork'
    );
    const changedUser = {...user._doc, _id: user._id.toString()}

    return { token: token, user: changedUser }; 
    
  }, 
  getUser: async({}, req)=>{
    console.log("req auth", req.isAuth)
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    let user =  await User.findById(mongoose.Types.ObjectId(req.userId));
    return {
      ...user._doc,
      _id: user._id.toString()
    }
  } ,
  createCategory: async ({category, id}, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    const { title, imageUrl, type  } = category;
    console.log("the iput", category)
    console.log("the id", id)
    let alreadyCategory = null;
    if(id !== "null" )
      alreadyCategory =  await Category.findById(mongoose.Types.ObjectId(id));    
    if(alreadyCategory){
      const categoryDataToChange = {
        imageUrl,
        title
      }  
      const filter = { _id: id };
      let updatedCategory = await Category.findOneAndUpdate(filter,categoryDataToChange, {
        new: true
      });
      console.log("the user", updatedCategory)
  
      return {
        ...updatedCategory._doc,
        _id: updatedCategory._id.toString()
      }; 
    }
    const categoryData = {
      imageUrl,
      type, 
      title
    }  
    const newCategory = new Category(categoryData);
    const getCategory = await newCategory.save();
    return {
      ...getCategory._doc,
      _id: getCategory._id.toString()
    }

  },
  getCategory: async({id}) =>{
    let category =  await Category.findById(mongoose.Types.ObjectId(id));
    return {
      ...category._doc,
      _id: category._id.toString()
    }
  },
  checkUserAvailable: async({email}) => {
    const existingUser = await User.findOne({ email: email });

    if(existingUser)
      return true
    return false;  
  },
  allBusinesses: async(args, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    const allBusiness = await Business.find({}).populate('category')
    // const business =  allBusiness.map(async(business) => {
    // let category =  await Category.findById(mongoose.Types.ObjectId(business.category));
    
    //   return {
    //     ...business._doc,
    //     _id: business._id.toString(),
    //     category
    //   }
    // })
    // console.log("allBusiness", allBusiness)
    return allBusiness
  },
  getAllBusiness: async({filterInput}, req)=>{
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    let { pageNo, filter, added } = filterInput;
    console.log(`the pageNo ${pageNo} and filter: ${filter} and added ${added} `)
    pageNo = pageNo -1;
    const resultesPerPages = 50 * pageNo;
    console.log("the total result to skip", resultesPerPages)
    let allBusinesses = [];
    if(filter === 'not' && !added){
      console.log("in if", resultesPerPages);
      allBusinesses = await Business.find({addedByAdmin: false}).populate('googleBusiness').skip(resultesPerPages).limit(50);
      // console.log("the allBusiness", allBusinesses)
    }
    else if(filter !== 'not' && added){
      console.log("the filter", filter)
      try{
      allBusinesses = await Business.find({addedByAdmin: true, category: mongoose.Types.ObjectId(filter)}).populate('category googleBusiness').skip(resultesPerPages).limit(50)
      }catch(err){
        console.log("the error", err)
      }
      console.log("thee busines", allBusinesses)
    }
    else if(filter === 'not' && added ){
      console.log("in the third", resultesPerPages)
      allBusinesses = await Business.find({addedByAdmin: true, category: []}).populate('category googleBusiness').skip(resultesPerPages).limit(50)
      console.log("the allBusinesses", allBusinesses)
    }

    return allBusinesses;

  }, 
  getSearchResults: async({ searchInput }, req) => {

    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    const { searchValue, filter, added } = searchInput;
    console.log(`the searchValue ${searchValue} and filter: ${filter} and added ${added} `)
    let allBusinesses = [];
    if(filter === 'not' && !added){
      allBusinesses = await Business.find({addedByAdmin: false, name: { $regex: searchValue, $options: "i" }}).populate('googleBusiness category')
    }
    else if(filter !== 'not' && added){
      try{
      allBusinesses = await Business.find({addedByAdmin: true, name: { $regex: searchValue, $options: "i" } }).populate('category googleBusiness')
      }catch(err){
        console.log("the error", err)
      }
    }
    else if(filter === 'not' && added ){
      allBusinesses = await Business.find({addedByAdmin: true,name: { $regex: searchValue, $options: "i" } ,category: []}).populate('category googleBusiness')
    }
    return allBusinesses;
  
  },
  deleteBusiness: async({ id }, req)=>{
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    const filter = { _id: mongoose.Types.ObjectId(id) };
    const update = {
      category: [], 
      addedByAdmin: false,
      customData: {
        address: null,
        phoneNo: null,
        rating: null,
        latitude: null,
        longitude: null
      },
      ratioType: 'boy',
      accumulatedRating: {
        fun: 0,
        crowd: 0,
        girlToGuyRatio: 0,
        difficultyGettingIn: 0,
        difficultyGettingDrink: 0
      },
      rating: {
        fun: 2,
        crowd: 2,
        ratioInput: 2,
        difficultyGettingIn: 2,
        difficultyGettingDrink: 2
      }

    }

    let updatedDoc = await Business.findOneAndUpdate(filter, update, {
      new: true
    });
    console.log("the updated doc", updatedDoc);
    if(updatedDoc)
      return true
    return false  
  }, 
  deleteCategory: async({ categoryId }, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    const getCategory = await Category.deleteOne({_id: mongoose.Types.ObjectId(categoryId) })
    console.log("getCategory", getCategory)
    if(getCategory.deletedCount>0){
      const getBusiness =  await Business.remove({ category: mongoose.Types.ObjectId(categoryId) })
      console.log("getCategory", getBusiness)
    }
    else{
      return false
    }
    if(getCategory.deletedCount > 0)
      return true
    return false
  },
  getCategories: async(args, req)=>{
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    
    const allCategory = await Category.find({})
    const categories =  allCategory.map((category) => {
      return {
        ...category._doc,
        _id: category._id.toString()
      }
    })
    return categories
  },
  createBusiness: async({ businessInput }, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    let user =  await User.findById(mongoose.Types.ObjectId(req.userId));
    if(!user) 
      throw new Error("Invalid user");
    
    const { category, name, rating, ageInterval, ratioType, customData, customBusiness, photos } = businessInput;
    console.log("the business input ", businessInput)

    let businessSelectedCategories = [];
    let allCategories = category.split(',');
    allCategories.map((id)=>{
      businessSelectedCategories.push(mongoose.Types.ObjectId(id));
    })
    let records = await Category.find().where('_id').in(businessSelectedCategories).exec();
    
    console.log("the all photoss", photos.split(',') )
    
    const totalPhotos = photos.split(',').map((url)=>{
      return {
        secure_url: url
      }
    }) 
    console.log("the total photos", totalPhotos)
    const { latitude, longitude , address, phoneNo} = customData;
    const business = new Business({
      category: businessSelectedCategories, 
      name,
      rating,
      ageInterval,
      ratioType,
      addedByAdmin: true,
      customBusiness: true,
      uploadedPhotos: totalPhotos,
      location: {
        type: "Point",
        coordinates: [longitude, latitude ]
      },
      customData: {
        address,
        phoneNo,
        rating: customData.rating,
        latitude,
        longitude
      }
    })
    try{
    let updatedDoc = await business.save();
    console.log("the updated doc", updatedDoc)
    return{
      ...updatedDoc._doc,
      _id: updatedDoc._id.toString(),
      category: records
    }
    }catch(err){
      console.log("the error", err)
    }
  }, 
  updateBusiness: async( { businessInput }, req ) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    let user =  await User.findById(mongoose.Types.ObjectId(req.userId));
    if(!user) 
      throw new Error("Invalid user");
    
    const { id, category, name, rating, ageInterval, ratioType, photos, customData } = businessInput;
    let businessSelectedCategories = [];
    let allCategories = category.split(',');
    console.log("all catgories", allCategories)
    allCategories.map((id)=>{
      businessSelectedCategories.push(mongoose.Types.ObjectId(id));
    })
    let records = await Category.find().where('_id').in(businessSelectedCategories).exec();
    const totalPhotos = photos.split(',').map((url)=>{
      return {
        secure_url: url
      }
    }) 
    
    const filter = { _id: mongoose.Types.ObjectId(id) };
    const { latitude, longitude , address, phoneNo} = customData;
    const update = {
      category: businessSelectedCategories, 
      name,
      rating,
      ageInterval,
      ratioType,
      addedByAdmin: true,
      uploadedPhotos: totalPhotos,
      customData: {
        address,
        phoneNo,
        rating: customData.rating,
        latitude,
        longitude
      }
    }

    

    let updatedDoc = await Business.findOneAndUpdate(filter, update, {
      new: true
    });
    console.log("the updated doc", updatedDoc);
    
    return{
      ...updatedDoc._doc,
      _id: updatedDoc._id.toString(),
      category: records
    }
  }, 
  getDashboardData: async({}, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    let allRequests = [];
    allRequests.push(Business.find({}).count())
    allRequests.push(User.find({}).count())
    allRequests.push(Category.find({}).count())
   
    const [totalBusiness, totalUsers, totalCategories ] = await Promise.all(allRequests)
    
    return {
      totalBusiness,
      totalUsers,
      totalCategories
    }

  }
  ,
  addNotCategorizeBusiness: async({ placeId }) =>{
    const filter = { placeId };
    const update = {
      addedByAdmin: true
    }
    let updatedDoc = await Business.findOneAndUpdate(filter, update, {
      new: true
    });
    if(updatedDoc)
      return true
    return false;  
  }
  ,
  addRating: async({ rating , businessId}, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    let user =  await User.findById(mongoose.Types.ObjectId(req.userId));
    if(!user) 
      throw new Error("Invalid user");
    
    let business =  await Business.findOne({ placeId: businessId });;
    const { fun, crowd, girlToGuyRatio, difficultyGettingIn, difficultyGettingDrink } = rating;
    if(fun > 10 || crowd> 10 || girlToGuyRatio > 10 || difficultyGettingDrink> 10 || difficultyGettingIn > 10)
      throw new Error("Invalid number maximum rating");
    
    console.log("the business", business)  
    let { accumulatedRating, totalUserCountRating } = business;
    totalUserCountRating = totalUserCountRating + 1;
    accumulatedRating.fun =  (accumulatedRating.fun + fun)
    accumulatedRating.crowd = (accumulatedRating.crowd + crowd)
    accumulatedRating.girlToGuyRatio = (accumulatedRating.girlToGuyRatio + girlToGuyRatio)
    accumulatedRating.difficultyGettingIn = (accumulatedRating.difficultyGettingIn + difficultyGettingIn)
    accumulatedRating.difficultyGettingDrink = (accumulatedRating.difficultyGettingDrink + difficultyGettingDrink)

    const filter = { placeId: businessId };
    let updatedDoc = await Business.findOneAndUpdate(filter,{
      rating:{
      fun: (accumulatedRating.fun)/totalUserCountRating,
      crowd: (accumulatedRating.crowd)/totalUserCountRating,
      girlToGuyRatio: (accumulatedRating.girlToGuyRatio)/totalUserCountRating,
      difficultyGettingIn: (accumulatedRating.difficultyGettingIn)/totalUserCountRating,
      difficultyGettingDrink: (accumulatedRating.difficultyGettingDrink)/totalUserCountRating,
      },
      totalUserCountRating,
      accumulatedRating
     }, {
      new: true
    });
    console.log("the business Rating Updated", updatedDoc)

    console.log("the business", accumulatedRating)  
    return updatedDoc.rating;  
  },
  getSingleBusiness: async ({ id }) => {
    console.log("id business is", id)
    let businessData =  await Business.findById(mongoose.Types.ObjectId(id)).populate('category googleBusiness')
    console.log("business data", businessData)
    return {
      ...businessData._doc,
      _id: businessData._id.toString()
    }
  }
  ,
  setVibe: async({ vibeInput }, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    let user =  await User.findById(mongoose.Types.ObjectId(req.userId));
    if(!user) 
      throw new Error("Invalid user");
    const { crowdedPlace, ageInterval, nightLife, barType } = vibeInput;
    const vibe = {
      crowdedPlace,
      ageInterval,
      nightLife,
      barType,
      user
    }
    
    const myVibe = new Vibe(vibe);
    const getMyVibe = await myVibe.save();
    return{
      ...getMyVibe._doc,
      _id: getMyVibe._id.toString()
    }

  }, 
  updateVibe: async({ vibeInput }, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    let user =  await User.findById(mongoose.Types.ObjectId(req.userId));
    if(!user) 
      throw new Error("Invalid user");
      const { crowdedPlace, ageInterval, nightLife, barType } = vibeInput;
      const vibe = {
        crowdedPlace,
        ageInterval,
        nightLife,
        barType,
        user
      }  

    const filter = { user: req.userId };
    const update = 
      { 
        crowdedPlace,
        ageInterval,
        nightLife,
        barType
      };

    let updatedDoc = await Vibe.findOneAndUpdate(filter, update, {
      new: true
    });
    console.log("the updated doc", updatedDoc);
    
    return{
      ...updatedDoc._doc,
      _id: updatedDoc._id.toString()
    }
  },
  getVibe: async({}, req) =>{
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }

    let vibe =  await Vibe.findOne({ user: req.userId })
    if(vibe)
      return vibe
    return null;
  },
  createPost: async({postInput}, req) => {
    // console.log("req.Auth", req.isAuth);
     console.log("the user", req.userId);
    const errors = [];
    if(validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 }) ){
      errors.push({ message: "title is incorrect" })
    }
    if(validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 }) ){
      errors.push({ message: "content is incorrect" })
    }

    if(errors.length){
      const error = new Error("Invalid input");
      error.code =422;
      error.data = errors
      throw error;
    }   
    
    const user =  await User.findById(mongoose.Types.ObjectId(req.userId));
    console.log("the user", user)

    const post = {
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user
    }
   
    const newPost = new Post(post)
    const createdPost = await newPost.save();
    user.posts.push(createdPost)
    await user.save();

    return {
      ...createdPost._doc, _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
      creator: user
    }
    
  }
}