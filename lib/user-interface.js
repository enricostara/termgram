//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// import the dependencies
require('requirish')._(module);
var outStream = new (require('mute-stream'))({replace: '*'});
outStream.pipe(process.stdout);
require('colors');
var i18n = require('i18n/en-US');
var rl = require('readline').createInterface(process.stdin, outStream);
var events = new (require('events').EventEmitter);


function askWordInput(question, defaultAnswer) {
    return new Promise(function (fulfill) {
        ask(question, defaultAnswer, /^[\w\+]+$/, i18n.ui.error.askWord, function (answer) {
            fulfill(answer);
        })
    });
}

function askPasswordInput(question, regEx) {
    return new Promise(function (fulfill, reject) {
        rl.setPrompt(question + ': ');
        rl.prompt();
        outStream.mute();
        rl.once('line',  function (password) {
            outStream.unmute();
            if (!regEx) {
                fulfill(password);
            } else if (password.match(regEx)) {
                fulfill(password);
            } else {
                console.log(i18n.ui.error.askPassword);
                reject();
            }
        });
    });
}

function askNumericInput(question, defaultAnswer) {
    return new Promise(function (fulfill) {
        ask(question, defaultAnswer, /^\d+$/, i18n.ui.error.askNumeric, function (answer) {
            fulfill(answer);
        })
    });
}

function askPhoneInput(question, defaultAnswer) {
    return new Promise(function (fulfill) {
        ask(question, defaultAnswer, /^(\+|00)\d{5,}$/, i18n.ui.error.askPhone, function (answer) {
            fulfill(answer);
        })
    });
}

function ask(question, defaultAnswer, regex, errorMsg, callback) {
    var postfix = defaultAnswer ? ' (' + defaultAnswer.underline + ')' : '';
    rl.question(question + postfix + ': ', function (answer) {
        if (defaultAnswer && answer.length === 0) {
            callback(defaultAnswer);
        } else if (answer.match(regex)) {
            callback(answer);
        } else {
            console.log(errorMsg);
            ask(question, defaultAnswer, regex, errorMsg, callback);
        }
    });
}

function askConfirmationInput(question, defaultYes) {
    return new Promise(function (fulfill, reject) {
        var postfix = defaultYes === undefined ? i18n.ui.askConfirmation :
            (defaultYes === false ? i18n.ui.askConfirmation_defaultNo : i18n.ui.askConfirmation_defaultYes);
        rl.question(question + ' (' + postfix + '): ', function (answer) {
            if (defaultYes !== undefined && answer.length === 0) {
                if (defaultYes) {
                    fulfill();
                } else {
                    reject();
                }
            } else if (answer.match(/^y(es)?$/i)) {
                fulfill();
            } else {
                reject();
            }
        });
    });
}

function spacer(rows) {
    var spacer = '';
    if (rows) {
        for (var i = 1; i < rows; i++) {
            spacer += '\n';
        }
    }
    console.log(spacer);
}

function hRule() {
    console.log('________________________________________\n');
}

var interval;
function spinner() {
    if(interval) {
        clearInterval(interval);
        outStream.write(' \b');
        rl.resume();
        return;
    }
    var chars = ['\\', '|', '/', '-'];
    var i = 0;
    interval = setInterval(function () {
        outStream.write(chars[i++ % 4]);
        outStream.write('\b');
    }, 200);
    rl.pause();
}

function option(key, msg) {
    console.log('\t[ ' + ('' + key).bold.cyan + ' ] ' + msg);
}


rl.on('SIGINT', function () {
    events.emit(exports.EVENT.EXIT);
});

function close() {
    rl.close();
}

exports.askWordInput = askWordInput;
exports.askPasswordInput = askPasswordInput;
exports.askNumericInput = askNumericInput;
exports.askPhoneInput = askPhoneInput;
exports.askConfirmationInput = askConfirmationInput;
exports.spacer = spacer;
exports.hRule = hRule;
exports.spinner = spinner;
exports.option = option;
exports.close = close;
exports.events = events;
exports.EVENT = {
    EXIT: 'exit'
};
