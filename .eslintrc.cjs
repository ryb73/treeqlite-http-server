"use strict";

/** @type {import('@typescript-eslint/utils').TSESLint.Linter.ConfigType} */
module.exports = {
  extends: [`plugin:deprecation/recommended`, `@ryb73`],

  overrides: [
    {
      files: [`*.test.ts`],
      rules: {
        "@typescript-eslint/no-shadow": [
          `error`,
          { allow: [`afterAll`, `assert`, `beforeAll`, `describe`, `test`] },
        ],
      },
    },
  ],

  rules: {
    "sonar/function-return-type": `off`,
    "sonar/new-cap": `off`,
    "testing-library/no-debugging-utils": `off`,
  },
};
