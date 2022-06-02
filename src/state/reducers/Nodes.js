import * as actionTypes from "../types/Nodes";

const INITIAL_STATE = {
    isFetchingSentryNodeDelegates: false,

    sentryNodeDelegates: [],
};

export const nodesReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        //ERC20 Transactions
        case actionTypes.FETCH_SENTRY_NODE_DELEGATES_START: {
            return Object.assign({}, state, {
                isFetchingSentryNodeDelegates: true
            });
        }
        case actionTypes.FETCH_SENTRY_NODE_DELEGATES_END: {
            return Object.assign({}, state, {
                isFetchingSentryNodeDelegates: false
            });
        }
        case actionTypes.FETCH_SENTRY_NODE_DELEGATES_SUCCESS: {
            let body = action.response.body;
            let sentryNodeDelegates = body;

            return Object.assign({}, state, {
                sentryNodeDelegates: sentryNodeDelegates,
            });
        }

        default: {
            return state
        }
    }
};
