"use strict";

/** @type {import('@typescript-eslint/utils').TSESLint.Linter.ConfigType} */
module.exports = {
  extends: [`plugin:deprecation/recommended`, `@ryb73`],

  rules: {
    "sonar/new-cap": `off`,
    "testing-library/no-debugging-utils": `off`,
  },
};
