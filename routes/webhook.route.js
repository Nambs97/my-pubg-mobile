//{SERVER}/webhook
const bodyParser = require('body-parser').json();
const express = require('express');
const router = express.Router();
const Webhook = require('../controllers/webhook.controller');
require('dotenv').config();

//GET : Webhook Welcome Message
router.get('/',function(req, res) {
    res.send('Welcome to LCDP Gaming Store Webhook !');
});

router.post('/verify', (req, res) => {
    let body = req.body;
  
    // Checks if this is an event from a page subscription
    if (body.object === 'page') {
  
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {
  
      // Gets the body of the webhook event
      let webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id;
      console.log('Sender PSID: ' + senderPsid);
      Webhook.getUserProfile(senderPsid).then(senderProfile => {
        console.log('EXTERNAL ROUTE : ' + JSON.stringify(senderProfile));
        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhookEvent.message) {
          Webhook.handleMessage(senderProfile, webhookEvent.message);
        } else if (webhookEvent.postback) {
          if (webhookEvent.postback.payload === 'get_started') {
            Webhook.startConversation(senderProfile);
          } else {
            Webhook.handlePostback(senderProfile, webhookEvent.postback);
          }
        }
      });
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Adds support for GET requests to our webhook
router.get('/verify', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

router.post('/order/confirm', (req, res) => {
  let body = req.body;

  // Checks senderPsid and orderDetails have been supplied in the request
  if (body.senderPsid && body.orderDetails) {
    Webhook.getUserProfile(body.senderPsid).then(senderProfile => {
      console.log('CONFIRM ORDER GET USER PROFILE : ' + JSON.stringify(senderProfile));
      Webhook.confirmOrder(senderProfile, body.orderDetails);
    });
    // Returns a '200 OK' response to all requests
    res.status(200).send({'statusReason': 'Order confirmed successfully !', 'orderDetails': body.orderDetails});
  } else {
    // Returns a '401' if event is not from a page subscription
    res.sendStatus(401).send({'statusReason': 'Order confirmation failed ! Missing mandatory parameters.', 'orderDetails': body.orderDetails});
  }
});

router.post('/order/cancel', (req, res) => {
  let body = req.body;

  // Checks senderPsid and orderDetails have been supplied in the request
  if (body.senderPsid && body.orderDetails) {
    Webhook.getUserProfile(body.senderPsid).then(senderProfile => {
      console.log('CANCEL ORDER GET USER PROFILE : ' + JSON.stringify(senderProfile));
      Webhook.cancelOrder(senderProfile, body.orderDetails);
    });
    // Returns a '200 OK' response to all requests
    res.status(200).send({'statusReason': 'Order cancelled successfully !', 'orderDetails': body.orderDetails});
  } else {
    // Returns a '401' if event is not from a page subscription
    res.sendStatus(401).send({'statusReason': 'Order cancellation failed ! Missing mandatory parameters.', 'orderDetails': body.orderDetails});
  }
});

module.exports = router;