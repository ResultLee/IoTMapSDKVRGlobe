import combine from '../../../../Source/Core/combine.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';
import defined from '../../../../Source/Core/defined.js';
import DeveloperError from '../../../../Source/Core/DeveloperError.js';
import TimeDynamicImagery from '../../../../Source/Scene/TimeDynamicImagery.js';
import UrlTileImageryLayer from './UrlTileImageryLayer.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
import WebMercatorTilingScheme from '../../../../Source/Core/WebMercatorTilingScheme.js';

function loadImage(imageryProvider, col, row, level, request, interval) {
    const labels = imageryProvider._tileMatrixLabels;
    const tileMatrix = defined(labels) ? labels[level] : level.toString();
    const subdomains = imageryProvider._subdomains;
    const staticDimensions = imageryProvider._dimensions;
    const dynamicIntervalData = defined(interval) ? interval.data : undefined;

    let resource;
    let templateValues;
    if (!imageryProvider._useKvp) {
        templateValues = {
            TileMatrix: tileMatrix,
            TileRow: row.toString(),
            TileCol: col.toString(),
            s: subdomains[(col + row + level) % subdomains.length]
        };

        resource = imageryProvider._resource.getDerivedResource({
            request: request
        });
        resource.setTemplateValues(templateValues);

        if (defined(staticDimensions)) {
            resource.setTemplateValues(staticDimensions);
        }

        if (defined(dynamicIntervalData)) {
            resource.setTemplateValues(dynamicIntervalData);
        }
    } else {
        let query = {};
        query.tilematrix = tileMatrix;
        query.layer = imageryProvider._layer;
        query.style = imageryProvider._style;
        query.tilerow = row;
        query.tilecol = col;
        query.tilematrixset = imageryProvider._tileMatrixSetID;
        query.format = imageryProvider._format;

        if (defined(staticDimensions)) {
            query = combine(query, staticDimensions);
        }

        if (defined(dynamicIntervalData)) {
            query = combine(query, dynamicIntervalData);
        }

        templateValues = {
            s: subdomains[(col + row + level) % subdomains.length]
        };

        resource = imageryProvider._resource.getDerivedResource({
            queryParameters: query,
            request: request
        });
        resource.setTemplateValues(templateValues);
    }

    return resource.fetchImage({
        preferImageBitmap: true,
        flipY: true
    });
}

/**
 * 用于场景加载WMTS瓦片的图层对象，统一在{@link ImageryLayer}对象中创建，不支持单独创建
 * @protected
 * @extends ImageryProvider
 */
class WMTSImageryLayer extends UrlTileImageryLayer {
    /**
     * 创建WMTS影像图层
     * @param {String} url 影像图层URL地址
     * @param {Object} options 图层参数
     * @param {String} options.layer WMTS服务的图层名称
     * @param {String} options.style WMTS服务的图层样式名称
     * @param {String} options.format WMTS服务的图像的MIME类型
     * @param {String} options.tileMatrixSetID WMTS服务的TileMatrixSet标识符
     */
    constructor(url, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        super(url, options);

        const defaultParameters = Object.freeze({
            service: 'WMTS',
            version: '1.0.0',
            request: 'GetTile'
        });

        const resource = this._resource;
        url = resource.url;
        const style = options.style;
        const tileMatrixSetID = options.tileMatrixSetID;

        const bracketMatch = url.match(/{/g);
        if (
            !defined(bracketMatch) ||
            (bracketMatch.length === 1 && /{s}/.test(url))
        ) {
            resource.setQueryParameters(defaultParameters);
            this._useKvp = true;
        } else {
            const templateValues = {
                style: style,
                Style: style,
                TileMatrixSet: tileMatrixSetID
            };

            resource.setTemplateValues(templateValues);
            this._useKvp = false;
        }

        this._style = style;
        this._tileMatrixSetID = tileMatrixSetID;
        this._tileMatrixLabels = options.tileMatrixLabels;
        this._format = defaultValue(options.format, 'image/jpeg');

        this._tilingScheme = defined(options.tilingScheme)
            ? options.tilingScheme
            : new WebMercatorTilingScheme({ ellipsoid: options.ellipsoid });

        this._tileWidth = defaultValue(options.tileWidth, 256);
        this._tileHeight = defaultValue(options.tileHeight, 256);

        this._maximumLevel = defaultValue(options.maximumLevel, 17);
        this._minimumLevel = defaultValue(options.minimumLevel, 0);

        const that = this;
        this._reload = undefined;
        if (defined(options.times)) {
            this._timeDynamicImagery = new TimeDynamicImagery({
                clock: options.clock,
                times: options.times,
                requestImageFunction: function (x, y, level, request, interval) {
                    return loadImage(that, x, y, level, request, interval);
                },
                reloadFunction: function () {
                    if (defined(that._reload)) {
                        that._reload();
                    }
                }
            });
        }

        const swTile = this._tilingScheme.positionToTileXY(
            Rectangle.southwest(this._rectangle),
            this._minimumLevel
        );
        const neTile = this._tilingScheme.positionToTileXY(
            Rectangle.northeast(this._rectangle),
            this._minimumLevel
        );
        const tileCount =
            (Math.abs(neTile.x - swTile.x) + 1) * (Math.abs(neTile.y - swTile.y) + 1);
        if (tileCount > 4) {
            throw new DeveloperError('影像图层不支持在最低级别具有四个以上瓦片!');
        }
    }

    requestImage(x, y, level, request) {
        let result;
        const timeDynamicImagery = this._timeDynamicImagery;
        let currentInterval;

        if (defined(timeDynamicImagery)) {
            currentInterval = timeDynamicImagery.currentInterval;
            result = timeDynamicImagery.getFromCache(x, y, level, request);
        }

        if (!defined(result)) {
            result = loadImage(this, x, y, level, request, currentInterval);
        }

        if (defined(result) && defined(timeDynamicImagery)) {
            timeDynamicImagery.checkApproachingInterval(x, y, level, request);
        }

        return result;
    }
}

export default WMTSImageryLayer;
