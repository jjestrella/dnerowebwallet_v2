import React from "react";
import './TransactionList.css';
import DneroTransactionListItem from './DneroTransactionListItem'

class TransactionList extends React.Component {
    createList(){
        return this.props.transactions.map(function(transaction, index){
            return <DneroTransactionListItem key={ transaction.hash }
                                             transaction={transaction}
            />;
        })
    };

    render() {
        return (
            <div className="TransactionList">
                {this.createList()}
            </div>
        );
    }
}

export default TransactionList;
