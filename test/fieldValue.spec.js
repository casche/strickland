import expect from 'expect';
import { fieldValue } from '../src';

describe('fieldValue', () => {
    describe('message', () => {
        it('defaults to "${field} must be ${exactly}" for an exact fieldValue', () => {
            const validate = fieldValue('field', 2);
            const result = validate({ field: 2 });
            expect(result.message).toBe('field must be 2');
        });

        it('defaults to "${field} must be between ${min} and ${max}" for a range', () => {
            const validate = fieldValue('field', 2, 3);
            const result = validate({ field: 2 });
            expect(result.message).toBe('field must be between 2 and 3');
        });

        it('can be overridden through props', () => {
            const validate = fieldValue('field', 2, 3, { message: 'Overridden' });
            const result = validate({ field: 2 });
            expect(result.message).toBe('Overridden');
        });
    });

    describe('props', () => {
        it('flow through', () => {
            const validate = fieldValue('field', 2, 3, { errorLevel: 10 });
            const result = validate({ field: 2 });
            expect(result.errorLevel).toBe(10);
        });

        it('guards against null', () => {
            const validate = fieldValue('field', 2, 3, null);
            const result = validate({ field: 2 });
            expect(result.message).toExist();
        });
    });

    describe('treats falsy values as valid', () => {
        const validate = fieldValue('field', 1);
        let notDefined;

        [ notDefined, null, false, 0, '' ]
        .forEach((value) => {
            it(JSON.stringify(value), () => {
                const result = validate(value);
                expect(result.isValid).toBe(true);
            });
        });
    });

    describe('treats falsy field values as valid', () => {
        const validate = fieldValue('field', 1);
        let notDefined;

        [ notDefined, null, false, 0, '' ]
        .forEach((value) => {
            it(JSON.stringify(value), () => {
                const result = validate({ field: value });
                expect(result.isValid).toBe(true);
            });
        });
    });

    describe('uses a single argument as an exact value', () => {
        describe('for numbers', () => {
            [
                { exactly: 2, value: 1, isValid: false },
                { exactly: 2, value: 2, isValid: true },
                { exactly: 2, value: 3, isValid: false }
            ].forEach((test) => {
                it(JSON.stringify(test), () => {
                    const validate = fieldValue('number', test.exactly);
                    const result = validate({ number: test.value });
                    expect(result.isValid).toBe(test.isValid);
                });
            });
        });

        describe('for strings', () => {
            [
                { exactly: 'b', value: 'a', isValid: false },
                { exactly: 'b', value: 'b', isValid: true },
                { exactly: 'b', value: 'c', isValid: false }
            ].forEach((test) => {
                it(JSON.stringify(test), () => {
                    const validate = fieldValue('string', test.exactly);
                    const result = validate({ string: test.value });
                    expect(result.isValid).toBe(test.isValid);
                });
            });
        });

        describe('for dates', () => {
            [
                { exactly: new Date(2016, 4, 13), value: new Date(2016, 4, 12), isValid: false },
                { exactly: new Date(2016, 4, 13), value: new Date(2016, 4, 13), isValid: true },
                { exactly: new Date(2016, 4, 13), value: new Date(2016, 4, 14), isValid: false }
            ].forEach((test) => {
                it(JSON.stringify(test), () => {
                    const validate = fieldValue('date', test.exactly);
                    const result = validate({ date: test.value });
                    expect(result.isValid).toBe(test.isValid);
                });
            });
        });
    });

    describe('uses a min/max pair as a value range', () => {
        describe('for numbers', () => {
            [
                { min: 2, max: 3, value: 1, isValid: false },
                { min: 2, max: 3, value: 2, isValid: true },
                { min: 2, max: 3, value: 3, isValid: true },
                { min: 2, max: 3, value: 4, isValid: false }
            ].forEach((test) => {
                it(JSON.stringify(test), () => {
                    const validate = fieldValue('number', test.min, test.max);
                    const result = validate({ number: test.value });
                    expect(result.isValid).toBe(test.isValid);
                });
            });
        });

        describe('for strings', () => {
            [
                { min: 'b', max: 'c', value: 'a', isValid: false },
                { min: 'b', max: 'c', value: 'b', isValid: true },
                { min: 'b', max: 'c', value: 'c', isValid: true },
                { min: 'b', max: 'c', value: 'd', isValid: false }
            ].forEach((test) => {
                it(JSON.stringify(test), () => {
                    const validate = fieldValue('string', test.min, test.max);
                    const result = validate({ string: test.value });
                    expect(result.isValid).toBe(test.isValid);
                });
            });
        });

        describe('for dates', () => {
            [
                { min: new Date(2016, 4, 13), max: new Date(2016, 4, 14), value: new Date(2016, 4, 12), isValid: false },
                { min: new Date(2016, 4, 13), max: new Date(2016, 4, 14), value: new Date(2016, 4, 13), isValid: true },
                { min: new Date(2016, 4, 13), max: new Date(2016, 4, 14), value: new Date(2016, 4, 14), isValid: true },
                { min: new Date(2016, 4, 13), max: new Date(2016, 4, 14), value: new Date(2016, 4, 15), isValid: false }
            ].forEach((test) => {
                it(JSON.stringify(test), () => {
                    const validate = fieldValue('date', test.min, test.max);
                    const result = validate({ date: test.value });
                    expect(result.isValid).toBe(test.isValid);
                });
            });
        });
    });
});