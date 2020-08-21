const fs = require('fs');
const path = require('path');
const os = require('os');
const helpers = require('./helpers');
const { CONFIG_FILE_NAME } = require('./constants');
const CONFIG_FILE_PATH = path.resolve(os.homedir(), CONFIG_FILE_NAME);
let USER_CONFIG;

/**
 * Get the user's config
 * 
 * Read's the user's configuration file and returns an Object of
 * configuration constants.
 * 
 * @async
 * 
 * @requires path
 * @requires notepack-cli/userConfig.readUserConfig
 * 
 * @returns {Object}
 */
function getUserConfig() {
  if (!USER_CONFIG) {
    USER_CONFIG = model.readUserConfig();
  }

  /**
   * App root folder
   * 
   * @constant
   * @type {String}
   */
  const APP_ROOT_FOLDER = path.resolve(USER_CONFIG.appRootFolder);

  /**
   * Base folders to scan
   *
   * @constant
   * @type {String}
   */
  const BASE_FOLDERS = USER_CONFIG.baseFolders;

  /**
   * Team base folder
   *
   * @constant
   * @type {String}
   */
  const TEAM_FOLDER = USER_CONFIG.teamFolder;

  /**
   * Anchor heading level
   * 
   * The H tag level of the anchor heading.
   * 
   * @constant
   * @type {String}
   */
  const TODO_ANCHOR_HEADING_LEVEL = USER_CONFIG.todoAnchorHeadingLevel;

  /**
   * Anchor heading for a section of todos in a README.md file.
   *
   * @constant
   * @type {String}
   */
  const TODO_ANCHOR = `${TODO_ANCHOR_HEADING_LEVEL} ${USER_CONFIG.todoAnchor}`;

  /**
   * Todo group heading level
   * 
   * The H tag level for groups of todos. Should be a lower H tag value
   * than TODO_ANCHOR_HEADING_LEVEL.
   * 
   * @constant
   * @type {String}
   */
  const TODO_GROUP_HEADING_LEVEL = USER_CONFIG.todoGroupHeadingLevel;

  return {
    APP_ROOT_FOLDER,
    BASE_FOLDERS,
    TEAM_FOLDER,
    TODO_ANCHOR_HEADING_LEVEL,
    TODO_ANCHOR,
    TODO_GROUP_HEADING_LEVEL
  }
}

/**
 * Read user configuration file
 * 
 * Reads the user configuration file and returns a JSON Object. Returns
 * false if the configuration cannot be found or read.
 * 
 * @requires fs
 * @requires JSON
 * 
 * @returns {Object|Boolean}
 */
function readUserConfig() {
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    const data = fs.readFileSync(CONFIG_FILE_PATH);

    if (data) {
      return JSON.parse(data);
    }
  }

  return false;
}

/**
 * Write user configuration file
 * 
 * Writes the supplied configuration JSON Object to a file.
 * 
 * @requires fs
 * @requires JSON
 * @requires notepack-cli/helpers.isWriteable
 *
 * @param {Object} configuration JSON configuration Object
 * 
 * @return {Boolean}
 */
function writeUserConfig(configuration) {
  if (helpers.isWriteable(CONFIG_FILE_PATH)) {
    try {
      fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(configuration, null, 2));
      return true;
    } catch (err) {
      console.error(err);
    }
  }

  return false;
}

const model = {
  CONFIG_FILE_NAME,
  CONFIG_FILE_PATH,
  getUserConfig,
  readUserConfig,
  writeUserConfig
};

module.exports = model;