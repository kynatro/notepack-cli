const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const os = require('os');
const updateTodos = require('./updateTodos');
const team = require('./team');
const recentFiles = require('./recentFiles');
const { RUNNING_TESTS, WATCHING_FILE_NAME } = require('./constants');
const { updateTodosFromReadme } = require('./updateTodosFromReadme');
const { APP_ROOT_FOLDER, BASE_FOLDERS, TEAM_FOLDER } = require('./userConfig').getUserConfig();

// Watch location based on user specified APP_ROOT_FOLDER
// const watcher = chokidar.watch('**/*.md', { cwd: APP_ROOT_FOLDER });
const watcher = chokidar.watch('.', {
  ignored: (path, stats) => stats?.isFile() && !path.endsWith('.md'),
  cwd: APP_ROOT_FOLDER
});

const model = {
  exitScript,
  updateTodosForAll,
  updateTodosForMe,
  updateRecentFiles,
  updateTodosForReadme,
  watcher
};

/**
 * Clean up files
 * 
 * Removes the .WATCHING file that houses the PID for the watcher when
 * started by the "notepack" bin script.
 * 
 * @requires fs
 * @requires path
 */
function exitScript() {
  const watchingFilePath = path.join(os.homedir(), WATCHING_FILE_NAME)

  // Gate removal of file for testing
  if (fs.existsSync(watchingFilePath)) {
    fs.unlinkSync(watchingFilePath);
  }

  model.watcher.close().then(() => process.exit());
}

/**
 * Update todos for all team members
 * 
 * Iterates through all team members and updates their respective folders
 * 
 * @requires notepack-cli/team.getTeamMembers
 * @requires notepack-cli/updateTodos.updateTodosForPerson
 */
function updateTodosForAll() {
  console.log('Updating todos for all:');

  const teamMembers = team.getTeamMembers();

  teamMembers.forEach(({ name }) => {
    console.log(`Updating todos for ${name}...`);
    updateTodos.updateTodosForPerson(name);
  })

  model.updateTodosForMe();
}

/**
 * Update todos for "me"
 * 
 * Updates the todos assigned to the project owner
 * 
 * @requires notepack-cli/updateTodos.updateTodosForPerson
 */
function updateTodosForMe() {
  console.log('Updating todos for me');
  updateTodos.updateTodosForPerson('Me');
}

/**
 * Update recent file list
 *
 * Updates the list of recently modified/created files in the root README.md file
 *
 * @requires notepack-cli/recentFiles.updateRecentFiles
 */
function updateRecentFiles() {
  console.log('Updating recent files');
  recentFiles.updateRecentFiles();
}

function updateTodosForReadme(filePath) {
  console.log('Updating todos for README:', filePath);
  updateTodosFromReadme(path.join(APP_ROOT_FOLDER, filePath));
}

/**
 * Monitor change events from chokidar watcher
 * 
 * Updates todos for a user or every(one|thing) depending on the file path
 * received. If the file path is in a team member's folder, only their todos
 * and the project owner's will be updated. If a file path is outside the 
 * team member folder, everything is updated.
 * 
 * @requires path
 * @requires notepace/updateTodos.updateTodosForPerson
 * @requires notepace/updateTodos.updateTodosForFolders
 */
watcher.on('change', (filePath) => {
  // Process todo completion on README files
  if (filePath.includes('README.md')) {
    model.updateTodosForReadme(filePath);
  } else {
    // Execute specific team member update for files in a team member folder
    if (filePath.includes(TEAM_FOLDER)) {
      const teamMember = filePath.replace(`${TEAM_FOLDER}/`, '').split('/')[0];
      console.log(`Updating todos for ${teamMember}`);
      updateTodos.updateTodosForPerson(teamMember);
      model.updateTodosForMe();
    }
    // Otherwise, update everything
    else {
      model.updateTodosForAll();

      console.log('Updating todos for folders...');
      updateTodos.updateTodosForFolders(BASE_FOLDERS);
    }

    model.updateRecentFiles();
  }
})

// Ensure the process cleans up when terminated
process.on('SIGINT', exitScript);
process.on('SIGTERM', exitScript);
process.on('EXIT', exitScript);

// Do not run this while testing
if (!RUNNING_TESTS) {
  // Start with a fresh update
  model.updateTodosForAll();
  model.updateRecentFiles();
  updateTodos.updateTodosForFolders(BASE_FOLDERS);
  
  console.log('Watching folders...');
}

module.exports = model;