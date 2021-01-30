const User = require('../models/users');
const Post = require('../models/posts');
const Business = require('../models/business.js');
const Category = require('../models/Category.js');
const Vibe = require('../models/vibe');
const userEstablishmentRating = require('../models/userEstablishmentRating');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const validator = require('validator');
const moment = require('moment');
var jwt = require('jsonwebtoken');
var ObjectId = require('mongodb').ObjectID;
var schedule = require('node-schedule');


module.exports = {
  hello(){
    return {
      text: "Hello world",
      views: 123
    }
  },
  createUser: async (args, req) => {
    const { userInput } = args;
    const {email, firstName, lastName, dob, accountType, phoneNumber, password, gender} = userInput
  
    const errors = [];
    if(!validator.isEmail(email)){
      throw new Error("email is incorrect" )
    }
    let hashedPassword = null;
    if (password)
      hashedPassword = await bcrypt.hash(userInput.password, 12);
    var years = moment().diff(dob, 'years');

    if(years<21)
      throw new Error("Your Age must be 21 or greater.." )
    
    const existingUser = await User.findOne({ email })
    if(existingUser)
      throw new Error("User already exists" )
    
    let user = new User( {
      firstName,
      lastName,
      email,
      dob,
      accountType,
      phoneNumber,
      password : hashedPassword,
      gender
    })
    const result = await user.save()
  
    const changedUser = {...result._doc, _id: result._id.toString()}
    const token = jwt.sign(
      { 
        userId: result._id.toString(),
        email: result.email
      },
      'secretWork'
    );
    return {token, user: changedUser}

  }, 
  updateUser: async (args, req) => {
    const { userInput } = args;
    const {existingEmail,newEmail,firstName, lastName,dob, profilePic } = userInput
    console.log("new email", newEmail)
    console.log("the existing email", existingEmail);
    let newEmailFieldinsert = newEmail === "notApply" ? "notApply" : newEmail ;
   

    if(!validator.isEmail(existingEmail)){
      throw new Error( "Existing email is incorrect")
    }
    console.log("new", newEmailFieldinsert)
    if(newEmailFieldinsert!== "notApply") {
      if (!validator.isEmail(newEmail))
         throw new Error( "new email is incorrect")
    }

    
    let updatedEmail = existingEmail;
    const existingUser = await User.findOne({ email: existingEmail })
    if(!existingUser)
      throw new Error("User Not Found" )
    if(newEmail !== "notApply")
      updatedEmail = newEmail;

    const update = 
      { 
        email: updatedEmail,
        firstName,
        lastName,
        dob,
        profilePic
      };
      
    let isSameEmail = true;
    if(newEmail !== "notApply")
      isSameEmail =  existingUser.email === newEmail ? true : false

    const filter = { _id: req.userId };
    let updatedDoc = await User.findOneAndUpdate(filter, update, {
      new: true
    });
    
    console.log("the updated doc", updatedDoc);

    return { ...updatedDoc, 
     user: updatedDoc,
     isSameEmail: isSameEmail
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
      
  },
  adminLogin: async({email, password})=>{    
    const user = await User.findOne({ email: email });
    if(!user){
      const error = new Error("Invalid Username or Password");
      error.code = 401;
      throw error;
    }
    console.log("the user passwrod", password)
    const isEqual = await bcrypt.compare(password, user.password)
    if(!isEqual){
      const error = new Error('Invalid Username or Passwordss');
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
    return {
      token: token,
      user
    }
  },
  login: async({email})=>{
    const user = await User.findOne({ email: email });
    if(!user){
      const error = new Error("Invalid Username or Password");
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
  }, 
  getUserByAppleIdAndUpdateEmail: async({email, appleId})=> {
    let user = await User.findOne({ appleId });
    if(! user)
      return null

    let updatedUser ;  
    if(user.email !== email){
      updatedUser = await User.findOneAndUpdate({ appleId }, {email}, {
        new: true
      });
      console.log("the updated doc", updatedUser);
    }
    else
      updatedUser = user;
    
     return updatedUser; 
  },
  createCategory: async ({category, id}, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    const { title, imageUrl, type  } = category;
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
  addToFavourites: async({id, addOrRemove}, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    let user =  await User.findById(mongoose.Types.ObjectId(req.userId));  
    let UserFavouritesEstablishments  =  await user.favoritesEstablishments;
    if(addOrRemove === "add"){
      UserFavouritesEstablishments.push(mongoose.Types.ObjectId(id))
    }
    else if(addOrRemove === "remove"){
      UserFavouritesEstablishments = UserFavouritesEstablishments.filter(business=> {
        return mongoose.Types.ObjectId(business).toString() !== mongoose.Types.ObjectId(id).toString()
      })
    }
   

    let updatedDoc = await User.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.userId) }, 
    {
      favoritesEstablishments: UserFavouritesEstablishments
    }, 
    {
      new: true
    }).populate('favoritesEstablishments');
    const allFavourite = updatedDoc.favoritesEstablishments.map(business => business._id)
    console.log("thedocuments idss", allFavourite)
    let updatedFavourites = await Business.find({_id: allFavourite}).populate('category googleBusiness');

    return updatedFavourites
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
  getNearByLocationBusiness: async ({locationInput}, req) => {
    const { latitude, longitude, radius } = locationInput;
    console.log("the nearby input", locationInput)

    const getData = await Business.find({
      location: {
       $near: {
        $maxDistance: radius,
        $geometry: {
         type: "Point",
         coordinates: [longitude, latitude ]
        }
       }
      },
      addedByAdmin: true
     })
    .populate('googleBusiness category');
    // console.log("the getdata", getData);
     
    return getData;   
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
  searchByUser: async ({ searchValue }, req) => {
    const searchBusinesses = Business.find({addedByAdmin: true, name: { $regex: searchValue, $options: "i" }}).populate('googleBusiness category')
    return searchBusinesses;
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
  },
  showRateItButtonUntilNextHours: async({ businessId }, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    let user =  await User.findById(mongoose.Types.ObjectId(req.userId));
    if(!user) 
      throw new Error("Invalid user");
    
    let establishmentSpecificRating = await userEstablishmentRating.findOne({ userId: req.userId, establishmentId: businessId });

    let showRateItButton ;
    if(establishmentSpecificRating)
      showRateItButton = false
    else  
      showRateItButton = true;
    
    
    return {
      showRateItButton,
      ratingSaveTime: establishmentSpecificRating ? establishmentSpecificRating.ratingSaveTime : null
    }
  },
  addRating: async({ rating , businessId, ratingSaveTime, performTime}, req) => {
    try{
      if(!req.isAuth){
        const error = new Error("Unauthorized User");
        error.code =401;
        throw error;
      }
      let user =  await User.findById(mongoose.Types.ObjectId(req.userId));
      if(!user) 
        throw new Error("Invalid user");
      
      let business =  await Business.findById(businessId);;
      const { fun, crowd, ratioInput, difficultyGettingIn, difficultyGettingDrink } = rating;
      console.log("in the backend the value comes", rating)
      if(fun > 5.1 || crowd> 5.1 || ratioInput > 3.1 || difficultyGettingDrink> 4.1 || difficultyGettingIn > 5.1)
        throw new Error("Invalid number maximum rating");
      
      let { accumulatedRating, totalUserCountRating } = business;
      let businessRating = business.rating;
      totalUserCountRating = totalUserCountRating + 1;
      accumulatedRating.fun =  (accumulatedRating.fun + fun)
      accumulatedRating.crowd = (accumulatedRating.crowd + crowd)
      accumulatedRating.ratioInput = (accumulatedRating.ratioInput + ratioInput)
      accumulatedRating.difficultyGettingIn = (accumulatedRating.difficultyGettingIn + difficultyGettingIn)
      accumulatedRating.difficultyGettingDrink = (accumulatedRating.difficultyGettingDrink + difficultyGettingDrink)

      const filter = { _id: mongoose.Types.ObjectId(businessId) };
      let updatedDoc = await Business.findOneAndUpdate(filter,{
        rating:{
        fun: ((accumulatedRating.fun)/totalUserCountRating).toFixed(2),
        crowd: ((accumulatedRating.crowd)/totalUserCountRating).toFixed(2),
        ratioInput: ((accumulatedRating.ratioInput )/totalUserCountRating).toFixed(2),
        difficultyGettingIn: (( accumulatedRating.difficultyGettingIn)/totalUserCountRating).toFixed(2),
        difficultyGettingDrink: ((accumulatedRating.difficultyGettingDrink )/totalUserCountRating).toFixed(2),
        },
        totalUserCountRating,
        accumulatedRating
      }, {
        new: true
      });

      let allBusinessRatings = updatedDoc.allRating;
      let existingRating = updatedDoc.rating;
      let newRating = {
        fun: existingRating.fun,
        crowd: existingRating.crowd,
        ratioInput: existingRating.ratioInput,
        difficultyGettingIn: existingRating.difficultyGettingIn,
        difficultyGettingDrink:existingRating.difficultyGettingDrink,
        creationAt: moment().format("YYYY-MM-DD HH:mm:ss")
      }
      allBusinessRatings.push(newRating)
      let newEstablishmentRating = new userEstablishmentRating ({
        userId: req.userId.toString(),
        establishmentId: businessId.toString(),
        ratingSaveTime
      })
      let establishmentRatingDoc = await newEstablishmentRating.save()  
      
      console.log("the perform", performTime)
      let local = moment(performTime).add(59, 'minutes')
      console.log("the today",  local.format())
      console.log("establishmentRatingDoc", establishmentRatingDoc)
      schedule.scheduleJob(local.format(), async function () {
        console.log("in executinggg")
        await  userEstablishmentRating.deleteOne({_id: mongoose.Types.ObjectId(establishmentRatingDoc._id) })
      })


      updatedDoc = await Business.findOneAndUpdate(filter,{
        allRating: allBusinessRatings
      }, {
        new: true
      });

      return updatedDoc.rating;  
    }catch(err){
      console.log("the err", err)
    }
  },
  getCurrentDayExactTimeRating: async({ businessId }) => {
    let businessData =  await Business.findById(mongoose.Types.ObjectId(businessId)).populate('category googleBusiness')
    let allRatings = businessData.allRating;
    let todayDate = moment().format('YYYY-MM-DD HH:mm:ss')
    
    var target = moment(todayDate).day();
    date = new Date,
    days = ( 7 - ( target - date.getDay() ) % 7 ),
    time = date.getTime() - ( days * 86400000 );
    date.setTime(time);
  
    date.setHours(moment(todayDate).hours());
    date.setMinutes(0);
    date.setSeconds(0);
    
    let userVisitDateTime = moment(date).format('YYYY-MM-DD HH:mm:ss');
    let splittedTime = userVisitDateTime.split(' ')[0].toString();

    let currentDayRatingAfterUserVisit = allRatings.filter(rating => moment(rating.creationAt).format('YYYY-MM-DD HH:mm:ss') >  userVisitDateTime && moment(rating.creationAt).format('YYYY-MM-DD HH:mm:ss').split(' ')[0].toString() === splittedTime )
    const newarr = currentDayRatingAfterUserVisit.sort((a, b) => {
      return moment(a.creationAt).diff(b.creationAt);
    });
    let ExactTime;
    let ratingAccordingToTime = {};
    if(newarr.length>0){
      ExactTime =  moment().format('hh:mm A') + " " + moment(newarr[0].creationAt).format('dddd').toString()
      ratingAccordingToTime = {
        fun: newarr[0].fun,
        crowd: newarr[0].crowd,
        ratioInput: newarr[0].ratioInput,
        difficultyGettingIn: newarr[0].difficultyGettingIn,
        difficultyGettingDrink: newarr[0].difficultyGettingDrink 
      } ;
    }
    else{
      ratingAccordingToTime = null
      ExactTime = null
    }
   
    return {
      rating: ratingAccordingToTime,
      getExactTime: ExactTime
    }

  }, 
  getUserByPhoneNumber: async({ phoneNumber }) => {
    let user = await User.findOne({ phoneNumber });
    return user;
  },
  getSingleBusiness: async ({ id }) => {
    console.log("id business is", id)
    let businessData =  await Business.findById(mongoose.Types.ObjectId(id)).populate('category googleBusiness')
    console.log("business data", businessData)
    return {
      ...businessData._doc,
      _id: businessData._id.toString()
    }
  },
  getFavouriteEstablishments: async ({}, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }
    let user =  await User.findById(mongoose.Types.ObjectId(req.userId)).populate('favoritesEstablishments');
    if(!user) 
      throw new Error("Invalid user");
      let userTotalEstablishments = [];
    user.favoritesEstablishments.map((business) => {
      userTotalEstablishments.push(Business.findById(mongoose.Types.ObjectId(business._id)).populate('category googleBusiness'))
    })
    
    return await Promise.all(userTotalEstablishments);
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
    
    vibeInput.user = user;
    vibeInput.selectedCategories = vibeInput.selectedCategories.split(',');
    const myVibe = new Vibe(vibeInput);
    const getMyVibe = await myVibe.save();
    return{
      ...getMyVibe._doc,
      _id: getMyVibe._id.toString(),
      selectedCategories: getMyVibe.selectedCategories.toString()
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
    console.log("the vibe input", vibeInput)  
    vibeInput.user = user;
    vibeInput.selectedCategories = vibeInput.selectedCategories.split(',');
    const filter = { user: req.userId };
    let updatedDoc = await Vibe.findOneAndUpdate(filter, vibeInput, {
      new: true
    });

    return{
      ...updatedDoc._doc,
      _id: updatedDoc._id.toString(),
      selectedCategories: updatedDoc.selectedCategories.toString()
    }
  },
  getVibe: async({}, req) => {
    if(!req.isAuth){
      const error = new Error("Unauthorized User");
      error.code =401;
      throw error;
    }

    let vibe =  await Vibe.findOne({ user: req.userId })
    if(vibe)
    return{
      ...vibe._doc,
      _id: vibe._id.toString(),
      selectedCategories: vibe.selectedCategories.toString()
    }
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