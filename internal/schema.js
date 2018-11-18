var VALIDATORS = require('./validator').VALIDATORS;

function Schema() {
    this._validatorFactories = [];
    this._type = 'any';
    this._required = false;
    this._children = null;
    this._optional = false;
    this._length = undefined;
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
    this._length = min;
    this._validatorFactories.push(VALIDATORS.Min);
    return this;
};

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
exports.ObjectSchema = ObjectSchema;