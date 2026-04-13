export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  modulePaths: ['<rootDir>'],
  setupFilesAfterEnv: ['jest-setup.js'],
};
