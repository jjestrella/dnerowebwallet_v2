import BigNumber from 'bignumber.js';
import {Ten18} from "./constants/index";

function transformInsufficientFundRegexMatch(match){
    let amount = match[1];
    let currency = match[2];

    let amountBN = new BigNumber(amount);
    let amountDecimalStr = amountBN.dividedBy(Ten18).toString();

    return {
        amount: amountDecimalStr,
        amountWei: amount,
        amountBN: amountBN,
        currency: (currency === "DneroWei" ? 'DNERO' : 'DTOKEN')
    }
}

function humanizeInsufficientFundErrorMessage(errorMessage, isSendTransaction){
    const regex = /(\d+)[^\d]+(DneroWei|DTokenWei)/gm;
    let m;
    let amounts = [];

    while ((m = regex.exec(errorMessage)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        amounts.push(transformInsufficientFundRegexMatch(m));
    }

    let currentDneroBalance = amounts[0];
    let currentDtokenBalance = amounts[1];
    let attemptedToSendDnero = amounts[2];
    let attemptedToSendDtoken = amounts[3];

    if((currentDtokenBalance.amountBN.isLessThan(attemptedToSendDtoken.amountBN)) &&
        attemptedToSendDtoken.amountWei === "1000000000000" && isSendTransaction){
        return `Insufficient gas. You need at least ${attemptedToSendDtoken.amount} DTOKEN to send this transaction.`;
    }
    else if(currentDneroBalance.amountBN.isLessThan(attemptedToSendDnero.amountBN) && isSendTransaction){
        return `Insufficient funds. You only have ${currentDneroBalance.amount} DNERO but tried to send ${attemptedToSendDnero.amount} DNERO.`;
    }
    else if(currentDtokenBalance.amountBN.isLessThan(attemptedToSendDtoken.amountBN) && isSendTransaction){
        return `Insufficient funds. You only have ${currentDtokenBalance.amount} DTOKEN but tried to send ${attemptedToSendDtoken.amount} DTOKEN.`;
    }
    else if(currentDtokenBalance.amountBN.isLessThan(attemptedToSendDtoken.amountBN) && (isSendTransaction === false)){
        return `Insufficient funds. You need at least ${attemptedToSendDtoken.amount} DTOKEN to send this transaction.`;
    }
    else{
        return errorMessage;
    }
}

export function humanizeErrorMessage(errorMessage){
    let humanizedErrorMessage = errorMessage;
    let errorMessageLC = errorMessage.toLowerCase();

    try {
        if(errorMessageLC.includes('insufficient fund')){
            humanizedErrorMessage = humanizeInsufficientFundErrorMessage(errorMessage, true);
        }
        else if(errorMessageLC.includes('required minimal balance')){
            humanizedErrorMessage = humanizeInsufficientFundErrorMessage(errorMessage, false);
        }
    }
    catch (e) {
        // Back to default (just in case)
        humanizedErrorMessage = errorMessage;
    }

    return humanizedErrorMessage;
}
