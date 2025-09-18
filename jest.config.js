// Jest configuration for PayPay SDK tests
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/test/**/*.test.ts',
    '**/test/**/*.test.js',
    '**/test/**/*.spec.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/types/**',
    '!**/node_modules/**',
    '!**/test/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        outDir: './test-dist'
      }
    }]
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      tsconfig: {
        outDir: './test-dist'
      }
    }
  }
};