'use strict';

const userConfig = require('../userConfig');
const notepackConfigMock = require('../__mocks__/notepack_config.mock')
userConfig.getUserConfig = jest.fn().mockReturnValue(notepackConfigMock);

const { formatAlias, getTeamMembers, getTeamMemberAliases } = require('../team');
const { MOCK_FILE_INFO, TEAM_MEMBERS } = require('../__mocks__/notes.mock');

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