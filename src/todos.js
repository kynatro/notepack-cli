const argv = require('yargs').argv;
const fs = require('fs');
const path = require('path');
const fm = require('front-matter');
const { isValidNode } = require('./helpers');
const { getTeamMemberAliases } = require('./team');
const { APP_ROOT_FOLDER, MATCH_PATTERN } = require('./constants');

/**
 * Clean todo string
 *
 * Cleans up the todo string removing the checkbox syntax and
 * trimming whitespace.
 *
 * @param {String} todo A todo string
 * @returns {String}
 */
function cleanTodo(todo) {
  return `${todo}`.replace(new RegExp(MATCH_PATTERN), '').trim();
}

/**
 * Format assignment for easier matching
 *
 * Removes any @ mention prefixes, replaces . with spaces, trims white space.
 *
 * @param {String} assignment Assignment string
 * @returns {String}
 */
function formatAssignment(assignment) {
  return assignment.replace(/^@/, '').replace(/\./, ' ').trim();
}

/**
 * Get the todo assignment
 *
 * Get the individual assigned to the todo. Maps @mention keywords for known
 * individuals to their full name. If no individual is specified it is assumed
 * the assignment is to "Me".
 *
 * @param {String} todo A todo string
 * @default "Me"
 * @returns {String}
 */
function getAssignment(todo) {
  const formattedTodo = cleanTodo(todo);
  const mentionAssignment = formattedTodo.match(/^@([A-Za-z\.]+)/);

  if (mentionAssignment) {
    return mentionAssignment[1];
  } else {
    return 'Me';
  }
}

/**
 * Get assignment alias
 *
 * Returns the alias of the @mention assignment if it exists or the @mention
 * assignment if no alias is found.
 *
 * @param {String} assignment The @mention assignment
 * @returns {String}
 */
function getAssignmentAlias(assignment) {
  const aliases = getTeamMemberAliases();
  const formattedAssignment = formatAssignment(assignment);
  return aliases[formattedAssignment.toLowerCase()] || formattedAssignment;
}

/**
 * Get todos
 *
 * Traverses the entire project folder structure for markdown files that
 * contain todos and generates an array of Object literals describing the
 * todos found.
 *
 * Each Object literal in the Array returned follows this schema:
 *
 *   filePath {String} The project root relative path to the file containing the todo
 *   fileName {String} The name of the file containing the todo
 *   groupName {String} A group name for the todo
 *   todo {String} The cleaned todo
 *   assignedTo {String} The individual the todo is assigned to
 * 
 * @requires fm
 * @requires fs
 * @requires path
 * @requires notepack/helpers.isValidNode
 * @param {String} [pathScope=''] The path to scan for todos
 * @param {Array} [todos=[]] The array of todos to populate
 * @returns {Array}
 */
function getTodos(pathScope = '', todos = []) {
  let id = 1;

  fs.readdirSync(path.resolve(APP_ROOT_FOLDER, pathScope)).forEach((node) => {
    const nodePathname = path.resolve(APP_ROOT_FOLDER, pathScope, node);
    const nodeStats = fs.statSync(nodePathname);
    const extname = path.extname(node);

    if (isValidNode(node)) {
      if (nodeStats.isFile() && extname === '.md') {
        const src = fs.readFileSync(nodePathname, 'utf8');
        const matches = src.match(new RegExp(`${MATCH_PATTERN}.*`, 'g'));
        const frontMatter = fm(src);

        if (matches && !frontMatter.attributes.excludeTodos) {
          matches.forEach((match) => {
            let fileDate = node.match(/^\d{4}(-\d{2}){0,2}/);
            if (fileDate && fileDate.length) {
              fileDate = fileDate[0];
            }

            const assignedTo = getAssignment(match);

            todos.push({
              id: id++,
              filePath: nodePathname.replace(APP_ROOT_FOLDER, '.'),
              fileName: node,
              groupName: groupName(nodePathname),
              todo: cleanTodo(match),
              assignedTo,
              assignedToAlias: getAssignmentAlias(assignedTo),
              fileCreateTime: nodeStats.birthtime || nodeStats.ctime,
              fileDate
            });
          });
        }
      } else if (nodeStats.isDirectory()) {
        todos = getTodos(nodePathname, todos);
      }
    }
  });

  return todos;
}

/**
 * Get todos assigned to an individual
 *
 * Returns a filtered set of todos whose assignedTo or assignedToAlias matches
 * the assignment argument. Uses alias for comparison to allow any alias or 
 * actual name to be passed as the assignment argument.
 *
 * @param {String} assignment Assignment value
 * @returns
 */
function getTodosAssignedTo(assignment) {
  const aliasedAssignment = getAssignmentAlias(assignment);
  const todos = getTodos();

  return todos.filter(todo => todo.assignedToAlias === aliasedAssignment);
}

/**
 * Generate the Group Name
 *
 * Uses the nodePathname to create a distinguishing group name for todos
 * If the nodePathname file name is the same as its directory name, the
 * next directory up will be used as the first part of the group name.
 *
 * @param {String} nodePathname A valid pathname for the node
 *
 * @return {String}
 */
function groupName(nodePathname) {
  const dirname = path.dirname(nodePathname);
  const nodeName = path.basename(nodePathname, '.md');
  let parentDirname = path.basename(dirname);

  if (parentDirname === nodeName) {
    parentDirname = path.basename(path.dirname(dirname));
  }

  return `${parentDirname} / ${nodeName}`;
}

/**
 * Log todos to the console
 *
 * Logs the todos given to the console in a human readable format grouped
 * by file.
 *
 * @param {Array} [todos=[]] Array of todos found by getTodos()
 * @param {String} assignedTo Optional individual to filter by
 */
function logTodos(todos = [], assignedTo) {
  let title = 'All todos:';

  if (assignedTo) {
    title = `Todos assigned to ${assignedTo}`;
  }

  console.log(`\x1b[1m\x1b[34m${title}\x1b[0m`);
  console.log('----------------------------------------------------------');

  const groups = todos.reduce((obj, todo) => {
    obj[todo.groupName] = obj[todo.groupName] || [];
    obj[todo.groupName].push(cleanTodo(todo.todo));
    return obj;
  }, {});

  Object.keys(groups).forEach((group) => {
    console.log('\x1b[32m', `\n${group}:`, '\x1b[0m');

    groups[group].forEach((todo) => {
      const formattedTodo = todo
        // Format emphasis Markdown as underlined
        .replace(/_(.*?)_/, "\x1b[4m$1\x1b[0m")
        // Format user as bold and blue
        .replace(/@[^\s]+/, "\x1b[34m\x1b[1m$&\x1b[0m")

      console.log(`* ${formattedTodo}`);
    })
  })
}

// Log output when called directly (from CLI)
if (require.main === module) {
  let assignedTo;
  let todos;

  if (argv.mine || ['me', 'mine'].includes(`${argv.assignedTo}`.toLowerCase())) {
    assignedTo = 'Me';
    todos = getTodosAssignedTo('Me');
  } else if (argv.assignedTo) {
    assignedTo = argv.assignedTo;
    todos = getTodosAssignedTo(assignedTo);
  } else {
    todos = getTodos();
  }

  logTodos(todos, assignedTo);
}

module.exports = {
  default: getTodos,
  cleanTodo,
  formatAssignment,
  getAssignment,
  getAssignmentAlias,
  getTodos,
  getTodosAssignedTo,
  groupName
};
