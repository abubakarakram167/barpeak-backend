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
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
var cors = require('cors');
var auth = require('./middleware/auth');
var events = [];
const port = process.env.PORT || 3000;
var distDir = __dirname + "/dist/";

app.use(express.static(distDir));
app.use(cors());
app.use(bodyParser.json());
app.use(auth);

app.post('/', function(req, res) {
  const url = req.body.url;
  res.send("askdjnaksndkajnskss");
});

app.get('/getGoogleMapsResults', async function (req, res, next) {
  const latitude = 32.7970465;
  const longitude = -117.2545220;
  const {business_type} = req.query;
  console.log("int hte backend", business_type);
  const getData = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude}, ${longitude}&radius=15000&type=${business_type}&key=AIzaSyD9CLs9poEBtI_4CHd5Y8cSHklQPoCi6NM`);
  console.log("the resultss", getData.data.results)
  res.send(getData.data.results);

})

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


mongoose.connect( connection , { useNewUrlParser: true })
        .then(()=>{  
          app.listen(port, () => {  
            console.log("server is up....")
          })
        }).catch(err => { console.log("the error", err) })  