import React from 'react';
import { useForm } from 'react-hook-form';
import { ethers } from 'ethers';
import * as dnerojs from '@dnerolabs/dnero-js';
import FormField from '../FormField';
import {StakePurposeForDDROP} from '../../constants';
import {formatDNC20TokenAmountToLargestUnit} from '../../utils/Utils';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import {DDropAsset} from '../../constants/assets';

export default function WithdrawStakeTxForm(props){
    const {onSubmit, defaultValues, formRef, selectedAccount, assets, chainId} = props;
    const {register, handleSubmit, errors, watch, setValue} = useForm({
        mode: 'onChange',
        defaultValues: defaultValues || {
            purpose: dnerojs.constants.StakePurpose.StakeForSentry,
            holder: '',
            amount: ''
        }
    });
    const purpose = parseInt(watch('purpose'));
    const amount = watch('amount');


    const renderEstDDROPToReturn = () => {
        const percentageToUnstake = Math.min(parseFloat(amount), 100.0) / 100;
        const dnc20stakes = _.get(selectedAccount, ['dnc20Stakes'], {});
        const balanceStr = _.get(dnc20stakes, 'ddrop.estimatedTokenOwnedWithRewards', '0');
        const balanceBN = new BigNumber(balanceStr);
        const amountBN = balanceBN.multipliedBy(percentageToUnstake);
        const formattedAmt = formatDNC20TokenAmountToLargestUnit(amountBN.toString(), DDropAsset(chainId).decimals);

        return (
            <div>
                <span className={'Balance__amount-title'}>Estimated DDROP Returned: </span><span className={'Balance__amount-value'}>{formattedAmt}</span>
            </div>
        );
    };

    return (
        <form className={'TxForm TxForm--WithdrawStake'}
              onSubmit={handleSubmit(onSubmit)}
              ref={formRef}
        >
            <FormField title={'Stake Type'}
                       error={errors.purpose && 'Stake type is required'}
            >
                <select
                    className={'RoundedInput'}
                    name={'purpose'}
                    ref={register({ required: true })}
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
                    <option key={'validator'}
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
                purpose !== StakePurposeForDDROP &&
                <FormField title={'Holder'}
                           error={errors.holder && 'A valid node address is required'}
                >
                    <input name="holder"
                           className={'RoundedInput'}
                           placeholder={'Enter node address'}
                           ref={register({
                               required: true,
                               validate: (s) => ethers.utils.isAddress(s)
                           })} />
                </FormField>
            }

            {
                purpose === StakePurposeForDDROP &&
                <FormField title={'% Amount to Unstake'}
                           error={errors.amount && errors.amount.message}
                >
                    <input name="amount"
                           className={'RoundedInput'}
                           placeholder={'Enter % amount to unstake'}
                           ref={register({
                               required: {
                                   value: true,
                                   message: 'Unstake % amount is required'
                               },
                               validate: {
                                   moreThanZero: (s) => {
                                       const f = parseFloat(s);

                                       return (f > 0) ? true : 'Invalid % amount.';
                                   },
                                   lessThanOrEqualTo100: (s) => {
                                       const f = parseFloat(s);

                                       return (f <= 100.0) ? true : 'Invalid % amount. Max 100%.';
                                   }
                               }
                           })} />
                </FormField>
            }
            {
                (purpose === StakePurposeForDDROP && !_.isEmpty(amount)) &&
                renderEstDDROPToReturn()
            }
        </form>
    );
}

