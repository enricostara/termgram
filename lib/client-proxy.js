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

//var primaryDC = telegramLink.TEST_PRIMARY_DC;
var primaryDC = telegramLink.PROD_PRIMARY_DC;
var realClient;
var dataCenters;
var authKey;

function createClientForNewUser() {
    if (realClient) {
        throw new Error('Authorization key already created.')
    }
    return new Promise(function (fulfill, reject) {
        var client = createClient(primaryDC, function () {
            client.getDataCenters(function (dcs) {
                dataCenters = dcs;
                logger.info('Data centers: ', dataCenters.toPrintable());
                 //check if the current data-center is also the nearest one
                if (dataCenters.current != dataCenters.nearest) {
                    var newDc = dataCenters[dataCenters.nearest];
                    logger.info('Change the current data-center with the nearest one %s = %s:%s', dataCenters.nearest, newDc.host, newDc.port);
                    client = createClient(newDc, fulfill, reject);
                } else {
                    fulfill();
                }
            });
        }, reject);
    });
}

function sendCodeToPhone(phoneNumber) {
    if (!realClient) {
        throw new Error('Client is not initialized!');
    }
    var client = realClient;
    return new Promise(function (fulfill, reject) {
        client.once('error', reject);
        client.sendCodeToPhone(phoneNumber, function (result) {
            // check if the phone number requires a different data-center (PHONE_MIGRATE_X)
            if('mtproto.type.Rpc_error' == result.typeName) {
                console.log(result.toPrintable());
                switch (result.error_code) {
                    case 303:
                        var requiredDCName = 'DC_' + result.error_message.slice(-1);
                        logger.info('The phone number %s requires the data-center %s', phoneNumber,  requiredDCName);
                        var requiredDC = dataCenters[requiredDCName];
                        client = createClient(requiredDC, function() {
                            client.sendCodeToPhone(phoneNumber, fulfill);
                        }, reject);
                        break;
                    case 400:
                        reject(new Error(result.error_code));
                        break;
                    default :
                        reject(new Error(result.error_message));
                }
            } else {
                fulfill(result);
            }
        });
    });
}

function createClient(dataCenter, fulfill, reject) {
    if(realClient) {
        realClient.end();
    }
    logger.info('Start to create the client connecting to DC %s:%s..', dataCenter.host, dataCenter.port);
    var client = telegramLink.createClient(app, dataCenter, function () {
        logger.info('Start to create the auth-key..');
        client.createAuthKey(function (auth) {
            logger.info('..the auth-key [%s] was created, the client is now ready.', auth.key.id.toString('hex'));
            authKey = auth.key;
            fulfill();
        });
    });
    client.once('error', reject);
    realClient = client;
    logger.info('..client created.');
    return client;
}

function getAuthKey() {
    return authKey;
}


// export the services
exports.createClientForNewUser = createClientForNewUser;
exports.sendCodeToPhone = sendCodeToPhone;
exports.getAuthKey = getAuthKey;
