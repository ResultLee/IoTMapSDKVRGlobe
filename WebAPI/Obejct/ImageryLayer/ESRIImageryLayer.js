import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import GeographicProjection from '../../../Source/Core/GeographicProjection.js';
import GeographicTilingScheme from '../../../Source/Core/GeographicTilingScheme.js';
import Rectangle from '../../../Source/Core/Rectangle.js';
import RuntimeError from '../../../Source/Core/RuntimeError.js';
import TileProviderError from '../../../Source/Core/TileProviderError.js';
import WebMercatorProjection from '../../../Source/Core/WebMercatorProjection.js';
import WebMercatorTilingScheme from '../../../Source/Core/WebMercatorTilingScheme.js';
import ImageryProvider from './ImageryProvider.js';

/**
 * 用于场景加载ESRI瓦片的图层对象，统一在{@link ImageryLayer}对象中创建，不支持单独创建
 * @protected
 * @extends ImageryProvider
 */
class ESRIImageryLayer extends ImageryProvider {
    /**
     * 创建ESRI影像图层
     * @param {String} url 影像图层URL地址
     * @param {Object} options 图层参数
     */
    constructor(url, options) {
        super(url, options);

        this._resource.appendForwardSlash();
        if (defined(options.token)) {
            this._resource.setQueryParameters({
                token: options.token
            });
        }

        this._tileWidth = defaultValue(options.tileWidth, 256);
        this._tileHeight = defaultValue(options.tileHeight, 256);
        this._maximumLevel = options.maximumLevel;
        this._tilingScheme = defaultValue(
            options.tilingScheme,
            new GeographicTilingScheme({ ellipsoid: options.ellipsoid })
        );

        this._useTiles = defaultValue(options.useTiles, true);

        this._rectangle = defaultValue(
            options.rectangle,
            this._tilingScheme.rectangle
        );

        const that = this;
        let metadataError;

        function metadataSuccess(data) {
            const tileInfo = data.tileInfo;
            if (!defined(tileInfo)) {
                that._useTiles = false;
            } else {
                that._tileWidth = tileInfo.rows;
                that._tileHeight = tileInfo.cols;

                if (
                    tileInfo.spatialReference.wkid === 102100 ||
                    tileInfo.spatialReference.wkid === 102113
                ) {
                    that._tilingScheme = new WebMercatorTilingScheme({
                        ellipsoid: options.ellipsoid
                    });
                } else if (data.tileInfo.spatialReference.wkid === 4326) {
                    that._tilingScheme = new GeographicTilingScheme({
                        ellipsoid: options.ellipsoid
                    });
                } else {
                    const message = `Tile spatial reference WKID ${data.tileInfo.spatialReference.wkid} is not supported.`;
                    metadataError = TileProviderError.reportSuccess(
                        metadataError,
                        that,
                        that._errorEvent,
                        message,
                        undefined,
                        undefined,
                        undefined,
                        requestMetadata
                    );
                    if (!metadataError.retry) {
                        that._readyPromise.reject(new RuntimeError(message));
                    }
                    return;
                }
                that._maximumLevel = data.tileInfo.lods.length - 1;

                if (defined(data.fullExtent)) {
                    if (
                        defined(data.fullExtent.spatialReference) &&
                        defined(data.fullExtent.spatialReference.wkid)
                    ) {
                        if (
                            data.fullExtent.spatialReference.wkid === 102100 ||
                            data.fullExtent.spatialReference.wkid === 102113
                        ) {
                            const projection = new WebMercatorProjection();
                            const extent = data.fullExtent;
                            const sw = projection.unproject(
                                new Cartesian3(
                                    Math.max(
                                        extent.xmin,
                                        -that._tilingScheme.ellipsoid.maximumRadius * Math.PI
                                    ),
                                    Math.max(
                                        extent.ymin,
                                        -that._tilingScheme.ellipsoid.maximumRadius * Math.PI
                                    ),
                                    0.0
                                )
                            );
                            const ne = projection.unproject(
                                new Cartesian3(
                                    Math.min(
                                        extent.xmax,
                                        that._tilingScheme.ellipsoid.maximumRadius * Math.PI
                                    ),
                                    Math.min(
                                        extent.ymax,
                                        that._tilingScheme.ellipsoid.maximumRadius * Math.PI
                                    ),
                                    0.0
                                )
                            );
                            that._rectangle = new Rectangle(
                                sw.longitude,
                                sw.latitude,
                                ne.longitude,
                                ne.latitude
                            );
                        } else if (data.fullExtent.spatialReference.wkid === 4326) {
                            that._rectangle = Rectangle.fromDegrees(
                                data.fullExtent.xmin,
                                data.fullExtent.ymin,
                                data.fullExtent.xmax,
                                data.fullExtent.ymax
                            );
                        } else {
                            const extentMessage = `fullExtent.spatialReference WKID ${data.fullExtent.spatialReference.wkid} is not supported.`;
                            metadataError = TileProviderError.reportSuccess(
                                metadataError,
                                that,
                                that._errorEvent,
                                extentMessage,
                                undefined,
                                undefined,
                                undefined,
                                requestMetadata
                            );
                            if (!metadataError.retry) {
                                that._readyPromise.reject(new RuntimeError(extentMessage));
                            }
                            return;
                        }
                    }
                } else {
                    that._rectangle = that._tilingScheme.rectangle;
                }

                that._useTiles = true;
            }

            that._ready = true;
            that._readyPromise.resolve(true);
            TileProviderError.handleSuccess(metadataError);
        }

        function metadataFailure(e) {
            const message = `An error occurred while accessing ${that._resource.url}.`;
            metadataError = TileProviderError.reportSuccess(
                metadataError,
                that,
                that._errorEvent,
                message,
                undefined,
                undefined,
                undefined,
                requestMetadata
            );
            that._readyPromise.reject(new RuntimeError(message));
        }

        function requestMetadata() {
            const resource = that._resource.getDerivedResource({
                queryParameters: {
                    f: 'json'
                }
            });
            resource
                .fetchJsonp()
                .then(function (result) {
                    metadataSuccess(result);
                })
                .catch(function (e) {
                    metadataFailure(e);
                });
        }

        if (this._useTiles) {
            requestMetadata();
        } else {
            this._ready = true;
            this._readyPromise.resolve(true);
        }
    }

    requestImage(x, y, level, request) {
        let resource;
        if (this._useTiles) {
            resource = this._resource.getDerivedResource({
                url: `tile/${level}/${y}/${x}`,
                request: request
            });
        } else {
            const nativeRectangle = this._tilingScheme.tileXYToNativeRectangle(
                x,
                y,
                level
            );
            const bbox = `${nativeRectangle.west},${nativeRectangle.south},${nativeRectangle.east},${nativeRectangle.north}`;

            const query = {
                bbox: bbox,
                size: `${this._tileWidth},${this._tileHeight}`,
                format: 'png32',
                transparent: true,
                f: 'image'
            };

            if (
                this._tilingScheme.projection instanceof GeographicProjection
            ) {
                query.bboxSR = 4326;
                query.imageSR = 4326;
            } else {
                query.bboxSR = 3857;
                query.imageSR = 3857;
            }
            if (this.layers) {
                query.layers = `show:${this.layers}`;
            }

            resource = this._resource.getDerivedResource({
                url: 'export',
                request: request,
                queryParameters: query
            });
        }

        return resource.fetchImage({
            preferImageBitmap: true,
            flipY: true
        });
    }
}

export default ESRIImageryLayer;
