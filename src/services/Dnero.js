import {BigNumber} from 'bignumber.js';
import Ethereum from "./Ethereum";
import DneroJS from '../libs/dnerojs.esm';
import TokenTypes from "../constants/TokenTypes";
import Config from '../Config';
import RLP from 'eth-lib/lib/rlp';
import Bytes from 'eth-lib/lib/bytes';
import {NetworkExplorerUrls} from '../constants/Networks';

export default class Dnero {
    static _chainId = Config.defaultDneroChainID;

    static setChainID(newChainID){
        this._chainId = newChainID;
    }

    static getChainID(){
        return this._chainId;
    }

    static getTransactionExplorerUrl(transaction){
        const chainId = this.getChainID();
        const urlBase = NetworkExplorerUrls[chainId];

        return`${urlBase}/txs/${transaction.hash}`;
    }

    static getAccountExplorerUrl(account){
        const chainId = this.getChainID();
        const urlBase = NetworkExplorerUrls[chainId];

        return`${urlBase}/account/${account}`;
    }

    static getTransactionFee(){
        return 0.3;
    }

    static getSmartContractGasPrice(){
        //10^12 x 4 DTokenWei
        return 0.000004;
    }


    static unsignedSendTx(txData, sequence) {
        let { tokenType, from, to, amount, transactionFee} = txData;
        const ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Dnero = 10^18 DneroWei, 1 Gamma = 10^ DTokenWei
        const dneroWeiToSend = (tokenType === TokenTypes.DNERO ? (new BigNumber(amount)).multipliedBy(ten18) : (new BigNumber(0)));
        const dtokenWeiToSend = (tokenType === TokenTypes.DNERO_TOKEN ? (new BigNumber(amount)).multipliedBy(ten18) : (new BigNumber(0)));
        const feeInDTokenWei  = (new BigNumber(transactionFee)).multipliedBy(ten18); // Any fee >= 10^12 DTokenWei should work, higher fee yields higher priority
        const senderAddr =  from;
        const receiverAddr = to;
        const senderSequence = sequence;
        const outputs = [
            {
                address: receiverAddr,
                dneroWei: dneroWeiToSend,
                dtokenWei: dtokenWeiToSend,
            }
        ];

        let tx = new DneroJS.SendTx(senderAddr, outputs, feeInDTokenWei, senderSequence);

        return tx;
    }

    static unsignedDepositStakeTx(txData, sequence) {
        let { tokenType, from, holder, amount, transactionFee, purpose} = txData;
        const ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Dnero = 10^18 DneroWei, 1 Gamma = 10^ DTokenWei
        const amountWeiToSend = (new BigNumber(amount)).multipliedBy(ten18);
        const feeInDTokenWei  = (new BigNumber(transactionFee)).multipliedBy(ten18); // Any fee >= 10^12 DTokenWei should work, higher fee yields higher priority
        const source =  from;
        const senderSequence = sequence;

        let tx = null;

        if(purpose === DneroJS.StakePurposes.StakeForValidator){
            tx = new DneroJS.DepositStakeTx(source, holder, amountWeiToSend, feeInDTokenWei, purpose, senderSequence);
        }
        else if(purpose === DneroJS.StakePurposes.StakeForSentry){
            tx = new DneroJS.DepositStakeV2Tx(source, holder, amountWeiToSend, feeInDTokenWei, purpose, senderSequence);
        }
        else if(purpose === DneroJS.StakePurposes.StakeForEliteEdge){
            tx = new DneroJS.DepositStakeV2Tx(source, holder, amountWeiToSend, feeInDTokenWei, purpose, senderSequence);
        }

        return tx;
    }

    static unsignedWithdrawStakeTx(txData, sequence) {
        let { tokenType, from, holder, transactionFee, purpose} = txData;

        const ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Dnero = 10^18 DneroWei, 1 Gamma = 10^ DTokenWei
        const feeInDTokenWei  = (new BigNumber(transactionFee)).multipliedBy(ten18); // Any fee >= 10^12 DTokenWei should work, higher fee yields higher priority
        const source =  from;
        const senderSequence = sequence;

        let tx = new DneroJS.WithdrawStakeTx(source, holder, feeInDTokenWei, purpose, senderSequence);

        return tx;
    }

    static unsignedSmartContractTx(txData, sequence) {
        let { from, to, data, value, transactionFee, gasLimit} = txData;

        const ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Dnero = 10^18 DneroWei, 1 Gamma = 10^ DTokenWei
        const feeInDTokenWei  = (new BigNumber(transactionFee)).multipliedBy(ten18); // Any fee >= 10^12 DTokenWei should work, higher fee yields higher priority
        const senderSequence = sequence;
        const gasPrice = feeInDTokenWei;

        let tx = new DneroJS.SmartContractTx(from, to, gasLimit, gasPrice, data, value, senderSequence);

        return tx;
    }

    static isAddress(address){
        return Ethereum.isAddress(address);
    }

    static isValidHolderSummary(purpose, holderSummary){
        return DneroJS.DepositStakeV2Tx.isValidHolderSummary(purpose, holderSummary);
    }

    static async signTransaction(unsignedTx, privateKey){
        let chainID = Dnero.getChainID();
        // let unsignedTx = Dnero.unsignedSendTx(txData, sequence);
        let signedRawTxBytes = DneroJS.TxSigner.signAndSerializeTx(chainID, unsignedTx, privateKey);
        let signedTxRaw = signedRawTxBytes.toString('hex');

        //Remove the '0x' until the RPC endpoint supports '0x' prefixes
        signedTxRaw = signedTxRaw.substring(2);

        if(signedTxRaw){
            return signedTxRaw;
        }
        else{
            throw new Error("Failed to sign transaction.");
        }
    }

    static prepareTxPayload(unsignedTx){
        let chainID = Dnero.getChainID();
        let encodedChainID = RLP.encode(Bytes.fromString(chainID));
        let encodedTxType = RLP.encode(Bytes.fromNumber(unsignedTx.getType()));
        let encodedTx = RLP.encode(unsignedTx.rlpInput());
        let payload = encodedChainID + encodedTxType.slice(2) + encodedTx.slice(2);
        return payload.toString('hex');
    }
}
