const express = require('express');
require('dotenv').config();

//Set up Express App
const app = express();

app.use(express.json());


//Initialize routes
app.use('/api', require('./routes/api.route'));
app.use('/webhook', require('./routes/webhook.route'));

//Error handling middleware
app.use(function(err, req, res, next) {
    res.status(422).send({error: err.message});
});

const PORT = process.env.PORT || 4000;

//app.get('/api', (req, res) => res.send('Its working !'));

app.listen(PORT, function(){
    console.log('Server starts on port ' + PORT);
})