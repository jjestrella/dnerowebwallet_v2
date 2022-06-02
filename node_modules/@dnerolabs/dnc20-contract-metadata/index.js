const mainnetContractData = require('./mainnet-contract-map.json');
const testnetContractData = require('./testnet-contract-map.json');

module.exports = {
  tokensByChainId: {
    'mainnet': mainnetContractData,
    'testnet': testnetContractData,
  }
};
