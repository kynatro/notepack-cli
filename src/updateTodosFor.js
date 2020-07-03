'use strict'

var { getTodos, getTodosAssignedTo } = require('./todos')
var argv = require('yargs').argv
var fs = require('fs')
var path = require('path')
var cwd = path.dirname(__dirname)
var { PEOPLE_ALIASES, TEAM_FOLDER, TODO_ANCHOR, TODO_ANCHOR_HEADING_LEVEL } = require('./constants')

function getGroupNames(todos) {
  // Sort todos by date before grouping to ensure groups are ordered by date
  return todos.sort((a, b) => a.fileDate < b.fileDate ? 1 : -1)
    .reduce((arr, todo) => {
      if (!arr.includes(todo.groupName)) {
        arr.push(todo.groupName)
      }
      return arr
    }, [])
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
 * @return {String}
 */
function groupedTodos(todos, filePath, options = {}) {
  const groupNames = getGroupNames(todos)
  let groupedStr = `${options.prefix}` || ''

  groupNames.forEach(groupName => {
    const groupTodos = todos.filter((todo) => todo.groupName === groupName).sort((a, b) => a.id > b.id ? 1 : -1)
    // Get relative path to ensure links are correct
    const relativeFilePath = path.relative(path.dirname(filePath), path.join(cwd, groupTodos[0].filePath))
    const groupPath = encodeURIComponent(relativeFilePath).replace(/%2F/g, '/')

    groupedStr = `${groupedStr}\n${TODO_GROUP_HEADING_LEVEL} [${groupName}](${groupPath})\n${
      groupTodos.map(todo => (
        `- [ ] ${todo.todo}`
      )).join('\n')
      }`
  })

  return groupedStr
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
    !nodePathName.startsWith(path.join(cwd, TEAM_FOLDER))
  )

  folders.forEach(folder => {
    fs.readdirSync(path.resolve(cwd, folder)).forEach((node) => {
      const nodePathName = path.resolve(cwd, folder, node)
      const nodeStats = fs.statSync(nodePathName)

      if (nodeStats.isDirectory() && isValidFolder(nodePathName)) {
        const readmeFilepath = path.join(nodePathName, 'README.md')

        // Update the README.md file if it exists
        if (fs.existsSync(readmeFilepath)) {
          const todos = getTodos(nodePathName)

          writeTodos(readmeFilepath, todos)
        }

        updateTodosForFolders([nodePathName])
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
  const person = PEOPLE_ALIASES[assignedTo.toLowerCase()] || assignedTo
  const alias = Object.keys(PEOPLE_ALIASES).find(key => PEOPLE_ALIASES[key] === assignedTo) || assignedTo
  const todos = getTodosAssignedTo(alias)

  // Compose filePath based on assignedTo for either an person or root for mine
  let filePath = path.join(cwd, TEAM_FOLDER, person, 'README.md')
  if (['me', 'mine'].includes(assignedTo.toLowerCase())) {
    filePath = path.join(cwd, 'README.md')
  }

  writeTodos(filePath, todos)
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
    fs.accessSync(filePath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK)
  } catch (error) {
    console.error('Cannot write to', filePath)
    return false
  }

  const src = fs.readFileSync(filePath, 'utf8')
  let start = src.indexOf(TODO_ANCHOR)
  let end
  let chunks = []

  // File does not contain a TODO_ANCHOR header, append to the end
  if (start === -1) {
    start = src.length
    end = src.length
  }
  // File contains an # TODO_ANCHOR header, replace it
  else {
    end = src.substring(start + TODO_ANCHOR.length).indexOf(`\n${TODO_ANCHOR_HEADING_LEVEL} `) + start + TODO_ANCHOR.length

    // If end is the same as start, assume the end of the file
    if (end === start + TODO_ANCHOR.length - 1) {
      end = src.length
    }
  }

  // Beginning of file to start of todos chunk
  chunks.push(src.substring(0, start).trim())

  // Todos grouped by file
  chunks.push(groupedTodos(todos, filePath, { prefix: TODO_ANCHOR }))

  // End of todos chunk to end of file
  chunks.push(src.substring(end).trim())

  fs.writeFileSync(filePath, chunks.join('\n\n').trim() + '\n')

  return true
}

if (require.main === module) {
  updateTodosForPerson(argv.assignedTo)
}

module.exports = {
  default: updateTodosForPerson,
  updateTodosForPerson,
  updateTodosForFolders
}
