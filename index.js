var Schema = require('./internal/schema').Schema;
var ObjectSchema = require('./internal/schema').ObjectSchema;
var StringSchema = require('./internal/schema').StringSchema;
var ArraySchema = require('./internal/schema').ArraySchema;

var Validator = require('./internal/validator').Validator;
var TypeValidator = require('./internal/validator').TypeValidator;
var VALIDATORS = require('./internal/validator').VALIDATORS;
var getType = require('./internal/validator').getType;

var CONSTS = require('./internal/const');

/**
 * validate method
 * @param {*} target
 * @param {Schema} schema
 * @returns {Array|null} error stack
 */
function _validate(target, schema) {
    schema.valid = false;
    var ERR_STACK = [];
    if (schema._required) {
        if (target === undefined) {
            var err = {};
            if (schema.key) {
                err[schema.key] = 'is required';
            } else {
                err = 'this field is required';
            }
            ERR_STACK.push(err);
            return ERR_STACK;
        }
    }


    schema._validatorFactories = schema._validatorFactories.sort(function (pre, next) {
        if (pre.name === 'Allow') {
            if (next.name === 'Allow') return 0;
            return -1;
        }
        return 1;
    });

    schema._validatorFactories.forEach(function (_validatorFactory) {
        if (schema.valid) return;

        var _validator = _validatorFactory(schema);
        var test_result = _validator.validate(target);

        // test failed
        if (!test_result) {
            if (_validator.error) {
                ERR_STACK.push(_validator.error);
            }
        } else if (_validatorFactory.name === 'Allow' && schema.mode === CONSTS.MODE.ALLOW) {
            schema.valid = true;
        }

    });

    if (schema._value !== undefined) {
        if (schema._value !== target) {
            var err = {};
            if (schema.key) {
                err[schema.key] = 'is not equal to ' + schema._value;
            } else {
                err = 'this field is not equal to ' + schema._value;
            }
            ERR_STACK.push(err);
            return ERR_STACK;
        }
    }

    // child schema validate(object)
    var children = schema._children;
    if (children && target) {
        Object.keys(children).forEach(function (key) {
            var children_target = target[key];
            var children_schema = children[key];
            children_schema.is_child = true;
            children_schema.parent_key = schema.key;
            if (schema.key) {
                children_schema.key = [schema.key, key].join('.');
            } else {
                children_schema.key = key;
            }

            var children_ERR_STACK = Obeyman.validate(children_target, children_schema);
            if (children_ERR_STACK) {
                ERR_STACK = ERR_STACK.concat(children_ERR_STACK);
            }
        });
    }

    // items schema validate(array)
    var itemsSchema = schema._items;
    if (itemsSchema && target && schema._type === 'array') {

        var required_count = itemsSchema.filter(function (item_schema) {
            return item_schema._required;
        }).length;
        
        // validate required items count
        if (required_count > target.length) {
            var err = {},
                err_msg = 'required items can not less than ' + required_count;
            if (schema.key) {
                err[schema.key] = err_msg
            } else {
                err = err_msg;
            }
            ERR_STACK.push(err);
        }
        else {
            // default validate strategy: every item must matches one of listed conditions
            var err_index = [];

            var result = target.map(function (target_item, target_index) {
                var itemPassed = itemsSchema.some(function (item_schema) {
                    return !Obeyman.validate(target_item, item_schema);
                });
                if (itemPassed) {
                    return itemPassed;
                } else {
                    err_index.push(target_index);
                }
            });


            if (!result.every(function (res) {
                    return res
                })) {
                var err = {},
                    err_msg =
                    'items can`t satisfy all the conditions. They are: ' +
                    err_index.map(function (_index) {
                        return (schema.key || 'this') + '[' + _index + ']';
                    })
                    .join(', ');

                if (schema.key) {
                    err[schema.key] = err_msg
                } else {
                    err = err_msg;
                }
                ERR_STACK.push(err);
            }
        }

    }

    if (ERR_STACK.length) {
        return ERR_STACK;
    }
    return null;
}

var Obeyman = {
    internal: {
        TYPE: CONSTS.TYPE,
        VALIDATORS: VALIDATORS,
        Validator: Validator,
        TypeValidator: TypeValidator,
        Schema: Schema,
    },
    /**
     * Validate Method
     * @param {*} target 
     * @param {Obeyman.internal.Schema} schema 
     * @param {Function} [callback] err, msg
     * @returns {Array|null} error stack
     */
    validate: function validateWapper(target, schema, callback) {
        var err_stack = _validate(target, schema);

        if (getType(callback) === 'function') {
            var err = null;
            if (err_stack) {
                var err_msg = 'Schema validate failed, ';
                if (getType(err_stack[0]) === 'object') {
                    err_stack.forEach(function (_err) {
                        for (var key in _err) {
                            err_msg += '\n    at field `' + key + '`, ' + _err[key] + ';';
                        }
                    })
                } else {
                    err_msg = err_stack[0];
                }
                err_msg += '\n';
                err = new Error(err_msg);
            }
            callback.call(null, err, err_stack);
        }
        return err_stack;
    },
    any: function () {
        var _schema = new Schema();
        _schema._type = 'any';
        return _schema;
    },
    string: function (value) {
        var _schema = new StringSchema();
        _schema._validatorFactories.push(VALIDATORS.String);
        _schema._type = 'string';
        _schema._value = value;
        if (value !== undefined) {
            _schema._required = true;
            _schema._optional = false;
        }
        return _schema;
    },
    boolean: function (value) {
        var _schema = new Schema();
        _schema._validatorFactories.push(VALIDATORS.Boolean);
        _schema._type = 'boolean';
        _schema._value = value;
        if (value !== undefined) {
            _schema._required = true;
            _schema._optional = false;
        }
        return _schema;
    },
    number: function (value) {
        var _schema = new Schema();
        _schema._validatorFactories.push(VALIDATORS.Number);
        _schema._type = 'number';
        _schema._value = value;
        if (value !== undefined) {
            _schema._required = true;
            _schema._optional = false;
        }
        return _schema;
    },
    array: function () {
        var _schema = new ArraySchema();
        _schema._validatorFactories.push(VALIDATORS.Array);
        _schema._type = 'array';
        return _schema;
    },
    object: function () {
        var _schema = new ObjectSchema();
        _schema._validatorFactories.push(VALIDATORS.Object);
        _schema._type = 'object';
        return _schema;
    }
};

module.exports = Obeyman;