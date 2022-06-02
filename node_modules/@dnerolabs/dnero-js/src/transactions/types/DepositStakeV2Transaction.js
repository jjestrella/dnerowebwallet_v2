import _ from 'lodash';
import TxInput from '../common/TxInput'
import TxOutput from '../common/TxOutput'
import TxType from '../common/TxType'
import Coins from '../common/Coins'
import EthereumTx from '../common/EthereumTx'
import BigNumber from "bignumber.js"
import RLP from 'eth-lib/lib/rlp';
import Bytes from 'eth-lib/lib/bytes';
import BaseTransaction from "../common/BaseTransaction";
import {gasPriceDefault, StakePurpose} from "../../constants/index";

export default class DepositStakeV2Transaction extends BaseTransaction{
    static isValidHolderSummary(purpose, holderSummary){
        if(holderSummary){
            let summary = holderSummary;
            if(!holderSummary.startsWith('0x')){
                summary = "0x" + holderSummary;
            }

            let expectedLen = 460; // Sentry Nodes
            if(purpose === StakePurpose.StakeForEliteEdge){
                expectedLen = 524;
            }

            return (summary.length === expectedLen);
        }
        else{
            return false;
        }
    }

    constructor(tx){
        super(tx);

        let {source, holderSummary, purpose, amount, gasPrice, sequence} = tx;

        if(_.isNil(gasPrice)){
            gasPrice = gasPriceDefault;
        }

        let feeInDTokenWeiBN = BigNumber.isBigNumber(gasPrice) ? gasPrice : (new BigNumber(gasPrice));
        this.fee = new Coins(new BigNumber(0), feeInDTokenWeiBN);

        let stakeInWeiBN = BigNumber.isBigNumber(amount) ? amount : (new BigNumber(amount));
        if(purpose === StakePurpose.StakeForEliteEdge){
            // DTOKEN staking
            this.source = new TxInput(source, null, stakeInWeiBN, sequence);
        }
        else{
            // DNERO staking
            this.source = new TxInput(source, stakeInWeiBN, null, sequence);
        }

        this.purpose = purpose;

        //Parse out the info from the holder (summary) param
        if(!holderSummary.startsWith('0x')){
            holderSummary = "0x" + holderSummary;
        }

        //Ensure correct size
        if(!DepositStakeV2Transaction.isValidHolderSummary(purpose, holderSummary)) {
            //TODO: throw error
            console.log("Holder must be a valid node summary");
        }

        let nodeKeyBytes = Bytes.toArray(holderSummary);

        //slice instead of subarray
        let holderAddressBytes = nodeKeyBytes.slice(0, 20);

        this.blsPubkeyBytes = nodeKeyBytes.slice(20, 68);
        this.blsPopBytes = nodeKeyBytes.slice(68, 164);
        this.holderSigBytes = nodeKeyBytes.slice(164, 229);

        let holderAddress = Bytes.fromArray(holderAddressBytes);

        this.holder = new TxOutput(holderAddress, null, null);

        if(_.isNil(sequence)){
            this.setSequence(1);
        }
    }

    setSequence(sequence){
        const input = this.source;
        input.sequence = sequence;
    }

    getSequence(){
        const input = this.source;
        return input.sequence;
    }

    setFrom(address){
        const input = this.source;
        input.address = address;
    }

    setSignature(signature){
        let input = this.source;
        input.setSignature(signature);
    }

    signBytes(chainID){
        // Detach the existing signature from the source if any, so that we don't sign the signature
        let sig = this.source.signature;

        this.source.signature = "";

        let encodedChainID = RLP.encode(Bytes.fromString(chainID));
        let encodedTxType = RLP.encode(Bytes.fromNumber(this.getType()));
        let encodedTx = RLP.encode(this.rlpInput());
        let payload = encodedChainID + encodedTxType.slice(2) + encodedTx.slice(2);

        // For ethereum tx compatibility, encode the tx as the payload
        let ethTxWrapper = new EthereumTx(payload);
        let signedBytes = RLP.encode(ethTxWrapper.rlpInput()); // the signBytes conforms to the Ethereum raw tx format

        // Attach the original signature back to the source
        this.source.signature = sig;

        return signedBytes;
    }

    getType(){
        return TxType.DepositStakeV2;
    }

    rlpInput(){
        let rlpInput = [
            this.fee.rlpInput(),
            this.source.rlpInput(),
            this.holder.rlpInput(),

            Bytes.fromNumber(this.purpose),

            Bytes.fromArray(this.blsPubkeyBytes),
            Bytes.fromArray(this.blsPopBytes),
            Bytes.fromArray(this.holderSigBytes)
        ];

        return rlpInput;
    }
}
