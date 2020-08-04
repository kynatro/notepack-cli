'use strict';

const userConfig = require('../userConfig');
const notepackConfigMock = require('../__mocks__/notepack_config.mock')
userConfig.getUserConfig = jest.fn().mockReturnValue(notepackConfigMock);

const path = require('path');
const { cleanTodo, formatAssignment, getAssignment, getAssignmentAlias, getTodos, getTodosAssignedTo, groupName } = require('../todos');
const { MOCK_FILE_INFO, NOTES } = require('../__mocks__/notes.mock');
const { APP_ROOT_FOLDER } = notepackConfigMock;

jest.mock('fs');

beforeEach(() => {
  require('fs').__setMockFiles(MOCK_FILE_INFO);
});

describe('cleanTodo()', () => {
  test('removes "- [ ]" prefix from a todo and trims', () => {
    const todo = '- [ ] Foo';
    
    expect(cleanTodo(todo)).toEqual('Foo');
  });
});

describe('formatAssignment()', () => {
  test('removes "@" from assignment @mention and replaces "." with " "', () => {
    const mention = '@John.Doe';

    expect(formatAssignment(mention)).toEqual('John Doe');
  });
});

describe('getAssignment()', () => {
  test('should return "Me" for an un-assigned todo', () => {
    const unassignedTodo = 'Follow-up with John';

    expect(getAssignment(unassignedTodo)).toBe('Me');
  });
  
  test('should return the @mention name for an assigned todo', () => {
    const assignedTodo = '@John to build the thing';

    expect(getAssignment(assignedTodo)).toBe('John');
  });
});

describe('getAssignmentAlias()', () => {
  test('should return the alias of the @mention assignment if it exists', () => {
    const assignment = '@John';

    expect(getAssignmentAlias(assignment)).toBe('Johnathan Doe');
  });
  test('should return the @mention assignment if no alias is found', () => {
    const assignment = '@Robert';

    expect(getAssignmentAlias(assignment)).toBe('Robert');
  });
});

describe('getTodos()', () => {
  test('returns an Array', () => {
    expect(Array.isArray(getTodos())).toBeTruthy();
  });

  test('contains all todos assigned to anyone', () => {
    // Archive folders are skipped
    const validNotes = Object.keys(NOTES).filter(key => !/archive/gi.test(key)).map(key => NOTES[key]);
    const todosLength = Object.values(validNotes).join('\n').match(/- \[ \]/gi).length;

    expect(getTodos().length).toEqual(todosLength);
  });

  describe('a todo', () => {
    test('should have an id key that is a Number', () => {
      const todos = getTodos();
      const todo = todos[0];

      expect(todo.id).toEqual(expect.any(Number));
    });

    test('should have a filePath key that is a String', () => {
      const todos = getTodos();
      const todo = todos[0];

      expect(todo.filePath).toEqual(expect.any(String));
    });

    test('should have a fileName key that is a String', () => {
      const todos = getTodos();
      const todo = todos[0];

      expect(todo.fileName).toEqual(expect.any(String));
    });

    test('should have a fileName key that is a String', () => {
      const todos = getTodos();
      const todo = todos[0];

      expect(todo.groupName).toEqual(expect.any(String));
    });

    test('should have a todo key that is a String', () => {
      const todos = getTodos();
      const todo = todos[0];

      expect(todo.todo).toEqual(expect.any(String));
    });

    test('should have an assignedTo key that is a String', () => {
      const todos = getTodos();
      const todo = todos[0];

      expect(todo.assignedTo).toEqual(expect.any(String));
    });

    test('should have an assignedToAlias key that is a String', () => {
      const todos = getTodos();
      const todo = todos[0];

      expect(todo.assignedToAlias).toEqual(expect.any(String));
    });

    test('should have a fileCreateTime key that is a Date', () => {
      const todos = getTodos();
      const todo = todos[0];

      expect(todo.fileCreateTime).toEqual(expect.any(Date));
    });

    test('should have a fileDate key that is undefined when the todo file is not prefixed with a date (YYYY-MM-DD)', () => {
      const todos = getTodos();
      const todo = todos[0];

      expect(todo.fileDate).toBeNull();
    });

    test('should have a fileDate key that is a String when the todo file is prefixed with a date (YYYY-MM-DD)', () => {
      const todos = getTodos();
      const todo = todos.find(({ fileName }) => /^\d{4}(-\d{2}){0,2}/.test(fileName));

      expect(todo.fileDate).toEqual(expect.any(String));
    });
  });
});

describe('getTodosAssignedTo()', () => {
  test('returns an Array', () => {
    const todos = getTodosAssignedTo('John');

    expect(Array.isArray(todos)).toBeTruthy();
  });
  test('contains all todos assigned to an individual', () => {
    const todos = getTodosAssignedTo('John');

    todos.forEach(({ assignedToAlias }) => expect(assignedToAlias).toEqual('Johnathan Doe'));
  });
  test('when passed "Me" contains all todos assigned to me', () => {
    const todos = getTodosAssignedTo('Me');

    todos.forEach(({ assignedToAlias }) => expect(assignedToAlias).toEqual('Me'));
  });
});

describe('groupName()', () => {
  test('returns formatted string with parent folder and filename without file extension', () => {
    const parentFolder = 'Project 1';
    const fileName = '2020-07-26 Note 1.md';
    const nodePathname = path.join(APP_ROOT_FOLDER, parentFolder, fileName);

    expect(groupName(nodePathname)).toEqual(`${parentFolder} / ${path.basename(fileName, '.md')}`);
  });

  test('returns formatted string with parent of parent folder and filename without extension when parent folder and filename match', () => {
    const grandParentFolder = 'Project 1';
    const parentFolder = '2020-07-26 Note 1';
    const fileName = '2020-07-26 Note 1.md';
    const nodePathname = path.join(APP_ROOT_FOLDER, grandParentFolder, parentFolder, fileName);

    expect(groupName(nodePathname)).toEqual(`${grandParentFolder} / ${parentFolder}`);
  });
});