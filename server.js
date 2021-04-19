const express = require('express');
const mongoose = require('mongoose');


//Set up Express App
const app = express();

//Connect to MongoDb
mongoose.connect('mongodb://localhost:27017/ingenosya', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;

//app.use(express.static('public'));

app.use(express.json());


//Initialize routes
app.use('/api', require('./routes/api.route'));

//Error handling middleware
app.use(function(err, req, res, next) {
    res.status(422).send({error: err.message});
});

const PORT = process.env.PORT || 4000;

//app.get('/api', (req, res) => res.send('Its working !'));

app.listen(PORT, function(){
    console.log('Server starts on port ' + PORT);
})