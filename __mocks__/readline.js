'use strict';

const readline = jest.createMockFromModule('readline');

function createInterface() {
  return {
    close: () => {},
    question: () => {}
  };
};

readline.close = close;
readline.createInterface = createInterface;

module.exports = readline;