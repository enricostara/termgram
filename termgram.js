//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// clear the term
clearTerminal();

// setup the fs
var fs = require('fs');
var userHome = (process.env.HOME || process.env.USERPROFILE) + '/.termgram';
var logFolder = userHome + '/log';
try {
    fs.mkdirSync(userHome, '0770');
    fs.mkdirSync(logFolder, '0770');
} catch (e) {
}

// setup the logger
process.env.LOGGER_FILE = logFolder + '/termgram';
var getLogger = require('get-log');
getLogger.PROJECT_NAME = 'termgram';
var logger = getLogger('main');

// import other dependencies
require('colors');
require('telegram.link')(getSignature());
var ui = require('./lib/user-interface');
var i18n = require('./i18n/en-US');
var signUp = require('./lib/use-case/sign-up');
var signIn = require('./lib/use-case/sign-in');
var Updates = require('./lib/updates');
var selectChat = require('./lib/use-case/select-chat');
var chat = require('./lib/use-case/chat');
var userData = require('./lib/user-data');
userData.setBaseFolder(userHome);


// begin
function main() {
    var users = userData.retrieveUsernameList();
    console.log(i18n.welcome);
    ui.spacer();

    function doSignUp() {
        signUp(users).then(function (res) {
            logger.info('signUp res: %s', res);
            home();
        }, function (error) {
            console.log('signUp error: ', error.stack);
            shutdown();
        });
    }

    // if no users
    if (users.length == 0) {
        logger.info('User list is empty, sign up a new user.');
        doSignUp();
    } else {
        signIn(users).then(function (res) {
            logger.info('signIn res:', res);
            home();
        }, function (error) {
            if (error) {
                console.log('signIn error: ', error.stack);
                shutdown();
            } else {
                doSignUp();
            }
        });
    }
    ui.events.on(ui.EVENT.EXIT, function () {
        ui.askConfirmationInput(i18n.exit, true).then(shutdown, function () {
            console.log('nothing to do, again...')
        });
    });
}

// userHome page
function home() {
    var updates = Updates.getInstance();
    updates.start().then(function() {
        ui.spacer();
        selectChat().then(function (peer) {
            if (peer) {
                ui.spacer();
                chat(peer).then(function () {
                    console.log('nothing to do, now...');
                    shutdown();
                }, function (error) {
                    console.log('chat error: ', error.stack);
                    shutdown();
                });
            } else {
                console.log('No chat selected');
                console.log('nothing to do, now...');
                shutdown();
            }
        }, function (error) {
            console.log('selectChat error: ', error.stack);
            shutdown();
        });

    }, function (error) {
        console.log('update-emitter error: ', error.stack);
        shutdown();
    });
}

// end
function shutdown() {
    ui.close();
    Updates.getInstance().stop();
}

// clear the term
function clearTerminal() {
    process.stdout.write('\033c');
}

// get the application signature
function getSignature() {
    return (' T E R M G R A M '.bold + ' ' + require('./package.json').version ).cyan;
}

// run
main();