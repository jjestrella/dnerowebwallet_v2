import Coins from './Coins';

export default class TxOutput {
    constructor(address, dneroWei, dtokenWei) {
        this.address = address;

        if(dneroWei || dtokenWei){
            this.coins = new Coins(dneroWei, dtokenWei);
        }
        else{
            //TODO should this be undefined or null?
            this.coins = new Coins(null, null);
        }
    }

    rlpInput(){
        let address = null;

        if(this.address){
            address = this.address.toLowerCase();
        }
        else{
            //Empty address
            address = "0x0000000000000000000000000000000000000000";
        }

        let rplInput = [
            address,
            this.coins.rlpInput()
        ];

        return rplInput;
    }
}
