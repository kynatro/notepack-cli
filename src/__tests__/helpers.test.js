const fs = require('fs');
const { isValidNode, isWriteable } = require('../helpers');
const invalidFiles = [
  '.bin/notepack',
  '.git/HEAD',
  '.vscode',
  'node_modules/@babel/core/README.md',
  '.DS_Store',
  'Thumbs.db',
  'src/configure.js',
  'scripts/link.js',
  'font.ttf',
  'font.woff',
  'styles.css',
  'styles.scss',
  'styles.sass',
  'script.js',
  'data.json',
  '.editorconfig',
  'vector.svg',
  'README.md'
];
const validFiles = [
  'foo.md',
  '2020-07-25 Notes.md'
];

jest.mock('fs');

describe('isValidNode()', () => {
  invalidFiles.forEach(invalidFile => {
    test(`returns false for ${invalidFile}`, () => {
      expect(isValidNode(invalidFile)).toBeFalsy();
    });
  });
  
  validFiles.forEach(invalidFile => {
    test(`returns true for ${invalidFile}`, () => {
      expect(isValidNode(invalidFile)).toBeTruthy();
    });
  });
});

describe('isWriteable()', () => {
  const folderPath = 'folder';
  const filePath = `${folderPath}/foo.md`;

  beforeEach(() => {
    fs.accessSync = jest.fn();
  });

  test('returns true when accessSync check is valid', () => {
    fs.accessSync.mockReturnValueOnce(true);
    expect(isWriteable(filePath)).toBeTruthy();
  });

  test('returns false when accessSync check fails', () => {
    fs.accessSync.mockImplementationOnce(() => { throw new Error(); });
    expect(isWriteable(filePath)).toBeFalsy();
  });

  describe('when file exists', () => {
    beforeEach(() => {
      fs.existsSync = jest.fn(() => true);
    });
  
    test('checks writeability against the file', () => {
      isWriteable(filePath);

      expect(fs.accessSync).toHaveBeenCalledWith(expect.stringContaining(filePath), fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK)
    });
  });

  describe('when file does not exist', () => {
    beforeEach(() => {
      fs.existsSync = jest.fn(() => false);
    });

    test('checks writeability against the folder', () => {
      isWriteable(filePath);

      expect(fs.accessSync).toHaveBeenCalledWith(expect.stringContaining(folderPath), fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK)
    });
  });
});