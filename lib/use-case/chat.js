//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// import the dependencies
require('requirish')._(module);
require('colors');

var clientProxy = require('lib/client-proxy');
var ui = require('lib/user-interface');
var i18n = require('i18n/en-US');
var getLogger = require('get-log');
var logger = getLogger('use-case.select-chat');

var OPEN_TOTAL_MESSAGES = 10;
var UPDATE_INTERVAL = 5000;

function chat(peer) {
    return new Promise(function (fulfill, reject) {
        open(peer).then(fulfill, reject);
        //open(peer).then(function (lastMessage) {
        //    isRunning = true;
        //    callUpdate(peer, lastMessage, reject);
        //}, reject);
    });
}

function open(peer) {
    return new Promise(function (fulfill, reject) {
        ui.spinner();
        try {
            clientProxy.getClient().messages.getHistory(peer, 0, 0, OPEN_TOTAL_MESSAGES).then(function (container) {
                try {
                    ui.spinner();
                    // title
                    var title;
                    if (peer.instanceOf('api.type.InputPeerChat')) {
                        title = container.chats.getById(peer.chat_id).title;
                    } else {
                        var user = container.users.getById(peer.user_id);
                        title = user.first_name + ' ' + user.last_name;
                    }
                    ui.hRule();
                    console.log('\t' + title.bold);
                    // messages
                    var total = container && container.messages && container.messages.list ? container.messages.list.length : 0;
                    logger.info('Message list retrieved, total messages ', total);
                    if (total > 0) {
                        var lastMsg = {id: 0, userName: ''};
                        for (var index = total - 1; index >= 0; index--) {
                            lastMsg = renderMessage(container, index, lastMsg.userName);
                        }
                        fulfill(lastMsg);
                    } else {
                        fulfill(null);
                    }
                } catch (e) {
                    reject(e)
                }
            }, reject);
        } catch (e) {
            reject(e)
        }
    });
}


function renderMessage(container, index, lastUserName) {

    // message
    var message = container.messages.list[index];

    if(!message.instanceOf('api.type.Message')) {
        ui.spacer();
        console.log(message.toPrintable());
        // todo: manage the MessageService type
        return lastUserName;
    }

    var msgText = message.media.instanceOf('api.type.MessageMediaEmpty') ? message.message : '[image]';
    // user
    var userName = container.users.getById(message.from_id).first_name;
    // render
    if (userName !== lastUserName) {
        ui.spacer();
        console.log(' ' + userName.bold.cyan);
    }
    console.log(' ' + msgText);
    return {
        id: message.id,
        userName: userName
    };
}


/*
var isRunning = false;
var timeoutId;

function callUpdate(peer, lastMsg, reject) {
    timeoutId = setTimeout(function () {
        if (isRunning) {
            console.log('upd');
            update(peer, lastMsg).then(function (lastestMsg) {
                callUpdate(peer, lastestMsg, reject);
            }, function (error) {
                close();
                reject(error);
            });
        }
    }, UPDATE_INTERVAL)
}
*/


/*
function update(peer, lastMessage) {
    return new Promise(function (fulfill, reject) {
        ui.spinner();
        try {
            try{

            } catch (e) {
                reject(e)
            }

        } catch (e) {
            reject(e)
        }
    });
}
*/

/*
function close() {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    isRunning = false;
}
*/

// export the services
module.exports = exports = chat;