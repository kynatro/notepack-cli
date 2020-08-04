'use strict';

const userConfig = require('../userConfig');
const notepackConfigMock = require('../__mocks__/notepack_config.mock')
userConfig.getUserConfig = jest.fn(() => notepackConfigMock);

const updateTodos = require('../updateTodos');
const { getGroupNames, groupRelativePath, groupedTodos, isValidFolder, updateTodosForFolders, updateTodosForPerson, writeTodos } = updateTodos;

const fs = require('fs');
const path = require('path');
const { MOCK_FILE_INFO, NOTES } = require('../__mocks__/notes.mock');
const { todos: MOCK_TODOS, groupNames: MOCK_GROUP_NAMES } = require('../__mocks__/todos.mock');
const { TEAM_FOLDER } = require('../__mocks__/notepack_config.mock');
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

describe('isValidFolder()', () => {
  test('returns true for folders that are not archives or team folders', () => {
    expect(isValidFolder('foobar')).toBeTruthy();
  });

  test('returns false for folders with "archive" in their name', () => {
    expect(isValidFolder('archive')).toBeFalsy();
  });

  test('returns false for folders in the project TEAM_FOLDER', () => {
    expect(isValidFolder(path.join(APP_ROOT_FOLDER, TEAM_FOLDER, 'Team Member'))).toBeFalsy();
  });
});

describe('updateTodosForFolders()', () => {
  beforeEach(() => {
    updateTodos.writeTodos = jest.fn();
  });

  test('skips processing folders when isValidFolder() returns false', () => {
    updateTodos.updateTodosForFolders(['Notes']);
    expect(updateTodos.writeTodos).not.toHaveBeenCalledWith(expect.stringContaining('archives'), expect.any(Array));
  });

  test('calls writeTodos for directories with README.md files', () => {
    updateTodos.updateTodosForFolders(['Notes/Projects']);
    expect(updateTodos.writeTodos).toHaveBeenCalledWith(expect.stringContaining('Project 1/README.md'), expect.any(Array));    
  });
  
  test('does not call writeTodos for directories with README.md files', () => {
    updateTodos.updateTodosForFolders(['Notes/Projects']);
    expect(updateTodos.writeTodos).not.toHaveBeenCalledWith(expect.stringContaining('Project 2/README.md'), expect.any(Array));
  });
});

describe('updateTodosForPerson()', () => {
  beforeEach(() => {
    updateTodos.writeTodos = jest.fn();
  })

  test('calls writeTodos when a team member is passed in', () => {
    updateTodos.updateTodosForPerson('Jane');
    expect(updateTodos.writeTodos).toHaveBeenCalledWith(expect.stringContaining('Jane'), expect.any(Array));
  });
  
  test('calls writeTodos for the project root README when no team member is passed in', () => {
    updateTodos.updateTodosForPerson();
    expect(updateTodos.writeTodos).toHaveBeenCalledWith(path.join(APP_ROOT_FOLDER, 'README.md'), expect.any(Array));
  });
  
  test('calls writeTodos for the project root README when "me" is passed in', () => {
    updateTodos.updateTodosForPerson('me');
    expect(updateTodos.writeTodos).toHaveBeenCalledWith(path.join(APP_ROOT_FOLDER, 'README.md'), expect.any(Array));
  });
});

describe('writeTodos()', () => {
  test('returns false if file is not writable', () => {
    fs.accessSync = jest.fn(() => {
      throw new Error('error');
    });

    // Prevent error from logging
    console.error = jest.fn();

    expect(writeTodos('README.md', [])).toBeFalsy();
  });
  
  test('logs an error if file is not writable and not running in the background', () => {
    fs.accessSync = jest.fn(() => {
      throw new Error('error');
    });

    // Prevent error from logging
    console.error = jest.fn();

    writeTodos('README.md', []);
    expect(console.error).toHaveBeenCalled();
  });
  
  test('writes todos to the end of the file if no TODO_ANCHOR can be found', () => {
    fs.accessSync = jest.fn(() => true);
    fs.readFileSync = jest.fn().mockReturnValue('# Start of File\n\n# End of File');
    fs.writeFileSync = jest.fn();

    const filePath = path.resolve(APP_ROOT_FOLDER, 'README.md');

    writeTodos(filePath, MOCK_TODOS);

    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, expect.stringContaining(`# End of File\n\n${TODO_ANCHOR}`));
  });

  test('replaces the todo section in the file when TODO_ANCHOR is found', () => {
    fs.accessSync = jest.fn(() => true);
    fs.readFileSync = jest.fn().mockReturnValue(`# Start of File\n\n${TODO_ANCHOR}\n\n# End of File`);
    fs.writeFileSync = jest.fn();

    const filePath = path.resolve(APP_ROOT_FOLDER, 'README.md');

    writeTodos(filePath, MOCK_TODOS);

    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, expect.stringContaining(`# Start of File\n\n${TODO_ANCHOR}`));
  });
});