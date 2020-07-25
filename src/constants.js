const path = require('path');
const configuration = require('../project-config.json');

/**
 * App root folder
 * 
 * @constant
 * @type {String}
 */
const APP_ROOT_FOLDER = path.resolve(configuration.appRootFolder);

/**
 * Base folders to scan
 *
 * @constant
 * @type {String}
 */
const BASE_FOLDERS = configuration.baseFolders;

/**
 * Invalid file type patterns
 *
 * @constant
 * @type {Array}
*/
const FILE_IGNORE = ['.bin', '.git', '.vscode', 'node_modules', '.DS_Store', 'Thumbs.db', 'scripts', 'src', '.(ttf|woff)$', '.s?css$', '.sass$', '.js(on)?$', '.editorconfig', '.svg$', 'README.md']

/**
 * Todo match pattern
 *
 * @constant
 * @type {String}
 */
const MATCH_PATTERN = "-\\s?\\[ \\]"

/**
 * Team base folder
 *
 * @constant
 * @type {String}
 */
const TEAM_FOLDER = configuration.teamFolder;

/**
 * Anchor heading level
 * 
 * The H tag level of the anchor heading.
 * 
 * @constant
 * @type {String}
 */
const TODO_ANCHOR_HEADING_LEVEL = configuration.todoAnchorHeadingLevel;

/**
 * Anchor heading for a section of todos in a README.md file.
 *
 * @constant
 * @type {String}
 */
const TODO_ANCHOR = `${TODO_ANCHOR_HEADING_LEVEL} ${configuration.todoAnchor}`;

/**
 * Todo group heading level
 * 
 * The H tag level for groups of todos. Should be a lower H tag value
 * than TODO_ANCHOR_HEADING_LEVEL.
 * 
 * @constant
 * @type {String}
 */
const TODO_GROUP_HEADING_LEVEL = configuration.todoGroupHeadingLevel;

module.exports = {
  APP_ROOT_FOLDER,
  BASE_FOLDERS,
  FILE_IGNORE,
  MATCH_PATTERN,
  TEAM_FOLDER,
  TODO_ANCHOR,
  TODO_ANCHOR_HEADING_LEVEL,
  TODO_GROUP_HEADING_LEVEL
}
