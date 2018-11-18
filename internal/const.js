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

var MODE = {
    NORMAL: 0,
    ALLOW: 1
}

module.exports = {
    TYPE,
    MODE
};