const os = require('os');
const path = require('path');
const { CONFIG_FILE_NAME } = require('../src/constants');
const fs = require('fs');
const CONFIG_FILE_PATH = path.resolve(os.homedir(), CONFIG_FILE_NAME);

if (!fs.existsSync(CONFIG_FILE_PATH)) {
  require('../src/configure');
}