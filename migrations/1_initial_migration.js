const TestingToken = artifacts.require("TestingToken");

module.exports = function (deployer) {
  deployer.deploy(TestingToken, "test", "ttt");
};
