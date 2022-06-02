import _ from 'lodash';
import React from 'react'
import connect from "react-redux/es/connect/connect";
import SendTxForm from '../components/transactions/SendTxForm';
import {formDataToTransaction} from "../utils/Utils";
import {createTransactionRequest} from "../state/actions/Transactions";
import GradientButton from "../components/buttons/GradientButton";
import {DefaultAssets, getAllAssets, tokenToAsset} from "../constants/assets";
import DepositStakeTxForm from "../components/transactions/DepositStakeTxForm";
import WithdrawStakeTxForm from "../components/transactions/WithdrawStakeTxForm";
import {updateAccountBalances} from "../state/actions/Wallet";
import {showModal} from "../state/actions/ui";
import ModalTypes from "../constants/ModalTypes";
import DelegateVoteTxForm from "../components/transactions/DelegateVoteTxForm";

export class CreateTransactionModal extends React.Component {
    constructor() {
        super();

        this.formRef = React.createRef();
    }

    onNextClick = () => {
        this.formRef.current.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}));
    };

    onSubmit = async (data) => {
        const {transactionType, dneroWallet} = this.props;
        const tx = await formDataToTransaction(transactionType, data, dneroWallet);
        const deps = tx.dependencies || [];
        const depTx = deps[0];
        const transactionRequest = tx.toJson();
        if(depTx){
            transactionRequest.dependencies = [
                depTx.toJson()
            ];
        }

        this.props.dispatch(createTransactionRequest(transactionRequest));
    };

    onShowDelegatedSentryNodes = (onSelectNode) => {
        this.props.dispatch(showModal({
            type: ModalTypes.DELEGATED_NODE_SELECTOR,
            props: {
                onSelectNode: onSelectNode
            }
        }));
    }

    componentDidMount() {
        this.props.dispatch(updateAccountBalances(false));
    }

    render() {
        const {selectedIdentity, selectedAccount, transactionType, assets, chainId} = this.props;
        const title = transactionType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        return (
            <div className={'CreateTransactionModal'}>
                <div className="ModalTitle">
                    {title}
                </div>
                {
                    (transactionType === 'send') &&
                    <SendTxForm formRef={this.formRef}
                                selectedAccount={selectedAccount}
                                assets={assets}
                                chainId={chainId}
                                onSubmit={this.onSubmit}/>
                }
                {
                    (transactionType === 'deposit-stake') &&
                    <DepositStakeTxForm formRef={this.formRef}
                                        selectedAccount={selectedAccount}
                                        assets={assets}
                                        chainId={chainId}
                                        onSubmit={this.onSubmit}
                                        onShowDelegatedSentryNodes={this.onShowDelegatedSentryNodes}
                    />
                }
                {
                    (transactionType === 'withdraw-stake') &&
                    <WithdrawStakeTxForm formRef={this.formRef}
                                         selectedAccount={selectedAccount}
                                         assets={assets}
                                         chainId={chainId}
                                         onSubmit={this.onSubmit}/>
                }
                {
                    (transactionType === 'delegate-ddrop-vote') &&
                    <DelegateVoteTxForm formRef={this.formRef}
                                        selectedAccount={selectedAccount}
                                        chainId={chainId}
                                        onSubmit={this.onSubmit}/>
                }
                <div className={'CreateTransactionModal__footer'}>
                    <GradientButton onClick={this.onNextClick}
                                    title={'Next'}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    const {transactionType} = props;
    const {dneroWallet} = state;
    const selectedAddress = dneroWallet.selectedAddress;
    const identities = dneroWallet.identities;
    const accounts = dneroWallet.accounts;
    const tokens = dneroWallet.tokens;
    const chainId = dneroWallet.network.chainId;

    return {
        transactionType: transactionType,

        selectedAddress: selectedAddress,
        selectedIdentity: identities[selectedAddress],
        selectedAccount: accounts[selectedAddress],
        chainId: chainId,

        // Not ideal to pass this whole state but helps with the form data -> tx
        dneroWallet: dneroWallet,

        assets: getAllAssets(chainId, tokens),
    };
};

export default connect(mapStateToProps)(CreateTransactionModal);
