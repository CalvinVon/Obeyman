var Schema = require('./internal/schema').Schema;
var ObjectSchema = require('./internal/schema').ObjectSchema;

var Validator = require('./internal/validator').Validator;
var TypeValidator = require('./internal/validator').TypeValidator;
var VALIDATORS = require('./internal/validator').VALIDATORS;

var TYPE = require('./internal/type');

var ERROR = {
    REQUIRED: 'this field is required',
    TYPE: 'type error'
};

var Atm = {
    internal: {
        TYPE: TYPE,
        ERROR: ERROR,
        VALIDATORS: VALIDATORS,
        Validator: Validator,
        TypeValidator: TypeValidator,
        Schema: Schema,
    },
    validate: function validate(target, schema) {
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

        schema._validatorFactories.forEach(_validatorFactory => {
            var _validator = _validatorFactory(schema._optional, schema.key, schema._length);
            var test_result = _validator.validate(target);
            if (!test_result) {
                ERR_STACK.push(_validator.error);
            }
        });

        var children = schema._children;
        if (children && target) {
            Object.keys(children).forEach(key => {
                var children_target = target[key];
                var children_schema = children[key];
                children_schema.is_child = true;
                children_schema.parent_key = schema.key;
                if (schema.key) {
                    children_schema.key = [schema.key, key].join('.');
                } else {
                    children_schema.key = key;
                }

                var children_ERR_STACK = Atm.validate(children_target, children_schema);
                if (children_ERR_STACK) {
                    ERR_STACK = ERR_STACK.concat(children_ERR_STACK);
                }
            });
        }

        if (ERR_STACK.length) {
            return ERR_STACK;
        }
        return null;
    },
    any: function () {
        var _schema = new Schema();
        _schema._type = 'any';
        return _schema;
    },
    string: function () {
        var _schema = new Schema();
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

module.exports = Atm;