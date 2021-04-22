const bodyParser = require('body-parser').json();
const express = require('express');
const router = express.Router();
const PUBGm = require('../controllers/pubgm.controller');

//GET : API Welcome Message
router.get('/',function(req, res) {
    res.send('Welcome to LCDP Gaming Store API !');
});


//POST : Get PUBG Mobile Nickname from Midasbuy website
router.post('/pubgmobile', bodyParser, function(req, res, next){
    console.log('Request : ' + JSON.stringify(req.body));
    PUBGm.getPlayerIGN(req.body.remoteServer, req.body.playerID).then((playerIGN) => {
        res.send({'playerID': req.body.playerID, 'playerIGN': playerIGN});
        console.log('Response : ' + JSON.stringify({'playerID': req.body.playerID, 'playerIGN': playerIGN}));
    });
});

module.exports = router;
