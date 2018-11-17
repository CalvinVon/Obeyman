var TYPE = {
    number: 0,
    boolean: 1,
    string: 2,
    object: 3,
    array: 4,
    function: 5,
    regexp: 6,
    null: 7,
    undefined: 8
};

var ERROR = {
    REQUIRED: 'this field is required',
    TYPE: 'type error'
};

var VALIDATORS = {
    Number: function (optional, field) {
        return new TypeValidator('number', optional, field);
    },
    String: function (optional, field) {
        return new TypeValidator('string', optional, field);
    },
    Length: function (optional, field, limit) {
        return new LengthValidator(optional, field, limit);
    },
    Boolean: function (optional, field) {
        return new TypeValidator('boolean', optional, field);
    },
    Object: function (optional, field) {
        return new TypeValidator('object', optional, field);
    },
    Array: function (optional, field) {
        return new TypeValidator('array', optional, field);
    },
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
        var _schema = new Schema();
        _schema._validatorFactories.push(VALIDATORS.Object);
        _schema._type = 'object';
        _schema._required = true;
        return _schema;
    }
};

function Schema() {
    this._validatorFactories = [];
    this._type = 'any';
    this._required = false;
    this._children = null;
    this._optional = false;
    this._length = undefined;
}

Schema.prototype.keys = function (objectSchema) {
    if (this._type === 'object') {
        this._children = objectSchema;
    }
    return this;
};

Schema.prototype.required = function () {
    this._required = true;
    return this;
};

Schema.prototype.optional = function () {
    this._required = false;
    this._optional = true;
    return this;
};

Schema.prototype.len = function (limit) {
    this._length = limit;
    this._validatorFactories.push(VALIDATORS.Length);
    return this;
};

function Validator(optional, field) {
    this.name = 'validator';
    this.field = field || '';
    this.optional = optional || false;
    this.error = '';
}
Validator.prototype.validate = function (value) {
    return true
};

function TypeValidator(type, optional, field) {
    Validator.call(this, optional, field);

    this.name = type + ' validator';
    this.validate = function (value) {
        if (optional) return true;
        return getType(value) === type;
    };
    var err = {};
    err[this.field] = 'should be ' + type;
    this.error = err;
}

TypeValidator.prototype = new Validator();

function LengthValidator(optional, field, length) {
    Validator.call(this, optional, field);

    this.name = 'length validator';
    this.length = length;

    this.validate = function (value) {
        switch (getType(value)) {
            case 'string':
            case 'array':
                var err = {};
                err[field] = 'length should be ' + length;
                this.error = err;
                return value.length === length;
            default: 
                return true;
        }
    }
}
LengthValidator.prototype = new Validator();

function getType(value) {
    return Object.prototype.toString.call(value).replace(/\[object (\w+)\]/, '$1').toLowerCase();
}

module.exports = Atm;