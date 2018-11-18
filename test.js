var Obeyman = require('.');

// var schema = Obeyman.object().keys({
//     num: Obeyman.number().min(100).max(120).required().allow(1,2,3),
//     str: Obeyman.string().len(5),
//     obj: Obeyman.object().keys({
//         tar: Obeyman.number().required(),
//         obj: Obeyman.object().keys({
//             11: Obeyman.number().optional()
//         })
//     }),
//     arr: Obeyman.array().len(3).optional()
// });

// console.log(Obeyman.validate({
//     num: 120,
//     str: '1234a',
//     obj: {
//         tar: 1232,
//         obj: {}
//     },
//     arr: [1, 2, 3]
// }, schema))

console.log(Obeyman.validate(12, Obeyman.number().min(100).max(120).required().allow(1,2,123), (err, msg) => {
    console.log(err, msg)
}))