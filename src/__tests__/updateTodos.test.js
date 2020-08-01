'use strict';

const userConfig = require('../userConfig');
const notepackConfigMock = require('../__mocks__/notepack_config.mock')
userConfig.getUserConfig = jest.fn().mockReturnValue(notepackConfigMock);

const path = require('path');
const { getGroupNames, groupRelativePath, groupedTodos, updateTodosForFolders, updateTodosForPerson, writeTodos } = require('../updateTodos');
const { MOCK_FILE_INFO, NOTES } = require('../__mocks__/notes.mock');
const { todos: MOCK_TODOS, groupNames: MOCK_GROUP_NAMES } = require('../__mocks__/todos.mock');
const { APP_ROOT_FOLDER, TODO_ANCHOR, TODO_GROUP_HEADING_LEVEL } = notepackConfigMock;
const readmeFilePath = path.resolve(APP_ROOT_FOLDER, 'README.md');

jest.mock('fs');

beforeEach(() => {
  require('fs').__setMockFiles(MOCK_FILE_INFO);
});

describe('getGroupNames()', () => {
  test('returns an Array', () => {
    expect(Array.isArray(getGroupNames(MOCK_TODOS))).toBeTruthy();
  });

  test('returns a de-duped list of group names', () => {
    expect(getGroupNames(MOCK_TODOS)).toHaveLength(MOCK_GROUP_NAMES.length);

    for (let i in MOCK_GROUP_NAMES) {
      expect(getGroupNames(MOCK_TODOS)[i]).toEqual(MOCK_GROUP_NAMES[i]);
    }
  });
});

describe('groupRelativePath()', () => {
  const groupFilePath = './Project 1/Note 1.md';
  const result = groupRelativePath(readmeFilePath, groupFilePath);

  test('returns a String', () => {
    expect(typeof(result)).toEqual('string');
  });

  test('returns an encoded file path', () => {
    expect(result).toEqual(expect.stringContaining('%20'));
  });

  test('returns an encoded file path with %2F characters un-encoded', () => {
    expect(result).toEqual(expect.stringContaining('/'));
    expect(result).toEqual(expect.not.stringContaining('%2F'));
  });
});

describe('groupedTodos()', () => {
  let result;

  beforeEach(() => {
    result = groupedTodos(MOCK_TODOS, readmeFilePath);
  });

  test('returns a String', () => {
    expect(typeof(result)).toEqual('string');
  });

  test('returns a string that starts with the prefix option value when it is specified', () => {
    const result = groupedTodos(MOCK_TODOS, readmeFilePath, { prefix: TODO_ANCHOR });
    expect(result.startsWith(TODO_ANCHOR)).toBeTruthy();
  });

  test('returns a string with linked headings for todo groups', () => {
    MOCK_GROUP_NAMES.forEach(groupName => {
      const { filePath } = MOCK_TODOS.find(todo => todo.groupName === groupName);

      expect(result).toEqual(expect.stringContaining(`${TODO_GROUP_HEADING_LEVEL} [${groupName}](${groupRelativePath(readmeFilePath, filePath)})`));
    });
  });

  test('returns a string with todos', () => {
    expect(result).toEqual(expect.stringContaining('- [ ]'));
  });

  test('returns a string with todos grouped under their groupName', () => {
    MOCK_GROUP_NAMES.forEach(groupName => {
      const groupedTodos = MOCK_TODOS.filter(todo => todo.groupName === groupName);
      const groupStart = result.indexOf(`${TODO_GROUP_HEADING_LEVEL} [${groupName}]`);
      let groupChunk = result.substr(groupStart + TODO_GROUP_HEADING_LEVEL.length)
      const groupEnd = groupChunk.indexOf(TODO_GROUP_HEADING_LEVEL) > -1 ? groupChunk.indexOf(TODO_GROUP_HEADING_LEVEL) : groupChunk.length;
      groupChunk = groupChunk.substr(0, groupEnd);

      groupedTodos.forEach(groupedTodo => {
        expect(groupChunk).toEqual(expect.stringContaining(`- [ ] ${groupedTodo.todo}`));
      });
    });
  });
});

describe('updateTodosForFolders()', () => {
  test.todo('skips processing archive folders');

  test.todo('writes todos in a folder to the README.md in the folder');

  test.todo('does not write todos outside of the folder the README.md is in');
});

describe('updateTodosForPerson()', () => {
  test.todo('writes todos for an assigned user to the README.md file for the team member');
  
  test.todo('writes todos for project owner to the project root README.md file when assigned user is not set');
});

describe('writeTodos()', () => {
  test.todo('returns false if file is not writable');
  
  test.todo('logs an error if file is not writable and not running in the background');
  
  test.todo('does not log an error if file is not writable and is running in the background');

  test.todo('writes todos to the end of the file if no TODO_ANCHOR can be found');

  test.todo('replaces the todo section in the file when TODO_ANCHOR is found');
});