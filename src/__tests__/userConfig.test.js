'use strict';

const userConfigModel = require('../userConfig');
const { CONFIG_FILE_PATH, getUserConfig, readUserConfig, writeUserConfig } = userConfigModel;
const helpers = require('../helpers');
const fs = require('fs');
const userConfigData = {
  appRootFolder: 'example',
  baseFolders: [],
  teamFolder: 'Team',
  todoAnchor: 'Open Todos',
  todoAnchorHeadingLevel: '##',
  todoGroupHeadingLevel: '####'
};

jest.mock('fs');

describe('getUserConfig()', () => {
  beforeEach(() => {
    userConfigModel.USER_CONFIG = undefined;
  });

  test('returns an Object shape', () => {
    userConfigModel.readUserConfig = jest.fn(() => userConfigData);

    expect(getUserConfig()).toEqual(expect.objectContaining({
      APP_ROOT_FOLDER: expect.any(String),
      BASE_FOLDERS: expect.any(Array),
      TEAM_FOLDER: expect.any(String),
      TODO_ANCHOR_HEADING_LEVEL: expect.any(String),
      TODO_ANCHOR: expect.any(String),
      TODO_GROUP_HEADING_LEVEL: expect.any(String)
    }));
  });

  test('only calls readUserConfig() once', () => {
    userConfigModel.readUserConfig = jest.fn(() => userConfigData);

    getUserConfig();
    getUserConfig();

    expect(userConfigModel.readUserConfig).toHaveBeenCalledTimes(1);
  });
});

describe('readUserConfig()', () => {
  test('checks for existence of config file at CONFIG_FILE_PATH', () => {
    fs.existsSync = jest.fn();
    
    readUserConfig();

    expect.assertions(1);

    expect(fs.existsSync).toHaveBeenCalledWith(CONFIG_FILE_PATH);
  });

  describe('when CONFIG_FILE_PATH cannot be found', () => {
    beforeEach(() => {
      fs.existsSync = jest.fn(() => false);
    });
    
    test('returns false when file at CONFIG_FILE_PATH cannot be found', () => {
      expect(readUserConfig()).toBeFalsy();
    });
  });

  describe('when CONFIG_FILE_PATH is found', () => {
    beforeEach(() => {
      fs.existsSync = jest.fn(() => true);
    });
  
    test('reads file contents at CONFIG_FILE_PATH if file exists', () => {
      fs.readFileSync = jest.fn();
  
      readUserConfig();
  
      expect.assertions(1);
  
      expect(fs.readFileSync).toHaveBeenCalledWith(CONFIG_FILE_PATH);
    });
  
    test('returns JSON data from CONFIG_FILE_PATH if file exists', () => {
      fs.readFileSync = jest.fn(() => JSON.stringify(userConfigData));

      expect(readUserConfig()).toEqual(userConfigData);
    });
  });
});

describe('writeUserConfig()', () => {
  describe('when isWriteable(CONFIG_FILE_PATH) is true', () => {
    beforeEach(() => {
      helpers.isWriteable = jest.fn(() => true);
    });

    test('writes configuration to CONFIG_FILE_PATH', () => {
      fs.writeFileSync = jest.fn();

      writeUserConfig(userConfigData);

      expect(fs.writeFileSync).toHaveBeenCalledWith(CONFIG_FILE_PATH, JSON.stringify(userConfigData, null, 2));
    });

    describe('when writeFileSync() is successful', () => {
      beforeEach(() => {
        fs.writeFileSync = jest.fn(() => true);
      })

      test('returns true', () => {
        expect(writeUserConfig()).toBeTruthy();
      });
    });

    describe('when writeFileSync() is unsuccessful', () => {
      beforeEach(() => {
        fs.writeFileSync = jest.fn(() => { throw Error() });

        test('logs an error', () => {
          console.error = jest.fn();

          writeUserConfig();

          expect(console.error).toHaveBeenCalled();
        });

        test('returns false', () => {
          expect(writeUserConfig()).toBeFalsy()
        });
      })
    });
  });

  describe('when isWriteable(CONFIG_FILE_PATH) is false', () => {
    beforeEach(() => {
      helpers.isWriteable = jest.fn(() => false);
    });

    test('returns false', () => {
      expect(writeUserConfig()).toBeFalsy();
    });
  });
});
