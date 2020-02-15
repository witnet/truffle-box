module.exports = {
  compilers: {
    solc: { settings: { optimizer: { enabled: true, runs: 200 } } },
  },
  contracts_directory: "./contracts/flattened/",
  networks: {
    development: {
      provider: require("ganache-cli").provider({ gasLimit: 100000000 }),
      network_id: "*",
    },
    mainnet: {
      network_id: 1,
      host: "localhost",
      port: 8541,
    },
    rinkeby: {
      network_id: 4,
      host: "localhost",
      port: 8544,
    },
    ropsten: {
      network_id: 3,
      host: "localhost",
      port: 8543,
    },
    goerli: {
      network_id: 5,
      host: "localhost",
      port: 8545,
    },
  },
}
