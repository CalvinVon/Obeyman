var VALIDATORS = require('./validator').VALIDATORS;
var getType = require('./validator').getType;
var MODE = require('./const').MODE;

/**
 * Class Schema
 * @member {String} mode validate mode.
 *      ` when mode is ALLOW, once matched value in the allowed whitelist,
 *        total validate will pass no matter other validator return false
 * @member {String} key field path
 * @member {String} parent_key parent field path
 * @member {Array<ValidatorFactory>} _validatorFactories array of validators factories
 * @member {String} _type type of schema
 * @member {String} _type_cast type cast of schema
 * @member {String} _required
 * @member {String} _optional
 * @member {String} _length
 * @member {String} _allows whitelist value
 * @member {String} _children children schema
 * @member {Boolean} is_child
 */
function Schema() {
    this.mode = MODE.NORMAL;
    this._validatorFactories = [];
    this._type = 'any';
    this._type_cast = undefined;
    this._required = false;
    this._optional = false;
    this._length = undefined;
    this._children = null;
    this._allows = [];
}

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

Schema.prototype.min = function (min) {
    this._min = min;
    this._validatorFactories.push(VALIDATORS.Min);
    return this;
};

Schema.prototype.max = function (max) {
    this._max = max;
    this._validatorFactories.push(VALIDATORS.Max);
    return this;
};

Schema.prototype.allow = function () {
    var args = Array.prototype.slice.call(arguments);
    this.mode = MODE.ALLOW;

    if (getType(args[0]) === 'array') {
        this._allows = this._allows.concat(args[0]);
    } else {
        this._allows = this._allows.concat(args);
    }

    this._validatorFactories.push(VALIDATORS.Allow);
    return this;
};




function StringSchema() {
    Schema.call(this);

    this._type = 'string';
}
StringSchema.prototype = new Schema();
StringSchema.prototype.alphaNumber = function () {
    this._type_cast = 'number';
    return this;
}




function ObjectSchema() {
    Schema.call(this);

    this._type = 'object';
}

ObjectSchema.prototype = new Schema();
ObjectSchema.prototype.keys = function (objectSchema) {
    this._children = objectSchema;
    return this;
};





exports.Schema = Schema;
exports.StringSchema = StringSchema;
exports.ObjectSchema = ObjectSchema;