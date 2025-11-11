module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@domain/(.*)': '<rootDir>/src/domain/$1',
    '^@application/(.*)': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)': '<rootDir>/src/infrastructure/$1',
    '^@presentation/(.*)': '<rootDir>/src/presentation/$1',
    '^@shared/(.*)': '<rootDir>/src/shared/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.test.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageDirectory: 'coverage',
  verbose: true,
};
