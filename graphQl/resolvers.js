const User = require('../models/users');
const Post = require('../models/posts');
const Business = require('../models/business.js');
const Category = require('../models/Category.js');
const Vibe = require('../models/vibe');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const validator = require('validator');
var jwt = require('jsonwebtoken');

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
    const {email,firstName, lastName,dob, password, accountType, radius} = userInput
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
    
    const isSamePassword = await bcrypt.compare(password, existingUser.password)
    if(!isSamePassword){
      password = await bcrypt.hash(password, 12);
    }
    else{
      password = existingUser.password;
    }   
    const filter = { user: req.userId };
    const update = 
      { 
        email,
        firstName,
        lastName,
        dob,
        user,
        password,
        accountType,
        radius
      };

    let updatedDoc = await Vibe.findOneAndUpdate(filter, update, {
      new: true
    });
    
    // const token = jwt.sign(
    //   { 
    //     userId: result._id.toString(),
    //     email: result.email
    //   },
    //   'secretWork',
    //   { 'expiresIn': '1h' }
    // );
    return { ...updatedDoc, 
     _id: updatedDoc._id.toString()
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
  }
  ,
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
    const allBusiness = await Business.find({})
    const business =  allBusiness.map(async(business) => {
    let category =  await Category.findById(mongoose.Types.ObjectId(business.category));
      return {
        ...business._doc,
        _id: business._id.toString(),
        category
      }
    })
    return business
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
    const { placeId, category, title, rating, shortDescription, longDescription, ageInterval } = businessInput;
    let businessData =  await Business.findOne({ placeId });
    
    if(businessData)
      throw new Error("Business already added");
      
    let specificCategory =  await Category.findById(mongoose.Types.ObjectId(category));
    console.log("the category", category)
    const business = {
      placeId,
      category: specificCategory, 
      title,
      rating,
      shortDescription,
      longDescription,
      createdBy: user,
      totalUserCountRating: 0,
      ageInterval
    }  
    
    const newBusiness = new Business(business);
    const getBusiness = await newBusiness.save();
    return {
      ...getBusiness._doc,
      _id: getBusiness._id.toString()
    }
  },
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
  }
  ,
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
    
  },
  posts: async(posts,req)=>{
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    else{
      console.log("inn")
      const user =  await User.findById(mongoose.Types.ObjectId(req.userId));
      const totalPosts =  await Post.find().countDocuments();
      const posts = await Post.find().where('creator').in([user._id])
        .sort({ createdAt: -1 })
        .populate('creator')
      return {
        posts: posts.map((p)=>{
          return{
            ...p._doc,
            _id: p._id.toString(),
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString() 
          }
        }),
        totalPosts: posts.length
      }
    }
  },
  singlePost: async ({ id }, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    const singlePost = await Post.findById(id);
    console.log("the single post", singlePost)
    return{ ...singlePost._doc,
      _id: singlePost._id.toString(),
      createdAt: singlePost.createdAt.toString(),
      updatedAt: singlePost.updatedAt.toString() 
    }
  },
  updatePosts: async({id, postInput}, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    console.log("postinput", postInput)
    const updatedPost = await Post.findByIdAndUpdate(id, {  title: postInput.title, content: postInput.content, imageUrl: postInput.imageUrl })
    console.log("the updatedPost", updatedPost);
    return{
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toString(),
      updatedAt: updatedPost.updatedAt.toString()
    }
  }
}