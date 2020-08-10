'use strict';

const readline = jest.genMockFromModule('readline');

function createInterface() {
  return {
    question: () => {}
  };
};

readline.createInterface = createInterface;

module.exports = readline;