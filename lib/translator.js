"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _intlMessageformatParser = require("intl-messageformat-parser");

var _printer = _interopRequireDefault(require("./printer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Translator {
  constructor(translateText) {
    this.translateText = translateText;
  }

  translate(message) {
    let ast = (0, _intlMessageformatParser.parse)(message);
    let translated = this.transform(ast);
    return (0, _printer.default)(translated);
  }

  transform(ast) {
    ast.elements.forEach(el => {
      if (el.type === 'messageTextElement') {
        el.value = this.translateText(el.value);
      } else {
        let options = el.format && el.format.options;

        if (options) {
          options.forEach(option => this.transform(option.value));
        }
      }
    });
    return ast;
  }

}

exports.default = Translator;