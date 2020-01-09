module.exports = {
  preset: "ts-jest",
  "roots": [
    "./"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  "globalSetup": "./src/tests/setup.ts",
  "coverageThreshold": {
    "global": {
      "functions": 95,
      "lines": 90,
    }
  },
  "collectCoverageFrom": [
    // "src/commands/**",
    // "src/utilities/**",
    "!src/services/**",
    "!src/tests/**",
  ]
};
