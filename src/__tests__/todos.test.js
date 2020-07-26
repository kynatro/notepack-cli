'use strict';

const { getAssignment, getAssignmentAlias, getTodos, getTodosAssignedTo } = require('../todos');
const { MOCK_FILE_INFO, TEAM_MEMBERS } = require('../__mocks__/notes.mock');
const { describe } = require('yargs');

jest.mock('fs');

beforeEach(() => {
  require('fs').__setMockFiles(MOCK_FILE_INFO);
});

describe('getAssignment()', () => {
  test.todo('should return "Me" for an un-assigned todo');
  test.todo('should return a team member name for an assigned todo');
});

describe('getAssignmentAlias()', () => {
  test.todo('should return the alias of the @mention assignment if it exists');
  test.todo('should return the @mention assignment if no alias is found');
});

describe('getTodos()', () => {
  test.todo('returns an Array');
  test.todo('contains all todos assigned to anyone');
});

describe('getTodosAssignedTo()', () => {
  test.todo('returns an Array');
  test.todo('contains all todos assigned to an individual');
});