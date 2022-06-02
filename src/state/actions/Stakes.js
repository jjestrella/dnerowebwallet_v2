import Api from '../../services/Api'
import {reduxFetch} from './Api'
import {
    FETCH_STAKES
} from "../types/Stakes";
import Wallet from "../../services/Wallet";
import Dnero from "../../services/Dnero";

export function fetchStakes() {
    let address = Wallet.getWalletAddress();

    return reduxFetch(FETCH_STAKES, function () {
        return Api.fetchStakes(address, {
            network: Dnero.getChainID()
        });
    });
}
