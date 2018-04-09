'use strict';

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _glob = require('glob');

var _mkdirp = require('mkdirp');

var _translator = require('./lib/translator');

var _translator2 = _interopRequireDefault(_translator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ReactIntlAggregatePlugin(plugin_options) {
  this.plugin_options = plugin_options;
}

ReactIntlAggregatePlugin.prototype.apply = function (compiler) {
  var messagesPattern = this.plugin_options.messagesPattern || '../../i18n/messages/**/*.json';
  var aggregateOutputDir = this.plugin_options.aggregateOutputDir || '../../i18n/aggregate/';
  var aggregateFilename = this.plugin_options.aggregateFilename || 'en-US';
  var format = this.plugin_options.format;
  var translatorFunction = this.plugin_options.translatorFunction;

  compiler.plugin('emit', function (compilation, callback) {
    var MESSAGES_PATTERN = path.resolve(__dirname, messagesPattern);
    var AGGREGATE_DIR = path.resolve(__dirname, aggregateOutputDir);
    var AGGREGATE_FILE = path.resolve(AGGREGATE_DIR, aggregateFilename + '.json');

    console.log('Messages pattern: ' + MESSAGES_PATTERN);
    console.log('Aggregate dir: ' + AGGREGATE_DIR);
    var translator = translatorFunction ? new _translator2.default(translatorFunction) : undefined;
    var defaultMessages = (0, _glob.sync)(MESSAGES_PATTERN).map(function (filename) {
      return fs.readFileSync(filename, 'utf8');
    }).map(function (file) {
      return JSON.parse(file);
    }).reduce(function (collection, descriptors) {
      descriptors.forEach(function (_ref) {
        var id = _ref.id,
            defaultMessage = _ref.defaultMessage,
            description = _ref.description;

        if (collection.hasOwnProperty(id)) {
          throw new Error('Duplicate message id: ' + id);
        }
        var message = translator ? translator.translate(defaultMessage) : defaultMessage;
        if (format === 'short') {
          collection[id] = message;
        } else {
          collection[id] = {};
          collection[id]["id"] = id;
          collection[id]["defaultMessage"] = message;
          if (description) {
            collection[id].description = description;
          }
        }
      });
      return collection;
    }, {});

    if (!fs.existsSync(AGGREGATE_DIR)) {
      console.log('Creating directory: ' + AGGREGATE_DIR);
      (0, _mkdirp.sync)(AGGREGATE_DIR);
    }

    var aggregateTranslations = JSON.stringify(defaultMessages, null, 2);
    var previousTranslations = fs.existsSync(AGGREGATE_FILE) ? fs.readFileSync(AGGREGATE_FILE, 'utf8') : undefined;

    if (aggregateTranslations !== previousTranslations) {
      fs.writeFileSync(AGGREGATE_FILE, aggregateTranslations);
      console.log('Writing file: ' + AGGREGATE_FILE + ' with ' + Object.keys(defaultMessages).length + ' keys');
    } else {
      console.log('No translation changes detected for: ' + AGGREGATE_FILE);
    }
    console.log('Aggregating translations JSON complete!');
    callback();
  });
};

module.exports = ReactIntlAggregatePlugin;