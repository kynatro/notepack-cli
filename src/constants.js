const { argv } = require('yargs');

/**
 * User configuration file
 * 
 * @constant
 * @type {String}
 */
const CONFIG_FILE_NAME = '.notepack_config';

/**
 * File to track watching status
 * 
 * @constant
 * @type {String}
 */
const WATCHING_FILE_NAME = '.notepack_watching';

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

/**
 * Is the script being run by testing
 * 
 * Detects if jest is running or not
 * 
 * @constant
 * @type {Boolean}
 */
/* eslint no-undef: "off" */
let RUNNING_TESTS = false;
try {
  RUNNING_TESTS = jest !== 'undefined';
}
/* eslint no-empty: "off" */
catch(e) {}

/**
 * Calendar day window to constrain find command for recent files
 *
 * Optimize the find command to search within files modified in the last N days.
 *
 * @constant
 * @type {Number}
 */
const RECENT_FILES_DAY_WINDOW = 7;

module.exports = {
  CONFIG_FILE_NAME,
  FILE_IGNORE,
  MATCH_PATTERN,
  RECENT_FILES_DAY_WINDOW,
  RUNNING_IN_BACKGROUND,
  RUNNING_TESTS,
  WATCHING_FILE_NAME
}
