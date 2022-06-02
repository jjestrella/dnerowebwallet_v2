import _ from 'lodash';
import {zipMap} from "../utils/Utils";

const Networks =  {
    __deprecated__ETHEREUM: 'ethereum',
    DNERO_TESTNET: 'testnet',
    DNERO_TESTNET_AMBER: 'testnet_amber',
    DNERO_TESTNET_SAPPHIRE: 'testnet_sapphire',
    DNERO_MAINNET: 'mainnet',
    DNERO_PRIVATENET: 'privatenet',
};

export const NetworksWithDescriptions = [
    {
        id: Networks.DNERO_MAINNET,
        name: "Mainnet",
        description: "DNERO mainnet (Default)",
        // faucetId: "mainnet"
    },
    {
        id: Networks.DNERO_TESTNET,
        name: "Testnet",
        description: "DNERO testnet",
        faucetId: "testnet"
    },
    {
        id: Networks.DNERO_TESTNET_AMBER,
        name: "Testnet_Amber",
        description: "DNERO testnet for elite edge nodes (Apr 2021)"
    },
    {
        id: Networks.DNERO_TESTNET_SAPPHIRE,
        name: "Testnet (Sapphire)",
        description: "DNERO testnet for sentry nodes (Feb 2020)",
        // faucetId: "sapphire"
    },
    {
        id: Networks.DNERO_PRIVATENET,
        name: "Smart Contracts Sandbox",
        description: "DNERO testnet for Smart Contracts (ALPHA)",
        faucetId: "smart_contract"
    }
];

export const NetworksById = zipMap(NetworksWithDescriptions.map(({ id }) => id), NetworksWithDescriptions);

export const NetworkExplorerUrls = {
//    [Networks.DNERO_MAINNET]: 'https://explorer.dnerochain.org',
	  [Networks.DNERO_MAINNET]: 'http://164.92.81.239:5445',
//
//    [Networks.DNERO_TESTNET]: 'https://beta-explorer.dnerochain.org',
//    [Networks.DNERO_TESTNET_AMBER]: 'https://elite-edge-testnet-explorer.dnerochain.org',
//    [Networks.DNERO_TESTNET_SAPPHIRE]: 'https://sentry-testnet-explorer.dnerochain.org',
//    [Networks.DNERO_PRIVATENET]: 'https://smart-contracts-sandbox-explorer.dnerochain.org'
};

export function isEthereumNetwork(network) {
    return (network === Networks.__deprecated__ETHEREUM);
}

export function isDneroNetwork(network) {
    return (network !== Networks.__deprecated__ETHEREUM);
}

export function canEdgeNodeStake(network) {
    return true;
    return (network === Networks.DNERO_TESTNET_AMBER);
}

export function canSentryNodeStake(network) {
    return true;
}

export function canViewSmartContracts(network) {
    return true;
}

export function getNetworkName(networkId){
    return _.get(NetworksById, [networkId, 'name']);
}

export function getNetworkFaucetId(networkId){
    return _.get(NetworksById, [networkId, 'faucetId']);
}

export default Networks;
