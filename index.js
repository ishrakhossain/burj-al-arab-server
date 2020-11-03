const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
console.log(process.env.DB_PASS)





var admin = require("firebase-admin");

var serviceAccount = require("./travel-guru-master-a3337-firebase-adminsdk-4nar5-f349b7c8c1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});

app.use(cors())
app.use(bodyParser.json())

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cuf1v.mongodb.net/gettingMad?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("gettingMad").collection("noWorries");

  // perform actions on the collection object
  console.log('db connected successfully');

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0);
        console.log(result);
      })
    console.log(newBooking);
  })
  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      console.log({ idToken });
      admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
          const  tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if (tokenEmail == queryEmail) {
            bookings.find({ email: req.query.email })
              .toArray((err, documents) => {
                res.status(200).send(documents)
              })
          }
          console.log({ uid });
        }).catch(function (error) {
          res.status(404).send('Unauthorized access');        });
    }
    // idToken comes from the client app
    else{
      res.status(404).send('Unauthorized access');
    }

  })
});

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(port)