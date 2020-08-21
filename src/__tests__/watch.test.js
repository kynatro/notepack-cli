'use strict';

const chokidar = require('chokidar');
const fs = require('fs');

const userConfig = require('../userConfig');
const notepackConfigMock = require('../__mocks__/notepack_config.mock')
userConfig.getUserConfig = jest.fn().mockReturnValue(notepackConfigMock);
const { MOCK_FILE_INFO } = require('../__mocks__/notes.mock');

const team = require('../team');
const updateTodos = require('../updateTodos');
const watchModel = require('../watch');
const { exitScript } = require('../watch');
const { BASE_FOLDERS, TEAM_FOLDER } = notepackConfigMock;
const { watcher, updateTodosForAll, updateTodosForMe } = watchModel;

jest.mock('fs');
jest.mock('process');

beforeEach(() => {
  fs.__setMockFiles(MOCK_FILE_INFO);

  console.log = jest.fn();
  updateTodos.updateTodosForFolders = jest.fn();
  updateTodos.updateTodosForPerson = jest.fn();
});

describe('watcher', () => {
  test('should be an instance of chokidar.watch', () => {
    expect(watcher).toBeInstanceOf(chokidar.FSWatcher);
  });

  describe('on change event', () => {
    describe('with a path that includes README.md', () => {
      beforeEach(() => {
        watcher.emit('change', 'README.md');
      });

      test('it should not call updateTodos.updateTodosForPerson()', () => {
        expect(updateTodos.updateTodosForPerson).not.toHaveBeenCalled();
      });

      test('it should not call updateTodosForAll()', () => {
        watchModel.updateTodosForAll = jest.fn();
        
        expect(watchModel.updateTodosForAll).not.toHaveBeenCalled();
      });
    });

    describe('with a path that does NOT include README.md', () => {
      describe('with a path that does not include the TEAM_FOLDER', () => {
        beforeEach(() => {
          watcher.emit('change', 'file.md');
        });

        test('a message should be logged', () => {
          expect(console.log).toHaveBeenCalled();
        });

        test('updateTodosForAll() to be called', () => {
          expect(watchModel.updateTodosForAll).toHaveBeenCalled();
        });

        test('updateTodos.updateTodosForFolders to be called for BASE_FOLDERS', () => {
          expect(updateTodos.updateTodosForFolders).toHaveBeenCalledWith(BASE_FOLDERS);
        });
      });
      
      describe('with a path that includes the TEAM_FOLDER', () => {
        const teamMember = 'John Doe';

        beforeEach(() => {
          updateTodos.updateTodosForPerson = jest.fn();
          watchModel.updateTodosForMe = jest.fn();

          watcher.emit('change', `${TEAM_FOLDER}/${teamMember}/file.md`);
        });
        
        test('a message should be logged for the team member being updated', () => {
          expect(console.log).toHaveBeenCalledWith(expect.stringContaining(teamMember));
        });

        test('updateTodos.updateTodosForPerson to be called for the team member', () => {
          expect(updateTodos.updateTodosForPerson).toHaveBeenCalledWith(teamMember);
        });

        test('updateTodosForMe() to be called', () => {
          expect(watchModel.updateTodosForMe).toHaveBeenCalled();
        });
      });
    });
  });
});

describe('exitScript()', () => {
  beforeEach(() => {
    watcher.close = jest.fn(() => Promise.resolve());
    process.exit = jest.fn();
    fs.unlinkSync = jest.fn();
  });

  test('removes .WATCHING file when it exists', () => {
    fs.existsSync = jest.fn(() => true);

    exitScript();

    expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('.WATCHING'));
  });

  test('does not remove .WATCHING file when it is not found', () => {
    fs.existsSync = jest.fn(() => false);

    exitScript();

    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  test('closes watcher', () => {
    exitScript();

    expect(watcher.close).toHaveBeenCalled();
  });

  test('exits after closing the watcher', async () => {
    watcher.close = jest.fn(() => Promise.resolve());

    await exitScript();

    expect(process.exit).toHaveBeenCalled();
  });
});

describe('updateTodosForAll()', () => {
  const teamMembers = [{name: 'Jane Doe'}, {name: 'John Doe'}];

  beforeEach(() => {
    team.getTeamMembers = jest.fn(() => teamMembers);
    watchModel.updateTodosForMe = jest.fn();

    updateTodosForAll();
  });

  test('calls updateTodosForPerson() for each team member', () => {
    teamMembers.forEach(({ name }) => {
      expect(updateTodos.updateTodosForPerson).toHaveBeenCalledWith(name);
    });
  });

  test('calls updateTodosForMe()', () => {
    expect(watchModel.updateTodosForMe).toHaveBeenCalled();
  });
});

describe('updateTodosForMe()', () => {
  test('calls updateTodos.updateTodosForPerson with "Me"', () => {
    updateTodosForMe();

    expect(updateTodos.updateTodosForPerson).toHaveBeenCalledWith('Me');
  });
});
