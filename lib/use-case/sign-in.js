//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// import the dependencies
require('requirish')._(module);
require('colors');
var clientProxy = require('lib/client-proxy');
var ui = require('lib/user-interface');
var UserData = require('lib/user-data');
var i18n = require('i18n/en-US');
var getLogger = require('get-log');
var logger = getLogger('use-case.sign-in');
var userData;

function signIn(users) {
    return new Promise(function (fulfill, reject) {
        console.log(i18n.signIn.info);
        askUsername(users).then(function (username) {
            userData = UserData.loadUser(username);
            logger.info('User %s data loaded', username, userData);
            askPassword(username).then(function () {
                console.log(i18n.signIn.welcome, username);
                var clientPromise = clientProxy.createClientForUser(userData.getDataCenter());
                clientPromise.then(function () {
                    try{
                        clientProxy.getClient().contacts.getContacts('').then(function(contacts) {
                            console.log('contacts:', contacts.toPrintable());
                            fulfill();
                        }, reject);
/*
                        clientProxy.getClient().updates.getState().then(function(state) {
                            console.log('state:', state.toPrintable());
                            fulfill();
                        }, reject);
*/
                        console.log('client created');
                    } catch (e) {
                        reject(e)
                    }
                });
            }, reject)
        }, function () {
            ui.askConfirmationInput(i18n.signIn.ask_signUp, true).then(
                function () {
                    ui.spacer();
                    reject();
                },
                function () {
                    ui.spacer();
                    signIn(users);
                });
        });
    });
}


function askUsername(usernameList) {
    return new Promise(function (fulfill, reject) {
        ui.askWordInput(i18n.signIn.ask_username, process.env.USER).then(function (username) {
            if (usernameList.indexOf(username) < 0) {
                reject();
            } else {
                fulfill(username);
            }
        });
    })
}

var attempts = 3;
function askPassword() {
    return new Promise(function (fulfill, reject) {
        var authKeyBuffer = userData.getAuthKey();
        (function ask() {
            ui.askPasswordInput(i18n.signIn.ask_password).then(function (password) {
                var authKey = clientProxy.setAuthKey(authKeyBuffer, password);
                if (!authKey) {
                    if (--attempts > 0) {
                        ask();
                    } else {
                        reject(new Error('User failed to authenticate after 3 attempts.'));
                    }
                } else {
                    fulfill()
                }
            });
        })();
    })
}


// export the services
module.exports = exports = signIn;