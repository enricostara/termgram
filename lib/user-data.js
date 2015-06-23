//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// import the dependencies
var fs = require('fs');
var util = require('util');
var fileResolver = /^\.(\w+)\.user$/;
var baseFolder = '.';


function UserData(data) {
    util._extend(this, data);
}

UserData.prototype.setDataCenter = function (dataCenter) {
    this.dataCenter = dataCenter;
};

UserData.prototype.getDataCenter = function () {
    return this.dataCenter;
};

UserData.prototype.setAuthKey = function (authKeyBuffer) {
    this.authKey = authKeyBuffer.toString('base64');
};

UserData.prototype.getAuthKey = function () {
    return this.authKey ? new Buffer(this.authKey, 'base64') : null;
};

UserData.prototype.save = function () {
    var filePath = baseFolder + '/.' + this.name + '.user';
    var ws = fs.createWriteStream(filePath);
    ws.write(JSON.stringify(this));
    ws.end();
};

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

function loadUser(username) {
    var filePath = baseFolder + '/.' + username + '.user';
    return new UserData(JSON.parse(fs.readFileSync(filePath)));
}

function setBaseFolder(folder) {
    baseFolder = folder;
}

module.exports = exports = UserData;
exports.retrieveUsernameList = retrieveUsernameList;
exports.loadUser = loadUser;
exports.setBaseFolder = setBaseFolder;

