/*
 * @Author: SnotlingLiu<snotlingliu@gmail.com/>
 * @Date: 2022-10-31 14:29:36
 * @LastEditors: SnotlingLiu<snotlingliu@gmail.com/>
 * @LastEditTime: 2022-12-21 16:57:55
 * @Description: 
 */
// The path to the CesiumJS source code
const cesiumSource = './Source';
const cesiumWorkers = './Workers';
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: {
        main: path.resolve(__dirname, './Example/main.js'),
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        sourcePrefix: '',
        chunkFilename: "[name].chunk.js"
    },
    amd: {
        // Enable webpack-friendly use of require in Cesium
        toUrlUndefined: true
    },
    resolve: {
        alias: {
            cesium: path.resolve(__dirname, cesiumSource),
            '@@tweenjs/tween.js': path.resolve(__dirname, 'node_modules/@tweenjs/tween.js/dist')
        },
        fallback: {
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "stream": require.resolve("https-browserify"),
            "zlib": require.resolve("@zip.js/zip.js"),
            "buffer": require.resolve("buffer/"),
            "assert": require.resolve("assert/")
        }
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
            use: ['url-loader']
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: "index.html",
            favicon: path.resolve(__dirname, 'favicon.ico')
        }),
        new HtmlWebpackPlugin({
            template: './Example/template.html',
            filename: "Example/template.html",
            chunks: ['main'],
        }),
        // new HtmlWebpackPlugin({
        //     template: './Example/DataLoad/loadTileset.html',
        //     filename: "Example/loadTileset.html",
        //     chunks: ['main'],
        // }),
        // new HtmlWebpackPlugin({
        //     template: './Example/CustomShader/adjustmentColor.html',
        //     filename: "Example/adjustmentColor.html",
        //     chunks: ['main'],
        // }),
        // new HtmlWebpackPlugin({
        //     template: './Example/CustomShader/modelFlattening.html',
        //     filename: "Example/modelFlattening.html",
        //     chunks: ['main'],
        // }),
        // new HtmlWebpackPlugin({
        //     template: './Example/DataLoad/loadTilesetWithAttribute.html',
        //     filename: "Example/loadTilesetWithAttribute.html",
        //     chunks: ['main'],
        // }),
        // new HtmlWebpackPlugin({
        //     template: './Example/DataLoad/loadS3mbData.html',
        //     filename: "Example/loadS3mbData.html",
        //     chunks: ['main'],
        // }),
        // new HtmlWebpackPlugin({
        //     template: './Example/DataLoad/loadArcGisImageTileMap.html',
        //     filename: "Example/loadArcGisImageTileMap.html",
        //     chunks: ['main'],
        // }),
        // new HtmlWebpackPlugin({
        //     template: './Example/TaskProcessor/transcodeCRNToDXT.html',
        //     filename: "Example/transcodeCRNToDXT.html",
        //     chunks: ['main'],
        // }),
        // new HtmlWebpackPlugin({
        //     template: './Example/Render/deferredRender.html',
        //     filename: "Example/deferredRender.html",
        //     chunks: ['main'],
        // }),
        // new HtmlWebpackPlugin({
        //     template: './Example/CustomShader/addTextureOnTileset.html',
        //     filename: "Example/addTextureOnTileset.html",
        //     chunks: ['main'],
        // }),
        // new HtmlWebpackPlugin({
        //     template: './Example/WebAPI/ProjectManager.html',
        //     filename: "Example/ProjectManager.html",
        //     chunks: ['main'],
        // }),
        // new HtmlWebpackPlugin({
        //     template: './Example/DataLoad/loadTopoJsonTile.html',
        //     filename: "Example/loadTopoJsonTile.html",
        //     chunks: ['main'],
        // }),
        // new HtmlWebpackPlugin({
        //     template: './Example/DataLoad/loadGeojson.html',
        //     filename: "Example/loadGeojson.html",
        //     chunks: ['main'],
        // }),
        // new HtmlWebpackPlugin({
        //     template: './Example/DataLoad/loadHexagonLayer.html',
        //     filename: "Example/loadHexagonLayer.html",
        //     chunks: ['main'],
        // }),
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        new CopyWebpackPlugin({
            patterns: [
                { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
                { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
                { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
                { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
                { from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' },
                // { from: path.join('./Example', 'TaskProcessor'), to: 'TaskProcessor' }
            ]
        }),
        new webpack.DefinePlugin({
            // Define relative base path in cesium for loading assets
            CESIUM_BASE_URL: JSON.stringify('../'),
            require: 'require',
        })
    ],
    mode: 'development',
    devtool: 'inline-source-map',
};