const { watch } = require('gulp');
const fs = require('fs');
const path = require('path');
const { updateTodosForFolders, updateTodosForPerson } = require('./src/updateTodos');
const { getTeamMembers } = require('./src/team');
const { APP_ROOT_FOLDER, BASE_FOLDERS, TEAM_FOLDER } = require('./src/constants');

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
  const watchingFilePath = path.join(__dirname, '.WATCHING')

  // Gate removal of file for testing
  if (fs.existsSync(watchingFilePath)) {
    fs.unlinkSync(watchingFilePath);
  }
  
  process.exit();
}

/**
 * Update todos for all team members
 * 
 * Iterates through all team members and updates their respective folders
 * 
 * @requires notepack/team.getTeamMembers
 * @requires notepack/updateTodos.updateTodosForPerson
 */
function updateTodosForAll() {
  console.log('Updating todos for all:');

  const teamMembers = getTeamMembers();

  teamMembers.forEach(({ name }) => {
    console.log(`Updating todos for ${name}...`);
    updateTodosForPerson(name);
  })

  updateTodosForMe();
}

/**
 * Update todos for "me"
 * 
 * Updates the todos assigned to the project owner
 * 
 * @requires notepack/updateTodos.updateTodosForPerson
 */
function updateTodosForMe() {
  console.log('Updating todos for me');
  updateTodosForPerson('Me');
}

// Watch location based on user specified APP_ROOT_FOLDER
const watcher = watch(['**/*.md'], { cwd: APP_ROOT_FOLDER });

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
watcher.on('change', (path) => {
  // Prevent infinte loop
  if (!path.includes('README.md')) {
    // Execute specific team member update for files in a team member folder
    if (path.includes(TEAM_FOLDER)) {
      const teamMember = path.replace(`${TEAM_FOLDER}/`, '').split('/')[0];
      console.log(`Updating todos for ${teamMember}`);
      updateTodosForPerson(teamMember);
      updateTodosForMe();
    } 
    // Otherwise, update everything
    else {
      updateTodosForAll();

      console.log('Updating todos for folders...');
      updateTodosForFolders(BASE_FOLDERS);
    }
  }
})

// Ensure the process cleans up when terminated
process.on('SIGINT', exitScript);
process.on('SIGTERM', exitScript);
process.on('EXIT', exitScript);

// Start with a fresh update
updateTodosForAll();
updateTodosForFolders(BASE_FOLDERS);

exports.default = (cb) => {
  console.log('Watching folders...');
  cb();
}
