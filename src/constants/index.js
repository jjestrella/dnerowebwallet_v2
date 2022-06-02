import * as dnerojs from '@dnerolabs/dnero-js';
import DneroJS from "../libs/dnerojs.esm";

export const SingleCallTokenBalancesAddressByChainId = {
    [dnerojs.networks.ChainIds.Mainnet]: '0xb6ecbc094abd0ff7cf030ec9e81f6ca8045b87f9',
    [dnerojs.networks.ChainIds.Testnet]: '0xf0cfe34a7e053520f08bf0a982391810ece9c582',
    [dnerojs.networks.ChainIds.Privatenet]: '0xedba30e32e11ae95ca9c000b8de97c7af087c7de'
};

export const DDropStakingAddressByChainId = {
    [dnerojs.networks.ChainIds.Mainnet]: '0xA89c744Db76266ecA60e2b0F62Afcd1f8581b7ed',
    [dnerojs.networks.ChainIds.Testnet]: '0xA8bfA60203E55f86Dc7013CBf3d8fF85bb1d3cC7',
};

export const DDropAddressByChainId = {
    [dnerojs.networks.ChainIds.Mainnet]: '0x1336739B05C7Ab8a526D40DCC0d04a826b5f8B03',
    [dnerojs.networks.ChainIds.Testnet]: '0x08a0c0e8EFd07A98db11d79165063B6Bc2469ADF',
};

export const StakePurposeForDDROP = 1000;

export const Urls = {
    PreventingLostTokens: 'https://docs.dnerochain.org/docs/preventing-lost-eth-erc20-tokens'
};

export const FaucetAvailable = false;


export function getMinStakeAmount(purpose){
    if(purpose === dnerojs.constants.StakePurpose.StakeForValidator){
        return 200000.0;
    }
    else if(purpose === dnerojs.constants.StakePurpose.StakeForSentry){
        return 1000.0;
    }
    else if(purpose === dnerojs.constants.StakePurpose.StakeForEliteEdge){
        return 10000.0;
    }

    //Unknown
    return 0.0;
}

export function getMaxStakeAmount(purpose){
    if(purpose === dnerojs.constants.StakePurpose.StakeForEliteEdge){
        return 500000.0;
    }

    //No max
    return 100000000000.0;
}

export function getMaxDelegatedStakeAmount(purpose){
    if(purpose === dnerojs.constants.StakePurpose.StakeForSentry){
        //No max
        return 100000000000.0;
    }

    //Unknown
    return 0.0;
}
