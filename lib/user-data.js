//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// import the dependencies
var fs = require('fs');
var fileResolver = /^\.(\w+)\.user$/;
var baseFolder = '.';

function retrieveUsernameList() {
    var list = fs.readdirSync(baseFolder);
    list = list.map(function (value) {
        var match = value.match(fileResolver);
        return (match ? match[1] : null);
    }).filter(function (value) {
        return value
    });
    return list;
}

function saveUserAuthKey(username, authKeyBuffer) {
    var filePath = baseFolder + '/.' + username + '.user';
    var ws = fs.createWriteStream(filePath);
    ws.write(authKeyBuffer);
    ws.end();
}

function setBaseFolder(folder) {
    baseFolder = folder;
}

exports.retrieveUsernameList = retrieveUsernameList;
exports.saveUserAuthKey = saveUserAuthKey;
exports.setBaseFolder = setBaseFolder;

