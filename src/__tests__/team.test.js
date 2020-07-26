'use strict';

const yaml = require('js-yaml');
const { formatAlias, getTeamMembers, getTeamMemberAliases } = require('../team');
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

beforeEach(() => {
  require('fs').__setMockFiles(MOCK_FILE_INFO);
});

describe('formatAlias()', () => {
  test('makes string lowercase', () => {
    const mixedCaseName = 'RoBeRt';

    expect(formatAlias(mixedCaseName)).toEqual(mixedCaseName.toLowerCase());
  });

  test('replaces spaces with periods', () => {
    const nameWithSpaces = 'Robert Paulson';

    expect(formatAlias(nameWithSpaces)).toEqual(nameWithSpaces.toLowerCase().replace(/\s/gi, '.'));
  });
});

describe('getTeamMembers()', () => {
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
      aliases && aliases.forEach(alias => expect(teamMembersAliases).toContain(alias));
    });
  })
});

describe('getTeamMemberAliases()', () => {
  test('returns an Object', () => {
    const teamMemberAliases = getTeamMemberAliases();
    expect(typeof(teamMemberAliases)).toBe('object');
  });

  test('return Object contains formatted alias keys for each team member name', () => {
    const teamMemberAliases = getTeamMemberAliases();
    
    Object.keys(TEAM_MEMBERS).forEach((name) => {
      expect(teamMemberAliases[formatAlias(name)]).toBeDefined();
    });
  });

  test('return Object contains formatted alias keys for each team member alias', () => {
    const teamMemberAliases = getTeamMemberAliases();

    Object.values(TEAM_MEMBERS).forEach(({ aliases }) => {
      aliases && aliases.forEach(alias => {
        expect(teamMemberAliases[formatAlias(alias)]).toBeDefined();
      });
    });
  });

  test('return Object alias keys to match the team member name', () => {
    const teamMemberAliases = getTeamMemberAliases();
    
    Object.keys(TEAM_MEMBERS).forEach((name) => {
      const { aliases } = TEAM_MEMBERS[name];

      aliases && aliases.forEach(alias => {
        expect(teamMemberAliases[formatAlias(alias)]).toEqual(name);
      })
    })
  });

  test('return Object formatted name keys to match the team member name', () => {
    const teamMemberAliases = getTeamMemberAliases();
    
    Object.keys(TEAM_MEMBERS).forEach((name) => {
      expect(teamMemberAliases[formatAlias(name)]).toEqual(name);
    });
  });
});