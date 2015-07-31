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
var logger = getLogger('use-case.sign-up');

// constants
var PASSWORD_TYPE = {
    SIMPLE: '1',
    STRONG: '2'
};

function signUp(users) {
    return new Promise(function (fulfill, reject) {
        console.log(i18n.signUp.info);
        ui.spacer();
        askUsername(users, function (username) {
            logger.info('New user name: %s', username);
            var userData = new UserData({name: username});
            ui.spacer();
            console.log(i18n.signUp.choose_username_hello, username);
            var clientPromise = clientProxy.createClientForUser();
            askPassword(function (password) {
                console.log(i18n.signUp.auth_inProgress);
                ui.spinner();
                clientPromise.then(function (dataCenter) {
                    userData.setDataCenter(dataCenter);
                    ui.spinner();
                    ui.spacer();
                    askPhoneNumberToSendCode().then(function (res) {
                        logger.info('Send code to phone number response: %s', res.sendCodeRes.toPrintable());
                        // ask the received code
                        askAuthCode(res.phoneNumber, res.sendCodeRes.phone_code_hash).then(function (authCodeRes) {
                            function saveUser(signUpRes) {
                                try {
                                    var authKeyBuffer = clientProxy.getAuthKey().encrypt(password);
                                    userData.setAuthKey(authKeyBuffer);
                                    userData.save();
                                    logger.info('User data saved');
                                    fulfill(signUpRes);
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            logger.info('Auth code response: %s', authCodeRes.res.toPrintable());
                            if (res.sendCodeRes.phone_registered) {
                                saveUser(authCodeRes);
                            } else {
                                askFirstLastName(res.phoneNumber, res.sendCodeRes.phone_code_hash, authCodeRes.code).then(function(firstLastNamesRes) {
                                    saveUser(firstLastNamesRes);
                                }, reject)
                            }
                        }, reject);
                    });
                }, reject);
            });
        }, reject);
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

function askPhoneNumberToSendCode() {
    return new Promise(function (fulfill, reject) {
        console.log(i18n.signUp.ask_phoneNumber_info);
        (function askPhone() {
            ui.askPhoneInput(i18n.signUp.ask_phoneNumber).then(function (phoneNumber) {
                logger.info('Phone number: %s', phoneNumber);
                ui.spinner();
                clientProxy.sendCodeToPhone(phoneNumber).then(function (res) {
                    ui.spinner();
                    fulfill({
                        phoneNumber: phoneNumber,
                        sendCodeRes: res
                    });
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

function askAuthCode(phoneNumber, code_hash) {
    return new Promise(function (fulfill, reject) {
        (function askCode() {
            ui.askNumericInput(i18n.signUp.ask_authorizationCode).then(function (code) {
                ui.spinner();
                // check if the authorization is valid
                clientProxy.signIn(
                    phoneNumber,
                    code_hash,
                    code).then(function (res) {
                        ui.spinner();
                        fulfill({
                            code: code,
                            res: res
                        });
                    }, function (error) {
                        console.log(i18n.signUp['error_' + error.message], code);
                        if (error.message == 'PHONE_CODE_INVALID') {
                            askCode();
                        } else {
                            reject(error);
                        }
                    });
            });
        })();
    });
}

function askFirstLastName(phoneNumber, code_hash, code) {
    return new Promise(function (fulfill, reject) {
        console.log(i18n.signUp.phone_unregistered);
        (function askNames() {
            ui.askWordInput(i18n.signUp.choose_firstName).then(function (firstName) {
                ui.askWordInput(i18n.signUp.choose_lastName).then(function (lastName) {
                    ui.spinner();
                    clientProxy.getClient().auth.signUp(
                        phoneNumber,
                        code_hash,
                        code,
                        firstName,
                        lastName
                    ).then(function (res) {
                            ui.spinner();
                            fulfill(res);
                        }, function (error) {
                            console.log(i18n.signUp['error_' + error.message], code);
                            if (error.message == 'FIRSTNAME_INVALID' || error.message == 'LASTNAME_INVALID') {
                                askNames();
                            } else {
                                reject(error);
                            }
                        });
                });
            });
        })();
    });
}

// export the services
module.exports = exports = signUp;