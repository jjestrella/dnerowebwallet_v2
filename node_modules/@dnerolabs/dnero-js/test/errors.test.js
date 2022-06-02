require('isomorphic-fetch');
const dnerojs = require('..');

test('should humanize non-send transaction error', () => {
    const rawErrorMessage = 'Source balance is 0 DneroWei, 83219719973005968227 DTokenWei, but required minimal balance is 0 DneroWei, 93000000000000000000 DTokenWei';
    const humanizedErrorMessage = dnerojs.errors.humanizeErrorMessage(rawErrorMessage);
    const expectedMessage = `Insufficient funds. You need at least 93 DTOKEN to send this transaction.`;

    expect(humanizedErrorMessage).toBe(expectedMessage);
});

test('should humanize send transaction error (no dtoken for gas)', () => {
    const rawErrorMessage = 'Insufficient fund: balance is 1000000000000000000 DneroWei, 0 DTokenWei, tried to send 1000000000000000000 DneroWei, 1000000000000 DTokenWei';
    const humanizedErrorMessage = dnerojs.errors.humanizeErrorMessage(rawErrorMessage);
    const expectedMessage = `Insufficient gas. You need at least 0.000001 DTOKEN to send this transaction.`;

    expect(humanizedErrorMessage).toBe(expectedMessage);
});

test('should leave unknown errors alone', () => {
    const rawErrorMessage = 'Something happened on the vm';
    const humanizedErrorMessage = dnerojs.errors.humanizeErrorMessage(rawErrorMessage);
    const expectedMessage = `Something happened on the vm`;

    expect(humanizedErrorMessage).toBe(expectedMessage);
});
