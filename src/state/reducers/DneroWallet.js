import {UPDATE_DNERO_WALLET_STATE} from "../types/DneroWallet";

const INITIAL_STATE = {

};

export const dneroWalletReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case UPDATE_DNERO_WALLET_STATE : {
            return Object.assign({}, state, action.data);
        }
        default: {
            return state;
        }
    }
};
