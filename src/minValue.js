import validator from './validator';
import { gte } from 'lodash';

export default function minValueValidator(min = 0, props) {
    props = props || {};
    props.message = props.message || `At least ${min}`;

    return validator(
        (value) => gte(value, min),
        props
    );
}