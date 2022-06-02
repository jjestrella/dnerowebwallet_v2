import React from "react";
import './DneroTransactionListItem.css';
import moment from 'moment';
import TransactionStatus from './TransactionStatus'
import {formatNativeTokenAmountToLargestUnit, numberWithCommas, truncate} from "../utils/Utils";
import _ from 'lodash';
import Dnero from '../services/Dnero';

class DneroTransactionListItem extends React.Component {
    render() {
        let { transaction } = this.props;
        let {inputs, outputs, timestamp, bound, hash, is_local} = transaction;
        let input = (inputs ? inputs[0] : null);
        let output = (outputs ? outputs[0] : null);
        let from = _.get(input, ['address']);
        let to = _.get(output, ['address']);
        let isReceived = (bound === "inbound");
        let explorerUrl = Dnero.getTransactionExplorerUrl(transaction);

        //Truncate the addresses to help reduce the run ons
        from = truncate(from);
        to = truncate(to);

        let dneroAmount = _.get(output, ['coins', 'dnerowei']);
        let dtokenAmount = _.get(output, ['coins', 'dtokenwei']);

        return (
            <a className="DneroTransactionListItem"
               href={explorerUrl}
               target="_blank"
            >
                <div className="DneroTransactionListItem__left-container">
                    <div className="DneroTransactionListItem__top-container">
                        <TransactionStatus bound={bound} isLocal={is_local}/>
                    </div>
                    <div className="DneroTransactionListItem__middle-container">
                        <div className="DneroTransactionListItem__address-container">
                            <div className="DneroTransactionListItem__address-prefix" >{isReceived ? "FROM:" : "TO:"}</div>
                            <div className="DneroTransactionListItem__address">{isReceived ? from : to}</div>
                        </div>
                    </div>
                    <div className="DneroTransactionListItem__bottom-container">
                        <div className="DneroTransactionListItem__date">{moment.unix(timestamp).fromNow()}</div>
                    </div>
                </div>

                <div className="DneroTransactionListItem__right-container">
                    <div className="DneroTransactionListItem__amount-container">
                        <div className="DneroTransactionListItem__amount">{formatNativeTokenAmountToLargestUnit(dneroAmount)}</div>
                        <img className="DneroTransactionListItem__amount-icon"
                             src="/img/tokens/dnero_large@2x.png"
                        />
                    </div>
                    <div className="DneroTransactionListItem__amount-container">
                        <div className="DneroTransactionListItem__amount">{formatNativeTokenAmountToLargestUnit(dtokenAmount)}</div>
                        <img className="DneroTransactionListItem__amount-icon"
                             src="/img/tokens/dtoken_large@2x.png"
                        />
                    </div>
                </div>
            </a>
        );
    }
}

export default DneroTransactionListItem;
