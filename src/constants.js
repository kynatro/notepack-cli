const { argv } = require('yargs');

/**
 * User configuration file
 * 
 * @constant
 * @type {String}
 */
const CONFIG_FILE_NAME = '.notepack_config';

/**
 * Invalid file type patterns
 *
 * @constant
 * @type {Array}
*/
const FILE_IGNORE = ['archive', '.bin', '.git', '.vscode', 'node_modules', '.DS_Store', 'Thumbs.db', 'scripts', 'src', '.(ttf|woff)$', '.s?css$', '.sass$', '.js(on)?$', '.editorconfig', '.svg$', 'README.md']

/**
 * Todo match pattern
 *
 * @constant
 * @type {String}
 */
const MATCH_PATTERN = "-\\s?\\[ \\]"

/**
 * Is the script running in the background
 * 
 * Reads the optional flag to identify the script as running in the
 * background.
 * 
 * @requires argv
 * 
 * @constant
 * @type {Boolean}
 */
const RUNNING_IN_BACKGROUND = Boolean(argv.background);

module.exports = {
  CONFIG_FILE_NAME,
  FILE_IGNORE,
  MATCH_PATTERN,
  RUNNING_IN_BACKGROUND
}
