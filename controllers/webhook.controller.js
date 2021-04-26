const https = require('https');
const axios = require('axios');
require('dotenv').config();

// Handles messages events
function handleMessage(senderPsid, receivedMessage) {
    let response;
  
    // Checks if the message contains text
    if (receivedMessage.text) {
      // Create the payload for a basic text message, which
      // will be added to the body of your request to the Send API
      response = {
        'text': `You sent the message: '${receivedMessage.text}'. Now send me an attachment!`
      };
    } else if (receivedMessage.attachments) {
  
      // Get the URL of the message attachment
      let attachmentUrl = receivedMessage.attachments[0].payload.url;
      response = {
        'attachment': {
          'type': 'template',
          'payload': {
            'template_type': 'generic',
            'elements': [{
              'title': 'Is this the right picture?',
              'subtitle': 'Tap a button to answer.',
              'image_url': attachmentUrl,
              'buttons': [
                {
                  'type': 'postback',
                  'title': 'Yes!',
                  'payload': 'yes',
                },
                {
                  'type': 'postback',
                  'title': 'No!',
                  'payload': 'no',
                }
              ],
            }]
          }
        }
      };
    }
  
    // Send the response message
    callSendAPI(senderPsid, response);
  }
  
  // Handles messaging_postbacks events
  function handlePostback(senderPsid, receivedPostback) {
    let response;
  
    // Get the payload for the postback
    let payload = receivedPostback.payload;
  
    // Set the response based on the postback payload
    if (payload === 'yes') {
      response = { 'text': 'Thanks!' };
    } else if (payload === 'no') {
      response = { 'text': 'Oops, try sending another image.' };
    }
    // Send the message to acknowledge the postback
    callSendAPI(senderPsid, response);
  }
  
  // Sends response messages via the Send API
  function callSendAPI(senderPsid, response) {
  
    // The page access token we have generated in your app settings
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    const options = {
        hostname: 'graph.facebook.com',
        port: 443,
        path: '/v10.0/me/messages?access_token=' + PAGE_ACCESS_TOKEN,
        method: 'POST'
    }

    // Construct the message body
    let requestBody = {
      'recipient': {
        'id': senderPsid
      },
      'message': response
    };
  
    // Send the HTTP request to the Messenger Platform
    console.log('Start sending HTTPS Request to https://' + options.hostname + options.path);
    axios
      .post('https://graph.facebook.com/v10.0/me/messages?access_token=' + PAGE_ACCESS_TOKEN,
      requestBody).then((res)=> {
        console.log('Message sent!');
      })
      .catch(err => {
        console.error('Unable to send message:' + err);
      });
  }

  module.exports = {
    handleMessage: handleMessage,
    handlePostback: handlePostback,
};