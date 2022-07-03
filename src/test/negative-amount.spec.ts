import { NegativeAmountPipe } from '../app/pipe/negative-amount.pipe';


describe('Pipe Amount test', () => {
    let pipe: NegativeAmountPipe;
    beforeAll(() => {
        pipe = new NegativeAmountPipe();
    });
    it('Should return a positive number with two decimals after pass negative number', () => {
        expect(pipe.transform('-1.656565')).toBe('1.66');
    }) ;
    it('Should return a positive number with two decimals after pass positive number', () => {
        expect(pipe.transform('1.656565')).toBe('1.656565');
    }) ;
});