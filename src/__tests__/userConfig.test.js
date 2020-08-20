'use strict';

const notepackConfigMock = require('../__mocks__/notepack_config.mock')
const userConfigModel = require('../userConfig');
const { CONFIG_FILE_PATH, getUserConfig, readUserConfig, writeUserConfig } = userConfigModel;
const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('fs');

describe('getUserConfig()', () => {

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
      fs.readFileSync = jest.fn(() => JSON.stringify(notepackConfigMock));

      expect(readUserConfig()).toEqual(notepackConfigMock);
    });
  });
});

describe('writeUserConfig()', () => {

});
