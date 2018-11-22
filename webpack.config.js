const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    mode: 'production',
    entry: {
        obeyman: './index.js'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].min.js',
        libraryTarget: 'umd',
        library: 'Obeyman',
        globalObject: 'typeof self !== \'undefined\' ? self : this',
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['es2015']
                }
            }]
        }]
    },
    plugins: [
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false
                }
            },
            parallel: true
        })
    ]
}