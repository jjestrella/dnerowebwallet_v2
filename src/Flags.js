import Dnero from './services/Dnero';
import Networks, {canViewSmartContracts} from './constants/Networks';
import DneroJS from "./libs/dnerojs.esm";

export function isStakingAvailable(){
    return true;
}

export function canStakeFromHardwareWallet(){
    return true;
}

export function areSmartContractsAvailable(){
    const network = Dnero.getChainID();

    return canViewSmartContracts(network);
}

export function getMinStakeAmount(purpose){
    if(purpose === DneroJS.StakePurposes.StakeForValidator){
        return 2000000.0;
    }
    else if(purpose === DneroJS.StakePurposes.StakeForSentry){
        return 1000.0;
    }
    else if(purpose === DneroJS.StakePurposes.StakeForEliteEdge){
        return 10000.0;
    }

    //Unknown
    return 0.0;
}

export function getMaxStakeAmount(purpose){
    if(purpose === DneroJS.StakePurposes.StakeForEliteEdge){
        return 500000.0;
    }

    //No max
    return 100000000000.0;
}

export function getMaxDelegatedStakeAmount(purpose){
    if(purpose === DneroJS.StakePurposes.StakeForSentry){
        return 10000.0;
    }

    //Unknown
    return 0.0;
}
