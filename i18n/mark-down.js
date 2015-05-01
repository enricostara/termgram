//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// import the dependencies
require('colors');
var boldEx = /\*\*(.+?)\*\*/g;
var emEx = /_(.+?)_/g;

module.exports = function (i18n) {
    return convert(i18n);
};

function convert(obj) {
    for (var propertyName in obj) {
        var value = obj[propertyName];
        //console.log(propertyName + ': ' + value);
        switch (typeof value) {
            case 'string':
                obj[propertyName] = value.replace(boldEx, '$1'.bold).replace(emEx, '$1'.underline);
                break;
            default:
                obj[propertyName] = convert(value);
        }
    }
    return obj;
}