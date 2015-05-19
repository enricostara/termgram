//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// import the dependencies
require('requirish')._(module);
require('colors');
var clientProxy = require('lib/client-proxy');
var ui = require('lib/user-interface');
var userData = require('lib/user-data');
var i18n = require('i18n/en-US');
var getLogger = require('get-log');
var logger = getLogger('sign-up');

// constants
var PASSWORD_TYPE = {
    SIMPLE: '1',
    STRONG: '2'
};

function signUp(users) {
    return new Promise(function (fulfill, reject) {
        console.log(i18n.signUp.info);
        ui.spacer();
        askUsername(users, function (user) {
            ui.spacer();
            console.log(i18n.signUp.choose_username_hello, user);
            var clientPromise = clientProxy.createClientForNewUser();
            askPassword(function (password) {
                console.log(i18n.signUp.auth_inProgress);
                ui.spinner();
                clientPromise.then(function () {
                    ui.spinner();
                    ui.spacer();
                    askPhoneNumber().then(function (phoneNumber) {
                        console.log('password: %s', password);
                        console.log('phoneNumber: %s', phoneNumber);
                        clientProxy.sendCodeToPhone(phoneNumber).then(function (result) {
                            console.log('sendCode result:', result.toPrintable());
                            fulfill(result);
                        }, function (error) {
                            reject(error);
                        });
                    });
                }, function (error) {
                    reject(error);
                });
            });
        });
    });
}

function askUsername(users, callback) {
    ui.askWordInput(i18n.signUp.choose_username, process.env.USER).then(function (user) {
        if (user.length < 3 || user.length > 12) {
            console.log(i18n.signUp.choose_username_error);
            ui.spacer();
            askUsername(users, callback);
        } else if (users.indexOf(user) > -1) {
            console.log(i18n.signUp.choose_username_alreadyIn, user);
            ui.spacer();
            askUsername(users, callback);
        } else {
            callback(user);
        }
    });
}

function askPassword(callback) {
    console.log(i18n.signUp.choose_passwordType_answer);
    ui.spacer();
    ui.option(PASSWORD_TYPE.SIMPLE,
        i18n.signUp.choose_passwordType_option_simple + '\n (' + i18n.signUp.choose_passwordType_option_simple_case + ')');
    ui.spacer();
    ui.option(PASSWORD_TYPE.STRONG,
        i18n.signUp.choose_passwordType_option_strong + '\n (' + i18n.signUp.choose_passwordType_option_strong_case + ')');
    ui.spacer();
    (function askType() {
        ui.askNumericInput(i18n.signUp.choose_passwordType, '1').then(function (passwordType) {
            switch (passwordType) {
                case PASSWORD_TYPE.SIMPLE:
                    ui.spacer();
                    console.log('You chose: ' + i18n.signUp.choose_passwordType_option_simple);
                    (function askSimple() {
                        askTwice(i18n.signUp.choose_password_simple,
                            i18n.signUp.choose_password_retype, /^\d{4}$/).then(callback, askSimple);
                    })();
                    break;
                case PASSWORD_TYPE.STRONG:
                    ui.spacer();
                    console.log(i18n.signUp.choose_passwordType_chose + ' ' + i18n.signUp.choose_passwordType_option_strong);
                    (function askStrong() {
                        askTwice(i18n.signUp.choose_password_strong,
                            i18n.signUp.choose_password_retype, /^.{10,}$/).then(callback, askStrong);
                    })();
                    break;
                default:
                    askType();
            }
        });
    })();
    function askTwice(question, retypeQuestion, regEx) {
        return new Promise(function (fulfill, reject) {
            ui.askPasswordInput(question, regEx).then(function (password) {
                ui.askPasswordInput(retypeQuestion, regEx).then(function (password2) {
                    if (password == password2) {
                        fulfill(password);
                    } else {
                        console.log(i18n.signUp.choose_password_retype_error);
                        ui.spacer();
                        reject();
                    }
                }, function () {
                    ui.spacer();
                    reject();
                });
            }, function () {
                ui.spacer();
                reject();
            });
        });
    }
}

function askPhoneNumber() {
    return new Promise(function (fulfill) {
        console.log(i18n.signUp.give_phoneNumber_info);
        ui.askPhoneInput(i18n.signUp.give_phoneNumber).then(fulfill);
    });
}

// export the services
module.exports = exports = signUp;