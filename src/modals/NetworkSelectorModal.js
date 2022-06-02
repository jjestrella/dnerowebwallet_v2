import React from 'react';
import {connect} from 'react-redux';
import * as dnerojs from '@dnerolabs/dnero-js';
import {hideModal, hideModals} from "../state/actions/ui";
import {setNetwork} from "../state/actions/Wallet";

const classNames = require('classnames');

const OrderedNetworks = [
    dnerojs.networks.Mainnet,
    dnerojs.networks.Testnet,
    dnerojs.networks.Privatenet,
    dnerojs.networks.EliteEdgeTestnet,
];

export class NetworkSelectorModal extends React.Component {
    onNetworkClick = (network) => {
        this.props.dispatch(setNetwork(network.chainId));

        this.props.dispatch(hideModal());
    };

    render() {
        const {selectedNetwork} = this.props;

        return (
            <div className={'NetworkSelectorModal'}>
                <div className='NetworkSelectorModal__header'>
                    <div className='NetworkSelectorModal__header-title'>Select Network</div>
                </div>
                <div className='NetworkSelectorModal__content'>
                    <div className='NetworkSelectorModal__message'>
                        The default network for Dnero transactions is Mainnet.
                    </div>
                    <div className='NetworkSelectList'>
                        {
                            OrderedNetworks.map((network) => {
                                const classes = classNames('NetworkSelectListItem', { 'NetworkSelectListItem--active': (network.chainId === selectedNetwork.chainId)});

                                return (
                                    <div key={network.chainId}
                                         className={classes}
                                         onClick={() => {
                                             this.onNetworkClick(network);
                                         }}
                                    >
                                        <img className='NetworkSelectListItem__checkmark' src='/img/icons/checkmark.svg'/>
                                        <div className='NetworkSelectListItem__color' style={{backgroundColor: network.color}}/>
                                        <div className='NetworkSelectListItem__name'>{network.name}</div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { dneroWallet } = state;
    const selectedNetwork = dneroWallet.network;

    return {
        selectedNetwork: selectedNetwork,
    };
};

export default connect(mapStateToProps)(NetworkSelectorModal);
