var VALIDATORS = {
    Number: function (schema) {
        return new TypeValidator('number', schema._optional, schema.key);
    },
    String: function (schema) {
        return new TypeValidator('string', schema._optional, schema.key);
    },
    Boolean: function (schema) {
        return new TypeValidator('boolean', schema._optional, schema.key);
    },
    Object: function (schema) {
        return new TypeValidator('object', schema._optional, schema.key);
    },
    Array: function (schema) {
        return new TypeValidator('array', schema._optional, schema.key);
    },
    Length: function (schema) {
        return new LengthValidator(schema._optional, schema.key, schema._length);
    },
    Min: function (schema) {
        return new MinValidator(schema._optional, schema.key, schema._min);
    },
    Max: function (schema) {
        return new MaxValidator(schema._optional, schema.key, schema._max);
    },
    Allow: function (schema) {
        return new AllowValidator(schema._allows);
    }
};

function getType(value) {
    return Object.prototype.toString.call(value).replace(/\[object (\w+)\]/, '$1').toLowerCase();
}

/**
 * Validator Basic Class
 * @param {Boolean} optional Wheather this field is optional
 * @param {String} field field path
 * 
 * @member {String} name name of validator
 * @member {Boolean} optional Wheather this field is optional
 * @member {String} field field path
 * @member {String|Object} error when field exist, `error` is an object which key is error field
 * @member {Function} validate every validator must implement this method, return boolean
 */
function Validator(optional, field) {
    this.name = 'validator';
    this.field = field || '';
    this.optional = optional || false;
    this.error = '';
}
Validator.prototype.validate = function (value) {
    return true;
};

function TypeValidator(type, optional, field) {
    Validator.call(this, optional, field);

    this.name = type + ' validator';
    this.validate = function (value) {
        if (optional) {
            if (getType(value) === 'undefined') return true;
        }
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

    var msg = 'length should be ' + length;
    var err = {};
    if (field) err[field] = msg;
    else err = msg;
    this.error = err;

    this.validate = function (value) {
        if (optional) {
            if (getType(value) === 'undefined') return true;
        }
        switch (getType(value)) {
            case 'string':
            case 'array':
                return value.length === length;
            default:
                return true;
        }
    }
}
LengthValidator.prototype = new Validator();

function MinValidator(optional, field, min) {
    Validator.call(this, optional, field);

    this.name = 'min validator';
    this.min = min;

    var msg = 'should be more than ' + min;
    var err = {};
    if (field) err[field] = msg;
    else err = msg;
    this.error = err;

    this.validate = function (value) {
        if (optional) {
            if (getType(value) === 'undefined') return true;
        }
        switch (getType(value)) {
            case 'string':
            case 'array':
                msg = 'length ' + msg
                return value.length >= min;
            case 'number':
                return value >= min;

            default:
                break;
        }
    }
}
MinValidator.prototype = new Validator();


function MaxValidator(optional, field, max) {
    Validator.call(this, optional, field);

    this.name = 'max validator';
    this.max = max;

    var msg = 'length should be less than ' + max;
    var err = {};
    if (field) err[field] = msg;
    else err = msg;
    this.error = err;

    this.validate = function (value) {
        if (optional) {
            if (getType(value) === 'undefined') return true;
        }
        switch (getType(value)) {
            case 'string':
            case 'array':
                return value.length <= max;
            case 'number':
                return value <= max;

            default:
                break;
        }
    }
}
MaxValidator.prototype = new Validator();

function AllowValidator(whitelist) {

    Validator.call(this);
    this.name = 'allow validator';

    this.validate = function (value) {
        if (getType(whitelist) !== 'array') {
            whitelist = [];
        }
        return whitelist.some(item => item === value);
    }
}
AllowValidator.prototype = new Validator();

exports.VALIDATORS = VALIDATORS;
exports.getType = getType;
exports.Validator = Validator;
exports.TypeValidator = TypeValidator;
exports.LengthValidator = LengthValidator;
exports.MinValidator = MinValidator;
exports.MaxValidator = MaxValidator;
exports.AllowValidator = AllowValidator;