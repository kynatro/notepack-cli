const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { CWD } = require('./constants');

const questions = [
  {
    defaultValue: path.resolve(path.dirname(CWD)),
    key: 'appRootFolder',
    text: 'Application root folder location'
  },
  {
    callback: ({ answer, configuration, key }) => configuration[key] = answer.split(',').map(f => f.trim()),
    key: 'baseFolders',
    text: 'Folder paths to collate todos (comma delimited)'
  },
  {
    defaultValue: 'Team',
    key: 'teamFolder',
    text: 'Folder path for team notes'
  },
  {
    defaultValue: 'Open Todos',
    key: 'todoAnchor',
    text: 'Anchor title for todos section'
  },
  {
    defaultValue: '##',
    key: 'todoAnchorHeadingLevel',
    text: 'Anchor heading level for todos section'
  },
  {
    defaultValue: '####',
    key: 'todoGroupHeadingLevel',
    text: 'Todo group heading level (should be less than anchor heading)'
  }
];

/**
 * Ask a question
 * 
 * Uses a Readline Interface to ask a question and populate a value in the
 * supplied configuration Object literal.
 * 
 * @param {Object} options Options to configuration a question
 *   @param {Function} callback Optional callback in response to the question,
 *                              default is to write the key to the 
 *                              configuration Object literal.
 *   @param {Object} configuration Object literal to house configuration
 *   @param {String} defaultValue Optional default value for key
 *   @param {String} key Key to define with the response to the question
 *   @param {Readline.Interface} rl a Readline Interface to ask questions with
 *   @param {String} text The text for the question
 * 
 * @return {Promise}
 */
function askQuestion({
  callback = ({ answer, configuration, key }) => configuration[key] = answer,
  configuration,
  defaultValue = '',
  key,
  rl,
  text
}) {
  const message = `${text}: ${defaultValue && `(${defaultValue}) `}`;

  return new Promise((resolve, reject) => {
    rl.question(message, (answer) => {
      if (callback({ answer: answer || defaultValue, configuration, key })) {
        resolve();
      } else {
        reject();
      }
    });
  });
}

/**
 * Confirm configuration
 * 
 * Display the formatted configuration JSON Object and request the user to
 * confirm. If confirmed, calls writeConfiguration() to write the supplied
 * configuration JSON Object to a local JSON file. If not confirmed, the
 * Promise is rejected with an error message.
 * 
 * @requires JSON
 * 
 * @param {Object} configuration JSON configuration Object
 * @param {Readline.Interface} rl a Readline Interface to ask questions with
 * 
 * @return {Promise}
 */
function confirmConfiguration(configuration = {}, rl) {
  return new Promise((resolve, reject) => {
    console.log(`\n${JSON.stringify(configuration, null, 2)}\n`);

    rl.question('Continue with this as your configuration (yes/no)? ', (answer) => {
      if (/^y(es)?$/.test(answer)) {
        writeConfiguration(configuration)
          .then(() => resolve('🎉 Configuration file written successfully!'))
          .catch((err) => reject(err));
      } else if (/^no?$/.test(answer)) {
        reject('Configuration was not written.');
      } else {
        reject('Please provide "yes" or "no". Configuration was not written.');
      }
    });
  });
}

/**
 * Write configuration file
 * 
 * Writes the supplied configuration JSON Object to a file.
 * 
 * @requires fs
 * @requires path
 * @requires JSON
 * 
 * @param {Object} configuration JSON configuration Object
 * 
 * @return {Promise}
 */
function writeConfiguration(configuration) {
  const filePath = path.resolve(CWD, 'project-config.json');

  return new Promise((resolve, reject) => {
    try {
      fs.accessSync(filePath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
    } catch(err) {
      reject(`${filePath} is not writeable.`);
    }
  
    fs.writeFile(filePath, JSON.stringify(configuration, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(`${filePath} written successfully!`);
      }
    })
  });  
}

/**
 * Configure project
 * 
 * Initiate a configuration session for a project and write the configuration
 * to a local file for reference.
 * 
 * @async
 * @requires Readline
 */
async function configure() {
  let configuration = {};
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\x1b[1m\x1b[34m🛠 Configure your Notepack project...\n\x1b[0m');
  console.log('You will be asked a series of questions to configure Notepack');
  console.log('for your project. All file paths should be relative to the');
  console.log('application root folder.\n');

  for (let i = 0; i < questions.length; i++) {
    await askQuestion({
      ...questions[i],
      configuration,
      rl
    });
  }

  await confirmConfiguration(configuration, rl)
    .then(message => console.log(`\x1b[32m\x1b[1m\n${message}\x1b[0m`))
    .catch((err) => {
      console.error(`\x1b[31m\x1b[1m\n${err}\x1b[0m`);
    });
  
  rl.close();
}

configure();