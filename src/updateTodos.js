const { getTodos, getTodosAssignedTo, getAssignmentAlias } = require('./todos');
const { getTeamMembers } = require('./team');
const { argv } = require('yargs');
const fs = require('fs');
const path = require('path');
const { APP_ROOT_FOLDER, BASE_FOLDERS, TODO_GROUP_HEADING_LEVEL, TEAM_FOLDER, TODO_ANCHOR, TODO_ANCHOR_HEADING_LEVEL } = require('./userConfig').getUserConfig();
const { RUNNING_IN_BACKGROUND } = require('./constants');

/**
 * Get todo group names
 * 
 * Iterates through todos and builds a deduped array of groupName values,
 * sorted by file date in descending order.
 * 
 * @param {Array} todos Todos to parse
 * 
 * @return {Array}
 */
function getGroupNames(todos) {
  // Sort todos by date before grouping to ensure groups are ordered by date
  return todos.sort((a, b) => a.fileDate < b.fileDate ? 1 : -1)
    .reduce((arr, todo) => {
      if (!arr.includes(todo.groupName)) {
        arr.push(todo.groupName);
      }
      return arr;
    }, []);
}

/**
 * Get the relative path to a group file
 * 
 * Returns an encoded relative path to a group file relative to a README.md
 * being written to.
 * 
 * @param {String} readmeFilePath Base file path to compare filePath to
 * @param {String} groupFilePath Group file path
 * 
 * @requires path
 * 
 * @returns {String}
 */
function groupRelativePath(readmeFilePath, groupFilePath) {
  const relativeFilePath = path.relative(path.dirname(readmeFilePath), path.join(APP_ROOT_FOLDER, groupFilePath));
  return encodeURIComponent(relativeFilePath).replace(/%2F/g, '/');
}

/**
 * Build Grouped Todos String
 *
 * Builds a string of todos grouped by file and ordered by date. Automatically
 * builds relative links to files referenced in each group.
 *
 * @param {Array} todos Array of todos
 * @param {String} filePath Filepath of the file to be written to (for processing relative links)
 * @param {Object} options Additional options
 *   @param {String} prefix Prefix in front of group of todos
 *
 * @requires path
 * @requires notepack-cli/updateTodos.getGroupNames
 * 
 * @return {String}
 */
function groupedTodos(todos, filePath, options = {}) {
  const groupNames = getGroupNames(todos);
  let groupedStr = `${options.prefix}` || '';

  groupNames.forEach(groupName => {
    const groupTodos = todos.filter((todo) => todo.groupName === groupName).sort((a, b) => a.id > b.id ? 1 : -1);

    groupedStr = `${groupedStr}
${TODO_GROUP_HEADING_LEVEL} [${groupName}](${groupRelativePath(filePath, groupTodos[0].filePath)})
${groupTodos.map(todo => `- [ ] ${todo.todo}`).join('\n')}`;
  });

  return groupedStr;
}

/**
 * Update todos for all folders containing README.MD files
 *
 * Recursively iterates through all folders and updates README.md files found
 * within them with all todos contained within the folder.
 *
 * @param {Array} folders Array of folder names at project root
 */
function updateTodosForFolders(folders = []) {
  const isValidFolder = (nodePathName) => (
    !nodePathName.toLowerCase().includes('archive') &&
    !nodePathName.startsWith(path.join(APP_ROOT_FOLDER, TEAM_FOLDER))
  );

  folders.forEach(folder => {
    fs.readdirSync(path.resolve(APP_ROOT_FOLDER, folder)).forEach((node) => {
      const nodePathName = path.resolve(APP_ROOT_FOLDER, folder, node);
      const nodeStats = fs.statSync(nodePathName);

      if (nodeStats.isDirectory() && isValidFolder(nodePathName)) {
        const readmeFilepath = path.join(nodePathName, 'README.md');

        // Update the README.md file if it exists
        if (fs.existsSync(readmeFilepath)) {
          const todos = getTodos(nodePathName);

          writeTodos(readmeFilepath, todos);
        }

        updateTodosForFolders([nodePathName]);
      }
    })
  })
}

/**
 * Update todos for a person
 *
 * Iterates through the todos for an assignedTo person and updates their
 * associated README.md with open todos. Groups open todos by file and sorts
 * them in ascending order to highlight oldest todos first.
 *
 * Alternatively, instead of specifying an person's name for assignedTo,
 * pass "me" or "mine" to get all my todos.
 *
 * @param {String} assignedTo The shorthand name of the person to update
 */
function updateTodosForPerson(assignedTo = 'me') {
  // Attempt to get by alias
  const assignment = getAssignmentAlias(assignedTo);
  const todos = getTodosAssignedTo(assignment);

  // Compose filePath based on assignedTo for either an person or root for mine
  let filePath = path.join(APP_ROOT_FOLDER, TEAM_FOLDER, assignment, 'README.md');
  if (['me', 'mine'].includes(assignment.toLowerCase())) {
    filePath = path.join(APP_ROOT_FOLDER, 'README.md');
  }

  writeTodos(filePath, todos);
}

/**
 * Write Todos to a file
 *
 * Writes the supplied todos to a file at filePath. Organizes todos by folder
 * grouping and orders todos by date in descending order. Returns Boolean(false)
 * if the supplied filePath is not writable.
 *
 * @param {String} filePath file path for a file to write to
 * @param {Array} todos Todos to add to the file
 *
 * @return {Boolean}
 */
function writeTodos(filePath, todos) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
  } catch (error) {
    if (!RUNNING_IN_BACKGROUND) {
      console.error('Cannot write to', filePath);
    }
    return false
  }

  const src = fs.readFileSync(filePath, 'utf8');
  let start = src.indexOf(TODO_ANCHOR);
  let end;
  let chunks = [];

  // File does not contain a TODO_ANCHOR header, append to the end
  if (start === -1) {
    start = src.length;
    end = src.length;
  }
  // File contains an # TODO_ANCHOR header, replace it
  else {
    end = src.substring(start + TODO_ANCHOR.length).indexOf(`\n${TODO_ANCHOR_HEADING_LEVEL} `) + start + TODO_ANCHOR.length;

    // If end is the same as start, assume the end of the file
    if (end === start + TODO_ANCHOR.length - 1) {
      end = src.length;
    }
  }

  // Beginning of file to start of todos chunk
  chunks.push(src.substring(0, start).trim());

  // Todos grouped by file
  chunks.push(groupedTodos(todos, filePath, { prefix: TODO_ANCHOR }));

  // End of todos chunk to end of file
  chunks.push(src.substring(end).trim());

  fs.writeFileSync(filePath, chunks.join('\n\n').trim() + '\n');

  return true;
}

if (require.main === module) {
  if (argv.assignedTo) {
    updateTodosForPerson(argv.assignedTo);
  } else {
    const teamMembers = getTeamMembers();

    teamMembers.forEach(({ name }) => updateTodosForPerson(name));
    updateTodosForPerson('Me');
    updateTodosForFolders(BASE_FOLDERS);
  }
}

module.exports = {
  default: updateTodosForPerson,
  getGroupNames,
  groupRelativePath,
  groupedTodos,
  updateTodosForFolders,
  updateTodosForPerson,
  writeTodos
};
