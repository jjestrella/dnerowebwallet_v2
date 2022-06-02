const TokenTypes = {
    ETHEREUM: 'ethereum',
    ERC20_DNERO: 'erc20',
    DNERO: 'dnero',
    DNERO_TOKEN: 'dtoken',
};


export function tokenTypeToTokenName(tokenType){
    if(tokenType === TokenTypes.ETHEREUM){
        return "Ethereum";
    }
    else if(tokenType === TokenTypes.ERC20_DNERO){
        return "ERC20 Dnero";
    }
    else if(tokenType === TokenTypes.DNERO){
        return "Dnero";
    }
    else if(tokenType === TokenTypes.DNERO_TOKEN){
        return "DToken";
    }
}

export default TokenTypes;