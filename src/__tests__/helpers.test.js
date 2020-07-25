const { isValidNode } = require('../helpers');
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