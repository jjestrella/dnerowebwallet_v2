import {encodeWei} from '../../utils';
import BigNumber from "bignumber.js";

export default class Coins{
    constructor(dneroWei, dtokenWei){
        this.dneroWei = (dneroWei ? dneroWei : new BigNumber(0));
        this.dtokenWei = (dtokenWei ? dtokenWei : new BigNumber(0));
    }

    rlpInput(){
        let rlpInput = [
            encodeWei(this.dneroWei),
            encodeWei(this.dtokenWei)
        ];

        return rlpInput;
    }
}
