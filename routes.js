
var router = require('express').Router()
const Business = require('./models/business');
const googleBusiness = require('./models/googleBusiness');
const Message = require('./models/locations.js');
const axios = require('axios');
var mongoose = require('mongoose');
var cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'developer-inn', 
  api_key: '141611599995991', 
  api_secret: '-FP9u7Z7cyB3TVM7x5dGpXcfDco' 
});

router.post('/', function(req, res) {
  const url = req.body.url;
  res.send("askdjnaksndkajnskss");
});

router.get('/getBusiness', async (req, res)=>{
  const getBusiness =  await Business.findById(mongoose.Types.ObjectId('5fd83e7674710e0b68528ae4')).populate('googleBusiness')
  console.log("get business", getBusiness)
  res.send(getBusiness);
})

router.get('/uploadPhoto', async(req, res) => {
  // const photoReference = 'ATtYBwK6BOJcWTN_bZVK7xryLg1caQHSb5dkU8059rWW6c4HNBg7Daq-3KizjLJTSloAtjejn3aAXn_eMh_EuUZtzM8ZUtXx0u3i0gqGxgvs8yyuMOzVuAFYgMdb1ZycwZi7kS3mGzMyUdAPaktiyB8GlzoRm-sI3Fog7-KZ8fhtl4g8Xpia'
  const finalString = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=AIzaSyAx3VG1J8LBgf02sGaIQOoEVgf71m4XP2w`;
  console.log(`the final string:: ${finalString}`)
  try{
    const getUrl = await cloudinary.uploader.upload(finalString);
    console.log("the get url::", getUrl);
  }
  catch(err){
    console.log("the err", err)
  }
})

router.get('/getGoogleMapsResults', async function (req, res, next) {
  
  const latitude = req.query.lat;
  const longitude = req.query.lon;
  const radius = req.query.radius;
  const {business_type} = req.query;
  const { search_text } = req.query;
  // console.log(`the latitude ${latitude} the longitude: ${longitude} the radius: ${radius} and businesType: ${business_type} `)  
  
  let detailCall = 1;
  let totalNames = [];
  let totalResults = [];
  let totalCountResults = 0 
  let noOfCalls = 50000;
  let pageToken = true;
  let first = true;
  while(first || (pageToken && noOfCalls !== 0)  ){
    console.log("the page token", pageToken)
    let { data, nextPageToken } = await getAnother(latitude, longitude, radius, business_type, pageToken, first)
    //  let { data, nextPageToken } = await getBySearchText( search_text, pageToken, first, business_type)
    if (first)
      first = false;
    data.map(async(business) => {
      let businessData =  await googleBusiness.findOne({ place_id: business.place_id })
      if(!businessData){
        const businessDetails = await getDetailsOfBusiness(business.place_id);
        totalNames.push(businessDetails.name)
        totalResults.push(businessDetails)
        totalCountResults = totalCountResults + 1;
        const { location } = businessDetails.geometry; 
        let googleData = new googleBusiness(businessDetails)
        const getGoogleData = await googleData.save();

        let uploadPhotoResult = {}; 
        if(getGoogleData.photos && getGoogleData.photos.length > 0 )
          uploadPhotoResult = await uploadPhoto(getGoogleData.photos[0].photo_reference)
        
        let businessLocal = new Business( {
          placeId: getGoogleData.place_id,
          category: [],
          name: googleData.name,
          googleBusiness : mongoose.Types.ObjectId(googleData._id),
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat ]  //[longitude, latitude]
          },
          uploadedPhotos : [uploadPhotoResult]
        });
        await businessLocal.save();
      }
    })
    await delay();
    if(!nextPageToken)
      pageToken = null
    else
      pageToken = nextPageToken;  
    if(noOfCalls === 0)
      pageToken = false;  
    noOfCalls = noOfCalls - 1; 
  }
  res.send({ 
    totalNames,
    totalResults,
    totalCountResults
  });
})

const uploadPhoto = async(photoReference) => {
  
  const finalString = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=AIzaSyAx3VG1J8LBgf02sGaIQOoEVgf71m4XP2w`;
  try{
    const result = await cloudinary.uploader.upload(finalString);
    return result;
  }
  catch(err){
    console.log("the err", err)
  }
}

const uploadAllPhotos = async(photos) => {
  const totalphotosUrl = [];
  let i = 1
  for(let photo of photos){
    const finalString = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=AIzaSyAx3VG1J8LBgf02sGaIQOoEVgf71m4XP2w`;
    try{
      if(i !== 0){
        const { secure_url } = await cloudinary.uploader.upload(finalString);
        totalphotosUrl.push(secure_url)
      }
      i = i-1;
    }
    catch(err){
      console.log("the err", err)
    }
  }
  return totalphotosUrl;
}



const getDetailsOfBusiness = async (placeId)=>{
  const details = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=AIzaSyAx3VG1J8LBgf02sGaIQOoEVgf71m4XP2w`);
  return details.data.result
}

const delay = (args) => new Promise((resolve) => {
  setTimeout(()=>{ resolve('ok') }, 1500);
});

const getAnother = async(latitude, longitude, radius, business_type, pageToken, first) => {
  let getBusiness  = '';
  if(!pageToken || first )
    getBusiness = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude}, ${longitude}&radius=${radius}&type=${business_type}&key=AIzaSyAx3VG1J8LBgf02sGaIQOoEVgf71m4XP2w`);
  else{
    console.log("in comingg")
    getBusiness = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude}, ${longitude}&radius=${radius}&type=${business_type}&key=AIzaSyAx3VG1J8LBgf02sGaIQOoEVgf71m4XP2w&pagetoken=${pageToken}`);
  }
    
  return {  data: getBusiness.data.results,
            nextPageToken: getBusiness.data.next_page_token 
        }
}

const getBySearchText = async(searchText, pageToken, first, type) => {
  console.log(`the type ${type} and search text ${searchText} `)
  let getBusiness  = '';
  if(!pageToken || first )
    getBusiness = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchText}&key=AIzaSyAx3VG1J8LBgf02sGaIQOoEVgf71m4XP2w`);
  else{
    console.log("in comingg")
    getBusiness = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchText}&key=AIzaSyAx3VG1J8LBgf02sGaIQOoEVgf71m4XP2w&pagetoken=${pageToken}`);
  }
  console.log("the page toke token next", getBusiness.data);  
  return {  data: getBusiness.data.results,
            nextPageToken: getBusiness.data.next_page_token 
        }
}

router.get('/getSinglePlaceResult', async function (req, res, next) {
  const { place_id } = req.query
  console.log("the params in backend", req.query.place_id);
  const getData = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${req.query.place_id}&key=AIzaSyAx3VG1J8LBgf02sGaIQOoEVgf71m4XP2w`);
  console.log("the resultss", getData.data.result)
  res.send(getData.data.result);

})

router.post('/createMessage', async function(req, res, next){
  var message = new Message({
    username: "nayyar",
    text: "mcdonalds",
    location: {
     type: "Point",
     coordinates: [-109.110492, 35.021112 ]  //[longitude, latitude]
    },
   });
  message.save((err, message) => {
    if (err) console.log(err);
    console.log(message);
    res.send(message)
   });
})

router.get('/getNearLocations', async function(req, res, next){
  Message.find({
    location: {
     $near: {
      $maxDistance: 200000,
      $geometry: {
       type: "Point",
       coordinates: [-109.110492, 35.021112 ]
      }
     }
    }
   }).find((error, results) => {
    if (error) console.log(error);
    console.log(JSON.stringify(results, 0, 2));
    res.send(results)
   });
})

router.get('/getSearchTextResult', async function (req, res, next) {
  const { search_text } = req.query
  console.log("the params in backend", search_text);
  try{
    const getData = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${search_text}&key=AIzaSyD9CLs9poEBtI_4CHd5Y8cSHklQPoCi6NM`);
    console.log("the resultss", getData)
    res.send(getData.data.results);
  }catch(err){
    console.log("the error", err.response);
  }
})

module.exports = router