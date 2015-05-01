//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// import the dependencies
var telegramLink = require('telegram.link')(false);
var getLogger = require('get-log');
var logger = getLogger('client-factory');

// set the  environment
var app = {
    // NOTE: if you FORK the project you MUST use your APP ID.
    // Otherwise YOUR APPLICATION WILL BE BLOCKED BY TELEGRAM
    // You can obtain your own APP ID for your application here: https://my.telegram.org
    id: 19896,
    hash: 'b43316c048960d6a599d4fe3497c3610',
    version: '0.0.1',
    lang: 'en'
};
var primaryDC = telegramLink.TEST_PRIMARY_DC;

var client;

function createAuthorizationForNewUser() {
    if(client) {
        throw new Error('Authorization already created.')
    }
    return new Promise(function (fulfill, reject) {
        client = telegramLink.createClient(app, primaryDC, function () {
            logger.info('Start to create the auth-key..');
            client.createAuthKey(function (auth) {
                fulfill(auth);
            });
        });
        client.once(telegramLink.EVENT.ERROR, reject);
    });
}

function sendCodeToPhone(phoneNumber) {
    if(!client) {
        throw new Error('Client is not initialized!');
    }
    return new Promise(function (fulfill, reject) {
        client.once(telegramLink.EVENT.ERROR, reject);
        client.sendCodeToPhone(phoneNumber, function (result) {
            fulfill(result);
        });
    });
}

// export the services
exports.createAuthorizationForNewUser = createAuthorizationForNewUser;
exports.sendCodeToPhone = sendCodeToPhone;
