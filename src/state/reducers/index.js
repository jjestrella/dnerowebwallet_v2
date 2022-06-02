import { combineReducers } from 'redux';
import { walletReducer } from './Wallet';
import { uiReducer } from './ui';
import {dneroWalletReducer} from "./DneroWallet";

export const rootReducer = combineReducers({
    wallet: walletReducer,
    ui: uiReducer,
    dneroWallet: dneroWalletReducer,
});
