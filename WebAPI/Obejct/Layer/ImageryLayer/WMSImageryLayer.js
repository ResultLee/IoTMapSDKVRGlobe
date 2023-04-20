
import defaultValue from '../../../../Source/Core/defaultValue.js';
import defined from '../../../../Source/Core/defined.js';
import GeographicTilingScheme from '../../../../Source/Core/GeographicTilingScheme.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
import WebMercatorProjection from '../../../../Source/Core/WebMercatorProjection.js';
import TimeDynamicImagery from '../../../../Source/Scene/TimeDynamicImagery.js';
import ImageryProvider from './ImageryProvider.js';

const templateRegex = /{[^}]+}/g;
let projectedScratchComputed = false;
const projectedScratch = new Rectangle();

const Tags = {
    width: widthTag,
    height: heightTag,
    westProjected: westProjectedTag,
    southProjected: southProjectedTag,
    eastProjected: eastProjectedTag,
    northProjected: northProjectedTag
};

const includesReverseAxis = [
    3034, // ETRS89-extended / LCC Europe
    3035, // ETRS89-extended / LAEA Europe
    3042, // ETRS89 / UTM zone 30N (N-E)
    3043, // ETRS89 / UTM zone 31N (N-E)
    3044 // ETRS89 / UTM zone 32N (N-E)
];

const excludesReverseAxis = [
    4471, // Mayotte
    4559 // French Antilles
];

const defaultParameters = Object.freeze({
    service: 'WMS',
    version: '1.1.1',
    request: 'GetMap',
    styles: '',
    format: 'image/jpeg'
});

function objectToLowercase(obj) {
    const result = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key.toLowerCase()] = obj[key];
        }
    }
    return result;
}

function requestImage(imageryProvider, col, row, level, request, interval) {
    console.log(col, row, level);
    const dynamicIntervalData = defined(interval) ? interval.data : undefined;

    if (defined(dynamicIntervalData)) {
        // We set the query parameters within the tile provider, because it is managing the query.
        imageryProvider._resource.setQueryParameters(dynamicIntervalData);
    }
    // return this.requestImage(col, row, level, request);
    const resource = imageryProvider._resource;

    if (defined(dynamicIntervalData)) {
        // We set the query parameters within the tile provider, because it is managing the query.
        resource.setQueryParameters(dynamicIntervalData);
    }

    projectedScratchComputed = false;
    const templateValues = {};
    const url = resource.getUrlComponent(true);
    const match = url.match(templateRegex);
    if (defined(match)) {
        match.forEach(function (tag) {
            const key = tag.substring(1, tag.length - 1);
            if (defined(Tags[key])) {
                templateValues[key] = Tags[key](imageryProvider, col, row, level);
            }
        });
    }

    return resource.getDerivedResource({
        request: request,
        templateValues: templateValues
    }).fetchImage({
        preferImageBitmap: true,
        flipY: true
    });
}

function widthTag(imageryProvider, x, y, level) {
    return imageryProvider.tileWidth;
}

function heightTag(imageryProvider, x, y, level) {
    return imageryProvider.tileHeight;
}

function computeProjected(imageryProvider, x, y, level) {
    if (projectedScratchComputed) {
        return;
    }

    imageryProvider.tilingScheme.tileXYToNativeRectangle(
        x,
        y,
        level,
        projectedScratch
    );

    projectedScratchComputed = true;
}

function westProjectedTag(imageryProvider, x, y, level) {
    computeProjected(imageryProvider, x, y, level);
    return projectedScratch.west;
}

function southProjectedTag(imageryProvider, x, y, level) {
    computeProjected(imageryProvider, x, y, level);
    return projectedScratch.south;
}

function eastProjectedTag(imageryProvider, x, y, level) {
    computeProjected(imageryProvider, x, y, level);
    return projectedScratch.east;
}

function northProjectedTag(imageryProvider, x, y, level) {
    computeProjected(imageryProvider, x, y, level);
    return projectedScratch.north;
}

/**
 * 用于场景加载WMTS瓦片的图层对象，统一在{@link ImageryLayer}对象中创建，不支持单独创建
 * @protected
 * @extends ImageryProvider
 */
class WMSImageryLayer extends ImageryProvider {
    /**
     * 创建WMS影像图层
     * @param {String} url 影像图层URL地址
     * @param {Object} options 图层参数
     * @param {String} options.layers WMS图层的名称
     * @param {Ellipsoid} [options.ellipsoid = Ellipsoid.WGS84] 椭球体参数，默认为WGS84椭球体。
     * @param {String} options.parameters WMS图层信息中的其他参数
     * @param {String} options.parameters.crs WMS图层的SRS标签的值
     * @param {String} options.parameters.styles WMS图层的style标签的值
     * @param {String} options.parameters.format WMS图层的format标签的值
     */
    constructor(url, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        options.tilingScheme = defaultValue(
            options.tilingScheme,
            new GeographicTilingScheme({ ellipsoid: options.ellipsoid })
        );

        super(url, options);

        const resource = this._resource;

        resource.setQueryParameters(defaultParameters, true);
        if (defined(options.parameters)) {
            resource.setQueryParameters(objectToLowercase(options.parameters));
        }

        const that = this;
        this._reload = undefined;
        if (defined(options.times)) {
            this._timeDynamicImagery = new TimeDynamicImagery({
                clock: options.clock,
                times: options.times,
                requestImageFunction: function (x, y, level, request, interval) {
                    return requestImage(that, x, y, level, request, interval);
                },
                reloadFunction: function () {
                    if (defined(that._reload)) {
                        that._reload();
                    }
                }
            });
        }

        const parameters = {};
        parameters.layers = options.layers;
        parameters.bbox =
            '{westProjected},{southProjected},{eastProjected},{northProjected}';
        parameters.width = '{width}';
        parameters.height = '{height}';

        if (parseFloat(resource.queryParameters.version) >= 1.3) {
            parameters.crs = defaultValue(
                options.crs,
                options.tilingScheme &&
                    options.tilingScheme.projection instanceof WebMercatorProjection
                    ? 'EPSG:3857'
                    : 'CRS:84'
            );

            const parts = parameters.crs.split(':');
            if (parts[0] === 'EPSG' && parts.length === 2) {
                const code = Number(parts[1]);
                if (
                    (code >= 4000 && code < 5000 && !excludesReverseAxis.includes(code)) ||
                    includesReverseAxis.includes(code)
                ) {
                    parameters.bbox =
                        '{southProjected},{westProjected},{northProjected},{eastProjected}';
                }
            }
        } else {
            parameters.srs = defaultValue(
                options.srs,
                options.tilingScheme &&
                    options.tilingScheme.projection instanceof WebMercatorProjection
                    ? 'EPSG:3857'
                    : 'EPSG:4326'
            );
        }

        resource.setQueryParameters(parameters, true);

        this._layers = options.layers;

    }

    requestImage(x, y, level, request) {
        let result;
        const timeDynamicImagery = this._timeDynamicImagery;
        let currentInterval;

        // Try and load from cache
        if (defined(timeDynamicImagery)) {
            currentInterval = timeDynamicImagery.currentInterval;
            result = timeDynamicImagery.getFromCache(x, y, level, request);
        }

        // Couldn't load from cache
        if (!defined(result)) {
            result = requestImage(this, x, y, level, request, currentInterval);
        }

        // If we are approaching an interval, preload this tile in the next interval
        if (defined(result) && defined(timeDynamicImagery)) {
            timeDynamicImagery.checkApproachingInterval(x, y, level, request);
        }

        return result;
    }
}

export default WMSImageryLayer;
