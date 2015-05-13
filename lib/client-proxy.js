//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// import the dependencies
var telegramLink = require('telegram.link')();
var getLogger = require('get-log');
var logger = getLogger('client-factory');
var os = require('os');

// set the  environment
var app = {
    // NOTE: if you FORK the project you MUST use your APP ID.
    // Otherwise YOUR APPLICATION WILL BE BLOCKED BY TELEGRAM
    // You can obtain your own APP ID for your application here: https://my.telegram.org
    id: 19896,
    hash: 'b43316c048960d6a599d4fe3497c3610',
    version: require('../package.json').version,
    lang: 'en',
    deviceModel: os.type().replace('Darwin', 'OS_X'),
    systemVersion: os.platform() + '/' + os.release()
};

var primaryDC = telegramLink.TEST_PRIMARY_DC;
//var primaryDC = telegramLink.PROD_PRIMARY_DC;

var client;

function createAuthorizationForNewUser() {
    if(client) {
        throw new Error('Authorization key already created.')
    }
    return new Promise(function (fulfill, reject) {
        client = telegramLink.createClient(app, primaryDC, function () {
            logger.info('Start to create the auth-key..');
            client.createAuthKey(function (auth) {
                retrieveDataCenters(function() {
                    fulfill(auth);
                });
            });
        });
        client.once('error', reject);
    });
}

function sendCodeToPhone(phoneNumber) {
    if(!client) {
        throw new Error('Client is not initialized!');
    }
    return new Promise(function (fulfill, reject) {
        client.once('error', reject);
        client.sendCodeToPhone(phoneNumber, function (result) {
            fulfill(result);
        });
    });
}

function retrieveDataCenters(callback) {
    client.getDataCenters(function (resObj) {
        console.log('data-center map: ', resObj.toPrintable());
        callback();
    })

}

// export the services
exports.createAuthorizationForNewUser = createAuthorizationForNewUser;
exports.sendCodeToPhone = sendCodeToPhone;
