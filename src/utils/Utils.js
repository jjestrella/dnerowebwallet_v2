import _ from 'lodash';
import Networks from '../constants/Networks'
import BigNumber from 'bignumber.js';
import {Ten18} from '@dnerolabs/dnero-js/src/constants';
import {DefaultAssets, getAllAssets, tokenToAsset} from "../constants/assets";
import * as dnerojs from "@dnerolabs/dnero-js";
import {DDropStakingABI, DNC20ABI} from "../constants/contracts";
import {StakePurposeForDDROP, DDropAddressByChainId, DDropStakingAddressByChainId} from "../constants";


/**
 * Returns a new object with vals mapped to keys
 * @param {Array} keys
 * @param {Array} vals
 * @return {Object}
 */
export function zipMap(keys, vals){
    return Object.assign({}, ...keys.map((key, index) => ({[key]: vals[index]})));
}

export function trimWhitespaceAndNewlines(str){
    return str.trim().replace(new RegExp('\s?\r?\n','g'), '')
}

export function hasValidDecimalPlaces(str, maxDecimalPlaces){
    if(str === null){
        return true;
    }

    //Ensure it is a string
    var ensureStr = '' + str;

    var decimalSplit = ensureStr.split('.');

    if(decimalSplit.length > 0){
        var decimals = decimalSplit[decimalSplit.length - 1];

        return (decimals.length <= maxDecimalPlaces);
    }
    return true;
}

export function downloadFile(filename, contents){
    let element = document.createElement('a');

    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(contents));
    element.setAttribute('download', filename);
    element.style.display = 'none';

    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

export function copyToClipboard(str){
    //https://gist.githubusercontent.com/Chalarangelo/4ff1e8c0ec03d9294628efbae49216db/raw/cbd2d8877d4c5f2678ae1e6bb7cb903205e5eacc/copyToClipboard.js

    const el = document.createElement('textarea');  // Create a <textarea> element
    el.value = str;                                 // Set its value to the string that you want copied
    el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
    el.style.position = 'absolute';
    el.style.left = '-9999px';                      // Move outside the screen to make it invisible
    document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
    const selected =
        document.getSelection().rangeCount > 0        // Check if there is any content selected previously
            ? document.getSelection().getRangeAt(0)     // Store selection if found
            : false;                                    // Mark as false to know no selection existed before
    el.select();                                    // Select the <textarea> content
    document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
    document.body.removeChild(el);                  // Remove the <textarea> element
    if (selected) {                                 // If a selection existed before copying
        document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
        document.getSelection().addRange(selected);   // Restore the original selection
    }
}

export function onLine(){
    let online = true;

    try {
        online = window.navigator.onLine;
    }
    catch (e) {
        online = true;
    }

    return online;
}

export const truncate = (hash = '', length= 4) => {
    return hash.slice(0, (length + 2)) + '...' + hash.slice((length * -1));
};

export function legacyTruncate(fullStr, strLen, separator) {
    if(!fullStr){
        return fullStr;
    }

    if (fullStr.length <= strLen) return fullStr;

    separator = separator || '...';

    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2);

    return fullStr.substr(0, frontChars) +
        separator +
        fullStr.substr(fullStr.length - backChars);
}

export function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export function getQueryParameters(str) {
    const searchStr = (str || document.location.search);

    if(_.isNil(searchStr) || searchStr.length === 0){
        return {};
    }
    else{
        return searchStr.replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
    }
}

export function chainIDStringToNumber(chainIDstr) {
    switch(chainIDstr) {
        case Networks.DNERO_MAINNET:
            return 361;
        case Networks.DNERO_PRIVATENET:
            return 366;
        case Networks.DNERO_TESTNET:
            return 365;
    }
    return 0;
}





export const formatDNC20TokenAmountToLargestUnit = (number, decimals ) => {
    const bn = new BigNumber(number);
    const DecimalsBN = (new BigNumber(10)).pow(decimals);
    // Round down
    const fixed = bn.dividedBy(DecimalsBN).toString(10);

    return numberWithCommas(fixed);
};

export const formatNativeTokenAmountToLargestUnit = (number ) => {
    const bn = new BigNumber(number);
    const fixed = bn.dividedBy(Ten18).toString(10);

    return numberWithCommas(fixed);
};

export const toDNC20TokenSmallestUnit = (number, decimals ) => {
    const bn = new BigNumber(number);
    const DecimalsBN = (new BigNumber(10)).pow(decimals);
    return bn.multipliedBy(DecimalsBN);
};

export const toNativeTokenSmallestUnit = (number ) => {
    const bn = new BigNumber(number);
    return bn.multipliedBy(Ten18);
};

export const toDNC20TokenLargestUnit = (number, decimals ) => {
    const bn = new BigNumber(number);
    const DecimalsBN = (new BigNumber(10)).pow(decimals);
    return bn.dividedBy(DecimalsBN);
};

export const toNativeTokenLargestUnit = (number ) => {
    const bn = new BigNumber(number);
    return bn.dividedBy(Ten18);
};

export const isValidAmount = (selectedAccount, asset, amount) => {
    let amountBN = null;
    let balanceBN = null;

    if(_.isNil(asset)){
        // Return as valid so we don't show errors before asset is picked.
        return true;
    }

    if(asset.name === 'Dnero'){
        amountBN = toNativeTokenSmallestUnit('' + amount);
        balanceBN = new BigNumber(selectedAccount.balances['dnerowei']);
    }
    else if(asset.name === 'Dnero Token'){
        amountBN = toNativeTokenSmallestUnit('' + amount);
        balanceBN = new BigNumber(selectedAccount.balances['dtokenwei']);
    }
    else{
        // TNT-20 token
        amountBN = toDNC20TokenSmallestUnit('' + amount, asset.decimals);
        balanceBN = new BigNumber(selectedAccount.balances[asset.contractAddress]);
    }

    return amountBN.lte(balanceBN);
};

export const getAssetBalance = (selectedAccount, asset) => {
    if(asset.name === 'Dnero'){
        return formatNativeTokenAmountToLargestUnit(selectedAccount.balances['dnerowei']);
    }
    if(asset.name === 'Dnero Token'){
        return formatNativeTokenAmountToLargestUnit(selectedAccount.balances['dtokenwei']);
    }

    const balance = selectedAccount.balances[asset.contractAddress] || '0';
    return formatDNC20TokenAmountToLargestUnit(balance, asset.decimals);
};


export const formDataToTransaction = async (transactionType, txFormData, dneroWalletState) => {
    const accounts = dneroWalletState.accounts;
    const selectedAddress = dneroWalletState.selectedAddress;
    const selectedAccount = accounts[selectedAddress];
    const tokens = dneroWalletState.tokens;
    const chainId = dneroWalletState.network.chainId;
    const assets = getAllAssets(chainId, tokens);

    if (transactionType === 'send') {
        const {to, assetId, amount} = txFormData;
        const asset = _.find(assets, function (a) {
            return a.id === assetId;
        });

        if (asset.contractAddress) {
            // DNC20 token
            // TODO ensure they have the balance
            const dnc20Contract = new dnerojs.Contract(asset.contractAddress, DNC20ABI, null);
            const amountBN = toDNC20TokenSmallestUnit(amount, asset.decimals);
            return await dnc20Contract.populateTransaction.transfer(to, amountBN.toString());
        }
        else {
            // Native token
            const txData = {
                from: selectedAddress,
                outputs: [
                    {
                        address: to,
                        dneroWei: (assetId === 'dnero' ? dnerojs.utils.toWei(amount) : '0'),
                        dtokenWei: (assetId === 'dtoken' ? dnerojs.utils.toWei(amount) : '0')
                    }
                ]
            };

            return new dnerojs.transactions.SendTransaction(txData);
        }
    }
    if(transactionType === 'withdraw-stake'){
        const {holder, purpose, amount} = txFormData;
        const purposeInt = parseInt(purpose);

        if(purposeInt === StakePurposeForDDROP){
            const dDropStakingAddress = DDropStakingAddressByChainId[chainId];
            const ddropStakingContract = new dnerojs.Contract(dDropStakingAddress, DDropStakingABI, null);
            const percentageToUnstake = parseFloat(amount) / 100;
            const dnc20stakes = _.get(selectedAccount, ['dnc20Stakes'], {});
            const balanceStr = _.get(dnc20stakes, 'ddrop.balance', '0');
            const balanceBN = new BigNumber(balanceStr);
            const amountBN = balanceBN.multipliedBy(percentageToUnstake).integerValue();
            const unstakeTx = await ddropStakingContract.populateTransaction.unstake(amountBN.toString());

            return unstakeTx;
        }
        else{
            const txData = {
                holder: holder,
                purpose: purpose
            };

            return new dnerojs.transactions.WithdrawStakeTransaction(txData);
        }
    }
    if(transactionType === 'deposit-stake'){
        const {holder, holderSummary, purpose, amount} = txFormData;
        const purposeInt = parseInt(purpose);

        if(purposeInt === dnerojs.constants.StakePurpose.StakeForValidator){
            const txData = {
                holder: holder,
                purpose: purposeInt,
                amount: dnerojs.utils.toWei(amount),
            };

            return new dnerojs.transactions.DepositStakeTransaction(txData);
        }
        else if(purposeInt === dnerojs.constants.StakePurpose.StakeForSentry){
            const txData = {
                holderSummary: holderSummary,
                purpose: purposeInt,
                amount: dnerojs.utils.toWei(amount),
            };

            return new dnerojs.transactions.DepositStakeV2Transaction(txData);
        }
        else if(purposeInt === dnerojs.constants.StakePurpose.StakeForEliteEdge){
            const txData = {
                holderSummary: holderSummary,
                purpose: purposeInt,
                amount: dnerojs.utils.toWei(amount),
            };

            return new dnerojs.transactions.DepositStakeV2Transaction(txData);
        }
        else if(purposeInt === StakePurposeForDDROP){
            const dDropAddress = DDropAddressByChainId[chainId];
            const dDropStakingAddress = DDropStakingAddressByChainId[chainId];
            const ddropContract = new dnerojs.Contract(dDropAddress, DNC20ABI, null);
            const ddropStakingContract = new dnerojs.Contract(dDropStakingAddress, DDropStakingABI, null);
            const assetsById = _.keyBy(assets, 'id');
            const dDropAsset = assetsById[dDropAddress];
            const amountBN = toDNC20TokenSmallestUnit(amount, dDropAsset.decimals);
            const approveTx = await ddropContract.populateTransaction.approve(dDropStakingAddress,amountBN.toString());
            const stakeTx = await ddropStakingContract.populateTransaction.stake(amountBN.toString());
            // We are sending the approve TX in the background which fails because the amount hasn't been approved yet...so we will hardcode this gas limit for now
            stakeTx.gasLimit = 150000;
            stakeTx.dependencies = [
                approveTx
            ];

            return stakeTx;
        }
    }
    else if(transactionType === 'delegate-ddrop-vote'){
        const {address} = txFormData;
        const dDropStakingAddress = DDropStakingAddressByChainId[chainId];
        const ddropStakingContract = new dnerojs.Contract(dDropStakingAddress, DDropStakingABI, null);
        const delegateTx = await ddropStakingContract.populateTransaction.delegate(address);

        return delegateTx;
    }
};

export const transactionTypeToName = (txType) => {
    if(_.isNil(txType)){
        return  null;
    }

    switch (txType) {
        case dnerojs.constants.TxType.Send:
            return 'Send';
        case dnerojs.constants.TxType.SmartContract:
            return 'Call Contract';
        case dnerojs.constants.TxType.DepositStake:
            return 'Deposit Stake';
        case dnerojs.constants.TxType.DepositStakeV2:
            return 'Deposit Stake';
        case dnerojs.constants.TxType.WithdrawStake:
            return 'Withdraw Stake';
        default:
            return 'Unknown type';
    }
};

export const transactionRequestToTransactionType = (transactionRequest) => {
    const txType = _.get(transactionRequest, 'txType');
    const txData = _.get(transactionRequest, 'txData');

    try {
        if(txType === dnerojs.constants.TxType.SmartContract && _.isNil(_.get(txData, 'to'))){
            return 'Deploy Contract';
        }

        const contractData = _.get(txData, 'data');
        const dnc20Contract = new dnerojs.Contract(null, DNC20ABI, null);
        const data = dnc20Contract.interface.decodeFunctionData('transfer(address,uint256)',contractData);
        return 'Transfer Token';
    }
    catch (e) {

    }

    return transactionTypeToName(txType);
};

export const isHolderSummary = (holderSummary) => {
    if(holderSummary){
        let expectedLen = 458;

        if(holderSummary.startsWith('0x')){
            expectedLen = expectedLen + 2;
        }

        return (holderSummary.length === expectedLen);
    }
    else{
        return false;
    }
};

export function trimDecimalPlaces(x, maxDecimals) {
    let parts = x.split('.');
    let newFractional = '';
    let foundNonZero = false;

    _.map(parts[1], (char, idx) => {
        if(foundNonZero){
            return;
        }
        if((idx + 1) > maxDecimals){
            return;
        }

        if(char !== '0'){
            foundNonZero = true;
        }
        newFractional = newFractional + char;
    });

    parts[1] = newFractional;

    return parts.join('.');
}

export const sleep = (ms) => {
    return new Promise(r => setTimeout(r, ms));
};
