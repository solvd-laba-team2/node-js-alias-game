/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {

    "^bcrypt$": require.resolve("bcrypt"),  // Dla bcrypt
    "^natural$": require.resolve("natural"),  // Dla natural
  },
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  modulePathIgnorePatterns: ["<rootDir>/dist/"]
};