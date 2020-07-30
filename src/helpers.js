const fs = require('fs');
const path = require('path');
const { FILE_IGNORE } = require('./constants');

/**
 * Determine validity of a filename
 *
 * Determines if the filename is not included in the FILE_IGNORE
 *
 * @param {String} file The filename to validate
 * @returns {Boolean}
 */
function isValidNode(filename) {
  for (let i = 0; i < FILE_IGNORE.length; i++) {
    const pattern = new RegExp(FILE_IGNORE[i])

    if (pattern.test(filename)) {
      return false
    }
  }

  return true
}

/**
 * Check if a file path is writable
 * 
 * Checks if a file can be written to. If the file does not exist
 * it checks if the parent folder can be written to.
 * 
 * @requires fs
 * @requires path
 * 
 * @param {String} filePath File Path to check
 * @returns {Boolean}
 */
function isWriteable(filePath) {
  const checkPath = fs.existsSync(filePath) ? filePath : path.dirname(filePath);

  try {
    fs.accessSync(checkPath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}


module.exports = {
  isValidNode,
  isWriteable
}