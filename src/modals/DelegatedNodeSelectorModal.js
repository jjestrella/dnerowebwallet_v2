import React from 'react';
import {connect} from 'react-redux';
import {truncate} from '../utils/Utils';
import {hideModal} from "../state/actions/ui";

export class DelegatedNodeSelectorModal extends React.Component {
    onNodeClick = (node) => {
        const {onSelectNode} = this.props;

        this.props.dispatch(hideModal());

        if(onSelectNode){
            onSelectNode(node);
        }
    };

    render() {
        const {delegatedSentryNodes} = this.props;

        return (
            <div className={'DelegatedNodeSelectorModal'}>
                <div className='DelegatedNodeSelectorModal__header'>
                    <div className='DelegatedNodeSelectorModal__header-title'>Select Delegated Node</div>
                </div>
                <div className='DelegatedNodeSelectorModal__content'>
                    <div className='DelegatedNodeSelectorModal__message'>
                        Delegated staking Sentry Nodes are nodes run by Dnero community volunteers. Uptime of these nodes is not guaranteed, and you may not receive full DTOKEN rewards if the node you delegate to has significant downtime.
                    </div>
                    <div className='DelegatedNodeList'>
                        {
                            delegatedSentryNodes.map((node) => {
                                return (
                                    <div key={node.address}
                                         className={'DelegatedNodeListItem'}
                                         onClick={() => {
                                             this.onNodeClick(node);
                                         }}
                                    >
                                        <div className='DelegatedNodeListItem__name'>
                                            <span>{node.name}</span>
                                            <span className='DelegatedNodeListItem__fee'>{`${node.fee} Fee`}</span>
                                        </div>
                                        <div className='DelegatedNodeListItem__address'>{truncate(node.address)}</div>
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

const mapStateToProps = (state, props) => {
    const { dneroWallet } = state;
    const delegatedSentryNodes = dneroWallet.delegatedSentryNodes;

    return {
        delegatedSentryNodes: delegatedSentryNodes,

        onSelectNode: props.onSelectNode
    };
};

export default connect(mapStateToProps)(DelegatedNodeSelectorModal);
