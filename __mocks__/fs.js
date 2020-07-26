'use strict';

const path = require('path');

const fs = jest.genMockFromModule('fs');

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = Object.create(null);
function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    const dir = path.dirname(file);
    
    if (!mockFiles[dir]) {
      mockFiles[dir] = {};
    }

    mockFiles[dir][path.basename(file)] = newMockFiles[file];
  }
}

function existsSync(directoryPath) {
  const dirname = path.dirname(directoryPath);
  const basename = path.basename(directoryPath);
  
  return mockFiles[dirname] && Boolean(mockFiles[dirname][basename]);
}

function readdirSync(directoryPath) {
  return mockFiles[directoryPath] && Object.keys(mockFiles[directoryPath]) || [];
}

function readFileSync(directoryPath) {
  const dirname = path.dirname(directoryPath);
  const basename = path.basename(directoryPath);

  return mockFiles[dirname] && mockFiles[dirname][basename];
}

function statSync(directoryPath) {
  const dirname = path.dirname(directoryPath);
  const basename = path.basename(directoryPath);

  return {
    dirname,
    basename,
    isDirectory: function () { return mockFiles[this.dirname][this.basename] === 'directory'; }
  };
}

fs.__setMockFiles = __setMockFiles;
fs.existsSync = existsSync;
fs.readdirSync = readdirSync;
fs.readFileSync = readFileSync;
fs.statSync = statSync;

module.exports = fs;