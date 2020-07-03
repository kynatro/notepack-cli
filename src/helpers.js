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

module.exports = {
  isValidNode
}