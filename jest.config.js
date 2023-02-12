export default {
  preset: '@shelf/jest-mongodb',
  setupFiles: ['<rootDir>/jest.vars.js'],
  testEnvironment: 'node',
  timers: 'fake',
  automock: false,
  coverageReporters: ['html', 'json'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: [
    'node_modules',
    'test-config',
    'interfaces',
    '<rootDir>/src/app/main.js',
    '.mock.ts',
    'messages.*',
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 30,
      lines: 50,
      statements: 80,
    },
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};
