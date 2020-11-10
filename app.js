const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema }  = require('graphql');
var mongoose = require('mongoose');
const Event = require('./models/event');
const User = require('./models/users');
const app = express();
const bcrypt = require('bcryptjs');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
var cors = require('cors');
var auth = require('./middleware/auth');
var events = [];

app.use(cors());
app.use(bodyParser.json());
app.use(auth);
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
          app.listen(3000, () => {  
            console.log("server is up....")
          })
        }).catch(err => { console.log("the error", err) })  