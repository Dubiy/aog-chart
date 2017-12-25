'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: __dirname + '/web-src',
    entry: {
        chart: ['./chart', './style.scss'],
    },
    output: {
        path: __dirname + '/app',
        filename: "[name].js",
        library: '[name]'
    },
    watch: NODE_ENV === 'development',
    watchOptions: {
        aggregateTimeout: 100
    },
    externals: {
        charts: 'google.charts'
    },

    devtool: NODE_ENV === 'development' ?  'inline-cheap-module-source-map' : 'none',

    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV),
            LANG:     JSON.stringify('EN')
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            minChunks: 2
        }),
        new ExtractTextPlugin({
            filename: '[name].css',
            allChunks: true,
        }),
    ],

    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            // {
            //     test: /\.scss$/,
            //     loader: ['css-loader', 'sass-loader']
            // },
            //
            { // sass / scss loader for webpack
                test: /\.(sass|scss)$/,
                loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
            }
        ]
    }
};

if (NODE_ENV === 'production') {
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            uglifyOptions: {
                ie8: false,
                ecma: 8,
            },
            compress: {
                warnings: false,
                drop_console: true,
                unsafe: true
            }
        })
    )
}