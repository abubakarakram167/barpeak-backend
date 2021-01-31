const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const app = express();
const graphqlSchema = require('./graphQl/schema');
const graphqlResolver = require('./graphQl/resolvers');
var cors = require('cors');
var auth = require('./middleware/auth');
var mongoose = require('mongoose');
var mainRoutes = require('./routes.js')

app.use(cors());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(auth);
app.use(mainRoutes)

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



// local project #1
  // var connection = `mongodb://geoff:BarPeakthisweek1!@barpeak.i4yku.mongodb.net:27017,cluster0-shard-00-01.egqju.mongodb.net:27017,cluster0-shard-00-02.egqju.mongodb.net:27017/ProductionBarPeak?ssl=true&replicaSet=atlas-rgxqpa-shard-0&authSource=admin&retryWrites=true&w=majority`
// var original = `mongodb+srv://abubakar:abubakar@cluster0.egqju.mongodb.net/graphql-practise?retryWrites=true&w=majority`;

// production
  var connection = `mongodb+srv://geoff:BarPeakthisweek1!@barpeak.i4yku.mongodb.net/ProductionBarPeak?retryWrites=true&w=majority`
  //var hotspot = `mongodb://geoff:BarPeakthisweek1!@barpeak-shard-00-00.i4yku.mongodb.net:27017,barpeak-shard-00-01.i4yku.mongodb.net:27017,barpeak-shard-00-02.i4yku.mongodb.net:27017/ProductionBarPeak?ssl=true&replicaSet=atlas-12fzoe-shard-0&authSource=admin&retryWrites=true&w=majority`
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