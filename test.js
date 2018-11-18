var Atm = require('./index');

var schema = Atm.object().keys({
    num: Atm.number().min(100).required(),
    str: Atm.string().len(4),
    obj: Atm.object().keys({
        tar: Atm.number().required(),
        obj: Atm.object().keys({
            11: Atm.number().optional()
        })
    }),
    arr: Atm.array().len(3).optional()
});

console.log(Atm.validate({
    num: 1231,
    str: '1234',
    obj: {
        tar: 1232,
        obj: {}
    },
    arr: [1, 2, 3]
}, schema))