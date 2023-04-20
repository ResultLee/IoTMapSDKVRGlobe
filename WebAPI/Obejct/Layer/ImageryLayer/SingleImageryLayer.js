import Check from '../../../../Source/Core/Check.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';
import defined from '../../../../Source/Core/defined.js';
import GeographicTilingScheme from '../../../../Source/Core/GeographicTilingScheme.js';
import loadKTX2 from '../../../../Source/Core/loadKTX2.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
import RuntimeError from '../../../../Source/Core/RuntimeError.js';
import TileProviderError from '../../../../Source/Core/TileProviderError.js';
import ImageryProvider from './ImageryProvider.js';

function loadImage(resource) {
    const url = resource.url;
    Check.defined('url', url);

    const ktx2Regex = /\.ktx2$/i;

    if (ktx2Regex.test(url)) {
        return loadKTX2(resource);
    }

    return resource.fetchImage({
        preferImageBitmap: true,
        flipY: true
    });
}

/**
 * 用于场景加载单张图片的图层对象，统一在{@link ImageryLayer}对象中创建，不支持单独创建
 * @protected
 * @extends ImageryProvider
 */
class SingleImageryLayer extends ImageryProvider {
    /**
     * 创建单张图片影像图层
     * @param {String} url 影像图层URL地址
     * @param {Object} [options] 图层参数
     * @param {Ellipsoid} [options.ellipsoid = Ellipsoid.WGS84] 椭球体参数，默认为WGS84椭球体。
     * @param {Rectangle} [options.rectangle = Rectangle.MAX_VALUE] 图片在地图上覆盖的以弧度表示的矩形范围，默认为全球范围
     */
    constructor(url, options) {
        options = defaultValue(options, {});

        options.tilingScheme = new GeographicTilingScheme({
            numberOfLevelZeroTilesX: 1,
            numberOfLevelZeroTilesY: 1,
            ellipsoid: options.ellipsoid,
            rectangle: defaultValue(options.rectangle, Rectangle.MAX_VALUE)
        });

        super(url, options);

        let error;
        const that = this;
        const resource = this._resource;

        function success(image) {
            that._image = image;
            that._tileWidth = image.width;
            that._tileHeight = image.height;
            that._ready = true;
            TileProviderError.reportSuccess(that._errorEvent);
            return Promise.resolve(true);
        }

        function failure(e) {
            const message = `Failed to load image ${resource.url}.`;
            error = TileProviderError.reportError(
                error,
                that,
                that._errorEvent,
                message,
                0,
                0,
                0
            );
            if (error.retry) {
                return doRequest();
            }
            return Promise.reject(new RuntimeError(message));
        }

        function doRequest() {
            return loadImage(resource)
                .then(success)
                .catch(failure);
        }

        this._readyPromise = doRequest();
    }

    requestImage(x, y, level, request) {
        if (!defined(this._image)) {
            return;
        }

        return Promise.resolve(this._image);
    }
}

export default SingleImageryLayer;
