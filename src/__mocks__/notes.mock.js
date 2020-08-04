const yaml = require('js-yaml');
const path = require('path');
const { APP_ROOT_FOLDER, TEAM_FOLDER } = require('../userConfig').getUserConfig();

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

const NOTES = {
  'Note 1.md': `## Follow-up
- [ ] Self-assigned
- [ ] @John assigned`,
  '2020-07-26 Note 2.md': `## Follow-up
- [ ] @Jane assigned`,
  'Notes': 'directory',
  'Notes/README.md': '# Notes',
  'Notes/Projects': 'directory',
  'Notes/Projects/Project 1': 'directory',
  'Notes/Projects/Project 1/README.md': '# Project 1',
  'Notes/Projects/Project 1/Note 1.md': '- [ ] @Joe do things',
  'Notes/Projects/Project 2': 'directory',
  'Notes/Projects/Project 2/Note 1.md': '- [ ] @Joe do things',
  'Notes/archives': 'directory',
  'Notes/archives/Note 3.md': `- [ ] Will not be processed`,
  'Notes/archives/README.md': 'Will not be processed'
}

let MOCK_FILE_INFO = {};

Object.keys(TEAM_MEMBERS).reduce((obj, name) => {
  obj[path.join(TEAM_FOLDER_PATH, name)] = 'directory';
  obj[path.join(TEAM_FOLDER_PATH, name, 'README.md')] = (
    `---
${yaml.dump(TEAM_MEMBERS[name])}
---`
  );
  return obj;
}, MOCK_FILE_INFO);

Object.keys(NOTES).reduce((obj, filename) => {
  obj[path.join(APP_ROOT_FOLDER, filename)] = NOTES[filename];
  return obj;
}, MOCK_FILE_INFO);

module.exports = {
  MOCK_FILE_INFO,
  NOTES,
  TEAM_MEMBERS
};