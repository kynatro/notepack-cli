const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { APP_ROOT_FOLDER, BASE_FOLDERS, RECENT_FILES_ANCHOR, RECENT_FILES_COUNT, TODO_ANCHOR_HEADING_LEVEL } = require('./userConfig').getUserConfig();
const { RECENT_FILES_DAY_WINDOW, RUNNING_IN_BACKGROUND } = require('./constants');

const model = {
  default: getRecentFiles,
  getRecentFiles,
  logRecentFiles,
  updateRecentFiles,
  writeRecentFiles
};

module.exports = model;

/**
 * Get the recently updated files
 *
 * Finds the recently modified files in the BASE_FOLDERS and returns them in
 * order from most to least recently modified. Uses the bash find command internally
 * and checks for files modified in a specified period of days prior to now. Sorts
 * the results of the find command before doing any truncating of the set.
 *
 * Returns an Array of Objects with information about the files. File Object example:
 *
 * {
 *   filepath: '/Path/To/Note File.md',
 *   filename: 'Note File.md',
 *   mtime: '2021-04-21T16:06:27.003Z',
 *   mtimeMs: 1619021187002.882
 * }
 *
 * @param {number} [limit=RECENT_FILES_COUNT] Limit the amount to be returned
 * @param {number} [lastNDays=RECENT_FILES_DAY_WINDOW] Specify a period in days in which files were modified
 *
 * @returns {array}
 */
function getRecentFiles(limit = RECENT_FILES_COUNT, lastNDays = RECENT_FILES_DAY_WINDOW) {
  const folders = BASE_FOLDERS.map(f => path.join(APP_ROOT_FOLDER, f));

  return new Promise((resolve, reject) => {
    exec(`find ${folders.join(' ')} -not -name "README.md" -name "*.md" -type f -mtime -${lastNDays}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return false;
      }

      const files = stdout.trim().split('\n')
        .map(f => {
          const filepath = f.substr(f.indexOf(path.sep));
          let fileData = {
            filepath
          };

          if (fs.existsSync(filepath)) {
            const stat = fs.statSync(filepath);

            fileData.filename = path.basename(filepath);
            fileData.mtime = stat.mtime;
            fileData.mtimeMs = stat.mtimeMs;

            return fileData;
          }
        })
        .sort((a, b) => a.mtimeMs < b.mtimeMs ? 1 : -1);

      resolve(files.slice(0, limit));
    });
  });
}

/**
 * Get the relative path to a file
 *
 * Returns an encoded relative path to a file relative to a README.md
 * being written to.
 *
 * @param {String} readmeFilePath Base file path to compare filePath to
 * @param {String} filePath File path
 *
 * @requires path
 *
 * @returns {String}
 */
function relativeRecentFilePath(readmeFilePath, filePath) {
  const relativeFilePath = path.relative(path.dirname(readmeFilePath), filePath);
  return encodeURIComponent(relativeFilePath)
          .replace(/%2F/g, '/')
          .replace(/%3A/g, ':')
          .replace(/%2B/g, '+')
          .replace(/%2C/g, ',');
}

function logRecentFiles(recentFiles, limit = RECENT_FILES_COUNT, lastNDays = RECENT_FILES_DAY_WINDOW) {
  console.log(`\x1b[1m\x1b[34mRecent ${limit} files from the last ${lastNDays} days:\x1b[0m`);
  console.log('----------------------------------------------------------');

  recentFiles.forEach((recentFile, index) => {
    const dirname = path.basename(path.dirname(recentFile.filepath));
    const filename = recentFile.filepath.replace(APP_ROOT_FOLDER, '')
      .replace(new RegExp(`^${path.sep}`), '')
      .replace(`${path.sep}${dirname}${path.sep}`, `${path.sep}\x1b[1m${dirname}\x1b[0m${path.sep}\x1b[32m`);
    console.log(`\x1b[32m${filename}\x1b[0m`);
    console.log(`Last modified on: \x1b[33m${recentFile.mtime}\x1b[0m\n`);
  });
}

/**
 * Update the recent files list
 *
 * Gets the recent files and writes them to the root README.md file.
 *
 * @param {number} [limit=RECENT_FILES_COUNT] How many files to return
 * @param {number} [lastNDays=RECENT_FILES_DAY_WINDOW] Window to constrain recent file search to
 *
 * @returns {Promise}
 */
function updateRecentFiles(limit = RECENT_FILES_COUNT, lastNDays = RECENT_FILES_DAY_WINDOW) {
  return new Promise((resolve, reject) => {
    getRecentFiles(limit, lastNDays)
      .then(data => {
        resolve(writeRecentFiles(data));
      })
      .catch(error => reject(error));
});
}

function writeRecentFiles(recentFiles) {
  const readmeFilePath = path.join(APP_ROOT_FOLDER, 'README.md');

  try {
    fs.accessSync(readmeFilePath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
  } catch (error) {
    if (!RUNNING_IN_BACKGROUND) {
      console.error('Cannot write to', readmeFilePath);
    }
    return false
  }

  const src = fs.readFileSync(readmeFilePath, 'utf8');
  let start = src.indexOf(RECENT_FILES_ANCHOR);
  let end;
  let chunks = [];

  // File does not contain a TODO_ANCHOR header, append to the end
  if (start === -1) {
    start = src.length;
    end = src.length;
  }
  // File contains an # TODO_ANCHOR header, replace it
  else {
    end = src.substring(start + RECENT_FILES_ANCHOR.length).indexOf(`\n${TODO_ANCHOR_HEADING_LEVEL} `) + start + RECENT_FILES_ANCHOR.length;

    // If end is the same as start, assume the end of the file
    if (end === start + RECENT_FILES_ANCHOR.length - 1) {
      end = src.length;
    }
  }

  // Beginning of file to start of todos chunk
  chunks.push(src.substring(0, start).trim());

  chunks.push(`${RECENT_FILES_ANCHOR}
${recentFiles.map(({filepath, filename}) => `* [${filename}](${relativeRecentFilePath(readmeFilePath, filepath)})`).join('\n')}
`);

  // End of todos chunk to end of file
  chunks.push(src.substring(end).trim());

  console.log(chunks.join('\n\n').trim() + '\n');

  fs.writeFileSync(readmeFilePath, chunks.join('\n\n').trim());

  return true;
}

if (require.main === module) {
  getRecentFiles()
    .then(data => logRecentFiles(data))
    .catch(error => console.error(error));
}
