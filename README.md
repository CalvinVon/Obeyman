# Obeyman

A simple object schema validate tool.
(Simplified version of [hapijs/joi](https://github.com/hapijs/joi))

[![version](https://img.shields.io/npm/v/obeyman.svg)](https://github.com/CalvinVon/Obeyman)
![dependencies](https://img.shields.io/david/CalvinVon/obeyman.svg)
[![](https://img.shields.io/npm/dt/obeyman.svg)](https://github.com/CalvinVon/Obeyman)
[![](https://img.shields.io/github/size/CalvinVon/Obeyman/dist/obeyman.min.js.svg?label=minified%20size)](https://github.com/CalvinVon/Obeyman/blob/master/dist/obeyman.min.js)



# Getting Started

### Install

via npm

```bash
npm i obeyman -S
```

# Usage

```js
// define schema
const schema = Obeyman.object().keys({
    userId: Obeyman.number().required(),
    pageNum: Obeyman.number().required(),
    pageSize: Obeyman.number().optional(),
    ts: Obeyman.string(),
});

const target = {
    userid: 123,
    pageNum: 2,
    ts: +new Date()
};

// validate
const errStack = Obeyman.validate(target, schema);
console.log(errStack);
// output: 
//  [
//      { userId: 'is required' },
//      { ts: 'this field should be string' }
//  ]

// or use callback
Obeyman.validate(data, schema, (error, stack) => {
    if (error) {
        console.warn(`Validate failed\n`, stack);
    }
});
```

# API Reference
> Other types(e.g. `array`,`number`,`string`) inherit from  type `any`
- `#any`
    - `any.allow`
    - `any.required`
    - `any.optional`
    - `any.len`
    - `any.min`
    - `any.max`
- `#array`
    - `array.items`
- `#boolean`
- `#number`
- `#object`
    - `object.keys`
- `#string`
    - `string.alphaNumber`

see [joi API Reference doc(8.0.5)](https://github.com/hapijs/joi/blob/v8.0.5/API.md)