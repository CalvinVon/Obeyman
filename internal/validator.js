var VALIDATORS = {
    Number: function (optional, field) {
        return new TypeValidator('number', optional, field);
    },
    String: function (optional, field) {
        return new TypeValidator('string', optional, field);
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
    Length: function (optional, field, limit) {
        return new LengthValidator(optional, field, limit);
    },
    Min: function(optional, field, min) {
        return new MinValidator(optional, field, min);
    }
};
function getType(value) {
    return Object.prototype.toString.call(value).replace(/\[object (\w+)\]/, '$1').toLowerCase();
}

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

function MinValidator (optional, field, min) {
    Validator.call(this, optional, field);

    this.name = 'min validator';
    this.min = min;

    var msg = 'length should be more than ' + min;
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
                return value.length >= min;
            case 'number':
                return value >= min;
        
            default:
                break;
        }
    }
}
MinValidator.prototype = new Validator();

exports.VALIDATORS = VALIDATORS;
exports.Validator = Validator;
exports.TypeValidator = TypeValidator;
exports.LengthValidator = LengthValidator;
exports.MinValidator = MinValidator;