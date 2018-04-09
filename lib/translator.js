'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _intlMessageformatParser = require('intl-messageformat-parser');

var _printer = require('./printer');

var _printer2 = _interopRequireDefault(_printer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Translator = function () {
    function Translator(translateText) {
        _classCallCheck(this, Translator);

        this.translateText = translateText;
    }

    _createClass(Translator, [{
        key: 'translate',
        value: function translate(message) {
            var ast = (0, _intlMessageformatParser.parse)(message);
            var translated = this.transform(ast);
            return (0, _printer2.default)(translated);
        }
    }, {
        key: 'transform',
        value: function transform(ast) {
            var _this = this;

            ast.elements.forEach(function (el) {
                if (el.type === 'messageTextElement') {
                    el.value = _this.translateText(el.value);
                } else {
                    var options = el.format && el.format.options;
                    if (options) {
                        options.forEach(function (option) {
                            return _this.transform(option.value);
                        });
                    }
                }
            });

            return ast;
        }
    }]);

    return Translator;
}();

exports.default = Translator;