module.exports = {
  compilers: {
    solc: { optimizer: { enabled: true, runs: 200 } },
  },
  contracts_directory: "./contracts/flattened/",
  networks: {
    development: {
      provider: require("ganache-cli").provider({ gasLimit: 100000000 }),
      network_id: "*",
    },
    rinkeby: {
      network_id: 4,
      host: "localhost",
      port: 9004,
    },
    ropsten: {
      network_id: 3,
      host: "localhost",
      port: 9005,
    },
    goerli: {
      network_id: 5,
      host: "localhost",
      port: 9006,
    },
  },
}
