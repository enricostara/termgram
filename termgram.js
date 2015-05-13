//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// clear the term
clearTerminal();

// set the logging file name
process.env.LOGGER_FILE = 'log/termgram';

// import the dependencies
require('colors');
require('telegram.link')(getSignature());
var ui = require('./lib/user-interface');
var userData = require('./lib/user-data');
var i18n = require('./i18n/en-US');
var signUp = require('./lib/use-case/sign-up');
var getLogger = require('get-log');
getLogger.PROJECT_NAME = 'termgram';
var logger = getLogger('main');

// begin
function main() {
    var users = userData.retrieveUserList();
    console.log(i18n.welcome);
    ui.spacer();
    // if no users
    if (users.length == 0) {
        logger.info('User list is empty, sign up a new user.');
        signUp(users).then(function () {
            console.log('nothing to do, now...');
            shutdown();
        }, function(error) {
            console.log('signUp error: ', error.stack);
            shutdown();
        });
    }
    ui.events.on(ui.EVENT.EXIT, function () {
        ui.askConfirmationInput(i18n.exit, true).then(shutdown, function () {
            console.log('nothing to do, again...')
        });
    });
}

// end
function shutdown() {
    ui.close();
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