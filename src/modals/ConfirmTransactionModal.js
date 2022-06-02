import _ from 'lodash';
import React from 'react';
import * as dnerojs from '@dnerolabs/dnero-js';
import './TxConfirmationModal.css';
import connect from "react-redux/es/connect/connect";
import Modal from '../components/Modal'
import GradientButton from "../components/buttons/GradientButton";
import Wallet from '../services/Wallet'
import {
    approveTransactionRequest,
    rejectTransactionRequest
} from "../state/actions/Transactions";
import {
    formatNativeTokenAmountToLargestUnit, formatDNC20TokenAmountToLargestUnit,
    transactionRequestToTransactionType,
    transactionTypeToName, truncate
} from "../utils/Utils";
import {DefaultAssets, getAllAssets, tokenToAsset} from "../constants/assets";
import {DNC20ABI} from '../constants/contracts';
import FlatButton from "../components/buttons/FlatButton";
import {store} from "../state";
import MDSpinner from "react-md-spinner";
import BigNumber from "bignumber.js";


const renderDataRow = (title, value, suffix = '', isLarge = false) => {
    suffix = suffix ? suffix : '';

    if(value){
        return (
            <div className={`TxDataRow ${isLarge ? 'TxDataRow--large' : ''}`}>
                <div className="TxDataRow__title">
                    {title}
                </div>
                <div className="TxDataRow__value">
                    {value + suffix || ''}
                </div>
            </div>
        );
    }
    return null;
};

export class ConfirmTransactionModal extends React.Component {
    constructor(){
        super();

        this.state = {
            password: '',
            estimatedGasFee: null
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        let name = event.target.name;
        let value = event.target.value;

        this.setState({[name]: value});
    }

    onConfirmClick = () => {
        // TODO approve the request if the password matches
        // this.props.dispatch(createSendTransaction(this.props.network, this.props.transaction, this.state.password));
        const {transactionRequest} = this.props;
        this.props.dispatch(approveTransactionRequest(transactionRequest.id, this.state.password));
    }

    onRejectClick = () => {
        const {transactionRequest} = this.props;
        this.props.dispatch(rejectTransactionRequest(transactionRequest.id));
    }

    renderDataRows = () => {
        const {selectedAddress, transactionRequest, assets} = this.props;
        const txType = _.get(transactionRequest, 'txType');
        const txData = _.get(transactionRequest, 'txData');
        const stakePurpose = _.get(transactionRequest, 'txData.purpose');

        if(txType === dnerojs.constants.TxType.Send){
            const dneroWei = _.get(transactionRequest, 'txData.outputs[0].dneroWei', null);
            const dtokenWei = _.get(transactionRequest, 'txData.outputs[0].dtokenWei', null);

            return (
                <React.Fragment>
                    { renderDataRow('Transaction Type', transactionTypeToName(txType)) }
                    { renderDataRow('From', truncate(selectedAddress)) }
                    { renderDataRow('To', truncate(_.get(transactionRequest, 'txData.outputs[0].address'))) }
                    { dneroWei && (dneroWei !== '0') && renderDataRow('Amount', formatNativeTokenAmountToLargestUnit(dneroWei), ' DNERO') }
                    { dtokenWei && (dtokenWei !== '0') && renderDataRow('Amount', formatNativeTokenAmountToLargestUnit(dtokenWei), ' DTOKEN') }
                </React.Fragment>
            );
        }
        if(txType === dnerojs.constants.TxType.SmartContract){
            const transactionName = transactionRequestToTransactionType(transactionRequest);
            const contractAddress = _.get(transactionRequest, 'txData.to', null);
            const value = _.get(transactionRequest, 'txData.value');
            const asset = _.find(assets, function (a) {
                return a.contractAddress === contractAddress;
            });
            let transferToAddress = null;
            let transferToValue = null;
            let symbol = null;
            let decimals = null;

            try {
                const contractData = _.get(txData, 'data');
                const dnc20Contract = new dnerojs.Contract(null, DNC20ABI, null);
                const data = dnc20Contract.interface.decodeFunctionData('transfer(address,uint256)',contractData);
                transferToAddress = data[0];
                transferToValue = data[1].toString();
                symbol = asset && asset.symbol;
                decimals = asset && asset.decimals;
            }
            catch (e) {

            }

            return (
                <React.Fragment>
                    { renderDataRow('Transaction Type', transactionName) }
                    { !_.isNil(contractAddress) && renderDataRow('Contract', truncate(_.get(transactionRequest, 'txData.to'))) }
                    { renderDataRow('From', truncate(selectedAddress)) }
                    { !_.isNil(transferToAddress) && renderDataRow('To', truncate(transferToAddress)) }
                    { (!_.isNil(transferToAddress) && symbol && transferToValue) && renderDataRow('Token Amount', formatDNC20TokenAmountToLargestUnit(transferToValue, decimals), ` ${symbol}`) }
                    { (!_.isNil(value) && value > 0) && renderDataRow('Value', formatNativeTokenAmountToLargestUnit(value), ' DTOKEN') }
                    { renderDataRow('Data', _.get(transactionRequest, 'txData.data'), null, true) }

                </React.Fragment>
            );
        }
        if(txType === dnerojs.constants.TxType.WithdrawStake){
            return (
                <React.Fragment>
                    { renderDataRow('Transaction Type', transactionTypeToName(txType)) }
                    { renderDataRow('From', truncate(selectedAddress)) }
                    { renderDataRow('Holder', truncate(_.get(transactionRequest, 'txData.holder'))) }
                </React.Fragment>
            );
        }
        if(txType === dnerojs.constants.TxType.DepositStake){
            return (
                <React.Fragment>
                    { renderDataRow('Transaction Type', transactionTypeToName(txType)) }
                    { renderDataRow('Purpose', 'Validator Node') }
                    { renderDataRow('From', truncate(selectedAddress)) }
                    { renderDataRow('Holder', truncate(_.get(transactionRequest, 'txData.holder'))) }
                    { renderDataRow('Amount', formatNativeTokenAmountToLargestUnit(_.get(transactionRequest, 'txData.amount')), ' DNERO') }
                </React.Fragment>
            );
        }
        if(txType === dnerojs.constants.TxType.DepositStakeV2){
            return (
                <React.Fragment>
                    { renderDataRow('Transaction Type', transactionTypeToName(txType)) }
                    {
                        (stakePurpose === dnerojs.constants.StakePurpose.StakeForEliteEdge) &&
                        renderDataRow('Purpose', 'Edge Node')
                    }
                    {
                        (stakePurpose === dnerojs.constants.StakePurpose.StakeForSentry) &&
                        renderDataRow('Purpose', 'Sentry Node')
                    }
                    { renderDataRow('From', truncate(selectedAddress)) }
                    { renderDataRow('Holder summary', _.get(transactionRequest, 'txData.holderSummary'), null, true) }
                    {
                        (stakePurpose === dnerojs.constants.StakePurpose.StakeForEliteEdge) &&
                        renderDataRow('Amount', formatNativeTokenAmountToLargestUnit(_.get(transactionRequest, 'txData.amount')), ' DTOKEN')
                    }
                    {
                        (stakePurpose === dnerojs.constants.StakePurpose.StakeForSentry) &&
                        renderDataRow('Amount', formatNativeTokenAmountToLargestUnit(_.get(transactionRequest, 'txData.amount')), ' DNERO')
                    }
                </React.Fragment>
            );
        }
    };

    calculateTotalGasPrice = () => {
        const {transactionRequest} = this.props;

        if(transactionRequest?.gasFeeData?.totalGasFee){
            const dependencyGasFee = new BigNumber(_.get(transactionRequest, ['dependencies', 0, 'gasFeeData', 'totalGasFee'], '0'));

            return (new BigNumber(transactionRequest.gasFeeData.totalGasFee || '0')).plus(dependencyGasFee);
        }
    }

    render() {
        const {transactionRequest} = this.props;
        let isValid = Wallet.getWalletHardware() || this.state.password.length > 0;
        let txDataRows = this.renderDataRows();
        let passwordRow = null;

        if(!Wallet.getWalletHardware()){
            passwordRow = (
                <div className="TxConfirmationModal__password-container">
                    <div className="TxConfirmationModal__password-title">Enter your wallet password to sign this transaction</div>
                    <input className="ChoosePasswordCard__password-input"
                           placeholder="Enter wallet password"
                           name="password"
                           type="password"
                           value={this.state.password}
                           onChange={this.handleChange.bind(this)}
                    />
                </div>
            );
        }

        return (
            <Modal closeable={false}>
                <div className="TxConfirmationModal">
                    <div className="ModalTitle">
                        Confirm Transaction
                    </div>

                    <div className={'TxDataRows'}>
                        {
                            txDataRows
                        }
                        <div className={`TxDataRow`}>
                            <div className="TxDataRow__title">
                                Estimated Gas Fee
                            </div>
                            {
                                _.isNil(transactionRequest?.gasFeeData) &&
                                <div className="TxDataRow__value">
                                    <MDSpinner singleColor={'#1BDED0'} size={20}/>
                                </div>
                            }
                            {
                                !_.isNil(transactionRequest?.gasFeeData) &&
                                <div className="TxDataRow__value">
                                    <span>{`${formatNativeTokenAmountToLargestUnit(this.calculateTotalGasPrice())} DTOKEN`}</span>
                                </div>
                            }
                        </div>
                    </div>

                    { passwordRow }

                    <div className={'TxConfirmationModal__footer'}>
                        <FlatButton title={'Reject'}
                                    className={'ConfirmTransactionPage__reject-button'}
                                    size={'large'}
                                    onClick={this.onRejectClick}
                                    borderless centered/>
                        <GradientButton title={'Confirm'}
                                        className={'ConfirmTransactionPage__confirm-button'}
                                        disabled={isValid === false}
                                        onClick={this.onConfirmClick}
                        />
                    </div>

                </div>
            </Modal>
        )
    }
}

const mapStateToProps = state => {
    const { dneroWallet } = state;
    const selectedAddress = dneroWallet.selectedAddress;
    const identities = dneroWallet.identities;
    const accounts = dneroWallet.accounts;
    const transactionRequest = state.dneroWallet.transactionRequests[0];
    const tokens = dneroWallet.tokens;
    const chainId = dneroWallet.network.chainId;

    return {
        selectedAddress: selectedAddress,
        selectedIdentity: identities[selectedAddress],
        selectedAccount: accounts[selectedAddress],
        assets: getAllAssets(chainId, tokens),
        transactionRequest: transactionRequest,
    };
};

export default connect(mapStateToProps)(ConfirmTransactionModal);
