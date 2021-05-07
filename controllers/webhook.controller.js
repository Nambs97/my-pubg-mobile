const axios = require('axios');
const i18n = require('../config/i18n.config');
const emo = require('../services/emoji.service');
require('dotenv').config();

console.log('Made with ' + emo.heart + 'by LCDP Team');

// Update the Messenger Profile
setMessengerProfile();

///HOW TO USE USER GET PROFILE
/*getUserProfile('4118571594829852').then(userProfile => {
  console.log('EXTERNAL : ' + JSON.stringify(userProfile));
});*/


// Sends response messages via the Send API
function callSendAPI(senderPsid, response, timeTyping) {
  if (!timeTyping) {
    timeTyping = 0;
  }
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

  // Showing typing bubble
  setTyping(senderPsid, 'on');

  // Send the HTTP request to the Messenger Platform
  console.log('Start sending HTTPS Request to https://' + options.hostname + options.path);
  setTimeout(function() {
    axios
    .post('https://graph.facebook.com/v10.0/me/messages?access_token=' + PAGE_ACCESS_TOKEN,
    requestBody).then((res)=> {
      console.log('Message sent!');
    })
    .catch(err => {
      console.error('Unable to send message:' + err);
    });
  }, timeTyping);
}

// Sends response messages via the Send API
function setTyping(senderPsid, status) {
  let requestBody;
  // The page access token we have generated in your app settings
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
  const options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: '/v10.0/me/messages?access_token=' + PAGE_ACCESS_TOKEN,
      method: 'POST'
  }

  // Construct the message body
  if (status === 'on' || status === 'off') {
    requestBody = {
      'recipient': {
        'id': senderPsid
      },
      'sender_action': 'typing_' + status
    };
  }
  
  // Send the HTTP request to the Messenger Platform
  axios
    .post('https://graph.facebook.com/v10.0/me/messages?access_token=' + PAGE_ACCESS_TOKEN,
    requestBody).then((res)=> {
      console.log('Typing...');
    })
    .catch(err => {
      console.error('Unable to toggle typing status:' + err);
    });
}

// Get User Profile
async function getUserProfile(senderPsid) {
  try {
    userProfile = await callUserProfileAPI(senderPsid);
    return userProfile;
  } catch(err) {
    console.log('Unable to get User Profile : ' + err);
  }
}

// API Call for User Profile
function callUserProfileAPI(senderPsid) {
  // The page access token we have generated in your app settings
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
  const options = {
      hostname: 'graph.facebook.com',
      protocole: 'https',
      path: '/' + senderPsid + '?access_token=' + PAGE_ACCESS_TOKEN,
      method: 'GET'
  }
  
  return new Promise((resolve, reject) => {
    // Send the HTTP request to the Messenger Platform
    console.log('Start calling HTTPS Request to : ' + options.protocole +'://' + options.hostname + options.path);
    axios
      .get(options.protocole +'://' + options.hostname + options.path)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        console.error('Unable to retrieve user profile :' + err);
        reject(err);
      });
});
  
}


// Handles messages events
function handleMessage(senderProfile, receivedMessage) {
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
    callSendAPI(senderProfile.id, response);
  }
  
  // Handles messaging_postbacks events
  function handlePostback(senderProfile, receivedPostback) {
    let response;
  
    // Get the payload for the postback
    let payload = receivedPostback.payload;
  
    // Set the response based on the postback payload
    switch (payload) {
      case 'get_started':
        response = { 'text': 'Je suis le Professeur ! Ton futur Bot Gaming préféré. Combien de UC veux-tu acheter ?' };
        break;

      case 'yes':
        response = { 'text': 'Thanks!' };
        break;

      case 'no':
        response = { 'text': 'Oops, try sending another image.' };
        break;

      default:
          alert('Default case');
          break;
    }
    
    // Send the message to acknowledge the postback
    callSendAPI(senderProfile.id, response);
  }

  // Handles messaging_postbacks events
  function startConversation(senderProfile) {
    let response1, response2;
    
    response1 = { 'text': i18n.__("get_started.welcome", {
      userFirstName: senderProfile.first_name.replace("'", " "),
      sunglasses : emo.sunglasses
    }) };
    response2 = { 'text': i18n.__("get_started.want_to_buy") };
    
    console.log('===> Emoji :' + emo.heart);
    // Send the message to acknowledge the postback
    callSendAPI(senderProfile.id, response1, 1000);
    setTimeout(function(){
      callSendAPI(senderProfile.id, response2, 3000); 
    },2000);
  }

  //Sends receipts to customer
  function sendReceipt(senderPsid, orderDetails) {
    let response;
    let productName = 'PUBG Mobile (Global)'; //orderDetails.productName
    let productDesc = 'Unknown Cash (UC)'; //orderDetails.productDesc
    let productQuantity = 60; //orderDetails.productQuantity
    let productPrice = 25000; //orderDetails.productPrice
    let customerName = 'lcdpRIO'; //orderDetails.customerName
    let orderNumber = '1233454'; //orderDetails.orderNumber
    let paymentMethod = 'MVola'; //orderDetails.paymentMethod
    let totalCost = 25000; //orderDetails.totalCost

    response = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type':'receipt',
          'recipient_name':customerName,
          'order_number':orderNumber,
          'currency':'MGA',
          'payment_method':paymentMethod,
          'timestamp':'1619723935',
          'summary':{
          'subtotal': totalCost,
          'total_cost': totalCost
          },
          'elements':[
            {
              'title': productName,
              'subtitle':productDesc,
              'quantity': productQuantity,
              'price': productPrice,
              'currency': 'MGA'
            }
          ]
        }
      }
    }
  }
  
  // Sets Messenger Profile via API
  function setMessengerProfile() {
    let profileProperties = {
      "get_started": {
        "payload":"get_started"
      },
      "greeting":[
        {
          "locale":"default",
          "text":i18n.__("profile.greeting", {
            userFirstName: "{{user_first_name}}"
          })
        },
        {
          "locale":"en_US",
          "text":"Welcome to LCDP Gaming Store {{user_first_name}}!"
        }
      ]
    }
    // The page access token we have generated in your app settings
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    const options = {
        hostname: 'graph.facebook.com',
        port: 443,
        path: '/v10.0/me/messenger_profile?access_token=' + PAGE_ACCESS_TOKEN,
        method: 'POST'
    }
  
    // Send the HTTP request to the Messenger Platform
    console.log('Start sending HTTPS Request to https://' + options.hostname + options.path);
    axios
      .post('https://' + options.hostname + options.path,
      profileProperties).then((res)=> {
        console.log('Messenger Profile Updated !');
      })
      .catch(err => {
        console.error('Unable to update Messenger Profile : ' + err);
      });
  }

  module.exports = {
    handleMessage: handleMessage,
    handlePostback: handlePostback,
    startConversation: startConversation,
    getUserProfile: getUserProfile
};