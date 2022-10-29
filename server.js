//import { handler } from './build/handler.js';
import express from 'express';
import mongoose from 'mongoose';
import mongodbsession from 'express-mongodb-session';
import session from 'express-session';
import cors from 'cors';
import { UserApiController } from './api/user.js';

const app = express();

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// parse application/json
app.use(express.json());

// For CORS
app.use(cors({
  'allowedHeaders': ['Content-Type'],
  'origin': '*',
  'preflightContinue': true
}));

// Set up the MongoDB connection
var dbPath = 'mongodb://localhost/tilbot';

if (process.env.MONGO_USERNAME != undefined) {
  dbPath = 'mongodb://' + process.env.MONGO_USERNAME + ':' + process.env.MONGO_PASSWORD + '@mongo:' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB;
}

const options = {useNewUrlParser: true, useUnifiedTopology: true};
const mongo = mongoose.connect(dbPath, options);

// Make sure the express-mongodb-session can also use the existing connection
console.log(mongodbsession);
const MongoDBStore = mongodbsession(session);

// Main MongoDB connection
mongo.then(() => {
  console.log('MongoDB connected');

  // Sessions
  const store = new MongoDBStore({
    // Because we are using mongoose rather than MongoDB, express-mongodb-session refuses to use the existing connection because it is not instanceof MongoDB.MongoClient
    //existingConnection: mongo.connection,
    //databaseName: process.env.MONGO_DB,
    uri: dbPath,
    collection: 'sessions'
  });

  // Catch errors
  store.on('error', function(error) {
    console.log(error);
  });

  app.use(session({
    secret: 'Super secretthings',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    // Boilerplate options, see:
    // * https://www.npmjs.com/package/express-session#resave
    // * https://www.npmjs.com/package/express-session#saveuninitialized
    resave: true,
    saveUninitialized: true
  }));


  // add a route that lives separately from the SvelteKit app
  app.post('/api/login', (req, res) => {
    res.status(200);

    UserApiController.login(req.body.username, req.body.password).then(function(success) {
      if(success) {
        req.session.username = req.body.username;
        req.session.save();
        res.send('OK');
      }

      else {
        res.send('NOK');
      }
    });
  });

  app.get('/api/sesh', (req, res) => {
    res.status(200);
    console.log(req.session);
  });


  // let SvelteKit handle everything else, including serving prerendered pages and static assets
  //app.use(handler);

  app.listen(3001, () => {
    console.log('listening on port 3001');
  });
    
});