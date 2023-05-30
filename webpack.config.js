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
        // Hello World
        new HtmlWebpackPlugin({
            template: './Example/Hello World.html',
            filename: "./Hello World.html",
            chunks: ['main'],
        }),
        // 资源树
        new HtmlWebpackPlugin({
            template: './Example/Project/Project.html',
            filename: "./Project/Project.html",
            chunks: ['main'],
        }),
        // 工程管理
        new HtmlWebpackPlugin({
            template: './Example/ResourceTree/ResourceTree.html',
            filename: "./ResourceTree/ResourceTree.html",
            chunks: ['main'],
        }),
        // 地形图层
        new HtmlWebpackPlugin({
            template: './Example/Layer/TerrainLayer/SeeLevelTerrain.html',
            filename: "./Layer/TerrainLayer/SeeLevelTerrain.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/TerrainLayer/QuantizedTerrain.html',
            filename: "./Layer/TerrainLayer/QuantizedTerrain.html",
            chunks: ['main'],
        }),
        // 模型图层
        new HtmlWebpackPlugin({
            template: './Example/Layer/TDTilesetLayer/PhotographyLayer.html',
            filename: "./Layer/TDTilesetLayer/PhotographyLayer.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/TDTilesetLayer/PointCloudLayer.html',
            filename: "./Layer/TDTilesetLayer/PointCloudLayer.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/TDTilesetLayer/ModelBlank.html',
            filename: "./Layer/TDTilesetLayer/ModelBlank.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/TDTilesetLayer/ModelBlankSetColor.html',
            filename: "./Layer/TDTilesetLayer/ModelBlankSetColor.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/TDTilesetLayer/ModelBlankSetColorByGraduatedValue.html',
            filename: "./Layer/TDTilesetLayer/ModelBlankSetColorByGraduatedValue.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/TDTilesetLayer/ModelBlankSetColorByHeight.html',
            filename: "./Layer/TDTilesetLayer/ModelBlankSetColorByHeight.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/TDTilesetLayer/ModelBlankSetColorByUniqueValue.html',
            filename: "./Layer/TDTilesetLayer/ModelBlankSetColorByUniqueValue.html",
            chunks: ['main'],
        }),
        // 影像图层
        new HtmlWebpackPlugin({
            template: './Example/Layer/ImageryLayer/AmapCVAImagery.html',
            filename: "./Layer/ImageryLayer/AmapCVAImagery.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/ImageryLayer/AmapIMGImagery.html',
            filename: "./Layer/ImageryLayer/AmapIMGImagery.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/ImageryLayer/AmapVECImagery.html',
            filename: "./Layer/ImageryLayer/AmapVECImagery.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/ImageryLayer/BDCVAImagery.html',
            filename: "./Layer/ImageryLayer/BDCVAImagery.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/ImageryLayer/BDIMGImagery.html',
            filename: "./Layer/ImageryLayer/BDIMGImagery.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/ImageryLayer/BDVECImagery.html',
            filename: "./Layer/ImageryLayer/BDVECImagery.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/ImageryLayer/EsriIMGImagery.html',
            filename: "./Layer/ImageryLayer/EsriIMGImagery.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/ImageryLayer/EsriVECImagery.html',
            filename: "./Layer/ImageryLayer/EsriVECImagery.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/ImageryLayer/TencentIMGImagery.html',
            filename: "./Layer/ImageryLayer/TencentIMGImagery.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/ImageryLayer/TencentVECImagery.html',
            filename: "./Layer/ImageryLayer/TencentVECImagery.html",
            chunks: ['main'],
        }),
        // 矢量图层
        new HtmlWebpackPlugin({
            template: './Example/Layer/GraphicsLayer/point.html',
            filename: "Layer/GraphicsLayer/point.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/GraphicsLayer/LineString.html',
            filename: "Layer/GraphicsLayer/LineString.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/GraphicsLayer/MultiLineString.html',
            filename: "Layer/GraphicsLayer/MultiLineString.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/GraphicsLayer/Polygon.html',
            filename: "Layer/GraphicsLayer/Polygon.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/GraphicsLayer/MultiPolygon.html',
            filename: "Layer/GraphicsLayer/MultiPolygon.html",
            chunks: ['main'],
        }),
        // 矢量瓦片
        new HtmlWebpackPlugin({
            template: './Example/Layer/FeatureLayer/FeatureLayer.html',
            filename: "./Layer/FeatureLayer/FeatureLayer.html",
            chunks: ['main'],
        }),
        // 粒子图层
        new HtmlWebpackPlugin({
            template: './Example/Layer/ParticleLayer/BurstParticle.html',
            filename: "./Layer/ParticleLayer/BurstParticle.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/ParticleLayer/FireParticle.html',
            filename: "./Layer/ParticleLayer/FireParticle.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/ParticleLayer/FountainParticle.html',
            filename: "./Layer/ParticleLayer/FountainParticle.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/ParticleLayer/SmokeParticle.html',
            filename: "./Layer/ParticleLayer/SmokeParticle.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './Example/Layer/ParticleLayer/SpoutParticle.html',
            filename: "./Layer/ParticleLayer/SpoutParticle.html",
            chunks: ['main'],
        }),
        // 图形绘制
        new HtmlWebpackPlugin({
            template: './Example/Draw/Draw.html',
            filename: "./Draw/Draw.html",
            chunks: ['main'],
        }),
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        new CopyWebpackPlugin({
            patterns: [
                { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
                { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
                { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
                { from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' },
                { from: path.join('./Example', 'Resource'), to: 'Resource' },
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