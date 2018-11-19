var Obeyman = require('.');

var schema = Obeyman.object().keys({
    num: Obeyman.number().min(100).max(120).required().allow(1,2,3),
    str: Obeyman.string().len(5),
    eq: Obeyman.string('123'),
    obj: Obeyman.object().keys({
        tar: Obeyman.number().required(),
        obj: Obeyman.object().keys({
            11: Obeyman.number().optional()
        })
    }),
    arr: Obeyman.array().len(3).optional(),
    items: Obeyman.array().items(Obeyman.string().len(3).required())
});

// console.log(Obeyman.validate({
//     num: 121,
//     str: '1234a123',
//     obj: {
//         tar: 1232,
//         obj: {}
//     },
//     arr: [1, 2, 3]
// }, schema))

Obeyman.validate({
    num: 1,
    eq: 123,
    str: '1234a123',
    obj: {
        // tar: 1232,
        obj: {}
    },
    arr: [1, 2, 3],
    items: ['312', 22, 123123]
}, schema, function(err, msg) {
    console.log(err);
})

// Obeyman.validate([123, '321'], Obeyman.array().items(Obeyman.string().len(3)), (err, msg) => {
//     console.log(err)
// })