import validate from './validate';
import minLength from './minLength';
import maxLength from './maxLength';
import {getValidatorProps} from './utils';

export default function length(...params) {
    return function validateLength(value, context) {
        const props = getValidatorProps(
            ['minLength', 'maxLength'],
            params,
            value,
            context
        );

        const result = validate([
            minLength(props.minLength),
            maxLength(props.maxLength)
        ], value, context);

        return {
            ...props,
            ...result
        };
    }
}