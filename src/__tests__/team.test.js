'use strict';

const yaml = require('js-yaml');
const { getTeamMembers } = require('../team');
const { APP_ROOT_FOLDER, TEAM_FOLDER } = require('../constants');
const path = require('path');
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

jest.mock('fs');

describe('getTeamMembers()', () => {
  beforeEach(() => {
    require('fs').__setMockFiles(MOCK_FILE_INFO);
  });

  test('returns an Array', () => {
    const teamMembers = getTeamMembers();
    expect(Array.isArray(teamMembers)).toBeTruthy();
  });

  test('finds all team members in the team folder', () => {
    const teamMembers = getTeamMembers();
    expect(teamMembers.length).toEqual(Object.keys(TEAM_MEMBERS).length);
  });

  test('finds aliases for team members in the team folder', () => {
    const teamMembers = getTeamMembers();
    const teamMembersAliases = Object.values(teamMembers).reduce((arr, { aliases }) => ([...arr, ...aliases]), []);

    Object.values(TEAM_MEMBERS).forEach(({ aliases }) => {
      aliases && aliases.forEach(alias => expect(teamMembersAliases.includes(alias)).toBeTruthy());
    });
  })
});