import {props, required, minLength, length} from '../src/strickland';

describe('props', () => {
    it('returns a validate function', () => {
        const validate = props();
        expect(validate).toBeInstanceOf(Function);
    });

    describe('validates', () => {
        const personProps = {
            first: required({message: 'First: required'}),
            last: [
                required({message: 'Last: required'}),
                minLength(2, {message: 'Last: minLength'})
            ]
        };

        const validate = props(personProps);
        const person = {
            first: '',
            last: 'A'
        };

        const result = validate(person);

        it('returning a result object', () => {
            expect(result).toBeInstanceOf(Object);
        });

        it('returning results for all props', () => {
            expect(result).toMatchObject({
                props: {
                    first: {isValid: false},
                    last: {isValid: false}
                }
            });
        });

        it('returning a top-level isValid property', () => {
            expect(result.isValid).toBeDefined();
        });

        it('producing invalid results', () => {
            expect(result.isValid).toBe(false);
        });

        it('producing valid results', () => {
            const validPerson = {
                first: 'A',
                last: 'AB'
            };

            const validResult = validate(validPerson);
            expect(validResult).toMatchObject({
                isValid: true,
                props: {
                    first: {isValid: true},
                    last: {isValid: true}
                }
            });
        });
    });

    describe('with empty rules', () => {
        const validate = props();
        const result = validate();

        it('returns valid results', () => {
            expect(result.isValid).toBe(true);
        });

        it('returns empty props', () => {
            expect(result.props).toEqual({});
        });
    });

    describe('with nested rules objects', () => {
        const validate = props({
            name: required(),
            homeAddress: {
                street: required(),
                city: required(),
                state: [required(), length(2, 2)]
            },
            workAddress: {
                street: {
                    number: required(),
                    name: required()
                },
                city: required(),
                state: [required(), length(2, 2)]
            }
        });

        it('returns props in the shape of the rules', () => {
            const value = {
                name: 'Name',
                homeAddress: {
                    street: '9303 Lyon Dr.',
                    city: 'Hill Valley',
                    state: 'CA'
                },
                workAddress: {
                    street: {
                        number: 456,
                        name: 'Front St.'
                    },
                    city: 'City',
                    state: 'ST'
                }
            };

            const result = validate(value);

            expect(result.props).toMatchObject({
                name: {isValid: true},
                homeAddress: {
                    isValid: true,
                    props: {
                        street: {isValid: true},
                        city: {isValid: true},
                        state: {isValid: true}
                    }
                },
                workAddress: {
                    isValid: true,
                    props: {
                        street: {
                            isValid: true,
                            props: {
                                number: {isValid: true},
                                name: {isValid: true}
                            }
                        },
                        city: {isValid: true},
                        state: {isValid: true}
                    }
                }
            });
        });

        it('returns valid results', () => {
            const value = {
                name: 'Name',
                homeAddress: {
                    street: '9303 Lyon Dr.',
                    city: 'Hill Valley',
                    state: 'CA'
                },
                workAddress: {
                    street: {
                        number: 456,
                        name: 'Front St.'
                    },
                    city: 'City',
                    state: 'ST'
                }
            };

            const result = validate(value);

            expect(result).toMatchObject({
                isValid: true,
                props: {
                    homeAddress: {isValid: true},
                    workAddress: {
                        isValid: true,
                        props: {
                            street: {isValid: true}
                        }
                    }
                }
            });
        });

        it('returns invalid results (validating all properties)', () => {
            const value = {
                name: '',
                homeAddress: {
                    street: '9303 Lyon Dr.',
                    city: 'Hill Valley',
                    state: ''
                },
                workAddress: {
                    street: {
                        number: '',
                        name: ''
                    },
                    city: '',
                    state: 'ST'
                }
            };

            const result = validate(value);

            expect(result).toMatchObject({
                isValid: false,
                props: {
                    homeAddress: {
                        isValid: false
                    },
                    workAddress: {
                        isValid: false,
                        props: {
                            street: {
                                isValid: false,
                                props: {
                                    name: {isValid: false}
                                }
                            }
                        }
                    }
                }
            });
        });
    });

    describe('when properties are missing from the value', () => {
        const validate = props({
            name: required(),
            homeAddress: {
                street: required(),
                city: required(),
                state: [required(), length(2, 2)]
            },
            workAddress: {
                street: {
                    number: required(),
                    name: required()
                },
                city: required(),
                state: [required(), length(2, 2)]
            }
        });

        it('validates missing scalar values', () => {
            const value = {
                homeAddress: {},
                workAddress: {
                    street: {}
                }
            };

            const result = validate(value);

            expect(result).toMatchObject({
                isValid: false,
                props: {
                    name: {isValid: false},
                    homeAddress: {
                        isValid: false,
                        props: {
                            street: {isValid: false},
                            city: {isValid: false},
                            state: {isValid: false}
                        }
                    },
                    workAddress: {
                        isValid: false,
                        props: {
                            street: {
                                isValid: false,
                                props: {
                                    number: {isValid: false},
                                    name: {isValid: false}
                                }
                            },
                            city: {isValid: false},
                            state: {isValid: false}
                        }
                    }
                }
            });
        });

        it('sets missing top-level object properties to valid', () => {
            const value = {
                workAddress: {
                    street: {}
                }
            };

            const result = validate(value);
            expect(result.props.homeAddress.isValid).toBe(true);
        });

        it('sets missing nested object properties to valid', () => {
            const value = {
                workAddress: {}
            };

            const result = validate(value);

            expect(result.props.workAddress.props.street.isValid).toBe(true);
        });

        it('does not create props for missing nested object properties', () => {
            const value = {};
            const result = validate(value);

            expect(result.props).not.toHaveProperty('workAddress.props.street.results');
        });
    });

    describe('passes props to the validators', () => {
        const validatorProps = {validatorProp: 'Validator'};

        const validate = props({
            first: required({message: 'First'}),
            last: required({message: 'Last'})
        }, validatorProps);

        const value = {
            first: 'A',
            last: 'B'
        };

        const result = validate(value, {validateProp: 'Validate'});

        it('from the validator definition', () => {
            expect(result).toMatchObject({
                validatorProp: 'Validator',
                props: {
                    first: {validatorProp: 'Validator', message: 'First'},
                    last: {validatorProp: 'Validator', message: 'Last'}
                }
            });
        });

        it('from the validate function', () => {
            expect(result).toMatchObject({
                validateProp: 'Validate',
                props: {
                    first: {validateProp: 'Validate', message: 'First'},
                    last: {validateProp: 'Validate', message: 'Last'}
                }
            });
        });
    });

    describe('given async validators', () => {
        it('returns a Promise if a validator returns a Promise', () => {
            const validate = props({
                first: () => Promise.resolve(true)
            });

            const result = validate({first: 'LOG'});
            expect(result).toBeInstanceOf(Promise);
        });

        describe('resolves results', () => {
            it('that resolve as true', () => {
                const validate = props({
                    first: () => Promise.resolve(true)
                });

                const result = validate({first: 'LOG', test: 'that resolve as true'});
                return expect(result).resolves.toMatchObject({isValid: true});
            });

            it('that resolve as a valid result object', () => {
                const validate = props({
                    first: () => Promise.resolve({isValid: true})
                });

                const result = validate({first: 'LOG'});
                return expect(result).resolves.toMatchObject({isValid: true});
            });

            it('that resolve as false', () => {
                const validate = props({
                    first: () => Promise.resolve(false)
                });

                const result = validate({first: 'LOG'});
                return expect(result).resolves.toMatchObject({isValid: false});
            });

            it('that resolve as an invalid result object', () => {
                const validate = props({
                    first: () => Promise.resolve({isValid: false})
                });

                const result = validate({first: 'LOG'});
                return expect(result).resolves.toMatchObject({isValid: false});
            });

            it('recursively', () => {
                const validate = props({
                    first: () => Promise.resolve(
                        Promise.resolve(
                            Promise.resolve({
                                isValid: true,
                                recursively: 'Yes!'
                            })
                        )
                    ),
                    second: props({
                        third: () => Promise.resolve(
                            Promise.resolve(true)
                        ),
                        fourth: props({
                            fifth: () => Promise.resolve(
                                Promise.resolve({
                                    isValid: true,
                                    inNestedPropsValidators: 'Yep'
                                })
                            )
                        })
                    }),
                    sixth: () => ({
                        isValid: true,
                        syncProps: true
                    })
                });

                const value = {
                    first: null,
                    second: {
                        third: null,
                        fourth: {
                            fifth: null
                        }
                    }
                };

                const result = validate(value);
                return expect(result).resolves.toMatchObject({
                    isValid: true,
                    props: {
                        first: {
                            isValid: true,
                            recursively: 'Yes!'
                        },
                        second: {
                            isValid: true,
                            props: {
                                third: {isValid: true},
                                fourth: {
                                    isValid: true,
                                    props: {
                                        fifth: {
                                            isValid: true,
                                            inNestedPropsValidators: 'Yep'
                                        }
                                    }
                                }
                            }
                        },
                        sixth: {
                            isValid: true,
                            syncProps: true
                        }
                    }
                });
            });
        });

        it('puts validate props on the resolved result', () => {
            const validate = props({
                first: () => Promise.resolve(true)
            });

            const value = {
                first: 'First'
            };

            const result = validate(value, {message: 'Message'});
            return expect(result).resolves.toMatchObject({message: 'Message'});
        });
    });
});