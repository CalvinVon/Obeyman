var Schema = require('./internal/schema').Schema;
var ObjectSchema = require('./internal/schema').ObjectSchema;
var StringSchema = require('./internal/schema').StringSchema;

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
        if (!target) {
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
        if (!test_result) {
            if (_validator.error) {
                ERR_STACK.push(_validator.error);
            }
        } else if (schema.mode === CONSTS.MODE.ALLOW) {
            schema.valid = true;
        }

    });

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
            callback.call(null, !!err_stack, err_stack);
        }
        return err_stack;
    },
    any: function () {
        var _schema = new Schema();
        _schema._type = 'any';
        return _schema;
    },
    string: function () {
        var _schema = new StringSchema();
        _schema._validatorFactories.push(VALIDATORS.String);
        _schema._type = 'string';
        return _schema;
    },
    boolean: function () {
        var _schema = new Schema();
        _schema._validatorFactories.push(VALIDATORS.Boolean);
        _schema._type = 'boolean';
        return _schema;
    },
    number: function () {
        var _schema = new Schema();
        _schema._validatorFactories.push(VALIDATORS.Number);
        _schema._type = 'number';
        return _schema;
    },
    array: function () {
        var _schema = new Schema();
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