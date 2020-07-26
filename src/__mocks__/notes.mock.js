const yaml = require('js-yaml');
const path = require('path');
const { APP_ROOT_FOLDER, TEAM_FOLDER } = require('../constants');

const TEAM_FOLDER_PATH = path.resolve(APP_ROOT_FOLDER, TEAM_FOLDER);
const TEAM_MEMBERS = {
  'Jane Doe': {
    isNonReporting: true,
    aliases: ['Jane']
  },
  'Johnathan Doe': {
    aliases: ['John Doe', 'John', 'Johnathan']
  }
};

const MOCK_FILE_INFO = Object.keys(TEAM_MEMBERS).reduce((obj, name) => {
  obj[path.join(TEAM_FOLDER_PATH, name)] = 'directory';
  obj[path.join(TEAM_FOLDER_PATH, name, 'README.md')] = (
    `---
${yaml.dump(TEAM_MEMBERS[name])}
---`
  );
  return obj;
}, {});

module.exports = {
  MOCK_FILE_INFO,
  TEAM_MEMBERS
};