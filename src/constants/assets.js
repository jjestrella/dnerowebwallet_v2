import _ from 'lodash';
import * as dnerojs from '@dnerolabs/dnero-js';
import {DDropAddressByChainId} from './index';

const {tokensByChainId} = require('@dnerolabs/dnc20-contract-metadata');

const getTokenIconUrl = (fileName) => {
    if(_.isEmpty(fileName)){
        return null;
    }
    return `https://s3.us-east-2.amazonaws.com/assets.dnerochain.org/tokens/${fileName}`;
    // return `https://assets.dnerochain.org/tokens/${fileName}`;
};

const DneroAsset = {
    id: 'dnero',
    name: 'Dnero',
    symbol: 'DNERO',
    contractAddress: null,
    decimals: 18,
    iconUrl: getTokenIconUrl('dnero.png'),
    balanceKey: 'dnerowei'
};

const DTokenAsset = {
    id: 'dtoken',
    name: 'Dnero Token',
    symbol: 'DTOKEN',
    contractAddress: null,
    decimals: 18,
    iconUrl: getTokenIconUrl('dtoken.png'),
    balanceKey: 'dtokenwei'
};

const NativeAssets = [
    DneroAsset,
    DTokenAsset
];

const DDropAsset = (chainId) => {
    const ddropAddress = DDropAddressByChainId[chainId];
    let DNC20Asset = null;

    if(ddropAddress){
        DNC20Asset = {
            id: ddropAddress,
            name: 'DDROP',
            symbol: 'DDROP',
            contractAddress: ddropAddress,
            address: ddropAddress,
            decimals: 18,
            iconUrl: getTokenIconUrl(_.get(tokensByChainId, [chainId, ddropAddress, 'logo'])),
            balanceKey: ddropAddress
        };
    }

    return DNC20Asset;
};

const DefaultAssets = (chainId) => {
    const ddropAddress = DDropAddressByChainId[chainId];
    let DNC20Assets = [];
    let ddropAsset = DDropAsset(chainId);

    if(ddropAddress){
        DNC20Assets.push(ddropAsset);
    }

    return _.concat(NativeAssets, DNC20Assets);
};

const getAllAssets = (chainId, tokens) => {
    const ddropAddress = DDropAddressByChainId[chainId];
    const tokenAssets = tokens.map(tokenToAsset);
    const tokenAssetsWithoutTdrop = _.filter(tokenAssets, (asset) => {
        return asset.contractAddress?.toLowerCase() !== ddropAddress?.toLowerCase();
    });

    return _.concat(DefaultAssets(chainId), tokenAssetsWithoutTdrop);
};

const tokenToAsset = (token) => {
    const knownToken = (tokensByChainId[dnerojs.networks.ChainIds.Mainnet][token.address] || tokensByChainId[dnerojs.networks.ChainIds.Testnet][token.address]);

    return {
        id: token.address,
        name: token.symbol,
        symbol: token.symbol,
        contractAddress: token.address,
        decimals: token.decimals,
        iconUrl: (knownToken ? getTokenIconUrl(knownToken.logo) : null),
        balanceKey: token.address
    };
};

export {
    DefaultAssets,

    DneroAsset,
    DTokenAsset,
    DDropAsset,

    tokenToAsset,

    getAllAssets,
};
