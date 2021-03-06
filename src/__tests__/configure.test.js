'use strict';

const userConfig = require('../userConfig');
const notepackConfigMock = require('../__mocks__/notepack_config.mock')
userConfig.getUserConfig = jest.fn().mockReturnValue(notepackConfigMock);

const os = require('os');
const path = require('path');
const readline = require('readline');
const configureModel = require('../configure');
const { askQuestion, configure, confirmConfiguration, defaultAppRootFolder, questions } = configureModel;
let rl;

jest.mock('readline');

beforeEach(() => {
  rl = readline.createInterface();

  console.log = jest.fn();
  console.error = jest.fn();
});

describe('first run', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('should not call configure() when RUNNING_TESTS is truthy', () => {
    jest.mock('../configure', () => ({
      configure: jest.fn()
    }));

    const configureModel = require('../configure');
    
    expect(configureModel.configure).not.toHaveBeenCalled();
  });
});

describe('questions', () => {
  let answer;
  let configuration = {};
  let key;

  describe('baseFolders', () => {
    key = 'baseFolders';
    answer = 'Foo, Bar';

    test('callback converts comma delimited strings to an Array', () => {
      const question = questions.find(question => question.key === key);

      question.callback({ answer, configuration, key });

      expect(configuration[key]).toEqual(expect.arrayContaining(['Foo', 'Bar']));
    })
  });
});

describe('defaultAppRootFolder()', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });
  
  test('returns "~/Notes" when PWD is the same as the module', () => {
    process.env.PWD = path.resolve(path.dirname(path.dirname(__dirname)));

    expect(defaultAppRootFolder()).toEqual(path.join(os.homedir(), 'Notes'));
  });

  test('returns PWD when PWD is different than the module', () => {
    process.env.PWD = os.homedir();

    expect(defaultAppRootFolder()).toEqual(process.env.PWD);
  });
});

describe('askQuestion()', () => {
  let configuration;
  let defaultValue;
  let key;
  let text;
  let answer;

  beforeEach(() => {
    configuration = {};
    defaultValue = 'yes';
    key = 'foo';
    text = 'Shall we play a game?'
    answer = 'no';

    rl.question = jest.fn().mockImplementationOnce((message, cb) => { cb(answer) });
  });

  test('returns a Promise', () => {
    expect(askQuestion({ configuration, key, rl, text })).toEqual(expect.any(Promise));
  });

  test('writes the answer to the passed in configuration when a question has no custom callback defined', () => {
    askQuestion({ configuration, key, rl, text });

    expect(configuration[key]).toEqual(answer);
  });

  describe('custom callbacks', () => {
    const callback = jest.fn();

    test('resolve when call to callback is successful', () => {
      callback.mockReturnValue(true);

      expect.assertions(1);
      
      expect(askQuestion({ callback, configuration, key, rl, text })
        .then(data => {
          expect(true).toBeTruthy();
        }));
    });

    test('rejects when call to callback returns falsy', () => {
      callback.mockReturnValue(false);

      expect.assertions(1);
      
      expect(askQuestion({ callback, configuration, key, rl, text })
        .catch(err => {
          expect(true).toBeTruthy();
        }));
    });

    test('are called when passed in', () => {
      askQuestion({ callback, configuration, key, rl, text })
        .then(() => {})
        .catch(() => {});
  
      expect(callback).toHaveBeenCalled();
    });
  
    test('are called with the user answer, configuration, and key', () => {
      askQuestion({ callback, configuration, key, rl, text })
        .then(() => {})
        .catch(() => {});

      expect(callback).toHaveBeenCalledWith({
        answer,
        configuration,
        key
      });
    });

    test('are supplied the defaultValue as answer when no user answer is given', () => {
      answer = null;

      askQuestion({ callback, configuration, defaultValue, key, rl, text })
        .then(() => {})
        .catch(() => {});

      expect(callback).toHaveBeenCalledWith({
        answer: defaultValue,
        configuration,
        key
      });
    })
  });

  test('message given to user includes the defaultValue if it is specified', () => {
    askQuestion({ configuration, defaultValue, key, rl, text });

    expect(rl.question).toHaveBeenCalledWith(expect.stringContaining(defaultValue), expect.any(Function));
  });
});

describe('confirmConfiguration()', () => {
  let configuration;
  let answer;

  beforeEach(() => {
    configuration = { foo: 'bar' };
    answer = 'yes';

    rl.question = jest.fn().mockImplementationOnce((message, cb) => { cb(answer) });
    
    userConfig.writeUserConfig = jest.fn(() => true);
  });

  test('returns a Promise', () => {
    expect(confirmConfiguration(configuration, rl)).toEqual(expect.any(Promise));
  });

  test('calls writeUserConfig when answer is "yes"', () => {
    confirmConfiguration(configuration, rl);

    expect(userConfig.writeUserConfig).toHaveBeenCalledWith(configuration);
  });

  test('calls writeUserConfig when answer is "y"', () => {
    answer = 'y';

    confirmConfiguration(configuration, rl);

    expect(userConfig.writeUserConfig).toHaveBeenCalledWith(configuration);
  });

  test('resolves when writeUserConfig is successful', () => {
    expect(confirmConfiguration(configuration, rl).then((data) => {
      expect(true).toBeTruthy();
    }));
  });

  test('rejects when writeUserConfig is unsuccessful', () => {
    userConfig.writeUserConfig = jest.fn(() => false);

    expect(confirmConfiguration(configuration, rl).catch((err) => {
      expect(true).toBeTruthy();
    }));
  });

  test('rejects when answer is "no"', () => {
    answer = 'no';

    expect.assertions(1);

    expect(confirmConfiguration(configuration, rl).catch(err => {
      expect(err).toEqual(expect.any(String));
    }));
  });

  test('rejects when answer is "n"', () => {
    answer = 'no';

    expect.assertions(1);

    expect(confirmConfiguration(configuration, rl).catch(err => {
      expect(err).toEqual(expect.any(String));
    }));
  });

  test('rejects when no answer is provided', () => {
    answer = '';

    expect.assertions(1);

    expect(confirmConfiguration(configuration, rl).catch(err => {
      expect(err).toEqual(expect.any(String));
    }));
  });
});

describe('configure()', () => {
  beforeEach(() => {
    const RL_INTERFACE = readline.createInterface();
    readline.createInterface = jest.fn(() => RL_INTERFACE);

    userConfig.writeUserConfig = jest.fn(() => true);
    configureModel.askQuestion = jest.fn(() => Promise.resolve());
    configureModel.confirmConfiguration = jest.fn(() => Promise.resolve());
  });

  test('creates a new readline interface', async () => {
    await configure();

    expect(readline.createInterface).toHaveBeenCalled();
  });

  test('asks all questions', async () => {
    await configure();
    
    expect.assertions(questions.length);
    
    questions.forEach(question => {
      expect(configureModel.askQuestion).toHaveBeenCalledWith(expect.objectContaining({
        ...question
      }));
    });
  });
  
  test('then asks to confirmConfiguration()', async () => {
    await configure();

    expect(configureModel.confirmConfiguration).toHaveBeenCalled();
  });

  describe('when confirmConfiguration resolves', () => {
    const confirmationMessage = 'confirmConfiguration resolution message';

    beforeEach(() => {
      configureModel.confirmConfiguration = jest.fn(() => Promise.resolve(confirmationMessage));
    });

    test('resolution message from confirmConfiguration is displayed', async () => {
      await configure();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining(confirmationMessage));
    });

    test('notepack watch instructions are displayed', async () => {
      await configure();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('notepack watch'));
    });
  });

  describe('when confirmConfiguration rejects', () => {
    const errMessage = 'error message';

    beforeEach(() => {
      configureModel.confirmConfiguration = jest.fn(() => Promise.reject(errMessage));
    });

    test('error message from confirmConfiguration is displayed', async () => {
      await configure();

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining(errMessage));
    });

    test('notepack configure instructions are displayed', async () => {
      await configure();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('notepack configure'));
    });
  });
});