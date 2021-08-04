"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReactIntlAggregatePlugin = void 0;

var fs = _interopRequireWildcard(require("fs"));

var path = _interopRequireWildcard(require("path"));

var _glob = require("glob");

var _mkdirp = require("mkdirp");

var _translator = _interopRequireDefault(require("./lib/translator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class ReactIntlAggregatePlugin {
  constructor(options) {
    /** @type {HtmlWebpackOptions} */
    this.plugin_options = options || {};
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('ReactIntlAggregatePlugin', (compilation, callback) => {
      let messagesPattern = this.plugin_options.messagesPattern || '../../i18n/messages/**/*.json';
      let aggregateOutputDir = this.plugin_options.aggregateOutputDir || '../../i18n/aggregate/';
      let aggregateFilename = this.plugin_options.aggregateFilename || 'en-US';
      let translatorFunction = this.plugin_options.translatorFunction;
      const MESSAGES_PATTERN = path.resolve(__dirname, messagesPattern);
      const AGGREGATE_DIR = path.resolve(__dirname, aggregateOutputDir);
      const AGGREGATE_FILE = path.resolve(AGGREGATE_DIR, aggregateFilename + '.json');
      console.log('Messages pattern: ' + MESSAGES_PATTERN);
      console.log('Aggregate dir: ' + AGGREGATE_DIR);
      let translator = translatorFunction ? new _translator.default(translatorFunction) : undefined;
      let defaultMessages = (0, _glob.sync)(MESSAGES_PATTERN).map(filename => fs.readFileSync(filename, 'utf8')).map(file => JSON.parse(file)).reduce((collection, descriptors) => {
        descriptors.forEach(({
          id,
          defaultMessage,
          description
        }) => {
          if (collection.hasOwnProperty(id)) {
            console.warn(`Duplicate message id: ${id}`);
          }

          collection[id] = {};
          collection[id]["defaultMessage"] = translator ? translator.translate(defaultMessage) : defaultMessage;

          if (description) {
            collection[id].description = description;
          }
        });
        return collection;
      }, {});

      if (!fs.existsSync(AGGREGATE_DIR)) {
        console.log('Creating directory: ' + AGGREGATE_DIR);
        (0, _mkdirp.sync)(AGGREGATE_DIR);
      }

      let aggregateTranslations = JSON.stringify(defaultMessages, null, 2);
      const previousTranslations = fs.existsSync(AGGREGATE_FILE) ? fs.readFileSync(AGGREGATE_FILE, 'utf8') : undefined;

      if (aggregateTranslations !== previousTranslations) {
        fs.writeFileSync(AGGREGATE_FILE, aggregateTranslations);
        console.log('Writing file: ' + AGGREGATE_FILE + ' with ' + Object.keys(defaultMessages).length + ' keys');
      } else {
        console.log('No translation changes detected for: ' + AGGREGATE_FILE);
      }

      console.log('Aggregating translations JSON complete!');
      callback();
    });
  }

}

module.exports = ReactIntlAggregatePlugin;