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
                    askPhoneNumberToSendCode().then(function (result) {
                        console.log('sendCode result:', result.sendCodeResult.toPrintable());
                        // ask the received code
                        askAuthCode(result.phoneNumber, result.sendCodeResult.phone_code_hash).then(function () {
                            console.log('signIn result:', signInResult ? signInResult.toPrintable() : signInResult);
                            fulfill(signInResult);

                            //if (result.sendCodeResult.phone_registered) {
                            //} else {
                            //    fulfill(result);
                            //}

                        }, reject);
                    });
                }, reject);
            });
        }, reject);
    });
};


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

function askPhoneNumberToSendCode() {
    return new Promise(function (fulfill, reject) {
        console.log(i18n.signUp.ask_phoneNumber_info);
        (function askPhone() {
            ui.askPhoneInput(i18n.signUp.ask_phoneNumber).then(function (phoneNumber) {
                console.log('phoneNumber: %s', phoneNumber);
                clientProxy.sendCodeToPhone(phoneNumber).then(function (result) {
                    fulfill({phoneNumber: phoneNumber, sendCodeResult: result});
                }, function (error) {
                    console.log(i18n.signUp['error_' + error.message], phoneNumber);
                    if (error.message == 'PHONE_NUMBER_INVALID') {
                        askPhone();
                    } else {
                        reject(error);
                    }
                })
            });
        })();
    });
}

function askAuthCode(phoneNumber, phone_code_hash) {
    return new Promise(function (fulfill, reject) {
        (function askCode() {
            ui.askNumericInput(i18n.signUp.ask_authorizationCode).then(function (code) {
                // check if the authorization is valid
                clientProxy.signIn(
                    phoneNumber,
                    phone_code_hash,
                    code).then(function (result) {
                        fulfill(result);
                    }, function (error) {
                        console.log(i18n.signUp['error_' + error.message], code);
                        if (error.message == 'PHONE_CODE_INVALID') {
                            askCode();
                        } else if (error.message == 'PHONE_NUMBER_UNOCCUPIED') {
                            fulfill();
                        } else {
                            reject(error);
                        }
                    });
            });
        })();
    });
}

// export the services
module.exports = exports = signUp;