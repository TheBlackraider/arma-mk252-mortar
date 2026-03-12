// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  transform: { "^.+\\.[t|j]sx?$": "babel-jest" },
  moduleNameMapper: {
    "\\.(css|less|scss)$": "<rootDir>/__mocks__/styleMock.js"
  },
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"]
};
