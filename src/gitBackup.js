const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require("path");
const fs = require('fs');

const { APP_ROOT_FOLDER, BASE_FOLDERS } = require('./userConfig').getUserConfig();

const H1_PATTERN = /^# \w+/gim;
const FILE_NAME_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2} (.*)$/;
const STATUS_PATTERN = /^(.{2}) "?([^"]+)"?$/;
const STATUS_NEW = 'NEW';
const STATUS_MODIFIED = 'MODIFIED';
const STATUS_MODIFIED_STAGED = 'MODIFIED STAGED'
const STATUSES = {
  '??': STATUS_NEW,
  ' M': STATUS_MODIFIED,
  'M ': STATUS_MODIFIED_STAGED
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function commitStaged(message) {
  const quoteEscapedMessage = message.replace(/(")/g, '\\$1');
  const { stderr } = await exec(`git -C ${APP_ROOT_FOLDER} commit -m "${quoteEscapedMessage}"`);

  if (stderr) {
    console.error(stderr);
    return;
  }

  console.log('COMMITTED: ' + message);

  return true;
}

/**
 * Generate commit message
 *
 * Generates a commit message for the file at filePath. Message is generated in
 * priority order:
 *   1. The first H1 in the Markdown file
 *   2. The base name of the file without a date prefix
 *   3. The base name of the file
 *
 * @param {String} filePath Relative path to the file in this repository
 *
 * @returns {String}
 */
function generateCommitMessage(filePath) {
  const fileData = fs.readFileSync(path.resolve(APP_ROOT_FOLDER, filePath));
  const basename = path.basename(filePath, '.md');
  const h1 = `${fileData}`.match(H1_PATTERN);

  // Markdown title
  if (h1) {
    return h1[0];
  }

  // Title embedded in file name
  if (FILE_NAME_PATTERN.test(basename)) {
    return basename.match(FILE_NAME_PATTERN)[1];
  }

  // Fall back to filename
  return basename;
}

async function getStatuses() {
  let statuses = [];
  const { stderr, stdout } = await exec(`git -C ${APP_ROOT_FOLDER} status --porcelain`);

  if (stderr) {
    console.error(stderr);
    return;
  }

  stdout.split("\n").forEach(line => {
    const match = line.match(STATUS_PATTERN);

    if (match) {
      statuses.push({
        status: STATUSES[match[1]],
        filePath: match[2]
      });
    }
  });

  return statuses;
}

/**
 * Stage a file
 *
 * @param {nodegit<Repository>} repo Instance of nodegit Repository
 * @param {String} filePath Repo relative path to a file to be staged
 *
 * @uses nodegit.Repository.refreshIndex
 * @uses nodegit.Repository.addByPath
 * @uses nodegit.Repository.write
 * @uses nodegit.Repository.writeTree
 *
 * @returns {String} oid value for use in a commit
 */
async function stageFile(filePath) {
  const escapeFilePath = filePath.replace(/(\s|&+)/g, '\\$1');
  const { stderr } = await exec(`git -C ${APP_ROOT_FOLDER} add ${escapeFilePath}`);

  if (stderr) {
    console.error(stderr);
    return;
  }

  console.log('STAGED: ' + filePath);

  return true;
}

(async () => {
  const statuses = await getStatuses();
  // Only process files in the user specified base folders
  const filtered = statuses.filter((file) => (
    // File is in user's base folder(s)
    BASE_FOLDERS.some(baseFolder => file.filePath.startsWith(baseFolder)) ||
    // Root README.md file
    file.filePath === 'README.md'
  ));
  // Include the root README.md file (which exists outside BASE_FOLDERS)
  let updates = [];

  if (!filtered.length) {
    console.log('Everything has already been backed up 😎');
    return true;
  }

  // Individually commit new files
  await asyncForEach(filtered, async (file) => {
    const { status, filePath } = file;

    if (status == STATUS_NEW) {
      const commitMessage = generateCommitMessage(filePath);
      await stageFile(filePath);
      await commitStaged(commitMessage);
    } else {
      updates.push(file);
    }
  });

  // Process updated files (checked off todos)
  if (updates.length) {
    await asyncForEach(updates, async (file) => {
      const { filePath } = file;
      await stageFile(filePath);
    });

    await commitStaged('Update todos');
  }
})();
