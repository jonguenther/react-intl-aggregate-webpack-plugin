import * as fs from 'fs';
import * as path from 'path';
import { sync as globSync } from 'glob';
import { sync as mkdirpSync } from 'mkdirp';
import Translator from './lib/translator';
class ReactIntlAggregatePlugin {
  constructor(options) {
    /** @type {HtmlWebpackOptions} */
    this.plugin_options = options || {};
  }
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'ReactIntlAggregatePlugin',
      (compilation, callback) => {
        let messagesPattern = this.plugin_options.messagesPattern ||
          '../../i18n/messages/**/*.json';
        let aggregateOutputDir = this.plugin_options.aggregateOutputDir ||
          '../../i18n/aggregate/';
        let aggregateFilename = this.plugin_options.aggregateFilename ||
          'en-US';
        let translatorFunction = this.plugin_options.translatorFunction;
        const MESSAGES_PATTERN = path.resolve(__dirname, messagesPattern);
        const AGGREGATE_DIR = path.resolve(__dirname, aggregateOutputDir);
        const AGGREGATE_FILE = path.resolve(AGGREGATE_DIR, aggregateFilename +
          '.json');

        console.log('Messages pattern: ' + MESSAGES_PATTERN);
        console.log('Aggregate dir: ' + AGGREGATE_DIR)
        let translator = translatorFunction ? new Translator(translatorFunction) : undefined;
        let defaultMessages = globSync(MESSAGES_PATTERN)
          .map((filename) => fs.readFileSync(filename, 'utf8'))
          .map((file) => JSON.parse(file))
          .reduce((collection, descriptors) => {
            descriptors.forEach(({ id, defaultMessage }) => {
              if (collection.hasOwnProperty(id)) {
                console.warn(`Duplicate message id: ${id}`);
              }
              collection[id]= translator ? translator.translate(defaultMessage) : defaultMessage;              
            });
            return collection;
          }, {});

        if (!fs.existsSync(AGGREGATE_DIR)) {
          console.log('Creating directory: ' + AGGREGATE_DIR);
          mkdirpSync(AGGREGATE_DIR);
        }

        let aggregateTranslations = JSON.stringify(defaultMessages, null, 2);
        const previousTranslations = fs.existsSync(AGGREGATE_FILE) ? fs.readFileSync(AGGREGATE_FILE, 'utf8') : undefined;

        if (aggregateTranslations !== previousTranslations) {
          fs.writeFileSync(AGGREGATE_FILE, aggregateTranslations);
          console.log('Writing file: ' + AGGREGATE_FILE + ' with ' +
            Object.keys(defaultMessages).length + ' keys');

        } else {
          console.log('No translation changes detected for: ' + AGGREGATE_FILE);
        }
        console.log('Aggregating translations JSON complete!');

        callback();
      }
    );
  }
}

module.exports = ReactIntlAggregatePlugin;