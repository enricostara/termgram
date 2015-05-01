//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// import the dependencies
var fs = require('fs');
var fileResolver = /^\.(\w+)\.user$/;
var baseFolder = '.';

function retrieveUserList() {
    var list = fs.readdirSync(baseFolder);
    list = list.map(function (value) {
        var match = value.match(fileResolver);
        return (match ? match[1] : null);
    }).filter(function (value) {
        return value
    });
    return list;
}

function setBaseFolder(folder) {
    baseFolder = folder;
}

exports.retrieveUserList = retrieveUserList;
exports.setBaseFolder = setBaseFolder;

