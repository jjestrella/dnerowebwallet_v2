import _ from 'lodash';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ethers } from 'ethers';
import * as dnerojs from '@dnerolabs/dnero-js';
import FormField from '../../components/FormField';
import {
    formatNativeTokenAmountToLargestUnit,
    isHolderSummary,
    isValidAmount,
    numberWithCommas, toNativeTokenLargestUnit
} from '../../utils/Utils';
import {DDropAsset, DTokenAsset, DneroAsset} from '../../constants/assets';
import {getMaxDelegatedStakeAmount, getMaxStakeAmount, getMinStakeAmount, StakePurposeForDDROP} from '../../constants';
import FlatButton from "../buttons/FlatButton";
import BigNumber from "bignumber.js";

export default function DepositStakeTxForm(props) {
    const {onSubmit, defaultValues, formRef, selectedAccount, assets, chainId, onShowDelegatedSentryNodes} = props;
    const {register, handleSubmit, errors, watch, setValue} = useForm({
        mode: 'onChange',
        defaultValues: defaultValues || {
            purpose: dnerojs.constants.StakePurpose.StakeForSentry,
            holder: '',
            holderSummary: '',
            amount: '',
            delegatedSentryNode: null
        }
    });
    React.useEffect(() => {
        register('delegatedSentryNode');
    }, [register]);
    const purpose = parseInt(watch('purpose'));
    const delegatedSentryNode = watch('delegatedSentryNode');
    let holderTitle = null;
    let holderPlaceholder = null;
    let stakeAmountTitle = null;

    if (purpose === dnerojs.constants.StakePurpose.StakeForValidator) {
        holderTitle = 'Validator Node Holder (Address)';
        holderPlaceholder = 'Enter validator node address';
        stakeAmountTitle = 'Dnero Stake Amount';
    } else if (purpose === dnerojs.constants.StakePurpose.StakeForSentry) {
        holderTitle = 'Sentry Node Holder (Summary)';
        holderPlaceholder = 'Enter sentry node summary';
        stakeAmountTitle = 'Dnero Stake Amount';
    } else if (purpose === dnerojs.constants.StakePurpose.StakeForEliteEdge) {
        holderTitle = 'Edge Node Holder (Summary)';
        holderPlaceholder = 'Enter edge node summary';
        stakeAmountTitle = 'DToken Stake Amount';
    } else if (purpose === StakePurposeForDDROP) {
        holderTitle = null;
        holderPlaceholder = null;
        stakeAmountTitle = 'DDrop Stake Amount';
    }
    const populateMaxAmount = () => {
        let amount = '';
        let max = getMaxStakeAmount(purpose);
        if(purpose === dnerojs.constants.StakePurpose.StakeForValidator || purpose === dnerojs.constants.StakePurpose.StakeForSentry){
            amount = toNativeTokenLargestUnit(selectedAccount.balances['dnerowei']).toString(10);

            if (purpose === dnerojs.constants.StakePurpose.StakeForEliteEdge) {
                amount = Math.min(max, parseFloat(amount));
            } else if (
                purpose === dnerojs.constants.StakePurpose.StakeForSentry ||
                !_.isNil(delegatedSentryNode)) {
                max = getMaxDelegatedStakeAmount(purpose);
                amount = Math.min(max, parseFloat(amount));
            }
        }
        else if(purpose === dnerojs.constants.StakePurpose.StakeForEliteEdge){
            const maxDtokenBN = (new BigNumber(selectedAccount.balances['dtokenwei'])).minus(dnerojs.constants.gasPriceDefault);
            amount = toNativeTokenLargestUnit(maxDtokenBN.toString(10)).toString(10);

            amount = Math.min(max, parseFloat(amount));
        }
        else if(purpose === StakePurposeForDDROP){
            const dDropAsset = DDropAsset(chainId);
            const balance = selectedAccount.balances[dDropAsset.address] || '0';
            amount = toNativeTokenLargestUnit(balance).toString(10);
        }
        setValue('amount', amount);
    }

    return (
        <form className={'TxForm TxForm--DepositStake'}
              onSubmit={handleSubmit(onSubmit)}
              ref={formRef}
        >
            <FormField title={'Stake Type'}
                       error={errors.purpose && 'Stake type is required'}
            >
                <select
                    className={'RoundedInput'}
                    name={'purpose'}
                    ref={register({required: true})}
                >
                    <option key={'__placeholder__'}
                            value={''}
                            disabled>
                        Select stake type
                    </option>
                    <option key={'sentry'}
                            value={dnerojs.constants.StakePurpose.StakeForSentry}>
                        Sentry Node
                    </option>
                    <option key={'validator'}
                            value={dnerojs.constants.StakePurpose.StakeForValidator}>
                        Validator Node
                    </option>
                    <option key={'elite-edge'}
                            value={dnerojs.constants.StakePurpose.StakeForEliteEdge}>
                        Edge Node
                    </option>
                    {
                        DDropAsset(chainId) &&
                        <option key={'ddrop'}
                                value={StakePurposeForDDROP}>
                            DDROP
                        </option>
                    }
                </select>
            </FormField>

            {
                (purpose === dnerojs.constants.StakePurpose.StakeForValidator) &&
                <FormField title={holderTitle}
                           error={errors.holder && 'A valid validator address is required'}
                >
                    <input name="holder"
                           className={'RoundedInput'}
                           placeholder={holderPlaceholder}
                           ref={register({
                               required: true,
                               validate: (s) => ethers.utils.isAddress(s)
                           })}/>
                </FormField>
            }

            {
                (purpose === dnerojs.constants.StakePurpose.StakeForSentry) &&
                <FormField title={(delegatedSentryNode ? 'Delegated Sentry Node' : holderTitle)}
                           error={errors.holderSummary && 'Sentry node summary or delegated sentry node is required'}
                >
                    <React.Fragment>
                        <textarea name="holderSummary"
                          className={'RoundedInput'}
                          style={{height: 100, display: (delegatedSentryNode ? 'none' : 'block')}}
                          placeholder={holderPlaceholder}
                          ref={register({
                              required: true,
                              validate: (s) => isHolderSummary(s)
                          })}/>
                        {
                            _.isNil(delegatedSentryNode) &&
                            <a onClick={() => {
                                onShowDelegatedSentryNodes((node) => {
                                    setValue('holderSummary', node.node_summary);
                                    setValue('delegatedSentryNode', node);
                                });
                            }}
                               className={'Link'}
                               style={{marginTop: 8, textAlign: 'left'}}
                            >
                                Select Delegated Sentry Node
                            </a>
                        }
                    </React.Fragment>
                    {
                        !_.isNil(delegatedSentryNode) &&
                        <React.Fragment>
                            <div className={'RoundedInput'}>
                                <div className={'RoundedInputClearableValue'}>
                                    <div>{delegatedSentryNode.name}</div>
                                    <a onClick={() => {
                                        setValue('holderSummary', null);
                                        setValue('delegatedSentryNode', null);
                                    }}
                                       style={{marginLeft: 'auto'}}
                                    >
                                        <img src={'/img/icons/alert-x@2x.png'}/>
                                    </a>
                                </div>
                            </div>
                        </React.Fragment>
                    }
                </FormField>
            }


            {
                (purpose === dnerojs.constants.StakePurpose.StakeForEliteEdge) &&
                <FormField title={holderTitle}
                           error={errors.holderSummary && 'Edge node summary is required'}
                >
          <textarea name="holderSummary"
                    className={'RoundedInput'}
                    style={{height: 100}}
                    placeholder={holderPlaceholder}
                    ref={register({
                        required: true,
                        validate: (s) => dnerojs.transactions.DepositStakeV2Transaction.isValidHolderSummary(purpose, s)
                    })}/>
                </FormField>
            }

            <FormField title={stakeAmountTitle}
                       error={errors.amount && errors.amount.message}
            >
                <div className={'RoundedInputWrapper'}>
                    <input name="amount"
                       className={'RoundedInput'}
                       placeholder={'Enter amount to stake'}
                       ref={register({
                           required: {
                               value: true,
                               message: 'Stake amount is required'
                           },
                           validate: {
                               sufficientBalance: (s) => {
                                   let isValid = true;
                                   if (purpose === dnerojs.constants.StakePurpose.StakeForEliteEdge) {
                                       isValid = isValidAmount(selectedAccount, DTokenAsset, s);
                                   } else if (
                                       purpose === dnerojs.constants.StakePurpose.StakeForSentry ||
                                       purpose === dnerojs.constants.StakePurpose.StakeForValidator) {
                                       isValid = isValidAmount(selectedAccount, DneroAsset, s);
                                   } else if (purpose === StakePurposeForDDROP) {
                                       const dDropAsset = DDropAsset(chainId);

                                       isValid = isValidAmount(selectedAccount, dDropAsset, s);
                                   }

                                   return isValid ? true : 'Insufficient balance';
                               },
                               moreThanMin: (s) => {
                                   const f = parseFloat(s);
                                   const min = getMinStakeAmount(purpose);
                                   if (purpose === dnerojs.constants.StakePurpose.StakeForEliteEdge) {
                                       if(min > f){
                                           return `Invalid amount. Must be at least ${numberWithCommas(min)} DTOKEN`;
                                       }
                                   } else if (
                                       purpose === dnerojs.constants.StakePurpose.StakeForSentry ||
                                       purpose === dnerojs.constants.StakePurpose.StakeForValidator) {
                                       if(min > f){
                                           return `Invalid amount. Must be at least ${numberWithCommas(min)} DNERO`;
                                       }
                                   }
                                   return true;
                               },
                               lessThanMax: (s) => {
                                   const f = parseFloat(s);
                                   let max = getMaxStakeAmount(purpose);
                                   if (purpose === dnerojs.constants.StakePurpose.StakeForEliteEdge) {
                                       if(max < f){
                                           return `Invalid amount. Must be less than ${numberWithCommas(max)} DTOKEN`;
                                       }
                                   } else if (
                                       purpose === dnerojs.constants.StakePurpose.StakeForSentry ||
                                       !_.isNil(delegatedSentryNode)) {
                                       max = getMaxDelegatedStakeAmount(purpose);
                                       if(max < f){
                                           return `Invalid amount. There's a max of ${numberWithCommas(max)} DNERO for delegated nodes. Please download and run your own Sentry Node to stake more.`;
                                       }
                                   }
                                   return true;
                               },
                               moreThanZero: (s) => {
                                   const f = parseFloat(s);

                                   return (f > 0) ? true : 'Invalid stake amount';
                               }
                           }
                       })}/>
                       <FlatButton title={'Max'}
                                   size={'small'}
                                   className={'RoundedInputButton'}
                                   onClick={populateMaxAmount}/>
                </div>
            </FormField>
        </form>
    );
}
