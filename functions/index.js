const functions = require('firebase-functions');
//admin sdk
const admin = require('firebase-admin');

///intitalize the admin sdk 
admin.initializeApp();

//notification function 

exports.sendNotificationOnReservation = functions.database.ref('/ReservedItems/{resrverid}/ownerID/{ownerid}').onWrite(event => {

    const ownerid = event.params.ownerid;
    const resrverid = event.params.resrverid;

    if(!event.data.exists()){
        return;
    }

    const getDeviceToken = admin.database().ref('UsersToken/${ownerid}/token').once('value');
    const getRervationInfo = admin.database().ref('wear/${resrverid}/').once('value');

    return Promise.all([getDeviceToken,getRervationInfo]).then(results => {
        const tokenSnapshot = results[0];
        const reserver = results[1];

        if(!token.hasChildren()){
            return console.log('no notification token');
        }

        const reserverName = reserver.val().FirstName;

        console.log('follower', reserverName);


        //notification detalis 
        const payload = {
            data:{
                title: 'your item has been reserved',
                body: '${reserverName} has reserved your item'
            }
        };

        const token = Object.keys(tokenSnapshot.val());

        return admin.messaging().sendToDevice(token, payload).then(response => {
            const tokensToRemove = [];

            response.results.forEach((result, index)=>{
                const error = result.error;
                if(error){
                    console.error('fail', token[index],error);
                    // Cleanup the tokens who are not registered anymore.
                    if (error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/registration-token-not-registered') {
                             tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
                    }
                }
            });
            return Promise.all(tokensToRemove);
                });
            });
        });

