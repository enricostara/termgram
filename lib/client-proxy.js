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
    //,connectionType: 'TCP'
};

//var primaryDC = telegramLink.TEST_PRIMARY_DC;
var primaryDC = telegramLink.PROD_PRIMARY_DC;

var client;
var dataCenters;
var authKey;

function createClientForUser(dataCenter) {
    if (client) {
        throw new Error('Authorization key already created.')
    }
    return new Promise(function (fulfill, reject) {
        client = createClient(dataCenter || primaryDC, function () {
            client.once('error', reject);
            if(!dataCenter) {
                logger.info('Look for the nearest data centers..');
                client.getDataCenters(function (dcs) {
                    client.removeListener('error', reject);
                    dataCenters = dcs;
                    logger.info('Data centers: ', dataCenters.toPrintable());
                    //check if the current data-center is also the nearest one
                    if (dataCenters.current != dataCenters.nearest) {
                        var newDc = dataCenters[dataCenters.nearest];
                        logger.info('Change the current data-center with the nearest one %s = %s:%s', dataCenters.nearest, newDc.host, newDc.port);
                        authKey = null;
                        client = createClient(newDc, fulfill, reject);
                    } else {
                        fulfill(dataCenters[dataCenters.current]);
                    }
                });
            } else {
                fulfill(dataCenter);
            }
        }, reject);
    });
}

function sendCodeToPhone(phoneNumber) {
    return new Promise(function (fulfill, reject) {
        client.once('error', reject);
        client.auth.sendCode(phoneNumber, 5, 'en', function (result) {
            if (result.instanceOf('mtproto.type.Rpc_error')) {
                switch (result.error_code) {
                    // check if the phone number requires a different data-center (PHONE_MIGRATE_X)
                    case 303:
                        var requiredDCName = 'DC_' + result.error_message.slice(-1);
                        logger.info('The phone number %s requires the data-center %s', phoneNumber, requiredDCName);
                        var requiredDC = dataCenters[requiredDCName];
                        client = createClient(requiredDC, function () {
                            client.sendCodeToPhone(phoneNumber, fulfill);
                        }, reject);
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

function signIn(phoneNumber, codeHash, code) {
    return new Promise(function (fulfill, reject) {
        client.once('error', reject);
        client.auth.signIn(phoneNumber, codeHash, code, function (result) {
            if (result.instanceOf('mtproto.type.Rpc_error')) {
                if (result.error_message == 'PHONE_NUMBER_UNOCCUPIED') {
                    fulfill(result);
                } else {
                    reject(new Error(result.error_message));
                }
            } else {
                fulfill(result);
            }
        });
    });
}


function getClient() {
    return client;
}

function createClient(dataCenter, fulfill, reject) {
    if (client) {
        client.end();
        client = null;
    }
    logger.info('Start to create the client connecting to DC %s:%s..', dataCenter.host, dataCenter.port);
    var newClient = telegramLink.createClient(app, dataCenter, function () {
        if (!authKey) {
            logger.info('Start to create the auth-key..');
            newClient.createAuthKey(function (auth) {
                logger.info('..the auth-key [%s] was created, the client is now ready.', auth.key.id.toString('hex'));
                authKey = auth.key;
                fulfill(dataCenter);
            });
        } else {
            logger.info('auth-key already set');
            fulfill(dataCenter);
        }

    });
    newClient.once('error', reject);
    logger.info('..client created.');
    return newClient;
}

function getAuthKey() {
    return authKey;
}

function setAuthKey(authKeyBuffer, password) {
    authKey = telegramLink.retrieveAuthKey(authKeyBuffer, password);
    app.authKey = authKey;
    return authKey;
}

// export the services
exports.createClientForUser = createClientForUser;
exports.sendCodeToPhone = sendCodeToPhone;
exports.signIn = signIn;
exports.getAuthKey = getAuthKey;
exports.setAuthKey = setAuthKey;
exports.getClient = getClient;
