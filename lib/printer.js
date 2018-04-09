'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = printICUMessage;
var ESCAPED_CHARS = {
    '\\': '\\\\',
    '\\#': '\\#',
    '{': '\\{',
    '}': '\\}'
};

var ESAPE_CHARS_REGEXP = /\\#|[{}\\]/g;

function printICUMessage(ast) {
    return ast.elements.reduce(function (message, el) {
        var format = el.format,
            id = el.id,
            type = el.type,
            value = el.value;


        if (type === 'messageTextElement') {
            return message + value.replace(ESAPE_CHARS_REGEXP, function (char) {
                return ESCAPED_CHARS[char];
            });
        }

        if (!format) {
            return message + ('{' + id + '}');
        }

        var formatType = format.type.replace(/Format$/, '');

        var style = void 0,
            offset = void 0,
            options = void 0;

        switch (formatType) {
            case 'number':
            case 'date':
            case 'time':
                style = format.style ? ', ' + format.style : '';
                return message + ('{' + id + ', ' + formatType + style + '}');

            case 'plural':
            case 'selectOrdinal':
            case 'select':
                offset = format.offset ? ', offset:' + format.offset : '';
                options = format.options.reduce(function (str, option) {
                    var optionValue = printICUMessage(option.value);
                    return str + (' ' + option.selector + ' {' + optionValue + '}');
                }, '');
                return message + ('{' + id + ', ' + formatType + offset + ',' + options + '}');
        }
    }, '');
}