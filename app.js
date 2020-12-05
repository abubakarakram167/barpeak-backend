const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema }  = require('graphql');
var mongoose = require('mongoose');
const Event = require('./models/event');
const User = require('./models/users');
const axios = require('axios');
const app = express();
const bcrypt = require('bcryptjs');
const graphqlSchema = require('./graphQl/schema');
const graphqlResolver = require('./graphQl/resolvers');
var cors = require('cors');
var auth = require('./middleware/auth');
const business = require('./models/business');
var events = [];

app.use(cors());
app.use(bodyParser.json());
app.use(auth);

app.post('/', function(req, res) {
  const url = req.body.url;
  res.send("askdjnaksndkajnskss");
});

app.get('/getGoogleMapsResults', async function (req, res, next) {
   const latitude = req.query.lat;
   const longitude = req.query.lon;
   const radius = req.query.radius;
   const {business_type} = req.query;
  //  const latitude = 32.7970465;
  //  const longitude = -117.2545220; 
    console.log("im in backend", radius);
    console.log(`the latitude ${latitude} the longitude: ${longitude} the radius: ${radius} and businesType: ${business_type} `)
// console.log(`the latitude ${latitude} and longitude is ${longitude}`);
  
  
  let totalResults = [];
  let totalNames = [];
  let noOfCalls = 3;
  let pageToken = true;
  let first = true;
  while(first || (pageToken && noOfCalls !== 0)  ){
    
    let { data, nextPageToken } = await getAnother(latitude, longitude, radius, business_type, pageToken, first)
    if (first)
      first = false;
    data.map((business) => {
      totalResults.push(business)
      totalNames.push(business.name)
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
  console.log("the total Names", totalNames); 

  res.send(totalResults);

})

const delay = (args) => new Promise((resolve) => {
  setTimeout(()=>{ resolve('ok') }, 1500);
});

const getAnother = async(latitude, longitude, radius, business_type, pageToken, first) => {
  let getBusiness  = '';
  if(!pageToken || first )
    getBusiness = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude}, ${longitude}&radius=${radius}&type=${business_type}&key=AIzaSyD9CLs9poEBtI_4CHd5Y8cSHklQPoCi6NM`);
  else{
    console.log("in comingg")
    getBusiness = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude}, ${longitude}&radius=${radius}&type=${business_type}&key=AIzaSyD9CLs9poEBtI_4CHd5Y8cSHklQPoCi6NM&pagetoken=${pageToken}`);
  }
    
  return {  data: getBusiness.data.results,
            nextPageToken: getBusiness.data.next_page_token 
        }
}

app.get('/getSinglePlaceResult', async function (req, res, next) {
  const { place_id } = req.query
  console.log("the params in backend", req.query.place_id);
  const getData = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${req.query.place_id}&key=AIzaSyD9CLs9poEBtI_4CHd5Y8cSHklQPoCi6NM`);
  console.log("the resultss", getData.data.result)
  res.send(getData.data.result);

})

app.use('/graphql', graphqlHTTP ({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  formatError: (err)=>{
    if(!err.originalError)
      return err
    const data = err.originalError.data;
    const message = err.message;
    const code = err.originalError.code;
    return  {message, status: code, error: data}
  }
})) 

// project #1
var connection = `mongodb://abubakar:abubakar@cluster0-shard-00-00.egqju.mongodb.net:27017,cluster0-shard-00-01.egqju.mongodb.net:27017,cluster0-shard-00-02.egqju.mongodb.net:27017/graphql-practise?ssl=true&replicaSet=atlas-rgxqpa-shard-0&authSource=admin&retryWrites=true&w=majority`

var original = `mongodb+srv://abubakar:abubakar@cluster0.egqju.mongodb.net/graphql-practise?retryWrites=true&w=majority`;

// cloud test 

// var originalTwo = `mongodb+srv://abubakar:abubakar@cluster0.yhjwa.mongodb.net/clouding?retryWrites=true&w=majority`;

// console.log("the port", port)
var port = process.env.PORT || 3000;
console.log("the port", port)


mongoose.connect( connection , { useNewUrlParser: true })
        .then(()=>{  
          app.listen(port, function(){
            console.log("Express server listening on port %d in %s mode", app.settings.env);
          });
        }).catch(err => { console.log("the error", err) })  