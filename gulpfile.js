const { updateTodosForFolders, updateTodosForPerson } = require('./src/updateTodos');
const { watch } = require('gulp');
const fs = require('fs');
const path = require('path');
const cwd = __dirname;
const { BASE_FOLDERS, TEAM_FOLDER, APP_ROOT_FOLDER } = require('./src/constants');
const { getTeamMembers } = require('./src/team');

// Clean up file indicating watch is already running
function exitScript() {
  const watchingFilePath = path.join(cwd, '.WATCHING')
  
  if (fs.existsSync(watchingFilePath)) {
    fs.unlinkSync(watchingFilePath);
  }
  
  process.exit();
}

function updateTodosForAll() {
  console.log('Updating todos for all:');

  const teamMembers = getTeamMembers();

  teamMembers.forEach(({ name }) => {
    console.log(`Updating todos for ${name}...`);
    updateTodosForPerson(name);
  })

  updateTodosForMe();
}

function updateTodosForMe() {
  console.log('Updating todos for me');
  updateTodosForPerson('Me');
}

const watcher = watch(['**/*.md'], { cwd: APP_ROOT_FOLDER });

watcher.on('change', (path) => {
  if (!path.includes('README.md')) {
    if (path.includes(TEAM_FOLDER)) {
      const teamMember = path.replace(`${TEAM_FOLDER}/`, '').split('/')[0];
      console.log(`Updating todos for ${teamMember}`);
      updateTodosForPerson(teamMember);
      updateTodosForMe();
    } else {
      updateTodosForAll();

      console.log('Updating todos for folders...');
      updateTodosForFolders(BASE_FOLDERS);
    }
  }
})

process.on('SIGINT', exitScript);
process.on('SIGTERM', exitScript);
process.on('EXIT', exitScript);

updateTodosForAll();

exports.default = (cb) => {
  console.log('Watching folders...');
  cb();
}
