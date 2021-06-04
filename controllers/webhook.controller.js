const axios = require('axios');
const i18n = require('../config/i18n.config');
const emo = require('../services/emoji.service');
const Response = require('../services/response.service');
const { createWorker } = require('tesseract.js');
const convertapi = require('convertapi')('XNYDYqBwgvepJBTY');
const PUBGm = require('../controllers/pubgm.controller');
require('dotenv').config();

console.log('Made with ' + emo.heart + 'by LCDP Team');

// Update the Messenger Profile
setMessengerProfile();
// Setting Global Variables
let waiting_for_player_id = {};
let waiting_for_transaction_ref = {};
let isPlayerIdOk = {};
let isTransactionRefOk = {};
let globalProductName = {};
let globalProductDesc = {};
let globalPlayerID = {};
let globalPlayerIGN = {};
let globalTransactionRef = {};
let globalAmount = {};
let globalTotalPrice = {};
let globalPaymentMethod = {};


//getPlayerIdArrayFromImage('https://scontent.xx.fbcdn.net/v/t1.15752-9/188003250_866875303865680_31630890645455792_n.png?_nc_cat=111&ccb=1-3&_nc_sid=58c789&_nc_ohc=sCgyz0tCNmIAX8-I15o&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=ba79e765d6a6b58c86824a1948ab8767&oe=60CBD3EB');


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
      console.log("REQUEST SENT ====> " + JSON.stringify(requestBody));
      console.log('Message sent!');
    })
    .catch(err => {
      console.log("REQUEST SENT ====> " + JSON.stringify(requestBody));
      console.error('Unable to send message:' + err);
    });
  }, timeTyping);
}

// Sends response messages via the Send API
function callClickSendSMSAPI(senderProfile, orderDetails) {
  /*orderDetails = {
    order_id: 12345,
    product_name: "UC",
    product_desc: "PUBG Mobile Unknown Cash (Global)",
    product_quantity: 60,
    player_id: 563361811,
    player_ign: LCDPシRio,
    trans_ref: 555270421,
    payment_method: MVola,
    total_price: 20000
  }*/

  // The page access token we have generated in your app settings
  const CLICK_SEND_AUTH = process.env.CLICK_SEND_AUTH;
  const CLICK_SEND_RECEIVER = process.env.CLICK_SEND_RECEIVER;
  const CLICK_SEND_SENDER = process.env.CLICK_SEND_SENDER;
  const options = {
    hostname: 'rest.clicksend.com',
    port: 443,
    path: '/v3/sms/send',
    method: 'POST'
  }

  // Construct the message body
  let requestBody = {
    "messages": [
      {
        "from": CLICK_SEND_SENDER,
        "to": CLICK_SEND_RECEIVER,
        "source": "messenger",
        "body": "Commande recue sur LCDP GS : \n- Numero : " + orderDetails.order_id + " \n- PlayerID : " + orderDetails.player_id + " \n- Montant : " + orderDetails.product_quantity + " UC \n- Methode: " + orderDetails.payment_method + " \n- Ref Transaction : " + orderDetails.trans_ref
      }
    ]
  };

  const requestHeader = {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + CLICK_SEND_AUTH
  }

  // Send the HTTP request to the Messenger Platform
  console.log('Start sending HTTPS Request to https://' + options.hostname + options.path);
  axios
  .post('https://' + options.hostname + options.path,
  requestBody, {
    headers: requestHeader
  }).then((res)=> {
    console.log("REQUEST SENT ====> " + JSON.stringify(requestBody));
    console.log('Order SMS Notification sent!');
  })
  .catch(err => {
    console.log("REQUEST SENT ====> " + JSON.stringify(requestBody));
    console.error('Unable to send message:' + err);
  });
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

// Get Player ID inside string : return Array
function getPlayerIdArrayFromText(receivedMessage) {
	potentialPlayerIds = receivedMessage.match(/\d{5,}/g);
  if (potentialPlayerIds) {
    console.log("Potential Player ID <==> : " + potentialPlayerIds);
    console.log("Potential ID array length == : " + potentialPlayerIds.length);
  }
  return potentialPlayerIds;
}

// Get Player ID inside image : return Array
async function getPlayerIdArrayFromImage(receivedImageURL) {
  if (receivedImageURL) { /*&& receivedImageURL.match(/\.(jpeg|jpg|bmp|png|pbm)$/)*/
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(receivedImageURL);
    console.log('OCR ======> ' + text);
    await worker.terminate();

    potentialPlayerIds = text.match(/\d{5,}/g);
    if (potentialPlayerIds) {
      console.log("Potential Player ID <==> : " + potentialPlayerIds);
      console.log("Potential ID array length == : " + potentialPlayerIds.length);
    } else {
      console.log("No PUBG Mobile ID found on image!");
    }
    return potentialPlayerIds;
  } else {
    console.log('Please refer a supported image URL with one of the following extension : jpeg|jpg|bmp|png|pbm');
  }

}

// Get Transaction Ref inside string : return Array
function getTransRefArrayFromText(receivedMessage) {
	potentialTransRefs = receivedMessage.match(/\d{4,10}/g);
  if (potentialTransRefs) {
    console.log("Potential Transaction Ref <==> : " + potentialTransRefs);
    console.log("Potential Transaction Ref array length == : " + potentialTransRefs.length);
  }
  return potentialTransRefs;
}

// Get Transaction Refs inside image : return Array
async function getTransRefArrayFromImage(receivedImageURL) {
  if (receivedImageURL) { /*&& receivedImageURL.match(/\.(jpeg|jpg|bmp|png|pbm)$/)*/
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(receivedImageURL);
    console.log('OCR ======> ' + text);
    await worker.terminate();

    potentialTransRefs = text.match(/\d{4,10}/g);
    if (potentialTransRefs) {
      console.log("Potential Transaction Ref <==> : " + potentialTransRefs);
      console.log("Potential Transaction Ref array length == : " + potentialTransRefs.length);
    } else {
      console.log("No Transaction Ref found on image!");
    }
    return potentialTransRefs;
  } else {
    console.log('Please refer a supported image URL with one of the following extension : jpeg|jpg|bmp|png|pbm');
  }
}

// Get and send player IGN for check
function sendPlayerIGN(senderProfile, playerID) {
  console.log("PLAYER ID ARGUMENT ====> : " + playerID);
  setTyping(senderProfile.id, 'on');
  if (playerID && playerID !== undefined && playerID !== '') {
    PUBGm.getPlayerIGN('localchrome', playerID).then((playerIGN) => {
      if (playerIGN && playerIGN !== undefined) {
        console.log('PLAYER IGN ====> Votre Pseudo est ' + playerIGN);
        globalPlayerIGN[senderProfile.id] = playerIGN;
        let msg_player_ign_confirmation = Response.genButtonTemplate(
          i18n.__("order.player_ign_confirmation", {
            pseudo: playerIGN,
            id: playerID
          }),
          [
            {
              'type': 'postback',
              'title': 'Oui',
              'payload': 'confirm_player_ign_yes',
            },
            {
              'type': 'postback',
              'title': 'Non',
              'payload': 'confirm_player_ign_no',
            }
        ]);
  
        // Send the response message
        callSendAPI(senderProfile.id, msg_player_ign_confirmation);
      } else {
        let msg_player_ign_not_found_on_server = Response.genText(i18n.__("order.player_id_not_found_on_server", {
          id: playerID
        }));
    
        // Send the response message
        callSendAPI(senderProfile.id, msg_player_ign_not_found_on_server);
        waiting_for_player_id[senderProfile.id] = true;
      }
      
    });
  } else {
    let msg_player_ign_not_found_on_text = Response.genText(i18n.__("order.player_id_not_found_on_text"));
    
    // Send the response message
    callSendAPI(senderProfile.id, msg_player_ign_not_found_on_text);
    waiting_for_player_id[senderProfile.id] = true;
  }
  
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
    if (receivedMessage.text) { // IF RECEIVED MESSAGE CONTAINS TEXT
      // If message comes from Quick Replies
      if (receivedMessage.quick_reply) { // IF RECEIVED MESSAGE CONTAINS TEXT WITH QUICK REPLY
        console.log('QUICK REPLY PAYLOAD ====> ' + receivedMessage.quick_reply.payload);
        switch (receivedMessage.quick_reply.payload) {
          case 'order_63_uc':
            /*response = { 'text': i18n.__("order.ask_player_id", {
              amount: '63'
            }) };*/
            askPlayerIdWithAmount(senderProfile, '63');
            globalAmount[senderProfile.id] = '63';
            globalTotalPrice[senderProfile.id] = '4000';
            break;
    
          case 'order_340_uc':
            askPlayerIdWithAmount(senderProfile, '340');
            globalAmount[senderProfile.id] = '340';
            globalTotalPrice[senderProfile.id] = '21500';
            break;
    
          case 'order_690_uc':
            askPlayerIdWithAmount(senderProfile, '690');
            globalAmount[senderProfile.id] = '690';
            globalTotalPrice[senderProfile.id] = '41000';
            break;
    
          case 'order_1875_uc':
            askPlayerIdWithAmount(senderProfile, '1875');
            globalAmount[senderProfile.id] = '1875';
            globalTotalPrice[senderProfile.id] = '98000';
            break;

          case 'order_4000_uc':
            askPlayerIdWithAmount(senderProfile, '4000');
            globalAmount[senderProfile.id] = '4000';
            globalTotalPrice[senderProfile.id] = '193000';
            break;

          case 'order_8400_uc':
            askPlayerIdWithAmount(senderProfile, '8400');
            globalAmount[senderProfile.id] = '8400';
            globalTotalPrice[senderProfile.id] = '385000';
            break;
        }

      } else { // IF RECEIVED MESSAGE CONTAINS TEXT WITHOUT QUICK REPLY
        // If message comes from keyboard typing
        console.log("waiting_for_player_id[" + senderProfile.id + "] ====> " + waiting_for_player_id[senderProfile.id]);
        console.log("waiting_for_transaction_ref[" + senderProfile.id + "] ====> " + waiting_for_transaction_ref[senderProfile.id]);
        // Check if waiting for PUBG Mobile ID
        if (waiting_for_player_id[senderProfile.id]) {
          let playerIdArray = getPlayerIdArrayFromText(receivedMessage.text);
          if (playerIdArray) {
            isPlayerIdOk[senderProfile.id] = true;
            response = {
              'text': i18n.__("order.player_id_check_in_process", {
                hourglass: emo.hourglass
              }) 
            };
            globalPlayerID[senderProfile.id] = playerIdArray[0];
            sendPlayerIGN(senderProfile, playerIdArray[0]);
          } else {
            isPlayerIdOk[senderProfile.id] = false;
            response = {
              'text': i18n.__("order.player_id_not_found_on_text")
            };
          }
        } else if (waiting_for_transaction_ref[senderProfile.id]) {
          let transRefArray = getTransRefArrayFromText(receivedMessage.text);
          if (transRefArray) {
            isTransactionRefOk[senderProfile.id] = true;
            globalTransactionRef[senderProfile.id] = transRefArray[0];
            createOrder(senderProfile);
            response = {
              'text': i18n.__("order.order_in_process", {
                user_first_name: senderProfile.first_name.replace("'", " "),
                hourglass: emo.hourglass
              }) 
            };
          } else {
            isTransactionRefOk[senderProfile.id] = false;
            response = {
              'text': i18n.__("order.transaction_ref_not_found_on_text")
            };
          }
        } else {
          response = {
            'text': i18n.__("fallback.any", {
              message: (receivedMessage.text).replace("'", " ")
            })
          };
        }

        // Send the response message
        callSendAPI(senderProfile.id, response);
        if(isPlayerIdOk[senderProfile.id]) {
          waiting_for_player_id[senderProfile.id] = false;
        } else if(!isPlayerIdOk[senderProfile.id]) {
          waiting_for_player_id[senderProfile.id] = true;
        }

        if (isTransactionRefOk[senderProfile.id]) {
          waiting_for_transaction_ref[senderProfile.id] = false;
        } else if (!isTransactionRefOk[senderProfile.id]) {
          waiting_for_transaction_ref[senderProfile.id] = true;
        }
      }
      
    } else if (receivedMessage.attachments) { // IF RECEIVED MESSAGE CONTAINS ATTACHMENTS
      // Check if attachments is for PLAYER ID
      if (waiting_for_player_id[senderProfile.id]) {
        // Get the URL of the message attachment
        let attachmentUrl = receivedMessage.attachments[0].payload.url;
        console.log('IMAGE URL ====> ' + attachmentUrl);
        let playerIdInImage;
        getPlayerIdArrayFromImage(attachmentUrl).then((playerIdFoundArray) => {
          console.log('PLAYER IDs FROM FUNCTION CALL : ====> ' +  playerIdFoundArray);
          playerIdInImage = playerIdFoundArray;
          if (playerIdInImage) {
            console.log('PLAYER IDs ARRAY LENGTH ====> : ' + playerIdInImage.length);
            globalPlayerID[senderProfile.id] = playerIdInImage[0];
            let msg_player_id_confirmation = Response.genButtonTemplate(
              i18n.__("order.player_id_confirmation", {
                id: playerIdInImage[0]
              }),
              [
                {
                  'type': 'postback',
                  'title': 'Oui',
                  'payload': 'confirm_player_id_yes',
                },
                {
                  'type': 'postback',
                  'title': 'Non',
                  'payload': 'confirm_player_id_no',
                }
            ]);
            // Send the response message
            callSendAPI(senderProfile.id, msg_player_id_confirmation);
            waiting_for_player_id[senderProfile.id] = false;
          } else {
            console.log("IMAGE DOESN'T CONTAIN PUBG MOBILE ID");
            msg_player_ign_not_found_on_image = { 'text': i18n.__("order.player_id_not_found_on_image") }
            // Send the response message
            callSendAPI(senderProfile.id, msg_player_ign_not_found_on_image);
            waiting_for_player_id[senderProfile.id] = true;
          }     
        });
      } else if (waiting_for_transaction_ref[senderProfile.id]) { // Check if attachments is for TRANSACTION REF
        //PROCESS FOR CHECK TRANS REF IN ATTACHMENTS
        // Get the URL of the message attachment
        let attachmentUrl = receivedMessage.attachments[0].payload.url;
        console.log('IMAGE URL ====> ' + attachmentUrl);
        let transRefInImage;
        getTransRefArrayFromImage(attachmentUrl).then((transRefFoundArray) => {
          console.log('TRANSACTION REFs FROM FUNCTION CALL : ====> ' +  transRefFoundArray);
          transRefInImage = transRefFoundArray;
          if (transRefInImage) {
            console.log('TRANSACTION REFs ARRAY LENGTH ====> : ' + transRefInImage.length);
            globalTransactionRef[senderProfile.id] = transRefInImage[0];
            let msg_transaction_ref_confirmation = Response.genButtonTemplate(
              i18n.__("order.transaction_ref_confirmation", {
                trans_ref: transRefInImage[0]
              }),
              [
                {
                  'type': 'postback',
                  'title': 'Oui',
                  'payload': 'confirm_transaction_ref_yes',
                },
                {
                  'type': 'postback',
                  'title': 'Non',
                  'payload': 'confirm_transaction_ref_no',
                }
            ]);
            // Send the response message
            callSendAPI(senderProfile.id, msg_transaction_ref_confirmation);
          } else {
            console.log("IMAGE DOESN'T CONTAIN PUBG MOBILE ID");
            msg_player_ign_not_found_on_image = { 'text': i18n.__("order.player_id_not_found_on_image") }
            // Send the response message
            callSendAPI(senderProfile.id, msg_player_ign_not_found_on_image);
            waiting_for_player_id[senderProfile.id] = true;
          }     
        });
      } else { // Check if attachments is neither for PLAYER ID neither for TRANSACTION REF
        msg_fallback_attachment = Response.genText(i18n.__("fallback.attachment"));
        callSendAPI(senderProfile.id, msg_fallback_attachment);
      }
      
    }
  }
  
// Handles messaging_postbacks events
function handlePostback(senderProfile, receivedPostback) {
  // Get the payload for the postback
  let response;
  let payload = receivedPostback.payload;

  // Set the response based on the postback payload
  switch (payload) {
    case 'want_to_buy_uc_yes':
      //response = { 'text': 'Voici les tarifs des UC :' };
      initOrder(senderProfile);
      break;

      case 'want_to_buy_uc_no':
        msg_want_to_buy_uc_no = Response.genText(i18n.__("order.want_to_buy_uc_no"));
        callSendAPI(senderProfile.id, msg_want_to_buy_uc_no);
        break;

    case 'confirm_player_id_yes':
      let msg_player_id_check_in_process = Response.genText(i18n.__("order.player_id_check_in_process", {
        hourglass: emo.hourglass
      })); 
      callSendAPI(senderProfile.id, msg_player_id_check_in_process);
      sendPlayerIGN(senderProfile, globalPlayerID[senderProfile.id]);
      break;

    case 'confirm_player_id_no':
      let msg_player_id_error_retry = Response.genText(i18n.__("order.player_id_error_retry"));
      callSendAPI(senderProfile.id, msg_player_id_error_retry);
      waiting_for_player_id[senderProfile.id] = true;
      break;

    case 'confirm_player_ign_yes':
      //Choose payment method
      let msg_ask_payment_method = Response.genButtonTemplate(
        i18n.__("order.ask_payment_method"),
        [
          {
            'type': 'postback',
            'title': 'MVola',
            'payload': 'payment_method_mvola',
          },
          {
            'type': 'postback',
            'title': 'Orange Money',
            'payload': 'payment_method_orange_money',
          },
          {
            'type': 'postback',
            'title': 'Airtel Money',
            'payload': 'payment_method_airtel_money',
          }
      ]);
      callSendAPI(senderProfile.id, msg_ask_payment_method);
      break;

    case 'confirm_player_ign_no':
      let msg_player_ign_error_retry = Response.genText(i18n.__("order.player_id_error_retry"));
      callSendAPI(senderProfile.id, msg_player_ign_error_retry);
      waiting_for_player_id[senderProfile.id] = true;
      break;

    case 'payment_method_mvola':
      sendPaymentMethodHint(senderProfile, 'mvola', globalAmount[senderProfile.id]);
      globalPaymentMethod[senderProfile.id] = 'MVola';
      break;

    case 'payment_method_orange_money':
      sendPaymentMethodHint(senderProfile, 'orange_money', globalAmount[senderProfile.id]);
      globalPaymentMethod[senderProfile.id] = 'Orange Money';
      break;

    case 'payment_method_airtel_money':
      sendPaymentMethodHint(senderProfile, 'airtel_money', globalAmount[senderProfile.id]);
      globalPaymentMethod[senderProfile.id] = 'Airtel Money';
      break;

    case 'confirm_transaction_ref_yes':
      let msg_order_in_process = Response.genText(i18n.__("order.order_in_process", {
        user_first_name: senderProfile.first_name.replace("'", " "),
        hourglass: emo.hourglass
      }));
      createOrder(senderProfile);
      callSendAPI(senderProfile.id, msg_order_in_process);
      waiting_for_transaction_ref[senderProfile.id] = false;
      break;

    case 'confirm_transaction_ref_no':
      let msg_transaction_ref_error_retry = Response.genText(i18n.__("order.transaction_ref_error_retry")); 
      callSendAPI(senderProfile.id, msg_transaction_ref_error_retry);
      waiting_for_transaction_ref[senderProfile.id] = true;
      break;

    case 'view_wiki_pubg_mobile':
      response = { 'text': 'Voici le Wiki PUBG Mobile' };
      togglePersistentMenuForUser(senderProfile, 'off');
      // Send the message to acknowledge the postback
      callSendAPI(senderProfile.id, response);
      waiting_for_player_id[senderProfile.id] = false;
      waiting_for_transaction_ref[senderProfile.id] = false;
      break;

    case 'yes':
      response = { 'text': 'Thanks!' };
      // Send the message to acknowledge the postback
      callSendAPI(senderProfile.id, response);
      waiting_for_player_id[senderProfile.id] = false;
      waiting_for_transaction_ref[senderProfile.id] = false;
      break;

    case 'no':
      response = { 'text': 'Oops, try sending another image.' };
      // Send the message to acknowledge the postback
      callSendAPI(senderProfile.id, response);
      waiting_for_player_id[senderProfile.id] = false;
      waiting_for_transaction_ref[senderProfile.id] = false;
      break;

    default:
      response = { 'text': 'Oops, je ne comprends pas très bien ta demande. \nSouhaites-tu parler à un membre de la Team ?' };
      // Send the message to acknowledge the postback
      callSendAPI(senderProfile.id, response);
      waiting_for_player_id[senderProfile.id] = false;
      waiting_for_transaction_ref[senderProfile.id] = false;
      break;
  }
  
}

// Get Started Conversation with Bot
function startConversation(senderProfile) {
  let msg_welcome, msg_introduce, msg_call_to_buy;
  
  msg_welcome = { 'text': i18n.__("get_started.welcome", {
    userFirstName: senderProfile.first_name.replace("'", " "),
    sunglasses: emo.sunglasses,
    robot_face: emo.robot_face
  }) };

  msg_introduce = { 'text': i18n.__("get_started.introduce", {
    dollar: emo.dollar,
    video_game: emo.video_game
  }) };

  msg_call_to_buy = Response.genGenericTemplate(
    'https://i.ibb.co/fdDWThr/icon-ucs-300.png',
    i18n.__("order.want_to_buy", {
      shopping_trolley: emo.shopping_trolley
    }),
    'Compte Global uniquement',
    [
      {
        'type': 'postback',
        'title': 'Oui',
        'payload': 'want_to_buy_uc_yes',
      },
      {
        'type': 'postback',
        'title': 'Non',
        'payload': 'want_to_buy_uc_no',
      }
    ]);

  // Send the message to acknowledge the postback
  callSendAPI(senderProfile.id, msg_welcome, 1000);
  setTimeout(function(){
    callSendAPI(senderProfile.id, msg_introduce, 3000); 
  },2000);
  setTimeout(function(){
    callSendAPI(senderProfile.id, msg_call_to_buy, 3000); 
  },3000);
  waiting_for_player_id[senderProfile.id] = false;
  waiting_for_transaction_ref[senderProfile.id] = false;
}

// Start order of customer want to buy
function initOrder(senderProfile) {
  let msg_show_pricing, msg_ask_amount;
  globalProductName[senderProfile.id] = 'UC';
  globalProductDesc[senderProfile.id] = 'PUBG Mobile Unknown Cash (Global)';
  
  msg_show_pricing = { 'text': i18n.__("order.show_pricing", {
    white_check_mark: emo.white_check_mark,
    label: emo.label
  }) };

  msg_ask_amount = Response.genQuickReply(i18n.__("order.select_amount"),[
    {
      "title": "63 UC",
      "payload": "order_63_uc",
      //"image_url": "https://i.ibb.co/xHGCDsk/icon-uc.png"
    },{
      "title": "340 UC",
      "payload": "order_340_uc",
      //"image_url": "https://i.ibb.co/xHGCDsk/icon-uc.png"
    },{
      "title": "690 UC",
      "payload": "order_690_uc",
      //"image_url": "https://i.ibb.co/xHGCDsk/icon-uc.png"
    },{
      "title": "1 875 UC",
      "payload": "order_1875_uc",
      //"image_url": "https://i.ibb.co/xHGCDsk/icon-uc.png"
    },{
      "title": "4 000 UC",
      "payload": "order_4000_uc",
      //"image_url": "https://i.ibb.co/xHGCDsk/icon-uc.png"
    },{
      "title": "8 400 UC",
      "payload": "order_8400_uc",
      //"image_url": "https://i.ibb.co/xHGCDsk/icon-uc.png"
    }
  ]);

  // Send the message to acknowledge the postback
  callSendAPI(senderProfile.id, msg_show_pricing, 1000);
  setTimeout(function(){
    callSendAPI(senderProfile.id, msg_ask_amount, 2000); 
  },2000);
  waiting_for_player_id[senderProfile.id] = false;
  waiting_for_transaction_ref[senderProfile.id] = false;
}

// Ask Player's ID depending on the amount ordered
function askPlayerIdWithAmount(senderProfile, amount) {
  let msg_ask_player_id, msg_player_id_hint;

  // Setting GLOBAL variables
  waiting_for_player_id[senderProfile.id] = true;
  waiting_for_transaction_ref[senderProfile.id] = false;

  switch (amount) {
    case '63':
      msg_ask_player_id = { 'text': i18n.__("order.ask_player_id", {
        amount: '63'
      }) };
      break;

    case '340':
      msg_ask_player_id = { 'text': i18n.__("order.ask_player_id", {
        amount: '340'
      }) };
      break;

    case '690':
      msg_ask_player_id = { 'text': i18n.__("order.ask_player_id", {
        amount: '690'
      }) };
      break;

    case '1875':
      msg_ask_player_id = { 'text': i18n.__("order.ask_player_id", {
        amount: '1 875'
      }) };
      break;

    case '4000':
      msg_ask_player_id = { 'text': i18n.__("order.ask_player_id", {
        amount: '4 000'
      }) };
      break;

    case '8400':
      msg_ask_player_id = { 'text': i18n.__("order.ask_player_id", {
        amount: '8 400'
      }) };
      break;

    default:
      msg_ask_player_id = { 'text': 'Oops, je ne vends pas encore ce montant. \nSouhaites-tu en discuter avec un membre de la Team ?' };
      break;
  }

  msg_player_id_hint = { 'text': i18n.__("order.player_id_hint") };

  // Send the message to acknowledge the postback
  callSendAPI(senderProfile.id, msg_ask_player_id, 1000);
  /*setTimeout(function(){
    callSendAPI(senderProfile.id, msg_player_id_hint, 2000); 
  },2000);*/
}

// Send payment hint depending on the selected payment method
function sendPaymentMethodHint(senderProfile, payment_method, amount) {
  let msg_payment_method_hint;
  let msg_ask_transaction_ref;
  let isPaymentMethodOK = false;
  let isAmountOK = false;

  if (payment_method === 'mvola') {
    isPaymentMethodOK = true;
    msg_ask_transaction_ref = Response.genText(i18n.__("order.ask_transaction_ref"));
    switch (amount) {
      case '63':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '4 000',
          msisdn: '034 12 560 03',
          firstname: 'rarivoson'
        }) };
        break;

      case '340':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '21 500',
          msisdn: '034 12 560 03',
          firstname: 'rarivoson'
        }) };
        break;

      case '690':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '41 000',
          msisdn: '034 12 560 03',
          firstname: 'rarivoson'
        }) };
        break;

      case '1875':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '98 000',
          msisdn: '034 12 560 03',
          firstname: 'rarivoson'
        }) };
        break;

      case '4000':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '193 000',
          msisdn: '034 12 560 03',
          firstname: 'rarivoson'
        }) };
        break;

      case '8400':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '385 000',
          msisdn: '034 12 560 03',
          firstname: 'rarivoson'
        }) };
        break;

      default:
        isAmountOK = false;
        msg_payment_method_hint = { 'text': 'Oops, je ne vends pas encore ce montant. \nSouhaites-tu en discuter avec un membre de la Team ?' };
        break;
    }
  } else if (payment_method === 'orange_money') {
    isPaymentMethodOK = true;
    msg_ask_transaction_ref = Response.genText(i18n.__("order.ask_transaction_ref"));
    switch (amount) {
      case '63':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '4 000',
          msisdn: '032 56 283 08',
          firstname: 'RARIVOSON'
        }) };
        break;

      case '340':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '21 500',
          msisdn: '032 56 283 08',
          firstname: 'RARIVOSON'
        }) };
        break;

      case '690':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '41 000',
          msisdn: '032 56 283 08',
          firstname: 'RARIVOSON'
        }) };
        break;

      case '1875':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '98 000',
          msisdn: '032 56 283 08',
          firstname: 'RARIVOSON'
        }) };
        break;

      case '4000':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '193 000',
          msisdn: '032 56 283 08',
          firstname: 'RARIVOSON'
        }) };
        break;

      case '8400':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '385 000',
          msisdn: '032 56 283 08',
          firstname: 'RARIVOSON'
        }) };
        break;

      default:
        isAmountOK = false;
        msg_payment_method_hint = { 'text': 'Oops, je ne vends pas encore ce montant. \nSouhaites-tu en discuter avec un membre de la Team ?' };
        break;
    }
  } else if (payment_method === 'airtel_money') {
    isPaymentMethodOK = true;
    msg_ask_transaction_ref = Response.genText(i18n.__("order.ask_transaction_ref"));
    switch (amount) {
      case '63':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '4 000',
          msisdn: '032 56 283 08',
          firstname: 'RARIVOSON'
        }) };
        break;

      case '340':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '21 500',
          msisdn: '032 56 283 08',
          firstname: 'RARIVOSON'
        }) };
        break;

      case '690':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '41 000',
          msisdn: '032 56 283 08',
          firstname: 'RARIVOSON'
        }) };
        break;

      case '1875':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '98 000',
          msisdn: '032 56 283 08',
          firstname: 'RARIVOSON'
        }) };
        break;

      case '4000':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '193 000',
          msisdn: '032 56 283 08',
          firstname: 'RARIVOSON'
        }) };
        break;

      case '8400':
        isAmountOK = true;
        msg_payment_method_hint = { 'text': i18n.__("order.payment_method_hint", {
          amount: '385 000',
          msisdn: '032 56 283 08',
          firstname: 'RARIVOSON'
        }) };
        break;

      default:
        isAmountOK = false;
        msg_payment_method_hint = { 'text': 'Oops, je ne vends pas encore ce montant. \nSouhaites-tu en discuter avec un membre de la Team ?' };
        break;
    }
  } else {
    isPaymentMethodOK = false;
    msg_payment_method_hint = { 'text': 'Oops, je ne supporte pas encore cette méthode de paiement. \nSouhaites-tu en discuter avec un membre de la Team ?' };
  }


  // Send the message to acknowledge the postback
  callSendAPI(senderProfile.id, msg_payment_method_hint, 1000);
  if (isAmountOK && isPaymentMethodOK) {
    setTimeout(function(){
      callSendAPI(senderProfile.id, msg_ask_transaction_ref, 3000); 
    },2000);
  }
}


//Sends receipts to customer
function sendReceipt(senderProfile, orderDetails) {
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

// Create and Save Order to Database (Send SMS for Admin Notification)
function createOrder(senderProfile) {
  let orderDetails = {
      order_id: 12345,
      product_name: globalProductName[senderProfile.id],
      product_desc: globalProductDesc[senderProfile.id],
      product_quantity: globalAmount[senderProfile.id],
      player_id: globalPlayerID[senderProfile.id],
      player_ign: globalPlayerIGN[senderProfile.id],
      trans_ref: globalTransactionRef[senderProfile.id],
      payment_method: globalPaymentMethod[senderProfile.id],
      total_price: globalTotalPrice[senderProfile.id]
    }

  /*orderDetails = {
    order_id: 12345,
    product_name: "UC",
    product_desc: "PUBG Mobile Unknown Cash (Global)",
    product_quantity: 60,
    player_id: 563361811,
    player_ign: LCDPシRio,
    trans_ref: 555270421,
    payment_method: MVola,
    total_price: 20000
  }*/

  callClickSendSMSAPI(senderProfile, orderDetails)
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

// Sets Page Level Persistent Menu via API
function togglePersistentMenu(status) {
  let persistentMenu = {
    "persistent_menu": [
      {
        "locale": "default",
        "composer_input_disabled": false,
        "call_to_actions": [
          {
              "type": "postback",
              "title": "Acheter des UC",
              "payload": "want_to_buy_uc_yes"
          },
          {
              "type": "postback",
              "title": "Parler à un membre de la Team",
              "payload": "talk_to_member"
          }
        ]
      }
    ]
  }

  let removePersistentMenu = {
    data: {
    "fields": ["persistent_menu"]
    }
  }

  // The page access token we have generated in your app settings
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
  const options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: '/v10.0/me/messenger_profile?access_token=' + PAGE_ACCESS_TOKEN,
      method: 'POST'
  }

  if (status === 'on') {
    // Send the HTTP request to the Messenger Platform
    console.log('Start sending HTTPS Request to https://' + options.hostname + options.path);
    axios
      .post('https://' + options.hostname + options.path,
      persistentMenu).then((res)=> {
        console.log('Persistent Menu Setted !');
      })
      .catch(err => {
        console.error('Unable to turn on Persistent Menu : ' + err);
      });
  } else if (status === 'off') {
    console.log('Start sending HTTPS Request to https://' + options.hostname + options.path);
    axios
      .delete('https://' + options.hostname + options.path,
      removePersistentMenu).then((res)=> {
        console.log('Persistent Menu Unsetted !');
      })
      .catch(err => {
        console.error('Unable to turn off Persistent Menu : ' + err);
      });
  }
}

// Sets User Level Persistent Menu via API
function togglePersistentMenuForUser(senderProfile, status) {
  let persistentMenu = {
    "psid": senderProfile.id,
    "persistent_menu": [
      {
        "locale": "default",
        "composer_input_disabled": true,
        "call_to_actions": [
          {
              "type": "postback",
              "title": "Acheter des UC",
              "payload": "buy_uc"
          },
          {
              "type": "postback",
              "title": "Parler à un membre de la Team",
              "payload": "talk_to_member"
          },
          {
              "type": "postback",
              "title": "Wiki PUBG Mobile",
              "payload": "view_wiki_pubg_mobile"
          }
        ]
      }
    ]
  }

  // The page access token we have generated in your app settings
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
  const options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: '/v10.0/me/custom_user_settings?access_token=' + PAGE_ACCESS_TOKEN,
      delete_path: '/v10.0/me/custom_user_settings?psid=' + senderProfile.id + '&params=[%22persistent_menu%22]&access_token=' + PAGE_ACCESS_TOKEN,
      method: 'POST'
  }

  if (status === 'on') {
    // Send the HTTP request to the Messenger Platform
    console.log('Start sending HTTPS Request to https://' + options.hostname + options.path);
    axios
      .post('https://' + options.hostname + options.path,
      persistentMenu).then((res)=> {
        console.log('User Persistent Menu Setted !');
      })
      .catch(err => {
        console.error('Unable to turn on User Persistent Menu : ' + err);
      });
  } else if (status === 'off') {
    console.log('Start sending HTTPS Request to https://' + options.hostname + options.delete_path);
    axios
      .delete('https://' + options.hostname + options.delete_path)
      .then((res)=> {
        console.log('User Persistent Menu Unsetted !');
      })
      .catch(err => {
        console.error('Unable to turn off User Persistent Menu : ' + err);
      });
  }
}

  module.exports = {
    handleMessage: handleMessage,
    handlePostback: handlePostback,
    startConversation: startConversation,
    getUserProfile: getUserProfile
};