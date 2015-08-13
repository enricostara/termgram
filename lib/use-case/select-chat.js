//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// import the dependencies
require('requirish')._(module);
require('colors');

var api = require('telegram.link')();
var clientProxy = require('lib/client-proxy');
var ui = require('lib/user-interface');
var i18n = require('i18n/en-US');
var getLogger = require('get-log');
var logger = getLogger('use-case.select-chat');

function selectChat() {
    return new Promise(function (fulfill, reject) {
        ui.spinner();
        try {
            clientProxy.getClient().messages.getDialogs(0, 0, 0).then(function (container) {
                try {
                    ui.spinner();
                    var total = container && container.dialogs && container.dialogs.list ? container.dialogs.list.length : 0;
                    logger.info('Chat list retrieved, total chats ', total);
                    if (total > 0) {
                        ui.hRule();
                        console.log('\t' + i18n.selectChat.list);
                        ui.spacer();
                        var peers = {};
                        for (var index = total - 1; index >= 0; index--) {
                            peers[index] = renderChat(container, index);
                            ui.spacer();
                        }
                        ui.askNumericInput(i18n.selectChat.choose_chat, '1').then(function (index) {
                            logger.info('Selected chat:', index);
                            fulfill(peers[index - 1]);
                        });
                    } else {
                        console.log(i18n.selectChat.noChatAvailable);
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

function renderChat(container, index) {
    var dialog = container.dialogs.list[index];
    var unreadCount = dialog.unread_count > 0 ? ('(' + dialog.unread_count + ')').bold : '';
    var message = container.messages.getById(dialog.top_message);
    var msgText = message.media.instanceOf('api.type.MessageMediaEmpty') ? message.message : '[image]';
    var maxLength = 50;
    msgText = msgText.length > maxLength ? msgText.slice(0, maxLength - 3) + '...' : msgText;

    var user;
    var title;
    var peer = dialog.peer;
    var inputPeer;
    if (peer.instanceOf('api.type.PeerChat')) {
        var chat = container.chats.getById(peer.chat_id);
        title = chat.title;
        user = container.users.getById(message.from_id);
        inputPeer = new api.type.InputPeerChat();
        inputPeer.chat_id = peer.chat_id;
    } else if (peer.instanceOf('api.type.PeerUser')) {
        user = container.users.getById(peer.user_id);
        inputPeer = retrieveInputPeer(user);
    } else {
        throw new Error('Unknown peer type ' + peer.getTypeName());
    }

    var userName = user.instanceOf('api.type.UserSelf') ?
        i18n.selectChat.userSelfName :
        (user.first_name + ' ' + user.last_name);
    title = title ? title.bold + ' - ' + userName : userName.bold;

    ui.option(index + 1, title + '  ' + unreadCount);
    console.log('\t\t' + msgText);
    return inputPeer;
}

function retrieveInputPeer(user) {
    var inputPeer;
    if (user.instanceOf('api.type.UserContact')) {
        inputPeer = new api.type.InputPeerContact();
        inputPeer.user_id = user.id;
    } else if (user.instanceOf('api.type.UserRequest') || user.instanceOf('api.type.UserForeign')) {
        inputPeer = new api.type.InputPeerForeign();
        inputPeer.user_id = user.id;
        inputPeer.access_hash = user.access_hash;
    } else {
        throw new Error('Unknown user type ' + user.getTypeName());
    }
    return inputPeer;
}

// export the services
module.exports = exports = selectChat;