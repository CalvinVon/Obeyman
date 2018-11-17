var Atm = require('./index');

var schema = Atm.object().keys({
    a: Atm.number().len(5).required(),
    b: Atm.string().len(4).required(),
    asda: Atm.object().keys({
        tar: Atm.number().required(),
        obj: Atm.object().keys({
            11: Atm.number().optional()
        })
    }),
    arr: Atm.array().len(2).required()
});

console.log(Atm.validate({
    a: 123123,
    b: '12222',
    asda: {
        tar: 1232,
        obj: {}
    },
    arr: [1,2]
}, schema))