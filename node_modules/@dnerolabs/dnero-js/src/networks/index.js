const ChainIds =  {
    Mainnet: 'mainnet',
    Testnet: 'testnet',
    TestnetSapphire: 'testnet_sapphire',
    Privatenet: 'privatenet',
    EliteEdgeTestnet: 'testnet_amber'
};

const Mainnet = {
    chainId: ChainIds.Mainnet,
    name: "Mainnet",
    //rpcUrl: "https://dnero-bridge-rpc.dnerochain.org/rpc",
	rpcUrl: "http://143.198.132.249:15511/rpc",
    //explorerUrl: "https://explorer.dnerochain.org",
	explorerUrl: "http://164.92.81.239:5445",
    color: "#1BDED0",
};

const Testnet = {
    chainId: ChainIds.Testnet,
    name: "Testnet",
    rpcUrl: "https://dnero-bridge-rpc-testnet.dnerochain.org/rpc",
    explorerUrl: "https://beta-explorer.dnerochain.org",
    color: "#FF4A8D",
};

const TestnetSapphire = {
    chainId: ChainIds.TestnetSapphire,
    name: "Testnet (Sapphire)",
    rpcUrl: null,
    explorerUrl: null,
    color: "#3199F2",
};

const Privatenet = {
    chainId: ChainIds.Privatenet,
    name: "Smart Contracts Sandbox",
    rpcUrl: "https://dnero-node-rpc-smart-contract-sandbox.dnerochain.org/rpc",
    explorerUrl: "https://smart-contract-testnet-explorer.dnerochain.org",
    color: "#7157FF",
};

const EliteEdgeTestnet = {
    chainId: ChainIds.EliteEdgeTestnet,
    name: "Elite Edge Testnet",
    rpcUrl: "http://35.235.73.165:16888/rpc",
    explorerUrl: "https://elite-edge-testnet-explorer.dnerochain.org",
    color: "#E0B421",
};

const networks = {
    [ChainIds.Mainnet]: Mainnet,
    [ChainIds.Testnet]: Testnet,
    [ChainIds.TestnetSapphire]: TestnetSapphire,
    [ChainIds.Privatenet]: Privatenet,
    [ChainIds.EliteEdgeTestnet]: EliteEdgeTestnet,
}

const getRPCUrlForChainId = (chainId) => {
    //TODO throw if unknown
    return networks[chainId]['rpcUrl'];
}

const getExplorerUrlForChainId = (chainId) => {
    //TODO throw if unknown
    return networks[chainId]['explorerUrl'];
}

const getNetworkForChainId = (chainId) => {
    //TODO throw if unknown
    return networks[chainId];
}

export {
    Mainnet,
    Testnet,
    TestnetSapphire,
    Privatenet,
    EliteEdgeTestnet,

    ChainIds,

    getRPCUrlForChainId,
    getExplorerUrlForChainId,
    getNetworkForChainId
};

