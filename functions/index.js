/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Triggers when a user gets a new follower and sends a notification.
 *
 * Followers add a flag to `/followers/{followedUid}/{followerUid}`.
 * Users save their device notification tokens to `/users/{followedUid}/notificationTokens/{notificationToken}`.
 */
exports.sendFollowerNotification = functions.database.ref('/ReservedItems/{reserverid}/')
    .onWrite(async (change, context) => {
      const reserverid = context.params.reserverid;
      
      // If un-follow we exit the function.
      if (!change.after.val()) {
        return console.log('User ', reserverid, 'un-followed user');
      }


      
      // Get the list of device notification tokens.
      const ID = admin.database().ref(`/ReservedItems/${reserverid}/ownerID`).once('value');
      const userID = await Promise.all([ID]);

      const ownerID = userID[0];

      
  
      console.log('We have a new follower UID:', reserverid, 'for user:', ownerID.val());

      const getDeviceTokensPromise = admin.database().ref(`/UsersToken/${ownerID.val()}/token`).once('value');
      // Get the follower profile.
      const getReseverProfilePromise = admin.database().ref(`/User/${reserverid}`).once('value');
      // The snapshot to the user's tokens.
      let tokensSnapshot;

      // The array containing all the user's tokens.
      let tokens;

      const results = await Promise.all([getDeviceTokensPromise, getReseverProfilePromise]);


      tokensSnapshot = results[0];
      const resever = results[1].val();
      console.log('There are no notification tokens to send to.' + tokensSnapshot + "and " + resever);
      // Check if there are any device tokens.
      //if (!tokensSnapshot.hasChildren()) {
        //return console.log('There are no notification tokens to send to.');
      //}
      console.log('There are', tokensSnapshot.numChildren(), 'tokens to send notifications to.');
      console.log('Fetched follower profile', resever);

      // Notification details.
      const payload = {
        notification: {
          title: 'New Reservation!',
          body: `${resever.userFullName} Reserved your item.`,
        }
      };

      // Listing all tokens as an array.
      //tokens = Object.keys(tokensSnapshot.token.val());
      // Send notifications to all tokens.
      return  admin.messaging().sendToDevice(tokensSnapshot.val(), payload);
      // For each message check if there was an error.
      //const tokensToRemove = [];
      //response.results.forEach((result, index) => {
        //const error = result.error;
        //if (error) {
          //console.error('Failure sending notification to', tokens[index], error);
          // Cleanup the tokens who are not registered anymore.
          //if (error.code === 'messaging/invalid-registration-token' ||
            //  error.code === 'messaging/registration-token-not-registered') {
            //tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
          //}
        //}
      });


      //market items remove from market after 11 hours passed 
 

exports.CancelReservation = functions.https.onRequest((req, res) => {

    const TIME_TO_REMOVE = 11 * 60 * 60 * 10000; // 11 hours
    const nowTime = Date.now();
    const dbRef = admin.database().ref('/ReservedItems'); 

    dbRef.once("value", (snapshot) => {
      snapshot.forEach((child => {
        if((nowTime - Number(child.val()['time'])) >= TIME_TO_REMOVE){
              child.ref.set(null);
      }
      }));    
    });

    return res.status(200).end();
});



  